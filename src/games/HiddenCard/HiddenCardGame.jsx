import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../../i18n/LanguageProvider";
import GameModeSelect from "../../shared/components/GameModeSelect/GameModeSelect";
import GameResultOverlay from "../../shared/components/GameResultOverlay/GameResultOverlay";
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
import {
  getHiddenCardHints,
  getHiddenCardImage,
  getHiddenCardSuggestions,
  getHiddenCardSearchNames,
  isCorrectHiddenCardGuess,
  normalizeCardGuess,
  isPlayableHiddenCard,
  pickHiddenCard,
} from "./hiddenCardConfig";
import "./HiddenCardGame.css";

const HIDDEN_CARD_GAME_ID = GAME_IDS.HIDDEN_CARD;

const COPY = {
  es: {
    resultKicker: "Resultado",
    dailyChallenge: "Reto diario",
    infiniteChallenge: "Modo infinito",
    attemptsLabel: "Intentos",
    guessesLabel: "Intentos usados",
    inputLabel: "Nombre de la carta",
    inputPlaceholder: "Escribe el nombre de la carta",
    submit: "Probar carta",
    noCards: "No hay suficientes cartas para jugar.",
    loading: "Preparando carta oculta...",
    correct: "¡Correcto!",
    wrong: "No era esa.",
    winTitle: "¡Carta descubierta!",
    winText: "Has identificado la carta oculta.",
    loseTitle: "Carta no descubierta",
    loseText: "Se han agotado los intentos.",
    viewResults: "Ver resultado",
    playAgain: "Otra carta",
    backHome: "Volver",
    dailyRewardEarned: "Has ganado 1 caja arcana.",
    dailyRewardAlreadyClaimed: "Reto diario completado. Hoy ya tenías esta recompensa.",
    hintTitle: "Pistas reveladas",
    hintImage: "Imagen oculta",
    hintCost: "Coste",
    hintType: "Tipo",
    hintClass: "Clase",
    hintRarity: "Rareza",
    hintName: "Nombre",
    hintText: "Texto",
    firstLetter: "empieza por",
    words: "palabras",
    dailyReview: "Reto diario revisado",
    selected: "Elegiste",
    emptyGuess: "Selecciona una carta de la lista o escribe un nombre exacto para probar.",
    invalidGuess: "Elige una carta válida de la lista antes de probar.",
  },
  en: {
    resultKicker: "Result",
    dailyChallenge: "Daily challenge",
    infiniteChallenge: "Infinite mode",
    attemptsLabel: "Attempts",
    guessesLabel: "Used attempts",
    inputLabel: "Card name",
    inputPlaceholder: "Type the card name",
    submit: "Try card",
    noCards: "There are not enough cards to play.",
    loading: "Preparing hidden card...",
    correct: "Correct!",
    wrong: "Not that card.",
    winTitle: "Card revealed!",
    winText: "You identified the hidden card.",
    loseTitle: "Card not found",
    loseText: "You ran out of attempts.",
    viewResults: "View result",
    playAgain: "Another card",
    backHome: "Back",
    dailyRewardEarned: "You earned 1 arcane box.",
    dailyRewardAlreadyClaimed: "Daily challenge completed. You already had today’s reward.",
    hintTitle: "Revealed clues",
    hintImage: "Hidden image",
    hintCost: "Cost",
    hintType: "Type",
    hintClass: "Class",
    hintRarity: "Rarity",
    hintName: "Name",
    hintText: "Text",
    firstLetter: "starts with",
    words: "words",
    dailyReview: "Daily review",
    selected: "Selected",
    emptyGuess: "Select a card from the list or type an exact card name before trying.",
    invalidGuess: "Choose a valid card from the list before trying.",
  },
};

function useCopy(locale) {
  return COPY[locale] ?? COPY.es;
}

function MessagePanel({ copy, title, onBack }) {
  return (
    <main className="hidden-card-page">
      <section className="hidden-card-shell">
        <div className="hidden-card-message-panel">
          <h2>{title}</h2>
          <button type="button" className="hidden-card-button is-secondary" onClick={onBack}>{copy.backHome}</button>
        </div>
      </section>
    </main>
  );
}

