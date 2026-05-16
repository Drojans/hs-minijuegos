import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../../i18n/LanguageProvider";
import GameModeSelect from "../../shared/components/GameModeSelect/GameModeSelect";
import GamePageShell from "../../shared/components/GamePageShell/GamePageShell";
import { getGameIntroCopy } from "../../shared/config/gameIntroCopy";
import { GAME_MODE_IDS, getDailyItem } from "../../shared/gameModes/gameModes";
import {
  ARCANE_BOX_ID,
  DAILY_REWARD_BOX_AMOUNT,
  GAME_IDS,
  HIDDEN_CARD_MAX_ATTEMPTS,
} from "../../shared/config/gameRules";
import {
  completeDailyChallenge,
  getDailyGameProgress,
  getTodayKey,
  markDailyRewardClaimed,
  saveDailyChallengeResult,
} from "../../shared/progress/dailyProgress";
import { addArcaneBoxReward } from "../../shared/rewards/rewardStore";
import { getCardName } from "../../utils/cardLocale";
import HiddenCardMessagePanel from "./components/HiddenCardMessagePanel";
import HiddenCardResultOverlay from "./components/HiddenCardResultOverlay";
import HiddenCardStage from "./components/HiddenCardStage";
import HiddenCardTopbar from "./components/HiddenCardTopbar";
import { getHiddenCardCopy } from "./hiddenCardCopy";
import {
  getHiddenCardSearchNames,
  getHiddenCardSuggestions,
  isCorrectHiddenCardGuess,
  isPlayableHiddenCard,
  normalizeCardGuess,
  pickHiddenCard,
} from "./hiddenCardConfig";
import "./HiddenCardGame.css";

const HIDDEN_CARD_GAME_ID = GAME_IDS.HIDDEN_CARD;

function serializeGuesses(guesses = []) {
  return guesses.map((guess) => String(guess));
}

function getPlayableHiddenCards(cards, locale) {
  return cards
    .filter((card) => isPlayableHiddenCard(card, locale))
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
}

function resolveGuessCard({ playableCards, query, locale, selectedGuessCard }) {
  const normalizedQuery = normalizeCardGuess(query);
  if (!normalizedQuery) return null;

  if (selectedGuessCard) {
    const selectedNames = getHiddenCardSearchNames(selectedGuessCard, locale).map((name) => normalizeCardGuess(name));
    if (selectedNames.includes(normalizedQuery)) return selectedGuessCard;
  }

  const exactMatches = playableCards.filter((card) =>
    getHiddenCardSearchNames(card, locale).some((name) => normalizeCardGuess(name) === normalizedQuery),
  );

  return exactMatches.length === 1 ? exactMatches[0] : null;
}

