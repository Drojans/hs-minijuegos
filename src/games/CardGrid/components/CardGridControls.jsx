import CardAutocomplete from "../../../shared/components/CardAutocomplete/CardAutocomplete";
import { getCardName } from "../cardGridGameConfig";

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
      <CardAutocomplete
        id="grid-card-answer"
        label={t("grid.cardLabel")}
        value={answer}
        suggestions={isComplete ? [] : suggestions}
        getSuggestionKey={(card) => card.id}
        getSuggestionLabel={(card) => getCardName(card, locale)}
        onPickSuggestion={(card) => onPickSuggestion(getCardName(card, locale))}
        onChange={onAnswerChange}
        inputRef={inputRef}
        placeholder={t("grid.answerPlaceholder")}
        disabled={isComplete}
        rowClassName="cg-input-row cg-input-row-single"
      />
      <p className="cg-enter-hint">{t("grid.enterHint")}</p>
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
