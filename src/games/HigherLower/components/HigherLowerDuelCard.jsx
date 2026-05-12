import { getCardName } from "../../../utils/cardLocale";
import ImpostorNeutralCard from "../../Impostor/ImpostorNeutralCard";
import { getFullHigherLowerCardImage } from "../higherLowerConfig";

function HigherLowerDuelCard({ side, card, locale, copy, disabled, feedback, onChoose, revealResult, isNewCard }) {
  const name = getCardName(card, locale);
  const imageSrc = getFullHigherLowerCardImage(card, locale);
  const isFeedbackSide = feedback?.side === side;
  const feedbackClass = isFeedbackSide ? (feedback.isCorrect ? "is-correct" : "is-wrong") : "";
  const isRevealed = Boolean(revealResult);
  const isAnswerSide = isRevealed && (revealResult.correctSide === side || revealResult.isTie);
  const isWrongSelectedSide = isRevealed && !revealResult.isCorrect && revealResult.selectedSide === side;
  const revealClass = isRevealed ? "is-revealed" : "";
  const answerClass = isAnswerSide ? "is-answer-correct" : isWrongSelectedSide ? "is-answer-wrong" : "";
  const newCardClass = isNewCard && !isRevealed ? "is-new-card" : "";

  return (
    <button
      type="button"
      className={`hl-duel-card is-${side} ${feedbackClass} ${revealClass} ${answerClass} ${newCardClass}`}
      disabled={disabled}
      onClick={() => onChoose(side)}
      aria-label={side === "left" ? copy.chooseLeft : copy.chooseRight}
    >
      {isRevealed ? (
        <div className="hl-full-card-preview" aria-hidden="true">
          {imageSrc ? <img src={imageSrc} alt="" /> : <span>{name}</span>}
        </div>
      ) : (
        <div className="hl-neutral-card-preview" aria-hidden="true">
          <ImpostorNeutralCard card={card} locale={locale} />
        </div>
      )}
      <span className="hl-duel-name">{name}</span>
      {isFeedbackSide ? (
        <strong className="hl-card-feedback">{feedback.isCorrect ? copy.correct : copy.wrong}</strong>
      ) : null}
      {isRevealed && (isAnswerSide || isWrongSelectedSide) ? (
        <strong className="hl-card-feedback is-reveal-badge">
          {isAnswerSide ? copy.correctSide : copy.selected}
        </strong>
      ) : null}
    </button>
  );
}

export default HigherLowerDuelCard;
