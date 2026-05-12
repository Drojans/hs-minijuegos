import { createPortal } from "react-dom";
import "./GameResultOverlay.css";

function Confetti({ count = 36 }) {
  return (
    <div className="game-result-confetti" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => {
        const angle = (Math.PI * 2 * index) / count;
        const distance = 128 + (index % 6) * 16;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance - 18;

        return (
          <span
            key={index}
            style={{
              "--x": `${x.toFixed(0)}px`,
              "--y": `${y.toFixed(0)}px`,
              "--r": `${index * 37}deg`,
              "--delay": `${(index % 8) * 26}ms`,
            }}
          />
        );
      })}
    </div>
  );
}

function ActionButton({ action, variant = "secondary" }) {
  if (!action?.label || !action?.onClick) return null;

  return (
    <button
      type="button"
      className={`game-result-button is-${action.variant ?? variant}`}
      onClick={action.onClick}
    >
      {action.label}
    </button>
  );
}

function GameResultOverlay({
  tone = "success",
  kicker,
  title,
  text,
  detail,
  rewardMessage,
  preview,
  primaryAction,
  icon,
  showConfetti,
  className = "",
}) {
  const isSuccess = tone === "success" || tone === "correct" || tone === "won";
  const resolvedShowConfetti = showConfetti ?? isSuccess;
  const resolvedIcon = icon ?? (isSuccess ? "✦" : "!");
  const hasPreview = Boolean(preview);

  const overlay = (
    <div className="game-result-backdrop" role="presentation">
      <section
        className={`game-result-card is-${isSuccess ? "success" : "danger"} ${hasPreview ? "has-preview" : ""} ${className}`}
        role="status"
        aria-live="polite"
      >
        {resolvedShowConfetti ? <Confetti /> : null}

        <div className="game-result-layout">
          <div className="game-result-copy">
            <div className="game-result-icon" aria-hidden="true">
              <span>{resolvedIcon}</span>
            </div>

            {kicker ? <p className="game-result-kicker">{kicker}</p> : null}
            <h2>{title}</h2>
            {text ? <p className="game-result-text">{text}</p> : null}
            {detail ? <div className="game-result-detail">{detail}</div> : null}
            {rewardMessage ? <p className="game-result-reward">{rewardMessage}</p> : null}

            <div className="game-result-actions">
              <ActionButton action={primaryAction} variant="primary" />
            </div>
          </div>

          {hasPreview ? <div className="game-result-preview">{preview}</div> : null}
        </div>
      </section>
    </div>
  );

  if (typeof document === "undefined") {
    return overlay;
  }

  return createPortal(overlay, document.body);
}

export default GameResultOverlay;
