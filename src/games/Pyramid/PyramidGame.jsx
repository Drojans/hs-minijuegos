import { useCallback, useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../i18n/LanguageProvider";
import GameModeSelect from "../../shared/components/GameModeSelect/GameModeSelect";
import GamePageShell from "../../shared/components/GamePageShell/GamePageShell";
import { getGameIntroCopy } from "../../shared/config/gameIntroCopy";
import { ARCANE_BOX_ID, DAILY_REWARD_BOX_AMOUNT, GAME_IDS } from "../../shared/config/gameRules";
import { GAME_MODE_IDS, getDailyItem } from "../../shared/gameModes/gameModes";
import {
  completeDailyChallenge,
  getDailyGameProgress,
  getTodayKey,
  markDailyRewardClaimed,
  saveDailyChallengeResult,
} from "../../shared/progress/dailyProgress";
import { addArcaneBoxReward } from "../../shared/rewards/rewardStore";
import PyramidMessagePanel from "./components/PyramidMessagePanel";
import PyramidResultOverlay from "./components/PyramidResultOverlay";
import PyramidStage from "./components/PyramidStage";
import PyramidTopbar from "./components/PyramidTopbar";
import { getPyramidCopy } from "./pyramidCopy";
import {
  PYRAMID_DAILY_TIME_SECONDS,
  PYRAMID_TARGET_COUNT,
  buildPyramidCategories,
  findCardByAnswer,
  getCategoryLabel,
  getPyramidSuggestions,
  getRandomCategory,
  isPlayablePyramidCard,
} from "./pyramidGameConfig";
import "./PyramidGame.css";

const PYRAMID_GAME_ID = GAME_IDS.PYRAMID;

function normalizeInput(value) {
  return String(value ?? "").trim();
}

function PyramidGame({ cards = [], onBack }) {
  const { locale } = useLanguage();
  const copy = getPyramidCopy(locale);
  const introCopy = useMemo(() => getGameIntroCopy(PYRAMID_GAME_ID, locale), [locale]);
  const todayKey = useMemo(() => getTodayKey(), []);
  const playableCards = useMemo(() => cards.filter((card) => isPlayablePyramidCard(card, locale)), [cards, locale]);
  const categories = useMemo(() => buildPyramidCategories(cards, locale), [cards, locale]);
  const dailyCategory = useMemo(() => getDailyItem(categories, PYRAMID_GAME_ID, todayKey), [categories, todayKey]);

  const [selectedMode, setSelectedMode] = useState(null);
  const [category, setCategory] = useState(null);
  const [foundCards, setFoundCards] = useState([]);
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [suppressSuggestions, setSuppressSuggestions] = useState(false);
  const [dailyProgress, setDailyProgress] = useState(() => getDailyGameProgress(PYRAMID_GAME_ID, todayKey));
  const [timeLeft, setTimeLeft] = useState(PYRAMID_DAILY_TIME_SECONDS);
  const [result, setResult] = useState(null);
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const usedIds = useMemo(() => new Set(foundCards.map((card) => card.id)), [foundCards]);
  const suggestions = useMemo(() => {
    if (suppressSuggestions || result || normalizeInput(answer).length < 2) return [];
    return getPyramidSuggestions(playableCards, answer, usedIds, locale);
  }, [answer, locale, playableCards, result, suppressSuggestions, usedIds]);

  useEffect(() => {
    setDailyProgress(getDailyGameProgress(PYRAMID_GAME_ID, todayKey));
  }, [todayKey]);

  const markDailyLost = useCallback((cardsFound = foundCards, showOverlay = true) => {
    saveDailyChallengeResult(PYRAMID_GAME_ID, todayKey, {
      completed: true,
      completedAt: new Date().toISOString(),
      lastWasWon: false,
      lastWasCorrect: false,
      lastCategoryId: category?.id,
      lastFoundCardIds: cardsFound.map((card) => card.id),
    });
    setDailyProgress(getDailyGameProgress(PYRAMID_GAME_ID, todayKey));
    setResult("lost");
    setShowResultOverlay(showOverlay);
  }, [category?.id, foundCards, todayKey]);

  const failDailyByTime = useCallback(() => {
    if (result || selectedMode !== GAME_MODE_IDS.DAILY || dailyProgress.completed) return;
    markDailyLost(foundCards, true);
  }, [dailyProgress.completed, foundCards, markDailyLost, result, selectedMode]);

  useEffect(() => {
    if (selectedMode !== GAME_MODE_IDS.DAILY || result || dailyProgress.completed) return undefined;

    const intervalId = window.setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          window.clearInterval(intervalId);
          failDailyByTime();
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [dailyProgress.completed, failDailyByTime, result, selectedMode]);

  function buildResultCards(categoryToUse = category, savedIds = []) {
    const fromSaved = savedIds
      .map((id) => playableCards.find((card) => card.id === id))
      .filter(Boolean);

    if (fromSaved.length >= PYRAMID_TARGET_COUNT) return fromSaved.slice(0, PYRAMID_TARGET_COUNT);

    const filler = (categoryToUse?.matchingCards ?? [])
      .filter((card) => !fromSaved.some((saved) => saved.id === card.id))
      .slice(0, PYRAMID_TARGET_COUNT - fromSaved.length);

    return [...fromSaved, ...filler];
  }

  function resetRound(nextCategory) {
    setCategory(nextCategory);
    setFoundCards([]);
    setAnswer("");
    setMessage("");
    setSuppressSuggestions(false);
    setTimeLeft(PYRAMID_DAILY_TIME_SECONDS);
    setResult(null);
    setShowResultOverlay(false);
    setShowResults(false);
  }

  function startMode(modeId) {
    const latestProgress = getDailyGameProgress(PYRAMID_GAME_ID, todayKey);
    setDailyProgress(latestProgress);
    setSelectedMode(modeId);

    if (modeId === GAME_MODE_IDS.DAILY) {
      const nextCategory = dailyCategory;
      setCategory(nextCategory);
      setTimeLeft(PYRAMID_DAILY_TIME_SECONDS);
      setAnswer("");
      setMessage("");
      setSuppressSuggestions(false);

      if (latestProgress.completed) {
        const savedIds = Array.isArray(latestProgress.lastFoundCardIds) ? latestProgress.lastFoundCardIds : [];
        setFoundCards(buildResultCards(nextCategory, savedIds));
        setResult(latestProgress.lastWasWon ? "won" : "lost");
        setShowResults(true);
        setShowResultOverlay(false);
        return;
      }

      setFoundCards([]);
      setResult(null);
      setShowResults(false);
      setShowResultOverlay(false);
      return;
    }

    resetRound(getRandomCategory(categories));
  }

  function handleBack() {
    if (selectedMode === GAME_MODE_IDS.DAILY && !dailyProgress.completed && !result) {
      markDailyLost(foundCards, false);
    }

    onBack?.();
  }

  function markDailyWon(nextFoundCards) {
    completeDailyChallenge(PYRAMID_GAME_ID, todayKey);
    saveDailyChallengeResult(PYRAMID_GAME_ID, todayKey, {
      lastWasWon: true,
      lastWasCorrect: true,
      lastCategoryId: category?.id,
      lastFoundCardIds: nextFoundCards.map((card) => card.id),
    });

    const latestProgress = getDailyGameProgress(PYRAMID_GAME_ID, todayKey);

    if (!latestProgress.rewardClaimed) {
      addArcaneBoxReward({
        boxId: ARCANE_BOX_ID,
        amount: DAILY_REWARD_BOX_AMOUNT,
        source: PYRAMID_GAME_ID,
        dateKey: todayKey,
      });
      markDailyRewardClaimed(PYRAMID_GAME_ID, todayKey);
      saveDailyChallengeResult(PYRAMID_GAME_ID, todayKey, {
        lastWasWon: true,
        lastWasCorrect: true,
        lastCategoryId: category?.id,
        lastFoundCardIds: nextFoundCards.map((card) => card.id),
      });
    }

    setDailyProgress(getDailyGameProgress(PYRAMID_GAME_ID, todayKey));
  }

  function submitAnswer(event) {
    event.preventDefault();
    if (result || !category) return;

    const selectedCard = findCardByAnswer(playableCards, answer, locale);

    if (!selectedCard) {
      setMessage(copy.unknownCard);
      setSuppressSuggestions(false);
      return;
    }

    if (usedIds.has(selectedCard.id)) {
      setMessage(copy.duplicateCard);
      setSuppressSuggestions(false);
      return;
    }

    if (!category.answerIds.has(selectedCard.id)) {
      setMessage(copy.wrongCard);
      setSuppressSuggestions(false);
      return;
    }

    const nextFoundCards = [...foundCards, selectedCard];
    setFoundCards(nextFoundCards);
    setAnswer("");
    setMessage(copy.correctCard);
    setSuppressSuggestions(false);

    if (nextFoundCards.length >= PYRAMID_TARGET_COUNT) {
      setResult("won");
      setShowResultOverlay(true);

      if (selectedMode === GAME_MODE_IDS.DAILY) {
        markDailyWon(nextFoundCards);
      }
    }
  }

  function handleAnswerChange(value) {
    setAnswer(value);
    setSuppressSuggestions(false);
  }

  function handleSuggestionPick(value) {
    setAnswer(value);
    setSuppressSuggestions(true);
  }

  function startNextInfiniteRound() {
    resetRound(getRandomCategory(categories, category?.id));
  }

  if (playableCards.length === 0 || categories.length === 0 || !dailyCategory) {
    return <PyramidMessagePanel copy={copy} title={copy.noCards} onBack={onBack} />;
  }

  if (!selectedMode) {
    return (
      <GamePageShell className="py-page">
        <section className="py-shell is-mode-select">
          <GameModeSelect copy={introCopy} dailyCompleted={dailyProgress.completed} onSelectMode={startMode} />
        </section>
      </GamePageShell>
    );
  }

  if (!category) {
    return <PyramidMessagePanel copy={copy} title={copy.loading} onBack={handleBack} />;
  }

  const isDailyMode = selectedMode === GAME_MODE_IDS.DAILY;
  const isReview = isDailyMode && dailyProgress.completed;
  const categoryLabel = getCategoryLabel(category, locale);

  return (
    <GamePageShell className="py-page">
      <section className="py-shell">
        <PyramidTopbar
          copy={copy}
          isDailyMode={isDailyMode}
          timeLeft={timeLeft}
          result={result}
          isCompleted={dailyProgress.completed}
        />

        <PyramidStage
          copy={copy}
          locale={locale}
          categoryLabel={categoryLabel}
          foundCards={foundCards}
          answer={answer}
          suggestions={suggestions}
          message={message}
          result={result}
          isReview={isReview}
          showResults={showResults}
          selectedMode={selectedMode}
          onAnswerChange={handleAnswerChange}
          onSubmitAnswer={submitAnswer}
          onSuggestionPick={handleSuggestionPick}
          onStartNextInfiniteRound={startNextInfiniteRound}
        />
      </section>

      {showResultOverlay && result ? (
        <PyramidResultOverlay
          copy={copy}
          result={result}
          selectedMode={selectedMode}
          onViewResults={() => {
            setShowResultOverlay(false);
            setShowResults(true);
          }}
          onBack={handleBack}
        />
      ) : null}
    </GamePageShell>
  );
}

export default PyramidGame;
