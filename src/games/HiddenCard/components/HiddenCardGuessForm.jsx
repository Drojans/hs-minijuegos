import CardAutocomplete from "../../../shared/components/CardAutocomplete/CardAutocomplete";

function HiddenCardGuessForm({
  copy,
  query,
  suggestions,
  disabled,
  message,
  canSubmit,
  onChange,
  onSubmit,
  onPickSuggestion,
  inputRef,
}) {
  return (
    <form className="hidden-card-form" onSubmit={onSubmit}>
      <CardAutocomplete
        id="hidden-card-answer"
        label={copy.inputLabel}
        value={query}
        suggestions={disabled ? [] : suggestions}
        getSuggestionKey={({ card }) => card.id}
        getSuggestionLabel={({ label }) => label}
        onPickSuggestion={({ card }) => onPickSuggestion(card)}
        onChange={onChange}
        inputRef={inputRef}
        placeholder={copy.inputPlaceholder}
        disabled={disabled}
        canSubmit={canSubmit}
        submitLabel={copy.submit}
        rowClassName="hidden-card-input-row"
      />
      {message ? <p className="hidden-card-form-message">{message}</p> : null}
    </form>
  );
}

export default HiddenCardGuessForm;
