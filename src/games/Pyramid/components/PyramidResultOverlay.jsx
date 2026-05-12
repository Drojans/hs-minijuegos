import { GAME_MODE_IDS } from "../../../shared/gameModes/gameModes";
import GameResultOverlay from "../../../shared/components/GameResultOverlay/GameResultOverlay";

function PyramidResultOverlay({ copy, result, selectedMode, onViewResults }) {
  const isWon = result === "won";
  const rewardMessage = isWon && selectedMode === GAME_MODE_IDS.DAILY ? copy.dailyRewardEarned : null;

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

export default PyramidResultOverlay;
