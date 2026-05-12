import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../../i18n/LanguageProvider";
import LanguageToggle from "../../shared/components/LanguageToggle/LanguageToggle";
import GameModeSelect from "../../shared/components/GameModeSelect/GameModeSelect";
import GameResultOverlay from "../../shared/components/GameResultOverlay/GameResultOverlay";
import { GAME_MODE_IDS } from "../../shared/gameModes/gameModes";
import { ARCANE_BOX_ID, CARD_GRID_DAILY_TIME_SECONDS, DAILY_REWARD_BOX_AMOUNT, GAME_IDS } from "../../shared/config/gameRules";
import {
  completeDailyChallenge,
  getDailyGameProgress,
  getTodayKey,
  markDailyRewardClaimed,
  saveDailyChallengeResult,
} from "../../shared/progress/dailyProgress";
import { addArcaneBoxReward } from "../../shared/rewards/rewardStore";
import {
  TOTAL_CELLS,
  buildConditionPool,
  generateGrid,
  getCardImage,
  getCardName,
  getCardsByExactName,
  getGridModes,
  getNextEmptyCell,
  getSuggestions,
  isPlayableGridCard,
  normalize,
} from "./cardGridGameConfig";
import "./CardGridGame.css";

const CARD_GRID_GAME_ID = GAME_IDS.CARD_GRID;

const CARD_GRID_COPY = {
  es: {
    navMinigames: "Minijuegos",
    navCards: "Base de datos",
    navCollection: "Colección",
    title: "Grid de cartas",
    progressLabel: "Progreso",
    exampleLabel: "Ejemplo del minijuego Grid de cartas",
    howToPlayTitle: "Cómo se juega",
    stepHiddenIcon: "3×3",
    stepHiddenTitle: "Cruza fila y columna",
    stepHiddenText: "Cada casilla mezcla dos condiciones. Busca una carta que cumpla las dos a la vez.",
    stepChooseIcon: "+",
    stepChooseIconSrc: "",
    stepChooseTitle: "Escribe la carta",
    stepChooseText: "Selecciona una casilla, escribe el nombre y pulsa Enter para colocarla en el grid.",
    stepModesIcon: "⚔",
    stepModesTitle: "Dos formas de jugar",
    stepModesText: "Reto diario para la cuadrícula del día o modo infinito para practicar sin parar.",
    modeSelectorLabel: "Selecciona modo",
    dailyTitle: "Reto diario",
    infiniteTitle: "Modo infinito",
    completedStatus: "Completado",
    startMode: "Empezar",
    dailyChallenge: "Reto diario",
    infiniteChallenge: "Modo infinito",
    dailyRewardEarned: "Has ganado 1 caja arcana.",
    dailyRewardAlreadyClaimed: "Grid diario completado. Hoy ya tenías esta recompensa.",
    dailyTimeLabel: "Tiempo",
    dailyTimeExpiredMessage: "Se acabó el tiempo. El reto diario queda marcado como fallado.",
    backHome: "Volver",
  },
  en: {
    navMinigames: "Minigames",
    navCards: "Card database",
    navCollection: "Collection",
    title: "Card grid",
    progressLabel: "Progress",
    exampleLabel: "Card Grid minigame example",
    howToPlayTitle: "How to play",
    stepHiddenIcon: "3×3",
    stepHiddenTitle: "Match row and column",
    stepHiddenText: "Each cell combines two conditions. Find one card that satisfies both at once.",
    stepChooseIcon: "+",
    stepChooseIconSrc: "",
    stepChooseTitle: "Type the card",
    stepChooseText: "Select a cell, type the card name and press Enter to place it in the grid.",
    stepModesIcon: "⚔",
    stepModesTitle: "Two ways to play",
    stepModesText: "Daily challenge for today's grid or infinite mode to practice without limits.",
    modeSelectorLabel: "Select mode",
    dailyTitle: "Daily challenge",
    infiniteTitle: "Infinite mode",
    completedStatus: "Completed",
    startMode: "Start",
    dailyChallenge: "Daily challenge",
    infiniteChallenge: "Infinite mode",
    dailyRewardEarned: "You earned 1 arcane box.",
    dailyRewardAlreadyClaimed: "Daily grid completed. You already had today’s reward.",
    dailyTimeLabel: "Time",
    dailyTimeExpiredMessage: "Time is up. The daily challenge is marked as failed.",
    backHome: "Back",
  },
};

