import { useMemo, useState } from "react";
import { GAME_MODE_IDS } from "../../gameModes/gameModes";
import "./GameModeSelect.css";

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

function GameModeSelect({
  copy,
  title,
  dailyCompleted = false,
  previewSrc,
  previewAlt,
  onSelectMode,
}) {
  const modes = useMemo(
    () => [
      {
        id: GAME_MODE_IDS.DAILY,
        title: copy.dailyTitle,
        description: dailyCompleted ? copy.dailyCompletedDescription ?? copy.dailyDescription : copy.dailyDescription,
        meta: dailyCompleted ? copy.completedStatus : copy.dailyMeta,
        ariaLabel: dailyCompleted ? `${copy.dailyTitle}. ${copy.completedStatus}` : copy.dailyTitle,
      },
      {
        id: GAME_MODE_IDS.INFINITE,
        title: copy.infiniteTitle,
        description: copy.infiniteDescription,
        meta: copy.infiniteMeta,
        ariaLabel: copy.infiniteTitle,
      },
    ],
    [copy, dailyCompleted],
  );

  const [selectedModeId, setSelectedModeId] = useState(modes[0]?.id ?? GAME_MODE_IDS.DAILY);
  const selectedMode = modes.find((mode) => mode.id === selectedModeId) ?? modes[0];
  const steps = copy.steps?.length ? copy.steps : getLegacySteps(copy);
  const resolvedTitle = title ?? copy.title;
  const resolvedPreviewSrc = previewSrc ?? copy.previewSrc;
  const resolvedPreviewAlt = previewAlt ?? copy.exampleLabel ?? "";
  const startLabel = selectedMode.id === GAME_MODE_IDS.DAILY && dailyCompleted
    ? copy.startCompletedDaily ?? copy.startMode
    : copy.startMode;

  return (
    <div className="game-mode-modal-backdrop">
      <section className="game-mode-modal" aria-modal="true" aria-label={resolvedTitle} role="dialog">
        <header className="game-mode-modal-head">
          <p className="game-mode-modal-kicker">{copy.modeEyebrow ?? copy.modeSelectorLabel}</p>
          <h1>{resolvedTitle}</h1>
          {copy.description ? <p className="game-mode-modal-description">{copy.description}</p> : null}
          {copy.dailyRewardText ? (
            <div className="game-mode-reward-pill" aria-label={`${copy.rewardLabel}: ${copy.dailyRewardText}`}>
              <span>{copy.rewardLabel}</span>
              <strong>{copy.dailyRewardText}</strong>
            </div>
          ) : null}
        </header>

        <div className="game-mode-modal-layout">
          <aside className="game-mode-modal-visual" aria-label={copy.exampleLabel}>
            <div className="game-mode-preview-frame">
              {resolvedPreviewSrc ? <img src={resolvedPreviewSrc} alt={resolvedPreviewAlt} /> : <div className="game-mode-preview-placeholder" />}
            </div>
          </aside>

          <div className="game-mode-modal-content">
            <section className="game-mode-info-card" aria-label={copy.howToPlayTitle}>
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

            <div className="game-mode-modal-section">
              <span className="game-mode-modal-label">{copy.modeSelectorLabel}</span>
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
                    <span className="game-mode-option-title">{mode.title}</span>
                    {mode.description ? <small>{mode.description}</small> : null}
                    {mode.meta ? <em>{mode.meta}</em> : null}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="game-mode-select-start"
              onClick={() => onSelectMode(selectedMode.id)}
            >
              {startLabel}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default GameModeSelect;
