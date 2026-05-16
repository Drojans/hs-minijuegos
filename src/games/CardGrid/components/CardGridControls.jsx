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
        submitLabel={t("grid.submit")}
        submitButtonClassName="cg-check-button"
        canSubmit={!isComplete && Boolean(String(answer ?? "").trim())}
        onPickSuggestion={(card) => onPickSuggestion(getCardName(card, locale))}
        onRequestSubmit={onSubmitAnswer}
        onChange={onAnswerChange}
        inputRef={inputRef}
        placeholder={t("grid.answerPlaceholder")}
        disabled={isComplete}
        rowClassName="cg-input-row cg-input-row-single"
      />
      <p className="cg-enter-hint">{t("grid.enterHint")}</p>
      {shouldShowInputError ? (
        <div key={`grid-input-error-${feedbackNonce}-${message}`} className="cg-input-feedback is-error" role="alert">
          <p>{message}</p>
        </div>
      ) : null}
    </form>
  );
}

function AutoPlacementPanel({ t, pendingPlacement }) {
  if (pendingPlacement?.placements?.length) {
    return (
      <p className="cg-controls-help is-choice">
        {t("grid.choiceHelp")}
      </p>
    );
  }

  return (
    <p className="cg-controls-help">{t("grid.autoPlacementHint")}</p>
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
  onSurrender,
}) {
  const shouldShowMessage = messageTone !== "error" && (Boolean(message) || isComplete);

  const panelTitle = locale === "en" ? "Find a card" : "Busca una carta";

  return (
    <section className={`cg-bottom-controls ${messageTone ? `is-${messageTone}` : ""}`}>
      <header className="cg-controls-heading">
        <strong>{panelTitle}</strong>
      </header>

      <AutoPlacementPanel
        t={t}
        pendingPlacement={pendingPlacement}
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

      <button
        type="button"
        className="cg-surrender-button"
        onClick={onSurrender}
        disabled={isComplete}
      >
        {t("grid.surrender")}
      </button>

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
