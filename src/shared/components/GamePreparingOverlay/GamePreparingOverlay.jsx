import "./GamePreparingOverlay.css";

function GamePreparingOverlay({
  eyebrow = "Preparando partida",
  title = "Barajando cartas...",
  description = "La taberna está preparando el reto.",
}) {
  return (
    <section className="game-preparing-shell" aria-live="polite" aria-busy="true">
      <div className="game-preparing-card" role="status">
        <div className="game-preparing-orb" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="game-preparing-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="game-preparing-description">{description}</p>
        <div className="game-preparing-bar" aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  );
}

export default GamePreparingOverlay;
