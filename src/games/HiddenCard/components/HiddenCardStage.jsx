import HiddenCardGuessForm from "./HiddenCardGuessForm";
import HiddenCardGuessesList from "./HiddenCardGuessesList";
import HiddenCardHintList from "./HiddenCardHintList";
import HiddenCardPreview from "./HiddenCardPreview";

function HiddenCardStage({
  copy,
  card,
  locale,
  revealLevel,
  isRevealed,
  result,
  isReview,
  isDailyMode,
  query,
  suggestions,
  message,
  canSubmitGuess,
  inputRef,
  guesses,
  onQueryChange,
  onSubmitGuess,
  onPickSuggestion,
  onStartNextInfiniteRound,
}) {
  return (
    <section className="hidden-card-stage">
      <HiddenCardPreview
        card={card}
        locale={locale}
        revealLevel={revealLevel}
        isRevealed={isRevealed}
        copy={copy}
      />

      <div className="hidden-card-side-panel">
        <HiddenCardHintList copy={copy} card={card} locale={locale} revealLevel={revealLevel} />

        {!isRevealed && !result ? (
          <HiddenCardGuessForm
            copy={copy}
            query={query}
            suggestions={suggestions}
            disabled={Boolean(result || isReview)}
            message={message}
            inputRef={inputRef}
            canSubmit={canSubmitGuess}
            onChange={onQueryChange}
            onSubmit={onSubmitGuess}
            onPickSuggestion={onPickSuggestion}
          />
        ) : null}

        <HiddenCardGuessesList copy={copy} guesses={guesses} />

        {isRevealed && !isDailyMode && result ? (
          <button type="button" className="hidden-card-button is-primary" onClick={onStartNextInfiniteRound}>
            {copy.playAgain}
          </button>
        ) : null}
      </div>
    </section>
  );
}

export default HiddenCardStage;
