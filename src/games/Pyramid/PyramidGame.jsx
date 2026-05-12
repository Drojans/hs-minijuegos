import { useCallback, useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../i18n/LanguageProvider";
import GameModeSelect from "../../shared/components/GameModeSelect/GameModeSelect";
import GameResultOverlay from "../../shared/components/GameResultOverlay/GameResultOverlay";
import GamePageShell from "../../shared/components/GamePageShell/GamePageShell";
import { getGameIntroCopy } from "../../shared/config/gameIntroCopy";
import { GAME_MODE_IDS, getDailyItem } from "../../shared/gameModes/gameModes";
import { ARCANE_BOX_ID, DAILY_REWARD_BOX_AMOUNT, GAME_IDS } from "../../shared/config/gameRules";
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
  PYRAMID_DAILY_TIME_SECONDS,
  PYRAMID_TARGET_COUNT,
  buildPyramidCategories,
  findCardByAnswer,
  getCardImage,
  getCategoryLabel,
  getPyramidSuggestions,
  getRandomCategory,
  isPlayablePyramidCard,
} from "./pyramidGameConfig";
import "./PyramidGame.css";

const PYRAMID_GAME_ID = GAME_IDS.PYRAMID;

const COPY = {
  es: {
    resultKicker: "Resultado",
    dailyChallenge: "Reto diario",
    infiniteChallenge: "Modo infinito",
    dailyRewardEarned: "Has ganado 1 caja arcana.",
    dailyRewardAlreadyClaimed: "Pirámide diaria completada. Hoy ya tenías esta recompensa.",
    category: "Categoría",
    progress: "Progreso",
    cardPlaceholder: "Escribe una carta...",
    submit: "Comprobar",
    timeLabel: "Tiempo",
    found: "{count}/10 cartas",
    wrongCard: "Esa carta no encaja en la categoría.",
    duplicateCard: "Ya has usado esa carta en esta pirámide.",
    unknownCard: "No encuentro esa carta.",
    correctCard: "Correcta.",
    winTitle: "¡Pirámide completa!",
    winText: "Has encontrado 10 cartas que cumplen la categoría.",
    loseTitle: "Se acabó el tiempo",
    loseText: "La pirámide diaria queda marcada como fallada.",
    viewResults: "Ver resultados",
    playAgain: "Otra pirámide",
    backHome: "Volver",
    noCards: "No hay suficientes cartas para crear una pirámide.",
    loading: "Preparando pirámide...",
    resultsHint: "Resultados de la categoría",
  },
  en: {
    resultKicker: "Result",
    dailyChallenge: "Daily challenge",
    infiniteChallenge: "Infinite mode",
    dailyRewardEarned: "You earned 1 arcane box.",
    dailyRewardAlreadyClaimed: "Daily pyramid completed. You already had today’s reward.",
    category: "Category",
    progress: "Progress",
    cardPlaceholder: "Type a card...",
    submit: "Check",
    timeLabel: "Time",
    found: "{count}/10 cards",
    wrongCard: "That card does not match the category.",
    duplicateCard: "You already used that card in this pyramid.",
    unknownCard: "I cannot find that card.",
    correctCard: "Correct.",
    winTitle: "Pyramid complete!",
    winText: "You found 10 cards that match the category.",
    loseTitle: "Time is up",
    loseText: "The daily pyramid is marked as failed.",
    viewResults: "View results",
    playAgain: "Another pyramid",
    backHome: "Back",
    noCards: "There are not enough cards to create a pyramid.",
    loading: "Preparing pyramid...",
    resultsHint: "Category results",
  },
};

function useCopy(locale) {
  return COPY[locale] ?? COPY.es;
}

function formatText(template, values = {}) {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);
}

function MessagePanel({ copy, title, onBack }) {
  return (
    <GamePageShell className="py-page">
      <section className="py-shell">
        <div className="py-message-panel">
          <h2>{title}</h2>
          <button type="button" className="py-button is-secondary" onClick={onBack}>{copy.backHome}</button>
        </div>
      </section>
    </GamePageShell>
  );
}

