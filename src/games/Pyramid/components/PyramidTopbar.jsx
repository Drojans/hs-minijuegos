function PyramidTopbar({ copy, isDailyMode, timeLeft, result, isCompleted }) {
  const isLowTime = timeLeft <= 15 && !result && !isCompleted;

  return (
    <div className="py-topbar">
      <div className="py-mode-pill">{isDailyMode ? copy.dailyChallenge : copy.infiniteChallenge}</div>
      {isDailyMode ? (
        <div className={`py-timer ${isLowTime ? "is-low" : ""}`}>
          <span>{copy.timeLabel}</span>
          <strong>{Math.max(0, timeLeft)}s</strong>
        </div>
      ) : null}
    </div>
  );
}

export default PyramidTopbar;
