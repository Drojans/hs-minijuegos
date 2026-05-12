import GamePageShell from "../../../shared/components/GamePageShell/GamePageShell";

function HigherLowerMessagePanel({ copy, title, onBack }) {
  return (
    <GamePageShell className="hl-page">
      <section className="hl-shell">
        <div className="hl-message-panel">
          <h2>{title}</h2>
          <button type="button" className="hl-button is-secondary" onClick={onBack}>{copy.backHome}</button>
        </div>
      </section>
    </GamePageShell>
  );
}

export default HigherLowerMessagePanel;
