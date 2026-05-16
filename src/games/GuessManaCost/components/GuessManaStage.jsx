import GuessManaCardPreview from "./GuessManaCardPreview";
import GuessManaCrystalDisplay from "./GuessManaCrystalDisplay";
import GuessManaSelector from "./GuessManaSelector";

function GuessManaStage({
  copy,
  cardName,
  imageSrc,
  imageFailed,
  onImageError,
  hasAnswered,
  isCorrect,
  displayedCrystalValue,
  pendingCost,
  selectedCost,
  correctCost,
  hoveredCost,
  onHoverCost,
  onLeaveCost,
  onPickCost,
  onConfirmCost,
  onPlayAgain,
  showPlayAgain,
}) {
  return (
    <section className="guess-v3-stage" aria-label={cardName}>
      <div className="guess-v3-card-column">
        <GuessManaCardPreview
          imageSrc={imageSrc}
          cardName={cardName}
          imageFailed={imageFailed}
          onImageError={onImageError}
          copy={copy}
          hideManaCover={hasAnswered}
        />

        <GuessManaCrystalDisplay
          value={displayedCrystalValue}
          label={copy.selectedCost}
          isAnswered={hasAnswered}
          isCorrect={isCorrect}
        />
      </div>

      <aside className="guess-v3-controls" aria-labelledby="guess-v3-cost-title">
        <p id="guess-v3-cost-title" className="guess-v3-selector-title">
          {copy.chooseCost}
        </p>

        <GuessManaSelector
          hasAnswered={hasAnswered}
          pendingCost={pendingCost}
          selectedCost={selectedCost}
          correctCost={correctCost}
          hoveredCost={hoveredCost}
          onHoverCost={onHoverCost}
          onLeaveCost={onLeaveCost}
          onPickCost={onPickCost}
        />

        {!hasAnswered ? (
          <button
            type="button"
            className="guess-v3-button is-primary is-confirm"
            disabled={pendingCost === null}
            onClick={onConfirmCost}
          >
            {copy.confirmCost}
          </button>
        ) : null}

        {showPlayAgain ? (
          <button type="button" className="guess-v3-button is-primary is-confirm" onClick={onPlayAgain}>
            {copy.playAgain}
          </button>
        ) : null}
      </aside>
    </section>
  );
}

export default GuessManaStage;