function PyramidSlots({ foundCards, locale }) {
  const slots = Array.from({ length: PYRAMID_TARGET_COUNT }, (_, index) => foundCards[index] ?? null);
  const rows = [slots.slice(0, 1), slots.slice(1, 3), slots.slice(3, 6), slots.slice(6, 10)];

  return (
    <section className="py-pyramid" aria-label="Pirámide">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="py-pyramid-row">
          {row.map((card, slotIndex) => {
            const absoluteIndex = rows.slice(0, rowIndex).reduce((sum, current) => sum + current.length, 0) + slotIndex;
            return (
              <div key={absoluteIndex} className={`py-slot ${card ? "is-filled" : ""}`}>
                {card ? (
                  <>
                    <img src={getCardImage(card, locale)} alt={getCardName(card, locale)} />
                    <span>{getCardName(card, locale)}</span>
                  </>
                ) : (
                  <strong>{absoluteIndex + 1}</strong>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </section>
  );
}

function Suggestions({ suggestions, locale, onPick }) {
  if (suggestions.length === 0) return null;

  return (
    <div className="py-suggestions">
      {suggestions.map((card) => (
        <button
          key={card.id}
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onPick(getCardName(card, locale))}
        >
          {getCardName(card, locale)}
        </button>
      ))}
    </div>
  );
}

function ResultOverlay({ copy, result, selectedMode, onViewResults, onBack }) {
  const isWon = result === "won";
  const rewardMessage = isWon && selectedMode === GAME_MODE_IDS.DAILY ? copy.dailyRewardEarned : null;

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

function PyramidGame({ cards = [], onBack }) {
  const { locale } = useLanguage();
  const copy = useCopy(locale);
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
    if (selectedMode !== GAME_MODE_IDS.DAILY || result || dailyProgress.completed) return;

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
  }, [selectedMode, result, dailyProgress.completed, failDailyByTime]);

  function normalizeInput(value) {
    return String(value ?? "").trim();
  }

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

    let latestProgress = getDailyGameProgress(PYRAMID_GAME_ID, todayKey);

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

  function handleSuggestionPick(value) {
    setAnswer(value);
    setSuppressSuggestions(true);
  }

  function startNextInfiniteRound() {
    resetRound(getRandomCategory(categories, category?.id));
  }

  if (playableCards.length === 0 || categories.length === 0 || !dailyCategory) {
    return <MessagePanel copy={copy} title={copy.noCards} onBack={onBack} />;
  }

  if (!selectedMode) {
    return (
      <GamePageShell className="py-page">
        <section className="py-shell is-mode-select">
          <GameModeSelect
            copy={introCopy}
            dailyCompleted={dailyProgress.completed}
            onSelectMode={startMode}
          />
        </section>
      </GamePageShell>
    );
  }

  if (!category) {
    return <MessagePanel copy={copy} title={copy.loading} onBack={handleBack} />;
  }

  const isDailyMode = selectedMode === GAME_MODE_IDS.DAILY;
  const isReview = isDailyMode && dailyProgress.completed;
  const categoryLabel = getCategoryLabel(category, locale);

  return (
    <GamePageShell className="py-page">

      <section className="py-shell">
        <div className="py-topbar">
          <div className="py-mode-pill">{isDailyMode ? copy.dailyChallenge : copy.infiniteChallenge}</div>
          {isDailyMode ? (
            <div className={`py-timer ${timeLeft <= 15 && !result && !dailyProgress.completed ? "is-low" : ""}`}>
              <span>{copy.timeLabel}</span>
              <strong>{Math.max(0, timeLeft)}s</strong>
            </div>
          ) : null}
        </div>

        <section className="py-game-card">
          <header className="py-category-card">
            <span>{copy.category}</span>
            <h1>{categoryLabel}</h1>
            <p>{formatText(copy.found, { count: Math.min(foundCards.length, PYRAMID_TARGET_COUNT) })}</p>
          </header>

          <PyramidSlots foundCards={foundCards} locale={locale} />

          <section className="py-answer-panel">
            {showResults ? <p className="py-results-hint">{copy.resultsHint}</p> : null}
            {!result && !isReview ? (
              <form className="py-answer-form" onSubmit={submitAnswer}>
                <input
                  value={answer}
                  onChange={(event) => {
                    setAnswer(event.target.value);
                    setSuppressSuggestions(false);
                  }}
                  placeholder={copy.cardPlaceholder}
                  autoComplete="off"
                />
                <button type="submit" className="py-button is-primary">{copy.submit}</button>
                <Suggestions suggestions={suggestions} locale={locale} onPick={handleSuggestionPick} />
              </form>
            ) : null}
            {message && !showResults ? <p className="py-message">{message}</p> : null}
            {result && !showResultOverlay && selectedMode === GAME_MODE_IDS.INFINITE ? (
              <button type="button" className="py-button is-primary" onClick={startNextInfiniteRound}>{copy.playAgain}</button>
            ) : null}
          </section>
        </section>
      </section>

      {showResultOverlay && result ? (
        <ResultOverlay
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
