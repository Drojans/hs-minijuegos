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
      <label>{copy.inputLabel}</label>
      <div className="hidden-card-input-row">
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => onChange(event.target.value)}
          placeholder={copy.inputPlaceholder}
          disabled={disabled}
          autoComplete="off"
        />
        <button type="submit" disabled={disabled || !canSubmit}>{copy.submit}</button>
      </div>
      {message ? <p className="hidden-card-form-message">{message}</p> : null}
      {!disabled && suggestions.length > 0 ? (
        <div className="hidden-card-suggestions">
          {suggestions.map(({ card, label }) => (
            <button key={card.id} type="button" onClick={() => onPickSuggestion(card)}>
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </form>
  );
}

export default HiddenCardGuessForm;
