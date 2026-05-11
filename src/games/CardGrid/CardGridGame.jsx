import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../../i18n/LanguageProvider";
import LanguageToggle from "../../shared/components/LanguageToggle/LanguageToggle";
import GameModeSelect from "../../shared/components/GameModeSelect/GameModeSelect";
import { GAME_MODE_IDS } from "../../shared/gameModes/gameModes";
import {
  completeDailyChallenge,
  getDailyGameProgress,
  getTodayKey,
  markDailyRewardClaimed,
  saveDailyChallengeResult,
} from "../../shared/progress/dailyProgress";
import { addPackReward } from "../../shared/rewards/rewardStore";
import {
  GRID_SIZE,
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

const CARD_GRID_GAME_ID = "card-grid";
const DAILY_REWARD_PACK_ID = "standard";

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

function ModeSelector({ t, gridMode, gridModes, modeConfig, onChangeMode }) {
  return (
    <div className="cg-mode-selector">
      <span>{t("grid.modeLabel")}</span>
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

function GridResultOverlay({ t, result, rewardMessage, onViewResults, onRestart }) {
  const isWon = result === "won";
  const confettiPieces = Array.from({ length: 34 });

  return (
    <div className="cg-result-backdrop" role="presentation">
      <section className={`cg-result-card ${isWon ? "is-won" : "is-time"}`} role="status" aria-live="polite">
        {isWon ? (
          <div className="cg-result-confetti" aria-hidden="true">
            {confettiPieces.map((_, index) => {
              const angle = (Math.PI * 2 * index) / confettiPieces.length;
              const distance = 120 + (index % 5) * 20;
              const x = Math.cos(angle) * distance;
              const y = Math.sin(angle) * distance - 20;

              return (
                <span
                  key={index}
                  style={{
                    "--x": `${x.toFixed(0)}px`,
                    "--y": `${y.toFixed(0)}px`,
                    "--r": `${index * 37}deg`,
                    "--delay": `${(index % 8) * 28}ms`,
                  }}
                />
              );
            })}
          </div>
        ) : null}

        <div className="cg-result-icon" aria-hidden="true">
          <span>{isWon ? "✓" : "×"}</span>
        </div>

        <p className="cg-result-kicker">{t("grid.resultKicker")}</p>
        <h2>{isWon ? t("grid.resultVictoryTitle") : t("grid.resultTimeTitle")}</h2>
        <p>{isWon ? t("grid.resultVictoryText") : t("grid.resultTimeText")}</p>
        {rewardMessage ? <p className="cg-result-reward">{rewardMessage}</p> : null}

        <div className="cg-result-actions">
          <button type="button" className="cg-secondary-button" onClick={onViewResults}>
            {t("grid.viewResults")}
          </button>
          <button type="button" className="cg-primary-button" onClick={onRestart}>
            {t("grid.playAgain")}
          </button>
        </div>
      </section>
    </div>
  );
}

function BottomControls({
  t,
  grid,
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
  const answerInputRef = useRef(null);

  const usedCardIds = useMemo(
    () => new Set(Object.values(answers).map((card) => card.id)),
    [answers]
  );

  const correctCount = Object.keys(answers).length;
  const selectedKey = `${selectedCell.row}-${selectedCell.column}`;
  const selectedRow = grid?.rows[selectedCell.row];
  const selectedColumn = grid?.columns[selectedCell.column];
  const isComplete = correctCount >= TOTAL_CELLS;

  const selectedCandidates = useMemo(() => {
    if (!grid) return [];

    return (grid.candidateMap[selectedKey] ?? []).filter((card) => !usedCardIds.has(card.id));
  }, [grid, selectedKey, usedCardIds]);

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
    setMessage(nextMessage);
  }

  function makeGridReadyMessage() {
    return "";
  }

  function getDailyReviewState(nextGrid) {
    const latestProgress = getDailyGameProgress(CARD_GRID_GAME_ID, todayKey);

    if (!latestProgress.completed || !latestProgress.answerIds || !nextGrid) {
      return null;
    }

    const restoredAnswers = restoreAnswersFromIds(latestProgress.answerIds, playableCards);
    const restoredKeys = Object.keys(restoredAnswers);

    return {
      answers: restoredAnswers,
      revealedCells: restoredKeys,
      resultsMode: latestProgress.completed ? "won" : null,
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

    const nextAnswers = { ...answers };
    const nextRevealedCells = new Set(revealedCells);
    const usedIds = new Set(Object.values(nextAnswers).map((card) => card.id));

    grid.rows.forEach((_, rowIndex) => {
      grid.columns.forEach((__, columnIndex) => {
        const key = `${rowIndex}-${columnIndex}`;
        if (nextAnswers[key]) return;

        const fallbackCard = (grid.candidateMap[key] ?? []).find((card) => !usedIds.has(card.id));
        if (!fallbackCard) return;

        nextAnswers[key] = fallbackCard;
        usedIds.add(fallbackCard.id);
        nextRevealedCells.add(key);
      });
    });

    setAnswers(nextAnswers);
    setRevealedCells(nextRevealedCells);
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

  function startNewGrid() {
    if (selectedMode === GAME_MODE_IDS.DAILY) {
      setSelectedMode(null);
      setGrid(null);
      resetGrid(null, "");
      setDailyProgress(getDailyGameProgress(CARD_GRID_GAME_ID, todayKey));
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

  function completeDailyGrid(nextAnswers) {
    completeDailyChallenge(CARD_GRID_GAME_ID, todayKey);
    saveDailyChallengeResult(CARD_GRID_GAME_ID, todayKey, {
      answerIds: serializeAnswerIds(nextAnswers),
      completedGridMode: gridMode,
      lastWasCorrect: true,
    });

    let latestProgress = getDailyGameProgress(CARD_GRID_GAME_ID, todayKey);

    if (!latestProgress.rewardClaimed) {
      addPackReward({
        packId: DAILY_REWARD_PACK_ID,
        amount: 1,
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

    if (!grid || isComplete) return;

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
      setMistakes((current) => current + 1);
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

  function revealSelectedAnswer() {
    if (!grid || isComplete) return;

    if (answers[selectedKey]) {
      setMessage(t("grid.message.cellCompleted"));
      return;
    }

    const revealedCard = selectedCandidates.find((card) => !usedCardIds.has(card.id));

    if (!revealedCard) {
      setMessage(t("grid.message.noRevealAvailable"));
      return;
    }

    const nextAnswers = {
      ...answers,
      [selectedKey]: revealedCard,
    };

    setAnswers(nextAnswers);
    setRevealedCells((current) => {
      const updated = new Set(current);
      updated.add(selectedKey);
      return updated;
    });
    setAnswer("");
    setSuppressSuggestions(false);
    setMessage(t("grid.message.revealed", { name: getCardName(revealedCard, locale) }));
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
        <section className="cg-layout cg-layout-single">
          <GridBoard
            grid={grid}
            answers={answers}
            revealedCells={revealedCells}
            selectedCell={selectedCell}
            locale={locale}
            t={t}
            onSelectCell={setSelectedCell}
          />

          <BottomControls
            t={t}
            grid={grid}
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
      </section>

      {endOverlay ? (
        <GridResultOverlay
          t={t}
          result={endOverlay}
          rewardMessage={rewardMessage}
          onViewResults={viewEndResults}
          onRestart={startNewGrid}
        />
      ) : null}
    </main>
  );
}

export default CardGridGame;
