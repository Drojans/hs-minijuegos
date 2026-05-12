import GamePageShell from "../../../shared/components/GamePageShell/GamePageShell";

function GuessManaEmptyState({ copy, title, onBack }) {
  return (
    <GamePageShell className="guess-v3-page">
      <section className="guess-v3-shell">
        <section className="guess-v3-empty-state">
          <h2>{title}</h2>
          <button type="button" className="guess-v3-button is-secondary" onClick={onBack}>
            {copy.backHome}
          </button>
        </section>
      </section>
    </GamePageShell>
  );
}

export default GuessManaEmptyState;
