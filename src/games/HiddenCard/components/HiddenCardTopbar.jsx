function HiddenCardTopbar({ copy, isDailyMode, attemptsLeft, maxAttempts }) {
  return (
    <div className="hidden-card-topbar">
      <div className="hidden-card-mode-pill">{isDailyMode ? copy.dailyChallenge : copy.infiniteChallenge}</div>
      <div className="hidden-card-score-pill">
        <span>{copy.attemptsLabel}</span>
        <strong>{attemptsLeft}/{maxAttempts}</strong>
      </div>
    </div>
  );
}

export default HiddenCardTopbar;
