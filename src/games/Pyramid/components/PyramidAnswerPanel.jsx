import { GAME_MODE_IDS } from "../../../shared/gameModes/gameModes";
import CardAutocomplete from "../../../shared/components/CardAutocomplete/CardAutocomplete";
import { getCardName } from "../../../utils/cardLocale";

function PyramidAnswerPanel({
  copy,
  locale,
  result,
  isReview,
  showResults,
  selectedMode,
  answer,
  suggestions,
  message,
  messageTone,
  feedbackNonce,
  onAnswerChange,
  onSubmitAnswer,
  onSuggestionPick,
  onStartNextInfiniteRound,
}) {
  return (
    <section className="py-answer-panel">
      {showResults ? <p className="py-results-hint">{copy.resultsHint}</p> : null}

      {!result && !isReview ? (
        <form className="py-answer-form" onSubmit={onSubmitAnswer}>
          <CardAutocomplete
            id="pyramid-card-answer"
            value={answer}
            suggestions={suggestions}
            getSuggestionKey={(card) => card.id}
            getSuggestionLabel={(card) => getCardName(card, locale)}
            onPickSuggestion={(card) => onSuggestionPick(getCardName(card, locale))}
            onChange={onAnswerChange}
            placeholder={copy.cardPlaceholder}
            submitLabel={copy.submit}
            submitButtonClassName="py-button is-primary"
          />
        </form>
      ) : null}

      {message && !showResults ? (
        <p key={`${messageTone}-${feedbackNonce}-${message}`} className={`py-message ${messageTone ? `is-${messageTone}` : ""}`}>
          {message}
        </p>
      ) : null}

      {result && !showResults && selectedMode === GAME_MODE_IDS.INFINITE ? (
        <button type="button" className="py-button is-primary" onClick={onStartNextInfiniteRound}>
          {copy.playAgain}
        </button>
      ) : null}
    </section>
  );
}

export default PyramidAnswerPanel;
