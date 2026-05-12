import { getCardName } from "../cardGridGameConfig";

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

function CardGridControls({
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

export default CardGridControls;