function HiddenPreview({ card, locale, revealLevel, isRevealed, copy }) {
  const imageSrc = getHiddenCardImage(card, locale);
  const name = getCardName(card, locale);

  return (
    <section className={`hidden-card-preview level-${revealLevel} ${isRevealed ? "is-revealed" : ""}`}>
      <div className="hidden-card-image-frame">
        {imageSrc ? <img src={imageSrc} alt={isRevealed ? name : copy.hintImage} /> : <span>{name}</span>}
      </div>
      {isRevealed ? <strong className="hidden-card-real-name">{name}</strong> : null}
    </section>
  );
}

function HintList({ copy, card, locale, revealLevel }) {
  const hints = getHiddenCardHints(card, locale);
  const items = [
    { key: "cost", label: copy.hintCost, value: hints.cost, unlocked: revealLevel >= 1 },
    { key: "type", label: copy.hintType, value: hints.type, unlocked: revealLevel >= 2 },
    { key: "class", label: copy.hintClass, value: hints.class, unlocked: revealLevel >= 2 },
    { key: "rarity", label: copy.hintRarity, value: hints.rarity, unlocked: revealLevel >= 3 },
    {
      key: "name",
      label: copy.hintName,
      value: `${copy.firstLetter} ${hints.firstLetter} · ${hints.nameWords} ${copy.words}`,
      unlocked: revealLevel >= 4,
    },
    { key: "text", label: copy.hintText, value: hints.textSnippet, unlocked: revealLevel >= 4 },
  ];

  return (
    <aside className="hidden-card-hints">
      <p>{copy.hintTitle}</p>
      <div className="hidden-card-hint-grid">
        {items.map((item) => (
          <div key={item.key} className={`hidden-card-hint ${item.unlocked ? "is-unlocked" : ""}`}>
            <span>{item.label}</span>
            <strong>{item.unlocked ? item.value : "?"}</strong>
          </div>
        ))}
      </div>
    </aside>
  );
}

