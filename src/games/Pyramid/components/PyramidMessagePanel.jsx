import GamePageShell from "../../../shared/components/GamePageShell/GamePageShell";

function PyramidMessagePanel({ copy, title, onBack }) {
  return (
    <GamePageShell className="py-page">
      <section className="py-shell">
        <div className="py-message-panel">
          <h2>{title}</h2>
          <button type="button" className="py-button is-secondary" onClick={onBack}>
            {copy.backHome}
          </button>
        </div>
      </section>
    </GamePageShell>
  );
}

export default PyramidMessagePanel;
