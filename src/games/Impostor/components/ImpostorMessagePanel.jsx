import GamePageShell from "../../../shared/components/GamePageShell/GamePageShell";

function ImpostorMessagePanel({ copy, title, onBack }) {
  return (
    <GamePageShell className="im-page">
      <section className="im-shell">
        <section className="im-message-panel">
          <h1>{title}</h1>
          <button type="button" className="im-secondary-button" onClick={onBack}>
            {copy.backHome}
          </button>
        </section>
      </section>
    </GamePageShell>
  );
}

export default ImpostorMessagePanel;
