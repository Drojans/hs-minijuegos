import { formatGridTime } from "../cardGridState";

function CardGridTimer({ copy, timeLeft }) {
  if (typeof timeLeft !== "number") return null;

  return (
    <div className={`cg-daily-timer ${timeLeft <= 15 ? "is-danger" : ""}`} aria-live="polite">
      <span>{copy.dailyTimeLabel}</span>
      <strong>{formatGridTime(timeLeft)}</strong>
    </div>
  );
}

export default CardGridTimer;