function GuessForm({ copy, query, suggestions, disabled, message, canSubmit, onChange, onSubmit, onPickSuggestion, inputRef }) {
  return (
    <form className="hidden-card-form" onSubmit={onSubmit}>
      <label>{copy.inputLabel}</label>
      <div className="hidden-card-input-row">
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => onChange(event.target.value)}
          placeholder={copy.inputPlaceholder}
          disabled={disabled}
          autoComplete="off"
        />
        <button type="submit" disabled={disabled || !canSubmit}>{copy.submit}</button>
      </div>
      {message ? <p className="hidden-card-form-message">{message}</p> : null}
      {!disabled && suggestions.length > 0 ? (
        <div className="hidden-card-suggestions">
          {suggestions.map(({ card, label }) => (
            <button key={card.id} type="button" onClick={() => onPickSuggestion(card)}>
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </form>
  );
}

function GuessesList({ copy, guesses }) {
  if (!guesses.length) return null;

  return (
    <section className="hidden-card-guesses">
      <p>{copy.guessesLabel}</p>
      <div>
        {guesses.map((guess, index) => (
          <span key={`${guess}-${index}`}>{guess}</span>
        ))}
      </div>
    </section>
  );
}

function ResultOverlay({ copy, result, rewardMessage, onViewResults, onBack }) {
  const isWon = result === "won";

  return (
    <GameResultOverlay
      tone={isWon ? "success" : "danger"}
      kicker={copy.resultKicker}
      title={isWon ? copy.winTitle : copy.loseTitle}
      text={isWon ? copy.winText : copy.loseText}
      rewardMessage={rewardMessage}
      primaryAction={{ label: copy.viewResults, onClick: onViewResults }}
      secondaryActions={[{ label: copy.backHome, onClick: onBack }]}
    />
  );
}

function serializeGuesses(guesses = []) {
  return guesses.map((guess) => String(guess));
}

function HiddenCardGame({ cards = [], onBack }) {
  const { locale } = useLanguage();
  const copy = useCopy(locale);
  const introCopy = useMemo(() => getGameIntroCopy(HIDDEN_CARD_GAME_ID, locale), [locale]);
  const todayKey = useMemo(() => getTodayKey(), []);
  const inputRef = useRef(null);

  const playableCards = useMemo(() => {
    return cards
      .filter((card) => isPlayableHiddenCard(card, locale))
      .sort((a, b) => String(a.id).localeCompare(String(b.id)));
  }, [cards, locale]);

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
  const resolvedGuessCard = useMemo(() => {
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
  }, [playableCards, query, locale, selectedGuessCard]);
  const canSubmitGuess = Boolean(resolvedGuessCard && !result && !showResults);
  const attemptsUsed = guesses.length;
  const attemptsLeft = Math.max(0, HIDDEN_CARD_MAX_ATTEMPTS - attemptsUsed);
  const revealLevel = showResults || result || dailyProgress.completed
    ? 5
    : Math.min(4, attemptsUsed);

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
    setDailyProgress(getDailyGameProgress(HIDDEN_CARD_GAME_ID, todayKey));
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
    setDailyProgress(getDailyGameProgress(HIDDEN_CARD_GAME_ID, todayKey));
  }

  function markDailyWon(nextGuesses) {
    completeDailyChallenge(HIDDEN_CARD_GAME_ID, todayKey);
    saveDailyFinished(true, nextGuesses);
    let latestProgress = getDailyGameProgress(HIDDEN_CARD_GAME_ID, todayKey);

    if (!latestProgress.rewardClaimed) {
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
    } else {
      setRewardMessage(copy.dailyRewardAlreadyClaimed);
    }

    setDailyProgress(getDailyGameProgress(HIDDEN_CARD_GAME_ID, todayKey));
  }

  function finishGame(nextResult, nextGuesses) {
    setResult(nextResult);
    setShowResultOverlay(true);

    if (selectedMode === GAME_MODE_IDS.DAILY) {
      if (nextResult === "won") {
        markDailyWon(nextGuesses);
      } else {
        saveDailyFinished(false, nextGuesses);
      }
    }
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

    if (selectedMode === GAME_MODE_IDS.DAILY) {
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

  function startNextInfiniteRound() {
    clearGameState();
    setCurrentCard(pickHiddenCard(playableCards, currentCard?.id));
  }

  function handleBack() {
    onBack?.();
  }

  if (playableCards.length < 1 || !dailyCard) {
    return <MessagePanel copy={copy} title={copy.noCards} onBack={onBack} />;
  }

  if (!selectedMode) {
    return (
      <main className="hidden-card-page">
        <section className="hidden-card-shell is-mode-select">
          <GameModeSelect
            copy={introCopy}
            dailyCompleted={dailyProgress.completed}
            onSelectMode={startMode}
          />
        </section>
      </main>
    );
  }

  if (!currentCard) {
    return <MessagePanel copy={copy} title={copy.loading} onBack={handleBack} />;
  }

  const isDailyMode = selectedMode === GAME_MODE_IDS.DAILY;
  const isReview = isDailyMode && dailyProgress.completed;
  const isRevealed = showResults || isReview;

  return (
    <main className="hidden-card-page">

      <section className="hidden-card-shell">
        <div className="hidden-card-topbar">
          <div className="hidden-card-mode-pill">{isDailyMode ? copy.dailyChallenge : copy.infiniteChallenge}</div>
          <div className="hidden-card-score-pill">
            <span>{copy.attemptsLabel}</span>
            <strong>{attemptsLeft}/{HIDDEN_CARD_MAX_ATTEMPTS}</strong>
          </div>
        </div>

        <section className="hidden-card-stage">
          <HiddenPreview card={currentCard} locale={locale} revealLevel={revealLevel} isRevealed={isRevealed} copy={copy} />

          <div className="hidden-card-side-panel">
            <HintList copy={copy} card={currentCard} locale={locale} revealLevel={revealLevel} />

            {!isRevealed && !result ? (
              <GuessForm
                copy={copy}
                query={query}
                suggestions={suggestions}
                disabled={Boolean(result || isReview)}
                message={message}
                inputRef={inputRef}
                canSubmit={canSubmitGuess}
                onChange={(value) => {
                  setSelectedGuessCard(null);
                  setQuery(value);
                  setMessage("");
                }}
                onSubmit={submitGuess}
                onPickSuggestion={pickSuggestion}
              />
            ) : null}

            <GuessesList copy={copy} guesses={guesses} />

            {isRevealed && !isDailyMode && result ? (
              <button type="button" className="hidden-card-button is-primary" onClick={startNextInfiniteRound}>
                {copy.playAgain}
              </button>
            ) : null}
          </div>
        </section>
      </section>

      {showResultOverlay && result ? (
        <ResultOverlay
          copy={copy}
          result={result}
          rewardMessage={rewardMessage}
          onViewResults={() => {
            setShowResultOverlay(false);
            setShowResults(true);
          }}
          onNext={!isDailyMode ? startNextInfiniteRound : null}
          onBack={onBack}
        />
      ) : null}
    </main>
  );
}

export default HiddenCardGame;
