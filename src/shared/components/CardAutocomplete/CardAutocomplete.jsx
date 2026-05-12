import { useEffect, useMemo, useState } from "react";
import "./CardAutocomplete.css";

function defaultGetSuggestionKey(suggestion, index) {
  return suggestion?.id ?? suggestion?.card?.id ?? `${defaultGetSuggestionLabel(suggestion)}-${index}`;
}

function defaultGetSuggestionLabel(suggestion) {
  if (typeof suggestion === "string") return suggestion;
  return suggestion?.label ?? suggestion?.name ?? suggestion?.card?.name ?? "";
}

function clampIndex(index, length) {
  if (length <= 0) return -1;
  if (index < 0) return length - 1;
  if (index >= length) return 0;
  return index;
}

function CardAutocomplete({
  id,
  label,
  value,
  placeholder,
  disabled = false,
  canSubmit = true,
  submitLabel,
  inputRef,
  className = "",
  rowClassName = "",
  inputClassName = "",
  submitButtonClassName = "",
  suggestions = [],
  getSuggestionKey = defaultGetSuggestionKey,
  getSuggestionLabel = defaultGetSuggestionLabel,
  onChange,
  onPickSuggestion,
}) {
  const visibleSuggestions = useMemo(
    () => (disabled ? [] : suggestions).filter(Boolean),
    [disabled, suggestions],
  );
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    setActiveIndex(visibleSuggestions.length > 0 ? 0 : -1);
  }, [value, visibleSuggestions.length]);

  function pickSuggestion(suggestion) {
    if (!suggestion) return;
    setActiveIndex(-1);
    onPickSuggestion?.(suggestion);
  }

  function handleKeyDown(event) {
    if (event.nativeEvent.isComposing) return;

    if (event.key === "ArrowDown" && visibleSuggestions.length > 0) {
      event.preventDefault();
      setActiveIndex((current) => clampIndex(current + 1, visibleSuggestions.length));
      return;
    }

    if (event.key === "ArrowUp" && visibleSuggestions.length > 0) {
      event.preventDefault();
      setActiveIndex((current) => clampIndex(current - 1, visibleSuggestions.length));
      return;
    }

    if (event.key === "Enter" && visibleSuggestions.length > 0 && activeIndex >= 0) {
      event.preventDefault();
      pickSuggestion(visibleSuggestions[activeIndex]);
      return;
    }

    if (event.key === "Escape" && visibleSuggestions.length > 0) {
      event.preventDefault();
      setActiveIndex(-1);
    }
  }

  const listId = id ? `${id}-suggestions` : undefined;
  const activeSuggestionId = activeIndex >= 0 && id ? `${id}-suggestion-${activeIndex}` : undefined;

  return (
    <div className={`card-autocomplete ${className}`.trim()}>
      {label ? <label htmlFor={id}>{label}</label> : null}
      <div className={`card-autocomplete-row ${rowClassName}`.trim()}>
        <input
          id={id}
          ref={inputRef}
          className={inputClassName}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          disabled={disabled}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={visibleSuggestions.length > 0}
          aria-controls={listId}
          aria-activedescendant={activeSuggestionId}
        />
        {submitLabel ? (
          <button type="submit" className={submitButtonClassName} disabled={disabled || !canSubmit}>
            {submitLabel}
          </button>
        ) : null}
      </div>

      {visibleSuggestions.length > 0 ? (
        <div id={listId} className="card-autocomplete-suggestions" role="listbox">
          {visibleSuggestions.map((suggestion, index) => {
            const labelText = getSuggestionLabel(suggestion);
            const isActive = index === activeIndex;

            return (
              <button
                id={id ? `${id}-suggestion-${index}` : undefined}
                key={getSuggestionKey(suggestion, index)}
                type="button"
                role="option"
                aria-selected={isActive}
                className={isActive ? "is-active" : ""}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => pickSuggestion(suggestion)}
              >
                {labelText}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default CardAutocomplete;
