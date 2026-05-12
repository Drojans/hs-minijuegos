import GameResultOverlay from "../../../shared/components/GameResultOverlay/GameResultOverlay";

function HigherLowerResultOverlay({ copy, result, rewardMessage, onViewResults }) {
  const isWon = result === "won";

  return (
    <GameResultOverlay
      tone={isWon ? "success" : "danger"}
      kicker={copy.resultKicker}
      title={isWon ? copy.winTitle : copy.loseTitle}
      text={isWon ? copy.winText : copy.loseText}
      rewardMessage={rewardMessage}
      primaryAction={{ label: copy.viewResults, onClick: onViewResults }}
    />
  );
}

export default HigherLowerResultOverlay;
