import { getCardName } from "../../../utils/cardLocale";
import { getQuestionLabel, getQuestionValueLabel } from "../higherLowerConfig";

function sideLabel(side, copy) {
  if (side === "left") return copy.left;
  if (side === "right") return copy.right;
  return copy.tie;
}

function HigherLowerResultsPanel({ copy, history, locale, onNext, isReview }) {
  if (!history.length) return null;

  return (
    <section className="hl-results-panel">
      <header>
        <span>{isReview ? copy.dailyReview : copy.resultsTitle}</span>
        {onNext ? <button type="button" className="hl-button is-secondary" onClick={onNext}>{copy.playAgain}</button> : null}
      </header>
      <div className="hl-results-list">
        {history.map((item, index) => {
          const label = getQuestionValueLabel(item.question, locale) || copy.value;
          return (
            <article key={`${item.leftCard.id}-${item.rightCard.id}-${index}`} className={`hl-result-row ${item.isCorrect ? "is-correct" : "is-wrong"}`}>
              <strong>{index + 1}</strong>
              <div>
                <p>{getQuestionLabel(item.question, locale)}</p>
                <small>
                  {getCardName(item.leftCard, locale)}: {item.leftValue} {label} · {getCardName(item.rightCard, locale)}: {item.rightValue} {label}
                </small>
              </div>
              <span>{item.isTie ? copy.tie : `${copy.selected}: ${sideLabel(item.selectedSide, copy)}`}</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default HigherLowerResultsPanel;