function HiddenCardGame({ cards = [], onBack }) {
  const { locale } = useLanguage();
  const copy = getHiddenCardCopy(locale);
  const introCopy = useMemo(() => getGameIntroCopy(HIDDEN_CARD_GAME_ID, locale), [locale]);
  const todayKey = useMemo(() => getTodayKey(), []);
  const inputRef = useRef(null);

  const playableCards = useMemo(() => getPlayableHiddenCards(cards, locale), [cards, locale]);
  const dailyCard = useMemo(() => getDailyItem(playableCards, HIDDEN_CARD_GAME_ID, todayKey), [playableCards, todayKey]);

  const [selectedMode, setSelectedMode] = useState(null);
  const [currentCard, setCurrentCard] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedGuessCard, setSelectedGuessCard] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [result, setResult] = useState(null);
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [message, setMessage] = useState("");
  const [rewardMessage, setRewardMessage] = useState("");
  const [dailyProgress, setDailyProgress] = useState(() => getDailyGameProgress(HIDDEN_CARD_GAME_ID, todayKey));

  useEffect(() => {
    setDailyProgress(getDailyGameProgress(HIDDEN_CARD_GAME_ID, todayKey));
  }, [todayKey]);

  useEffect(() => {
    if (selectedMode && !showResults && !result) {
      window.setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [selectedMode, currentCard, showResults, result]);

  const suggestions = useMemo(() => getHiddenCardSuggestions(playableCards, query, locale), [playableCards, query, locale]);
  const resolvedGuessCard = useMemo(
    () => resolveGuessCard({ playableCards, query, locale, selectedGuessCard }),
    [playableCards, query, locale, selectedGuessCard],
  );

  const isDailyMode = selectedMode === GAME_MODE_IDS.DAILY;
  const attemptsUsed = guesses.length;
  const attemptsLeft = Math.max(0, HIDDEN_CARD_MAX_ATTEMPTS - attemptsUsed);
  const isReview = isDailyMode && dailyProgress.completed;
  const revealLevel = showResults || result || dailyProgress.completed ? 5 : Math.min(4, attemptsUsed);
  const isRevealed = showResults || isReview;
  const canSubmitGuess = Boolean(resolvedGuessCard && !result && !showResults);

  function refreshDailyProgress() {
    setDailyProgress(getDailyGameProgress(HIDDEN_CARD_GAME_ID, todayKey));
  }

  function clearGameState() {
    setQuery("");
    setSelectedGuessCard(null);
    setGuesses([]);
    setResult(null);
    setShowResultOverlay(false);
    setShowResults(false);
    setMessage("");
    setRewardMessage("");
  }

  function startDailyReview(progress) {
    setCurrentCard(dailyCard);
    setGuesses(progress.lastGuesses ?? []);
    setResult(progress.lastWasWon ? "won" : "lost");
    setShowResults(true);
    setShowResultOverlay(false);
    setMessage("");
  }

  function startMode(modeId) {
    const latestProgress = getDailyGameProgress(HIDDEN_CARD_GAME_ID, todayKey);
    setDailyProgress(latestProgress);
    setSelectedMode(modeId);
    clearGameState();

    if (modeId === GAME_MODE_IDS.DAILY) {
      setCurrentCard(dailyCard);

      if (latestProgress.completed) {
        startDailyReview(latestProgress);
        return;
      }

      setGuesses(latestProgress.lastGuesses ?? []);
      return;
    }

    setCurrentCard(pickHiddenCard(playableCards));
  }

  function saveDailyPartial(nextGuesses) {
    saveDailyChallengeResult(HIDDEN_CARD_GAME_ID, todayKey, {
      lastCardId: dailyCard?.id,
      lastGuesses: serializeGuesses(nextGuesses),
      lastWasWon: false,
      lastWasCorrect: false,
    });
    refreshDailyProgress();
  }

  function saveDailyFinished(won, nextGuesses) {
    saveDailyChallengeResult(HIDDEN_CARD_GAME_ID, todayKey, {
      completed: true,
      completedAt: new Date().toISOString(),
      lastWasWon: won,
      lastWasCorrect: won,
      lastCardId: currentCard?.id,
      lastGuesses: serializeGuesses(nextGuesses),
    });
    refreshDailyProgress();
  }

  function claimDailyReward(nextGuesses) {
    completeDailyChallenge(HIDDEN_CARD_GAME_ID, todayKey);
    saveDailyFinished(true, nextGuesses);

    const latestProgress = getDailyGameProgress(HIDDEN_CARD_GAME_ID, todayKey);
    if (latestProgress.rewardClaimed) {
      setRewardMessage(copy.dailyRewardAlreadyClaimed);
      refreshDailyProgress();
      return;
    }

    addArcaneBoxReward({
      boxId: ARCANE_BOX_ID,
      amount: DAILY_REWARD_BOX_AMOUNT,
      source: HIDDEN_CARD_GAME_ID,
      dateKey: todayKey,
    });
    markDailyRewardClaimed(HIDDEN_CARD_GAME_ID, todayKey);
    saveDailyChallengeResult(HIDDEN_CARD_GAME_ID, todayKey, {
      lastWasWon: true,
      lastWasCorrect: true,
      lastCardId: currentCard?.id,
      lastGuesses: serializeGuesses(nextGuesses),
    });
    setRewardMessage(copy.dailyRewardEarned);
    refreshDailyProgress();
  }

  function finishGame(nextResult, nextGuesses) {
    setResult(nextResult);
    setShowResultOverlay(true);

    if (!isDailyMode) return;

    if (nextResult === "won") {
      claimDailyReward(nextGuesses);
      return;
    }

    saveDailyFinished(false, nextGuesses);
  }

  function submitGuess(event) {
    event?.preventDefault();

    if (!query.trim() || !currentCard || result || showResults) {
      setMessage(copy.emptyGuess);
      return;
    }

    if (!resolvedGuessCard) {
      setMessage(copy.invalidGuess);
      window.setTimeout(() => inputRef.current?.focus(), 0);
      return;
    }

    const guessText = getCardName(resolvedGuessCard, locale);
    const nextGuesses = [...guesses, guessText];
    const isCorrect =
      String(resolvedGuessCard.id) === String(currentCard.id) ||
      isCorrectHiddenCardGuess(currentCard, guessText, locale);

    setGuesses(nextGuesses);
    setQuery("");
    setSelectedGuessCard(null);

    if (isCorrect) {
      setMessage(copy.correct);
      finishGame("won", nextGuesses);
      return;
    }

    if (isDailyMode) {
      saveDailyPartial(nextGuesses);
    }

    if (nextGuesses.length >= HIDDEN_CARD_MAX_ATTEMPTS) {
      setMessage(copy.wrong);
      finishGame("lost", nextGuesses);
      return;
    }

    setMessage(copy.wrong);
  }

  function pickSuggestion(card) {
    setSelectedGuessCard(card);
    setQuery(getCardName(card, locale));
    setMessage("");
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function updateQuery(value) {
    setSelectedGuessCard(null);
    setQuery(value);
    setMessage("");
  }

  function startNextInfiniteRound() {
    clearGameState();
    setCurrentCard(pickHiddenCard(playableCards, Math.random, currentCard?.id));
  }

  if (playableCards.length < 1 || !dailyCard) {
    return <HiddenCardMessagePanel copy={copy} title={copy.noCards} onBack={onBack} />;
  }

  if (!selectedMode) {
    return (
      <GamePageShell className="hidden-card-page">
        <section className="hidden-card-shell is-mode-select">
          <GameModeSelect copy={introCopy} dailyCompleted={dailyProgress.completed} onSelectMode={startMode} />
        </section>
      </GamePageShell>
    );
  }

  if (!currentCard) {
    return <HiddenCardMessagePanel copy={copy} title={copy.loading} onBack={onBack} />;
  }

  return (
    <GamePageShell className="hidden-card-page">
      <section className="hidden-card-shell">
        <HiddenCardTopbar
          copy={copy}
          isDailyMode={isDailyMode}
          attemptsLeft={attemptsLeft}
          maxAttempts={HIDDEN_CARD_MAX_ATTEMPTS}
        />

        <HiddenCardStage
          copy={copy}
          card={currentCard}
          locale={locale}
          revealLevel={revealLevel}
          isRevealed={isRevealed}
          result={result}
          isReview={isReview}
          isDailyMode={isDailyMode}
          query={query}
          suggestions={suggestions}
          message={message}
          canSubmitGuess={canSubmitGuess}
          inputRef={inputRef}
          guesses={guesses}
          onQueryChange={updateQuery}
          onSubmitGuess={submitGuess}
          onPickSuggestion={pickSuggestion}
          onStartNextInfiniteRound={startNextInfiniteRound}
        />
      </section>

      {showResultOverlay && result ? (
        <HiddenCardResultOverlay
          copy={copy}
          result={result}
          rewardMessage={rewardMessage}
          locale={locale}
          onViewResults={() => {
            setShowResultOverlay(false);
            setShowResults(true);
          }}
          onBack={onBack}
        />
      ) : null}
    </GamePageShell>
  );
}

export default HiddenCardGame;
