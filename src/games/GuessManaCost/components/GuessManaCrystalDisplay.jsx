function GuessManaCrystalDisplay({ value, label, isAnswered, isCorrect }) {
  return (
    <div className={`guess-v3-selected-crystal ${isAnswered ? (isCorrect ? "is-correct" : "is-wrong") : ""}`}>
      <span className="guess-v3-selected-label">{label}</span>
      <div className="guess-v3-crystal-shell" aria-hidden="true">
        <img src="/ui/games/guess-mana-v3/mana-crystal.png" alt="" />
        <strong>{value ?? "?"}</strong>
      </div>
    </div>
  );
}

export default GuessManaCrystalDisplay;
