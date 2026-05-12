import HigherLowerDuelCard from "./HigherLowerDuelCard";

function HigherLowerDuelStage({
  copy,
  currentValueLabel,
  disabled,
  feedback,
  leftCard,
  locale,
  newCardSide,
  onChoose,
  questionLabel,
  revealedResult,
  rightCard,
  showRevealedState,
}) {
  return (
    <section className="hl-duel-stage">
      <HigherLowerDuelCard
        side="left"
        card={leftCard}
        locale={locale}
        copy={copy}
        disabled={disabled}
        feedback={feedback}
        revealResult={revealedResult}
        isNewCard={newCardSide === "left" && !showRevealedState}
        onChoose={onChoose}
      />

      <div className="hl-versus-panel">
        <span>VS</span>
        <h1>{questionLabel}</h1>
        <small>{feedback?.isTie ? copy.tieWin : currentValueLabel}</small>
      </div>

      <HigherLowerDuelCard
        side="right"
        card={rightCard}
        locale={locale}
        copy={copy}
        disabled={disabled}
        feedback={feedback}
        revealResult={revealedResult}
        isNewCard={newCardSide === "right" && !showRevealedState}
        onChoose={onChoose}
      />
    </section>
  );
}

export default HigherLowerDuelStage;
