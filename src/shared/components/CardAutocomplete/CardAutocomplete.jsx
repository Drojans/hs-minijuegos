import { useEffect, useMemo, useRef, useState } from "react";
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

function normalizeAutocompleteText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[’']/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .toLowerCase();
}

function scrollOptionIntoView(listElement, optionElement) {
  if (!listElement || !optionElement) return;

  const extraSpace = 8;
  const optionTop = optionElement.offsetTop;
  const optionBottom = optionTop + optionElement.offsetHeight;
  const visibleTop = listElement.scrollTop;
  const visibleBottom = visibleTop + listElement.clientHeight;

  if (optionTop < visibleTop) {
    listElement.scrollTo({ top: Math.max(0, optionTop - extraSpace), behavior: "smooth" });
    return;
  }

  if (optionBottom > visibleBottom) {
    listElement.scrollTo({
      top: optionBottom - listElement.clientHeight + extraSpace,
      behavior: "smooth",
    });
  }
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
  submitOnExactValue = false,
  onChange,
  onPickSuggestion,
  onRequestSubmit,
}) {
  const availableSuggestions = useMemo(
    () => (disabled ? [] : suggestions).filter(Boolean),
    [disabled, suggestions],
  );
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const suggestionsListRef = useRef(null);
  const suggestionButtonRefs = useRef([]);

  const visibleSuggestions = isSuggestionsOpen ? availableSuggestions : [];

  useEffect(() => {
    suggestionButtonRefs.current = suggestionButtonRefs.current.slice(0, availableSuggestions.length);

    if (!isSuggestionsOpen || availableSuggestions.length === 0) {
      setActiveIndex(-1);
      return;
    }

    setActiveIndex((current) => {
      if (current >= 0 && current < availableSuggestions.length) return current;
      return 0;
    });
  }, [availableSuggestions.length, isSuggestionsOpen, value]);

  useEffect(() => {
    if (activeIndex < 0) return;
    scrollOptionIntoView(suggestionsListRef.current, suggestionButtonRefs.current[activeIndex]);
  }, [activeIndex, visibleSuggestions.length]);

  function openSuggestions() {
    if (availableSuggestions.length === 0) return;
    setIsSuggestionsOpen(true);
  }

  function closeSuggestions() {
    setIsSuggestionsOpen(false);
    setActiveIndex(-1);
  }

  function pickSuggestion(suggestion) {
    if (!suggestion) return;
    closeSuggestions();
    onPickSuggestion?.(suggestion);
  }

  function handleChange(event) {
    setIsSuggestionsOpen(true);
    onChange?.(event.target.value);
  }

  function handleKeyDown(event) {
    if (event.nativeEvent.isComposing) return;

    if (event.key === "ArrowDown" && availableSuggestions.length > 0) {
      event.preventDefault();
      setIsSuggestionsOpen(true);
      setActiveIndex((current) => clampIndex(current + 1, availableSuggestions.length));
      return;
    }

    if (event.key === "ArrowUp" && availableSuggestions.length > 0) {
      event.preventDefault();
      setIsSuggestionsOpen(true);
      setActiveIndex((current) => clampIndex(current - 1, availableSuggestions.length));
      return;
    }

    if (event.key === "Enter") {
      const normalizedValue = normalizeAutocompleteText(value);
      const hasExactVisibleSuggestion =
        submitOnExactValue &&
        normalizedValue &&
        visibleSuggestions.some((suggestion) =>
          normalizeAutocompleteText(getSuggestionLabel(suggestion)) === normalizedValue
        );

      if (onRequestSubmit && hasExactVisibleSuggestion) {
        event.preventDefault();
        closeSuggestions();
        onRequestSubmit(event);
        return;
      }

      if (visibleSuggestions.length > 0 && activeIndex >= 0) {
        event.preventDefault();
        pickSuggestion(visibleSuggestions[activeIndex]);
        return;
      }

      if (onRequestSubmit) {
        event.preventDefault();
        closeSuggestions();
        onRequestSubmit(event);
        return;
      }
    }

    if (event.key === "Escape" && isSuggestionsOpen) {
      event.preventDefault();
      closeSuggestions();
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
          onChange={handleChange}
          onFocus={openSuggestions}
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
        <div id={listId} ref={suggestionsListRef} className="card-autocomplete-suggestions" role="listbox">
          {visibleSuggestions.map((suggestion, index) => {
            const labelText = getSuggestionLabel(suggestion);
            const isActive = index === activeIndex;

            return (
              <button
                id={id ? `${id}-suggestion-${index}` : undefined}
                key={getSuggestionKey(suggestion, index)}
                ref={(element) => {
                  suggestionButtonRefs.current[index] = element;
                }}
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
