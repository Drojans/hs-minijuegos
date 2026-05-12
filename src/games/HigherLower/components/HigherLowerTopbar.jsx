import { HIGHER_LOWER_DAILY_TARGET } from "../../../shared/config/gameRules";
import { GAME_MODE_IDS } from "../../../shared/gameModes/gameModes";

function HigherLowerTopbar({ copy, selectedMode, score }) {
  const isDailyMode = selectedMode === GAME_MODE_IDS.DAILY;

  return (
    <div className="hl-topbar">
      <div className="hl-mode-pill">{isDailyMode ? copy.dailyChallenge : copy.infiniteChallenge}</div>
      <div className="hl-score-pill">
        <span>{isDailyMode ? copy.scoreLabel : copy.streakLabel}</span>
        <strong>{score}/{isDailyMode ? HIGHER_LOWER_DAILY_TARGET : "∞"}</strong>
      </div>
    </div>
  );
}

export default HigherLowerTopbar;
