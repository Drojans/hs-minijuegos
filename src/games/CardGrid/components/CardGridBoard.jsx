import { getCardImage, getCardName } from "../cardGridGameConfig";
import { getGridCellKey } from "../cardGridState";

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

function CardGridBoard({ grid, answers, revealedCells, selectedCell, locale, t, onSelectCell }) {
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
              const answerKey = getGridCellKey(rowIndex, columnIndex);
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

export default CardGridBoard;
