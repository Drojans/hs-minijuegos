import { createPortal } from "react-dom";
import "./GameResultOverlay.css";

function Confetti({ count = 34 }) {
  return (
    <div className="game-result-confetti" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => {
        const angle = (Math.PI * 2 * index) / count;
        const distance = 120 + (index % 6) * 18;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance - 12;

        return (
          <span
            key={index}
            style={{
              "--x": `${x.toFixed(0)}px`,
              "--y": `${y.toFixed(0)}px`,
              "--r": `${index * 31}deg`,
              "--delay": `${(index % 8) * 24}ms`,
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
      <span>{action.label}</span>
    </button>
  );
}

function cleanResultText(value) {
  if (typeof value !== "string") return value;
  return value.trim().replace(/\.+$/u, "");
}

function normalizeRewardMessage(value, locale = "es") {
  if (!value || typeof value !== "string") return value;

  const cleaned = value
    .trim()
    .replace(/^[¡!]+/u, "")
    .replace(/[.!?]+$/u, "")
    .trim();

  if (!cleaned) return "";

  return locale === "en" ? `${cleaned}!` : `¡${cleaned}!`;
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
  statusLabel,
  locale = "es",
}) {
  const isSuccess = tone === "success" || tone === "correct" || tone === "won";
  const resolvedShowConfetti = showConfetti ?? isSuccess;
  const hasExplicitlyHiddenIcon = icon === null || icon === false || icon === "";
  const resolvedIcon = hasExplicitlyHiddenIcon ? null : (icon ?? null);
  const hasPreview = Boolean(preview);
  const resolvedRewardMessage = normalizeRewardMessage(rewardMessage, locale);
  const hasReward = Boolean(resolvedRewardMessage);
  const resolvedStatusLabel = cleanResultText(statusLabel ?? (locale === "en" ? (isSuccess ? "Success" : "Fail") : (isSuccess ? "Acierto" : "Fallo")));
  const resolvedKicker = cleanResultText(kicker);
  const resolvedTitle = cleanResultText(title);
  const resolvedText = cleanResultText(text);

  const overlay = (
    <div className="game-result-backdrop" role="presentation">
      <section
        className={`game-result-card is-${isSuccess ? "success" : "danger"} ${hasPreview ? "has-preview" : ""} ${hasReward ? "has-reward" : ""} ${className}`}
        role="status"
        aria-live="polite"
      >
        {resolvedShowConfetti ? <Confetti /> : null}
        <span className="game-result-ambient-glow game-result-ambient-glow-a" aria-hidden="true" />
        <span className="game-result-ambient-glow game-result-ambient-glow-b" aria-hidden="true" />

        <div className="game-result-layout">
          <div className="game-result-copy">
            {resolvedIcon ? (
              <div className="game-result-icon" aria-hidden="true">
                <span>{resolvedIcon}</span>
              </div>
            ) : null}

            {resolvedKicker ? <p className="game-result-kicker">{resolvedKicker}</p> : null}
            <p className={`game-result-status-pill is-${isSuccess ? "success" : "danger"}`}>{resolvedStatusLabel}</p>
            <h2>{resolvedTitle}</h2>
            {resolvedText ? <p className="game-result-text">{resolvedText}</p> : null}
            {detail ? <div className="game-result-detail">{detail}</div> : null}

            {hasReward ? (
              <div className="game-result-reward-panel">
                <p className="game-result-reward-label">{resolvedRewardMessage}</p>
                <div className="game-result-reward-chest" aria-hidden="true">
                  <img src="/ui/rewards/arcane-box-open.png" alt="" />
                </div>
              </div>
            ) : null}

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
