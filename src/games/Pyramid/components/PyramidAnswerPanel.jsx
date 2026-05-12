import { GAME_MODE_IDS } from "../../../shared/gameModes/gameModes";
import PyramidSuggestions from "./PyramidSuggestions";

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
          <input
            value={answer}
            onChange={(event) => onAnswerChange(event.target.value)}
            placeholder={copy.cardPlaceholder}
            autoComplete="off"
          />
          <button type="submit" className="py-button is-primary">
            {copy.submit}
          </button>
          <PyramidSuggestions suggestions={suggestions} locale={locale} onPick={onSuggestionPick} />
        </form>
      ) : null}

      {message && !showResults ? <p className="py-message">{message}</p> : null}

      {result && !showResults && selectedMode === GAME_MODE_IDS.INFINITE ? (
        <button type="button" className="py-button is-primary" onClick={onStartNextInfiniteRound}>
          {copy.playAgain}
        </button>
      ) : null}
    </section>
  );
}

export default PyramidAnswerPanel;
