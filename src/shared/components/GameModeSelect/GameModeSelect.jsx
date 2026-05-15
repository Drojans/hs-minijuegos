import { useMemo, useState } from "react";
import { GAME_MODE_IDS } from "../../gameModes/gameModes";
import { getDailyGameProgress } from "../../progress/dailyProgress";
import "./GameModeSelect.css";

const REWARD_BOX_SRC = "/ui/rewards/arcane-box-open.png";

function StepIcon({ icon, iconSrc, className = "" }) {
  if (iconSrc) {
    return (
      <div className={`game-mode-step-icon ${className}`} aria-hidden="true">
        <img src={iconSrc} alt="" />
      </div>
    );
  }

  return (
    <div className={`game-mode-step-icon ${className}`} aria-hidden="true">
      {icon}
    </div>
  );
}

function ModeIcon({ modeId }) {
  return (
    <span className={`game-mode-option-icon ${modeId === GAME_MODE_IDS.DAILY ? "is-daily" : "is-infinite"}`} aria-hidden="true">
      {modeId === GAME_MODE_IDS.DAILY ? "✦" : "∞"}
    </span>
  );
}

function getLegacySteps(copy) {
  return [
    {
      icon: copy.stepHiddenIcon ?? "?",
      iconSrc: copy.stepHiddenIconSrc,
      title: copy.stepHiddenTitle,
      text: copy.stepHiddenText,
    },
    {
      icon: copy.stepChooseIcon,
      iconSrc: copy.stepChooseIconSrc,
      iconClassName: copy.stepChooseIconSrc ? "is-crystal" : "",
      title: copy.stepChooseTitle,
      text: copy.stepChooseText,
    },
    {
      icon: copy.stepModesIcon ?? "⚔",
      iconSrc: copy.stepModesIconSrc,
      title: copy.stepModesTitle,
      text: copy.stepModesText,
    },
  ].filter((step) => step.title || step.text);
}

function getDailyMeta(copy, dailyProgress, dailyCompleted) {
  const completed = Boolean(dailyCompleted || dailyProgress?.completed);

  if (!completed) return copy.dailyMeta;

  const rewardWasEarned = Boolean(
    dailyProgress?.rewardClaimed ||
    dailyProgress?.lastWasCorrect === true ||
    dailyProgress?.lastWasWon === true,
  );

  return rewardWasEarned
    ? copy.dailyRewardClaimedMeta ?? copy.completedStatus
    : copy.dailyRewardLostMeta ?? copy.completedStatus;
}

function GameModeSelect({
  copy,
  title,
  dailyCompleted = false,
  dailyProgress = null,
  onSelectMode,
}) {
  const resolvedDailyProgress = dailyProgress ?? (copy.gameId ? getDailyGameProgress(copy.gameId) : null);
  const dailyMeta = getDailyMeta(copy, resolvedDailyProgress, dailyCompleted);
  const hasCompletedDaily = Boolean(dailyCompleted || resolvedDailyProgress?.completed);

  const modes = useMemo(
    () => [
      {
        id: GAME_MODE_IDS.DAILY,
        title: copy.dailyTitle,
        meta: dailyMeta,
        ariaLabel: `${copy.dailyTitle}. ${dailyMeta}`,
      },
      {
        id: GAME_MODE_IDS.INFINITE,
        title: copy.infiniteTitle,
        meta: copy.infiniteMeta,
        ariaLabel: copy.infiniteTitle,
      },
    ],
    [copy, dailyMeta],
  );

  const [selectedModeId, setSelectedModeId] = useState(modes[0]?.id ?? GAME_MODE_IDS.DAILY);
  const selectedMode = modes.find((mode) => mode.id === selectedModeId) ?? modes[0];
  const steps = copy.steps?.length ? copy.steps : getLegacySteps(copy);
  const resolvedTitle = title ?? copy.title;
  const headingId = `game-mode-title-${resolvedTitle?.toLowerCase?.().replace(/[^a-z0-9]+/gi, "-") ?? "intro"}`;
  const isLongTitle = String(resolvedTitle ?? "").length >= 18;
  const startLabel = selectedMode.id === GAME_MODE_IDS.DAILY && hasCompletedDaily
    ? copy.startCompletedDaily ?? copy.startMode
    : copy.startMode;

  return (
    <div className="game-mode-modal-backdrop">
      <section className="game-mode-modal" aria-modal="true" aria-labelledby={headingId} role="dialog">
        <header className="game-mode-modal-head">
          <h1 id={headingId} className={isLongTitle ? "is-long-title" : undefined}>{resolvedTitle}</h1>
          <span className="game-mode-title-divider" aria-hidden="true" />
          {copy.dailyRewardText ? (
            <div className="game-mode-reward-pill" aria-label={`${copy.rewardLabel}: ${copy.dailyRewardText}`}>
              <span className="game-mode-reward-label">{copy.rewardLabel}</span>
              <span className="game-mode-reward-prize">
                <img src={REWARD_BOX_SRC} alt="" aria-hidden="true" />
              </span>
            </div>
          ) : null}
        </header>

        <main className="game-mode-modal-body">
          <section className="game-mode-rules" aria-label={copy.howToPlayTitle}>
            <div className="game-mode-section-title">
              <span />
              <h2>{copy.howToPlayTitle}</h2>
              <span />
            </div>

            <div className="game-mode-steps">
              {steps.map((step, index) => (
                <article className="game-mode-step" key={`${step.title ?? "step"}-${index}`}>
                  <StepIcon
                    icon={step.icon ?? "?"}
                    iconSrc={step.iconSrc}
                    className={step.iconClassName ?? ""}
                  />
                  <div>
                    {step.title ? <h3>{step.title}</h3> : null}
                    {step.text ? <p>{step.text}</p> : null}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="game-mode-modal-section" aria-label={copy.modeSelectorLabel}>
            <div className="game-mode-section-title is-mode-title">
              <span />
              <h2>{copy.modeSelectorLabel}</h2>
              <span />
            </div>

            <div className="game-mode-option-list" role="tablist" aria-label={copy.modeSelectorLabel}>
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  role="tab"
                  aria-selected={selectedMode.id === mode.id}
                  aria-label={mode.ariaLabel}
                  className={`game-mode-option-card ${selectedMode.id === mode.id ? "is-selected" : ""}`}
                  onClick={() => setSelectedModeId(mode.id)}
                >
                  <ModeIcon modeId={mode.id} />
                  <span className="game-mode-option-copy">
                    <span className="game-mode-option-title">{mode.title}</span>
                    {mode.meta ? <em>{mode.meta}</em> : null}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <button
            type="button"
            className="game-mode-select-start"
            onClick={() => onSelectMode(selectedMode.id)}
          >
            {startLabel}
          </button>
        </main>
      </section>
    </div>
  );
}

export default GameModeSelect;
