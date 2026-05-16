function getTimerUrgencyClass(timeLeft) {
  if (timeLeft <= 5) return "is-urgent-high";
  if (timeLeft <= 10) return "is-urgent-mid";
  if (timeLeft <= 20) return "is-urgent-low";
  return "";
}

function CardGridTimer({ copy, timeLeft }) {
  if (typeof timeLeft !== "number") return null;

  const urgencyClass = getTimerUrgencyClass(timeLeft);

  return (
    <div className={`cg-daily-timer ${urgencyClass}`.trim()} aria-live="polite">
      <span>{copy.dailyTimeLabel}:</span>
      <strong>{timeLeft}</strong>
    </div>
  );
}

export default CardGridTimer;
