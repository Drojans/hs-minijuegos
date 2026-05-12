import GamePageShell from "../../../shared/components/GamePageShell/GamePageShell";

function CardGridEmptyState({
  t,
  cards,
  gridMode,
  gridModes,
  modeConfig,
  onBack,
  onChangeMode,
  onStartNewGrid,
}) {
  return (
    <GamePageShell className="cg-page">
      <section className="cg-shell">
        <section className="cg-empty">
          <button type="button" className="cg-secondary-button" onClick={onBack}>
            {t("common.backHome")}
          </button>
          <h1>{t("grid.title")}</h1>
          <p>
            {!cards.length ? t("grid.preparing") : t("grid.generationFailedShort")}
          </p>

          {cards.length ? (
            <>
              <div className="cg-mode-selector cg-mode-selector-empty">
                <span>{t("grid.modeLabelFull")}</span>
                <div className="cg-mode-buttons">
                  {Object.values(gridModes).map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      className={gridMode === mode.id ? "is-active" : ""}
                      onClick={() => onChangeMode(mode.id)}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
                <p>{modeConfig.description}</p>
              </div>

              <button type="button" className="cg-primary-button" onClick={onStartNewGrid}>
                {t("grid.retry")}
              </button>
            </>
          ) : null}
        </section>
      </section>
    </GamePageShell>
  );
}

export default CardGridEmptyState;
