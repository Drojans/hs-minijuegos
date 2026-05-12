import GamePageShell from "../../../shared/components/GamePageShell/GamePageShell";

function HiddenCardMessagePanel({ copy, title, onBack }) {
  return (
    <GamePageShell className="hidden-card-page">
      <section className="hidden-card-shell">
        <div className="hidden-card-message-panel">
          <h2>{title}</h2>
          <button type="button" className="hidden-card-button is-secondary" onClick={onBack}>
            {copy.backHome}
          </button>
        </div>
      </section>
    </GamePageShell>
  );
}

export default HiddenCardMessagePanel;
