import CardAutocomplete from "../../../shared/components/CardAutocomplete/CardAutocomplete";
import { getCardName } from "../cardGridGameConfig";

function AnswerForm({
  t,
  answer,
  suggestions,
  isComplete,
  locale,
  inputRef,
  message,
  messageTone,
  feedbackNonce,
  onAnswerChange,
  onPickSuggestion,
  onSubmitAnswer,
}) {
  const shouldShowInputError = messageTone === "error" && Boolean(message);
  const shakeClass = shouldShowInputError ? `is-shake-${feedbackNonce % 2 === 0 ? "even" : "odd"}` : "";

  function handleFormKeyDown(event) {
    if (event.nativeEvent.isComposing) return;
    if (event.key !== "Enter") return;
    if (event.defaultPrevented) return;

    onSubmitAnswer(event);
  }

  return (
    <form
      className={`cg-answer-form ${shouldShowInputError ? "is-error" : ""} ${shakeClass}`.trim()}
      onSubmit={onSubmitAnswer}
      onKeyDown={handleFormKeyDown}
    >
      <CardAutocomplete
        id="grid-card-answer"
        label={t("grid.cardLabel")}
        value={answer}
        suggestions={isComplete ? [] : suggestions}
        getSuggestionKey={(card) => card.id}
        getSuggestionLabel={(card) => getCardName(card, locale)}
        submitOnExactValue
        onPickSuggestion={(card) => onPickSuggestion(getCardName(card, locale))}
        onRequestSubmit={onSubmitAnswer}
        onChange={onAnswerChange}
        inputRef={inputRef}
        placeholder={t("grid.answerPlaceholder")}
        disabled={isComplete}
        rowClassName="cg-input-row cg-input-row-single"
      />
      <button type="submit" className="cg-hidden-submit" tabIndex={-1} aria-hidden="true">
        {t("grid.submit")}
      </button>
      <p className="cg-enter-hint">{t("grid.enterHint")}</p>
      {shouldShowInputError ? (
        <div key={`grid-input-error-${feedbackNonce}-${message}`} className="cg-input-feedback is-error" role="alert">
          <p>{message}</p>
        </div>
      ) : null}
    </form>
  );
}

function ConditionChip({ condition }) {
  if (!condition) return null;

  return (
    <span className="cg-selection-chip" title={condition.shortLabel}>
      {condition.icon ? (
        <img src={condition.icon} alt="" className="cg-selection-chip-icon" loading="eager" decoding="async" />
      ) : null}
      <span>{condition.shortLabel}</span>
    </span>
  );
}

function PlacementChoiceButton({ t, placement, onChoosePlacement }) {
  return (
    <button
      type="button"
      className="cg-placement-choice"
      onClick={() => onChoosePlacement(placement)}
      title={`${placement.rowCondition.shortLabel} + ${placement.columnCondition.shortLabel}`}
    >
      <span className="cg-placement-choice-label">{t("grid.placeHere")}</span>
      <span className="cg-placement-choice-conditions">
        <ConditionChip condition={placement.rowCondition} />
        <span className="cg-selection-join">+</span>
        <ConditionChip condition={placement.columnCondition} />
      </span>
    </button>
  );
}

function AutoPlacementPanel({ t, pendingPlacement, onChoosePlacement }) {
  if (pendingPlacement?.placements?.length) {
    return (
      <div className="cg-selection-summary cg-placement-panel is-choice">
        <p>{t("grid.choiceHelp")}</p>
        <div className="cg-placement-options">
          {pendingPlacement.placements.map((placement) => (
            <PlacementChoiceButton
              key={placement.key}
              t={t}
              placement={placement}
              onChoosePlacement={onChoosePlacement}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="cg-selection-summary cg-placement-panel">
      <p>{t("grid.autoPlacementHint")}</p>
    </div>
  );
}

function CardGridControls({
  t,
  pendingPlacement,
  message,
  messageTone,
  feedbackNonce,
  answer,
  suggestions,
  isComplete,
  locale,
  inputRef,
  onAnswerChange,
  onPickSuggestion,
  onSubmitAnswer,
  onChoosePlacement,
}) {
  const shouldShowMessage = messageTone !== "error" && (Boolean(message) || isComplete);

  return (
    <section className={`cg-bottom-controls ${messageTone ? `is-${messageTone}` : ""}`}>
      <AutoPlacementPanel
        t={t}
        pendingPlacement={pendingPlacement}
        onChoosePlacement={onChoosePlacement}
      />

      <AnswerForm
        t={t}
        answer={answer}
        suggestions={suggestions}
        isComplete={isComplete}
        locale={locale}
        inputRef={inputRef}
        message={message}
        messageTone={messageTone}
        feedbackNonce={feedbackNonce}
        onAnswerChange={onAnswerChange}
        onPickSuggestion={onPickSuggestion}
        onSubmitAnswer={onSubmitAnswer}
      />

      {shouldShowMessage ? (
        <div
          key={`${messageTone}-${feedbackNonce}-${message}`}
          className={`cg-message cg-message-inline ${messageTone ? `is-${messageTone}` : ""}`}
        >
          <p>{isComplete ? t("grid.completed") : message}</p>
        </div>
      ) : null}
    </section>
  );
}

export default CardGridControls;
