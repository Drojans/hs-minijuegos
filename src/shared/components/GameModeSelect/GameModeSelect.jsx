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
        ariaLabel: dailyCompleted ? `${copy.dailyTitle}. ${copy.completedStatus}` : copy.dailyTitle,
      },
      {
        id: GAME_MODE_IDS.INFINITE,
        title: copy.infiniteTitle,
        ariaLabel: copy.infiniteTitle,
      },
    ],
    [copy, dailyCompleted],
  );

  const [selectedModeId, setSelectedModeId] = useState(modes[0]?.id ?? GAME_MODE_IDS.DAILY);
  const selectedMode = modes.find((mode) => mode.id === selectedModeId) ?? modes[0];

  return (
    <div className="game-mode-modal-backdrop">
      <section className="game-mode-modal" aria-modal="true" aria-label={title} role="dialog">
        <header className="game-mode-modal-head">
          <h1>{title}</h1>
        </header>

        <div className="game-mode-modal-layout">
          <aside className="game-mode-modal-visual" aria-label={copy.exampleLabel}>
            <div className="game-mode-preview-frame">
              {previewSrc ? <img src={previewSrc} alt={previewAlt ?? ""} /> : <div className="game-mode-preview-placeholder" />}
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
                <article className="game-mode-step">
                  <StepIcon icon={copy.stepHiddenIcon ?? "?"} iconSrc={copy.stepHiddenIconSrc} />
                  <div>
                    <h3>{copy.stepHiddenTitle}</h3>
                    <p>{copy.stepHiddenText}</p>
                  </div>
                </article>

                <article className="game-mode-step">
                  <StepIcon
                    icon={copy.stepChooseIcon ?? null}
                    iconSrc={copy.stepChooseIconSrc ?? "/ui/games/guess-mana-v3/mana-crystal.png"}
                    className="is-crystal"
                  />
                  <div>
                    <h3>{copy.stepChooseTitle}</h3>
                    <p>{copy.stepChooseText}</p>
                  </div>
                </article>

                <article className="game-mode-step">
                  <StepIcon icon={copy.stepModesIcon ?? "⚔"} iconSrc={copy.stepModesIconSrc} />
                  <div>
                    <h3>{copy.stepModesTitle}</h3>
                    <p>{copy.stepModesText}</p>
                  </div>
                </article>
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
                    <span>{mode.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="game-mode-select-start"
              onClick={() => onSelectMode(selectedMode.id)}
            >
              {copy.startMode}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default GameModeSelect;