function useCardGridCopy(locale) {
  return CARD_GRID_COPY[locale] ?? CARD_GRID_COPY.es;
}

function getDailyGridSeed(dateKey, gridMode) {
  return `${CARD_GRID_GAME_ID}:${dateKey}:${gridMode}`;
}

function serializeAnswerIds(answers) {
  return Object.fromEntries(
    Object.entries(answers).map(([key, card]) => [key, card.id])
  );
}

function restoreAnswersFromIds(answerIds = {}, cards = []) {
  const cardById = new Map(cards.map((card) => [card.id, card]));
  const restored = {};

  Object.entries(answerIds).forEach(([key, cardId]) => {
    const card = cardById.get(cardId);
    if (card) restored[key] = card;
  });

  return restored;
}

function formatGridTime(totalSeconds) {
  const minutes = Math.floor(Math.max(0, totalSeconds) / 60);
  const seconds = Math.max(0, totalSeconds) % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function DailyTimer({ copy, timeLeft }) {
  if (typeof timeLeft !== "number") return null;

  return (
    <div className={`cg-daily-timer ${timeLeft <= 15 ? "is-danger" : ""}`} aria-live="polite">
      <span>{copy.dailyTimeLabel}</span>
      <strong>{formatGridTime(timeLeft)}</strong>
    </div>
  );
}

function GameHeader({ copy, onBack }) {
  return (
    <header className="cg-v2-header">
      <nav className="cg-v2-nav" aria-label="Principal">
        <button type="button" className="is-active" onClick={onBack}>
          {copy.navMinigames}
        </button>
        <button type="button" disabled>
          {copy.navCards}
        </button>
        <button type="button" disabled>
          {copy.navCollection}
        </button>
      </nav>

      <button type="button" className="cg-v2-brand" onClick={onBack} aria-label="Hearthdle">
        <img className="cg-v2-brand-mug is-left" src="/ui/home-v2/header-mug-cropped.png" alt="" />
        <span>Hearthdle</span>
        <img className="cg-v2-brand-mug" src="/ui/home-v2/header-mug-cropped.png" alt="" />
      </button>

      <div className="cg-v2-actions">
        <LanguageToggle compact className="cg-v2-language" />
      </div>
    </header>
  );
}

function ConditionContent({ condition }) {
  if (condition.icon) {
    return (
      <div
        className="cg-condition-icon-frame"
        title={condition.shortLabel}
        data-label={condition.shortLabel}
      >
        <img
          className="cg-condition-icon"
          src={condition.icon}
          alt={condition.shortLabel}
          loading="eager"
          decoding="async"
          onError={(event) => {
            const icon = event.currentTarget;
            const fallback = icon.parentElement?.querySelector(".cg-condition-icon-fallback");

            icon.style.display = "none";
            if (fallback) fallback.hidden = false;
          }}
        />
        <span className="cg-condition-icon-fallback" hidden>
          {condition.shortLabel}
        </span>
      </div>
    );
  }

  return (
    <>
      <span>{condition.description}</span>
      <strong>{condition.shortLabel}</strong>
    </>
  );
}

function EmptyState({
  copy,
  t,
  cards,
  gridMode,
  gridModes,
  modeConfig,
  onBack,
  onChangeMode,
  onStartNewGrid,
}) {
  return (
    <main className="cg-page">
      <GameHeader copy={copy} onBack={onBack} />
      <section className="cg-shell">
        <section className="cg-empty">
        <button type="button" className="cg-secondary-button" onClick={onBack}>
          {t("common.backHome")}
        </button>
        <h1>{t("grid.title")}</h1>
        <p>
          {!cards.length ? t("grid.preparing") : t("grid.generationFailedShort")}
        </p>

        {cards.length ? (
          <>
            <div className="cg-mode-selector cg-mode-selector-empty">
              <span>{t("grid.modeLabelFull")}</span>
              <div className="cg-mode-buttons">
                {Object.values(gridModes).map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    className={gridMode === mode.id ? "is-active" : ""}
                    onClick={() => onChangeMode(mode.id)}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
              <p>{modeConfig.description}</p>
            </div>

            <button type="button" className="cg-primary-button" onClick={onStartNewGrid}>
              {t("grid.retry")}
            </button>
          </>
        ) : null}
        </section>
      </section>
    </main>
  );
}

function SolvedCard({ card, locale }) {
  const imageSrc = getCardImage(card, locale);

  if (!imageSrc) {
    return <strong>{getCardName(card, locale)}</strong>;
  }

  return (
    <div className="cg-solved-card-frame">
      <img
        className="cg-solved-card-image"
        src={imageSrc}
        alt={getCardName(card, locale)}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

function AnswerCell({
  answerKey,
  solvedCard,
  selected,
  revealed,
  rowIndex,
  columnIndex,
  locale,
  t,
  onSelectCell,
}) {
  return (
    <button
      type="button"
      className={`cg-answer-cell ${selected ? "is-selected" : ""} ${
        solvedCard ? "is-solved" : ""
      } ${revealed ? "is-revealed" : ""}`}
      onClick={() => onSelectCell({ row: rowIndex, column: columnIndex })}
      title={solvedCard ? getCardName(solvedCard, locale) : t("grid.emptyCell")}
      data-cell-key={answerKey}
    >
      {solvedCard ? <SolvedCard card={solvedCard} locale={locale} /> : <span>+</span>}
    </button>
  );
}

function GridBoard({ grid, answers, revealedCells, selectedCell, locale, t, onSelectCell }) {
  return (
    <div className="cg-board-panel">
      <div className="cg-board" role="grid" aria-label={t("grid.title")}>
        <div className="cg-corner-cell">
          <span>GRID</span>
        </div>

        {grid.columns.map((column) => (
          <div className="cg-condition-cell cg-column-cell" key={column.id}>
            <ConditionContent condition={column} />
          </div>
        ))}

        {grid.rows.map((row, rowIndex) => (
          <div className="cg-row-fragment" key={row.id}>
            <div className="cg-condition-cell cg-row-cell">
              <ConditionContent condition={row} />
            </div>

            {grid.columns.map((column, columnIndex) => {
              const answerKey = `${rowIndex}-${columnIndex}`;
              const solvedCard = answers[answerKey];
              const selected =
                selectedCell.row === rowIndex && selectedCell.column === columnIndex;
              const revealed = revealedCells.has(answerKey);

              return (
                <AnswerCell
                  key={answerKey}
                  answerKey={answerKey}
                  solvedCard={solvedCard}
                  selected={selected}
                  revealed={revealed}
                  rowIndex={rowIndex}
                  columnIndex={columnIndex}
                  locale={locale}
                  t={t}
                  onSelectCell={onSelectCell}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function Suggestions({ suggestions, locale, isComplete, onPickSuggestion }) {
  if (suggestions.length === 0 || isComplete) return null;

  return (
    <div className="cg-suggestions">
      {suggestions.map((card) => (
        <button
          type="button"
          key={card.id}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onPickSuggestion(getCardName(card, locale))}
        >
          {getCardName(card, locale)}
        </button>
      ))}
    </div>
  );
}

function AnswerForm({
  t,
  answer,
  suggestions,
  isComplete,
  locale,
  inputRef,
  onAnswerChange,
  onPickSuggestion,
  onSubmitAnswer,
}) {
  return (
    <form className="cg-answer-form" onSubmit={onSubmitAnswer}>
      <label htmlFor="grid-card-answer">{t("grid.cardLabel")}</label>
      <div className="cg-input-row cg-input-row-single">
        <input
          id="grid-card-answer"
          ref={inputRef}
          value={answer}
          onChange={(event) => onAnswerChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
            event.preventDefault();
            onSubmitAnswer(event);
          }}
          placeholder={t("grid.answerPlaceholder")}
          autoComplete="off"
          disabled={isComplete}
        />
      </div>
      <p className="cg-enter-hint">{t("grid.enterHint")}</p>

      <Suggestions
        suggestions={suggestions}
        locale={locale}
        isComplete={isComplete}
        onPickSuggestion={onPickSuggestion}
      />
    </form>
  );
}

function ConditionChip({ condition }) {
  if (!condition) return null;

  return (
    <div className="cg-selection-chip" title={condition.shortLabel}>
      {condition.icon ? (
        <img src={condition.icon} alt="" className="cg-selection-chip-icon" loading="eager" decoding="async" />
      ) : null}
      <span>{condition.shortLabel}</span>
    </div>
  );
}

function SelectionSummary({ t, selectedRow, selectedColumn }) {
  return (
    <div className="cg-selection-summary" aria-label={t("grid.selectedCell")}>
      <ConditionChip condition={selectedRow} />
      <span className="cg-selection-join">+</span>
      <ConditionChip condition={selectedColumn} />
    </div>
  );
}

function GridResultOverlay({ t, copy, result, rewardMessage, onViewResults, onBack }) {
  const isWon = result === "won";

  return (
    <GameResultOverlay
      tone={isWon ? "success" : "danger"}
      kicker={t("grid.resultKicker")}
      title={isWon ? t("grid.resultVictoryTitle") : t("grid.resultTimeTitle")}
      text={isWon ? t("grid.resultVictoryText") : t("grid.resultTimeText")}
      rewardMessage={rewardMessage}
      primaryAction={{ label: t("grid.viewResults"), onClick: onViewResults }}
      secondaryActions={[{ label: copy.backHome, onClick: onBack }]}
    />
  );
}

function BottomControls({
  t,
  selectedRow,
  selectedColumn,
  mistakes,
  message,
  answer,
  suggestions,
  isComplete,
  locale,
  inputRef,
  onAnswerChange,
  onPickSuggestion,
  onSubmitAnswer,
}) {
  const shouldShowMessage = Boolean(message) || mistakes > 0 || isComplete;

  return (
    <section className="cg-bottom-controls">
      <SelectionSummary
        t={t}
        selectedRow={selectedRow}
        selectedColumn={selectedColumn}
      />

      <AnswerForm
        t={t}
        answer={answer}
        suggestions={suggestions}
        isComplete={isComplete}
        locale={locale}
        inputRef={inputRef}
        onAnswerChange={onAnswerChange}
        onPickSuggestion={onPickSuggestion}
        onSubmitAnswer={onSubmitAnswer}
      />

      {shouldShowMessage ? (
        <div className="cg-message cg-message-inline">
          <p>{isComplete ? t("grid.completed") : message}</p>
          <span>{t("grid.mistakes", { mistakes })}</span>
        </div>
      ) : null}
    </section>
  );
}

function CardGridGame({ cards, onBack }) {
  const { locale, t } = useLanguage();
  const copy = useCardGridCopy(locale);
  const todayKey = useMemo(() => getTodayKey(), []);
  const [gridMode, setGridMode] = useState("easy");
  const [selectedMode, setSelectedMode] = useState(null);
  const gridModes = useMemo(() => getGridModes(t), [t]);
  const modeConfig = gridModes[gridMode];

  const playableCards = useMemo(() => cards.filter(isPlayableGridCard), [cards]);

  const conditionPool = useMemo(
    () => buildConditionPool(cards, modeConfig.minCardsInCondition, locale, t),
    [cards, modeConfig.minCardsInCondition, locale, t]
  );

  const [grid, setGrid] = useState(null);
  const [selectedCell, setSelectedCell] = useState({ row: 0, column: 0 });
  const [answers, setAnswers] = useState({});
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [mistakes, setMistakes] = useState(0);
  const [revealedCells, setRevealedCells] = useState(new Set());
  const [suppressSuggestions, setSuppressSuggestions] = useState(false);
  const [endOverlay, setEndOverlay] = useState(null);
  const [resultsMode, setResultsMode] = useState(null);
  const [dailyProgress, setDailyProgress] = useState(() => getDailyGameProgress(CARD_GRID_GAME_ID, todayKey));
  const [rewardMessage, setRewardMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const answerInputRef = useRef(null);
  const latestDailyRunRef = useRef(null);
  const didFinalizeDailyRef = useRef(false);

  const usedCardIds = useMemo(
    () => new Set(Object.values(answers).map((card) => card.id)),
    [answers]
  );

  const correctCount = Object.keys(answers).length;
  const selectedKey = `${selectedCell.row}-${selectedCell.column}`;
  const selectedRow = grid?.rows[selectedCell.row];
  const selectedColumn = grid?.columns[selectedCell.column];
  const isComplete = correctCount >= TOTAL_CELLS;
  const isDailyMode = selectedMode === GAME_MODE_IDS.DAILY;
  const hasConsumedDailyAttempt = isDailyMode && dailyProgress.completed;
  const isDailyTimerRunning =
    isDailyMode &&
    grid &&
    !hasConsumedDailyAttempt &&
    !isComplete &&
    !endOverlay &&
    !resultsMode &&
    typeof timeLeft === "number";


  const suggestions = useMemo(() => {
    if (suppressSuggestions || normalize(answer).length < 3) return [];

    return getSuggestions(playableCards, answer, usedCardIds);
  }, [playableCards, answer, usedCardIds, suppressSuggestions]);

  useEffect(() => {
    setDailyProgress(getDailyGameProgress(CARD_GRID_GAME_ID, todayKey));
  }, [todayKey]);

  function resetGrid(nextGrid, nextMessage, options = {}) {
    const restoredAnswers = options.answers ?? {};

    setGrid(nextGrid);
    setAnswers(restoredAnswers);
    setMistakes(options.mistakes ?? 0);
    setRevealedCells(new Set(options.revealedCells ?? []));
    setSelectedCell(options.selectedCell ?? { row: 0, column: 0 });
    setAnswer("");
    setSuppressSuggestions(false);
    setEndOverlay(null);
    setResultsMode(options.resultsMode ?? null);
    setRewardMessage("");
    setTimeLeft(null);
    setMessage(nextMessage);
  }

  function makeGridReadyMessage() {
    return "";
  }

  function buildRevealedAnswerState(baseAnswers = answers, targetGrid = grid, baseRevealedCells = revealedCells) {
    if (!targetGrid) {
      return { answers: baseAnswers, revealedCells: new Set(baseRevealedCells) };
    }

    const nextAnswers = { ...baseAnswers };
    const nextRevealedCells = new Set(baseRevealedCells);
    const usedIds = new Set(Object.values(nextAnswers).map((card) => card.id));

    targetGrid.rows.forEach((_, rowIndex) => {
      targetGrid.columns.forEach((__, columnIndex) => {
        const key = `${rowIndex}-${columnIndex}`;
        if (nextAnswers[key]) return;

        const fallbackCard = (targetGrid.candidateMap[key] ?? []).find((card) => !usedIds.has(card.id));
        if (!fallbackCard) return;

        nextAnswers[key] = fallbackCard;
        usedIds.add(fallbackCard.id);
        nextRevealedCells.add(key);
      });
    });

    return { answers: nextAnswers, revealedCells: nextRevealedCells };
  }

  function getDailyReviewState(nextGrid) {
    const latestProgress = getDailyGameProgress(CARD_GRID_GAME_ID, todayKey);

    if (!latestProgress.completed || !latestProgress.answerIds || !nextGrid) {
      return null;
    }

    const restoredAnswers = restoreAnswersFromIds(latestProgress.answerIds, playableCards);

    if (latestProgress.lastWasCorrect) {
      const restoredKeys = Object.keys(restoredAnswers);
      return {
        answers: restoredAnswers,
        revealedCells: restoredKeys,
        resultsMode: "won",
      };
    }

    const revealedState = buildRevealedAnswerState(restoredAnswers, nextGrid, Object.keys(restoredAnswers));

    return {
      answers: revealedState.answers,
      revealedCells: Array.from(revealedState.revealedCells),
      resultsMode: latestProgress.failedReason === "time" ? "time" : "time",
    };
  }

  function handleAnswerChange(value) {
    setSuppressSuggestions(false);
    setAnswer(value);
  }

  function handleSuggestionPick(value) {
    setAnswer(value);
    setSuppressSuggestions(true);
    requestAnimationFrame(() => {
      answerInputRef.current?.focus();
    });
  }

  function revealAllPendingAnswers() {
    if (!grid) return;

    const revealedState = buildRevealedAnswerState();
    setAnswers(revealedState.answers);
    setRevealedCells(revealedState.revealedCells);

    return revealedState;
  }

  function finalizeDailyGridFailure(reason = "exit", snapshot = latestDailyRunRef.current) {
    if (!snapshot?.grid || snapshot.selectedMode !== GAME_MODE_IDS.DAILY || snapshot.dailyProgress?.completed) return null;
    if (didFinalizeDailyRef.current) return null;

    didFinalizeDailyRef.current = true;

    const revealedState = buildRevealedAnswerState(
      snapshot.answers,
      snapshot.grid,
      snapshot.revealedCells,
    );

    const nextProgress = saveDailyChallengeResult(CARD_GRID_GAME_ID, todayKey, {
      completed: true,
      completedAt: new Date().toISOString(),
      rewardClaimed: false,
      inProgress: false,
      answerIds: serializeAnswerIds(revealedState.answers),
      completedGridMode: snapshot.gridMode,
      lastWasCorrect: false,
      failedReason: reason,
      mistakes: snapshot.mistakes,
    });

    setDailyProgress(nextProgress);
    return revealedState;
  }

  function viewEndResults() {
    if (endOverlay === "time") {
      revealAllPendingAnswers();
    }

    setResultsMode(endOverlay ?? "won");
    setEndOverlay(null);
  }

  function createNewGrid(isNewGrid = false, modeOverride = selectedMode) {
    const isDailyMode = modeOverride === GAME_MODE_IDS.DAILY;
    const nextGrid = generateGrid(
      playableCards,
      conditionPool,
      modeConfig.minCandidatesPerCell,
      isDailyMode ? getDailyGridSeed(todayKey, gridMode) : null
    );

    const reviewState = isDailyMode ? getDailyReviewState(nextGrid) : null;
    resetGrid(nextGrid, makeGridReadyMessage(nextGrid, isNewGrid), reviewState ?? {});

    if (isDailyMode && !reviewState) {
      didFinalizeDailyRef.current = false;
      saveDailyChallengeResult(CARD_GRID_GAME_ID, todayKey, {
        inProgress: true,
        startedAt: new Date().toISOString(),
        answerIds: {},
        completedGridMode: gridMode,
        lastWasCorrect: false,
        failedReason: null,
        mistakes: 0,
      });
      setDailyProgress(getDailyGameProgress(CARD_GRID_GAME_ID, todayKey));
      setTimeLeft(CARD_GRID_DAILY_TIME_SECONDS);
    }
  }

  useEffect(() => {
    if (!cards.length || !selectedMode) return;

    createNewGrid(false, selectedMode);
    // createNewGrid depends on current state by design; keep explicit deps to avoid
    // regenerating more often than the previous implementation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cards.length,
    playableCards,
    conditionPool,
    modeConfig.minCandidatesPerCell,
    gridMode,
    selectedMode,
    t,
  ]);

  function returnToModes() {
    setSelectedMode(null);
    setGrid(null);
    resetGrid(null, "");
    setDailyProgress(getDailyGameProgress(CARD_GRID_GAME_ID, todayKey));
  }

  function startNewGrid() {
    if (selectedMode === GAME_MODE_IDS.DAILY) {
      returnToModes();
      return;
    }

    createNewGrid(true);
  }

  function changeGridMode(nextMode) {
    if (nextMode === gridMode) return;
    setGridMode(nextMode);
  }

  function startMode(modeId) {
    setSelectedMode(modeId);
    setDailyProgress(getDailyGameProgress(CARD_GRID_GAME_ID, todayKey));
    resetGrid(null, "");
  }

  function moveToNextEmptyCell(nextAnswers) {
    const nextCell = getNextEmptyCell(selectedKey, nextAnswers);

    if (nextCell) {
      setSelectedCell(nextCell);
    }
  }

  function failDailyGridByTime() {
    if (!grid || selectedMode !== GAME_MODE_IDS.DAILY || dailyProgress.completed) return;

    const revealedState = finalizeDailyGridFailure("time");
    if (!revealedState) return;

    setAnswers(revealedState.answers);
    setRevealedCells(revealedState.revealedCells);
    setTimeLeft(0);
    setMessage(copy.dailyTimeExpiredMessage);
    setRewardMessage("");
    setEndOverlay("time");
    setResultsMode(null);
  }

  useEffect(() => {
    latestDailyRunRef.current = {
      grid,
      answers,
      revealedCells,
      selectedMode,
      dailyProgress,
      gridMode,
      mistakes,
      timeLeft,
    };
  }, [answers, dailyProgress, grid, gridMode, mistakes, revealedCells, selectedMode, timeLeft]);

  useEffect(() => {
    if (!isDailyTimerRunning) return;

    function handlePageHide() {
      finalizeDailyGridFailure("exit", latestDailyRunRef.current);
    }

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handlePageHide);
      finalizeDailyGridFailure("exit", latestDailyRunRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDailyTimerRunning]);

  useEffect(() => {
    if (!isDailyTimerRunning) return;

    const intervalId = window.setInterval(() => {
      setTimeLeft((current) => {
        if (typeof current !== "number") return current;
        return Math.max(0, current - 1);
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isDailyTimerRunning]);

  useEffect(() => {
    if (!isDailyTimerRunning || timeLeft !== 0) return;
    failDailyGridByTime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDailyTimerRunning, timeLeft]);

  function completeDailyGrid(nextAnswers) {
    completeDailyChallenge(CARD_GRID_GAME_ID, todayKey);
    didFinalizeDailyRef.current = true;
    saveDailyChallengeResult(CARD_GRID_GAME_ID, todayKey, {
      answerIds: serializeAnswerIds(nextAnswers),
      completedGridMode: gridMode,
      lastWasCorrect: true,
      failedReason: null,
      inProgress: false,
      mistakes,
    });

    let latestProgress = getDailyGameProgress(CARD_GRID_GAME_ID, todayKey);

    if (!latestProgress.rewardClaimed) {
      addArcaneBoxReward({
        boxId: ARCANE_BOX_ID,
        amount: DAILY_REWARD_BOX_AMOUNT,
        source: CARD_GRID_GAME_ID,
        dateKey: todayKey,
      });
      latestProgress = markDailyRewardClaimed(CARD_GRID_GAME_ID, todayKey);
      setRewardMessage(copy.dailyRewardEarned);
    } else {
      setRewardMessage(copy.dailyRewardAlreadyClaimed);
    }

    setDailyProgress(latestProgress);
  }

  function submitAnswer(event) {
    event?.preventDefault();

    if (!grid || isComplete || hasConsumedDailyAttempt) return;

    if (answers[selectedKey]) {
      setMessage(t("grid.message.cellCompleted"));
      return;
    }

    const exactMatches = getCardsByExactName(playableCards, answer);

    if (!exactMatches.length) {
      setMessage(t("grid.message.cardNotFound"));
      return;
    }

    const unusedMatches = exactMatches.filter((card) => !usedCardIds.has(card.id));

    if (!unusedMatches.length) {
      setMessage(t("grid.message.cardAlreadyUsed"));
      return;
    }

    const validCard = unusedMatches.find(
      (card) => selectedRow?.predicate(card) && selectedColumn?.predicate(card)
    );

    if (!validCard) {
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes);
      if (selectedMode === GAME_MODE_IDS.DAILY) {
        saveDailyChallengeResult(CARD_GRID_GAME_ID, todayKey, {
          inProgress: true,
          answerIds: serializeAnswerIds(answers),
          completedGridMode: gridMode,
          lastWasCorrect: false,
          failedReason: null,
          mistakes: nextMistakes,
        });
      }
      setMessage(
        t("grid.message.wrongCell", {
          name: getCardName(unusedMatches[0], locale),
          row: selectedRow?.shortLabel,
          column: selectedColumn?.shortLabel,
        })
      );
      return;
    }

    const nextAnswers = {
      ...answers,
      [selectedKey]: validCard,
    };

    const didCompleteGrid = Object.keys(nextAnswers).length >= TOTAL_CELLS;

    if (selectedMode === GAME_MODE_IDS.DAILY && !didCompleteGrid) {
      saveDailyChallengeResult(CARD_GRID_GAME_ID, todayKey, {
        inProgress: true,
        answerIds: serializeAnswerIds(nextAnswers),
        completedGridMode: gridMode,
        lastWasCorrect: false,
        failedReason: null,
        mistakes,
      });
    }

    setAnswers(nextAnswers);
    setAnswer("");
    setSuppressSuggestions(false);

    if (didCompleteGrid) {
      if (selectedMode === GAME_MODE_IDS.DAILY) {
        completeDailyGrid(nextAnswers);
      }

      setMessage("");
      setEndOverlay("won");
      setResultsMode(null);
      return;
    }

    setMessage(t("grid.message.correct", { name: getCardName(validCard, locale) }));
    moveToNextEmptyCell(nextAnswers);
  }

  if (!cards.length) {
    return (
      <EmptyState
        copy={copy}
        t={t}
        cards={cards}
        gridMode={gridMode}
        gridModes={gridModes}
        modeConfig={modeConfig}
        onBack={onBack}
        onChangeMode={changeGridMode}
        onStartNewGrid={startNewGrid}
      />
    );
  }

  if (!selectedMode) {
    return (
      <main className="cg-page">
        <GameHeader copy={copy} onBack={onBack} />
        <section className="cg-shell is-mode-select">
          <GameModeSelect
            copy={copy}
            title={copy.title}
            dailyCompleted={dailyProgress.completed}
            previewSrc="/ui/games/card-grid-v2/mode-example.svg"
            previewAlt={copy.exampleLabel}
            onSelectMode={startMode}
          />
        </section>
      </main>
    );
  }

  if (!grid) {
    return (
      <EmptyState
        copy={copy}
        t={t}
        cards={cards}
        gridMode={gridMode}
        gridModes={gridModes}
        modeConfig={modeConfig}
        onBack={onBack}
        onChangeMode={changeGridMode}
        onStartNewGrid={startNewGrid}
      />
    );
  }

  return (
    <main className={`cg-page ${resultsMode ? `is-results-${resultsMode}` : ""}`}>
      <GameHeader copy={copy} onBack={onBack} />
      <section className="cg-shell">
        <DailyTimer copy={copy} timeLeft={isDailyMode && !dailyProgress.completed ? timeLeft : null} />
        <section className="cg-layout cg-layout-single">
          <GridBoard
            answers={answers}
            revealedCells={revealedCells}
            selectedCell={selectedCell}
            locale={locale}
            t={t}
            onSelectCell={setSelectedCell}
          />

          <BottomControls
            t={t}
            selectedRow={selectedRow}
            selectedColumn={selectedColumn}
            mistakes={mistakes}
            message={message}
            answer={answer}
            suggestions={suggestions}
            isComplete={isComplete}
            locale={locale}
            inputRef={answerInputRef}
            onAnswerChange={handleAnswerChange}
            onPickSuggestion={handleSuggestionPick}
            onSubmitAnswer={submitAnswer}
          />
        </section>

        {selectedMode === GAME_MODE_IDS.INFINITE && resultsMode && !endOverlay ? (
          <div className="cg-post-result-actions">
            <button type="button" className="cg-primary-button" onClick={startNewGrid}>
              {t("grid.playAgain")}
            </button>
          </div>
        ) : null}
      </section>

      {endOverlay ? (
        <GridResultOverlay
          t={t}
          copy={copy}
          result={endOverlay}
          rewardMessage={rewardMessage}
          onViewResults={viewEndResults}
          onBack={returnToModes}
        />
      ) : null}
    </main>
  );
}

export default CardGridGame;
