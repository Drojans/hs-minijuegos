import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../i18n/LanguageProvider";
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
    </main>
  );
}

function GridHeader({ t, onBack, correctCount }) {
  return (
    <header className="cg-header">
      <button type="button" className="cg-secondary-button" onClick={onBack}>
        {t("common.backHome")}
      </button>

      <div className="cg-title-block">
        <p className="cg-eyebrow">{t("grid.minigame")}</p>
        <h1>{t("grid.title")}</h1>
        <p>{t("grid.subtitle")}</p>
      </div>

      <div className="cg-score-pill">
        <span>{t("grid.progress")}</span>
        <strong>{correctCount}/{TOTAL_CELLS}</strong>
      </div>
    </header>
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
  selectedKey,
  answers,
  locale,
  onAnswerChange,
  onSubmitAnswer,
  onRevealSelectedAnswer,
}) {
  return (
    <form className="cg-answer-form" onSubmit={onSubmitAnswer}>
      <label htmlFor="grid-card-answer">{t("grid.cardLabel")}</label>
      <div className="cg-input-row">
        <input
          id="grid-card-answer"
          value={answer}
          onChange={(event) => onAnswerChange(event.target.value)}
          placeholder={t("grid.answerPlaceholder")}
          autoComplete="off"
          disabled={isComplete}
        />
        <button type="submit" className="cg-primary-button" disabled={isComplete}>
          {t("grid.tryAnswer")}
        </button>
      </div>

      <Suggestions
        suggestions={suggestions}
        locale={locale}
        isComplete={isComplete}
        onPickSuggestion={onAnswerChange}
      />

      <button
        type="button"
        className="cg-reveal-button"
        onClick={onRevealSelectedAnswer}
        disabled={isComplete || Boolean(answers[selectedKey])}
      >
        {t("grid.revealAnswer")}
      </button>
    </form>
  );
}

function ControlPanel({
  t,
  grid,
  gridMode,
  gridModes,
  modeConfig,
  selectedRow,
  selectedColumn,
  selectedKey,
  correctCount,
  mistakes,
  message,
  answer,
  answers,
  suggestions,
  isComplete,
  locale,
  onChangeMode,
  onAnswerChange,
  onSubmitAnswer,
  onRevealSelectedAnswer,
  onStartNewGrid,
}) {
  return (
    <aside className="cg-control-panel">
      <div className="cg-current-cell">
        <p className="cg-eyebrow">{t("grid.selectedCell")}</p>
        <h2>
          {selectedRow?.shortLabel} + {selectedColumn?.shortLabel}
        </h2>
        <span>
          {t("grid.possibleAnswers", {
            count: grid.candidateMap[selectedKey]?.length ?? 0,
          })}
        </span>
      </div>

      <ModeSelector
        t={t}
        gridMode={gridMode}
        gridModes={gridModes}
        modeConfig={modeConfig}
        onChangeMode={onChangeMode}
      />

      <AnswerForm
        t={t}
        answer={answer}
        suggestions={suggestions}
        isComplete={isComplete}
        selectedKey={selectedKey}
        answers={answers}
        locale={locale}
        onAnswerChange={onAnswerChange}
        onSubmitAnswer={onSubmitAnswer}
        onRevealSelectedAnswer={onRevealSelectedAnswer}
      />

      <div className="cg-message">
        <p>{isComplete ? t("grid.completed") : message}</p>
        <span>{t("grid.mistakes", { mistakes })}</span>
      </div>

      <button type="button" className="cg-secondary-button" onClick={onStartNewGrid}>
        {t("grid.newGrid")}
      </button>
    </aside>
  );
}

function CardGridGame({ cards, onBack }) {
  const { locale, t } = useLanguage();
  const [gridMode, setGridMode] = useState("easy");
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
  const [message, setMessage] = useState(() => t("grid.message.initial"));
  const [mistakes, setMistakes] = useState(0);
  const [revealedCells, setRevealedCells] = useState(new Set());

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
    if (normalize(answer).length < 3) return [];

    return getSuggestions(playableCards, answer, usedCardIds);
  }, [playableCards, answer, usedCardIds]);

  function resetGrid(nextGrid, nextMessage) {
    setGrid(nextGrid);
    setAnswers({});
    setMistakes(0);
    setRevealedCells(new Set());
    setSelectedCell({ row: 0, column: 0 });
    setAnswer("");
    setMessage(nextMessage);
  }

  function makeGridReadyMessage(nextGrid, isNewGrid = false) {
    if (!nextGrid) return t("grid.message.generationFailed");

    if (gridMode === "easy") {
      return isNewGrid ? t("grid.message.easyNewReady") : t("grid.message.easyReady");
    }

    return isNewGrid ? t("grid.message.normalNewReady") : t("grid.message.normalReady");
  }

  function createNewGrid(isNewGrid = false) {
    const nextGrid = generateGrid(
      playableCards,
      conditionPool,
      modeConfig.minCandidatesPerCell
    );

    resetGrid(nextGrid, makeGridReadyMessage(nextGrid, isNewGrid));
  }

  useEffect(() => {
    if (!cards.length) return;

    createNewGrid(false);
    // createNewGrid depends on current state by design; keep explicit deps to avoid
    // regenerating more often than the previous implementation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cards.length,
    playableCards,
    conditionPool,
    modeConfig.minCandidatesPerCell,
    gridMode,
    t,
  ]);

  function startNewGrid() {
    createNewGrid(true);
  }

  function changeGridMode(nextMode) {
    if (nextMode === gridMode) return;
    setGridMode(nextMode);
  }

  function moveToNextEmptyCell(nextAnswers) {
    const nextCell = getNextEmptyCell(selectedKey, nextAnswers);

    if (nextCell) {
      setSelectedCell(nextCell);
    }
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

    setAnswers(nextAnswers);
    setAnswer("");
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
    setMessage(t("grid.message.revealed", { name: getCardName(revealedCard, locale) }));
    moveToNextEmptyCell(nextAnswers);
  }

  if (!cards.length || !grid) {
    return (
      <EmptyState
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
    <main className="cg-page">
      <section className="cg-shell">
        <GridHeader t={t} onBack={onBack} correctCount={correctCount} />

        <div className="cg-progress-track">
          <span
            className="cg-progress-fill"
            style={{ width: `${(correctCount / TOTAL_CELLS) * 100}%` }}
          />
        </div>

        <section className="cg-layout">
          <GridBoard
            grid={grid}
            answers={answers}
            revealedCells={revealedCells}
            selectedCell={selectedCell}
            locale={locale}
            t={t}
            onSelectCell={setSelectedCell}
          />

          <ControlPanel
            t={t}
            grid={grid}
            gridMode={gridMode}
            gridModes={gridModes}
            modeConfig={modeConfig}
            selectedRow={selectedRow}
            selectedColumn={selectedColumn}
            selectedKey={selectedKey}
            correctCount={correctCount}
            mistakes={mistakes}
            message={message}
            answer={answer}
            answers={answers}
            suggestions={suggestions}
            isComplete={isComplete}
            locale={locale}
            onChangeMode={changeGridMode}
            onAnswerChange={setAnswer}
            onSubmitAnswer={submitAnswer}
            onRevealSelectedAnswer={revealSelectedAnswer}
            onStartNewGrid={startNewGrid}
          />
        </section>
      </section>
    </main>
  );
}

export default CardGridGame;
