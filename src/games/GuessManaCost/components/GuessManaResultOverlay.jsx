import GameResultOverlay from "../../../shared/components/GameResultOverlay/GameResultOverlay";

function GuessManaResultOverlay({ copy, isCorrect, cardName, correctCost, rewardMessage, onViewResults, onBack }) {
  return (
    <GameResultOverlay
      tone={isCorrect ? "success" : "danger"}
      kicker={copy.resultKicker}
      title={isCorrect ? copy.correct : copy.wrong}
      rewardMessage={rewardMessage}
      detail={(
        <>
          <strong className="guess-v3-result-card-name">{cardName}</strong>
          <div className="guess-v3-result-cost-row">
            <span className="guess-v3-result-cost-line">{copy.resultCostBefore}</span>
            <div className="guess-v3-result-cost-crystal" aria-hidden="true">
              <img src="/ui/games/guess-mana-v3/mana-crystal.png" alt="" />
              <span>{correctCost}</span>
            </div>
            <span className="guess-v3-result-cost-line">{copy.resultCostAfter}</span>
          </div>
        </>
      )}
      primaryAction={{ label: copy.viewResults, onClick: onViewResults }}
      secondaryActions={[{ label: copy.backHome, onClick: onBack }]}
    />
  );
}

export default GuessManaResultOverlay;
