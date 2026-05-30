import { MANA_VALUES } from "../guessManaConfig";

function GuessManaSelector({
  hasAnswered,
  pendingCost,
  selectedCost,
  correctCost,
  hoveredCost,
  onHoverCost,
  onLeaveCost,
  onPickCost,
}) {
  const manaRows = [
    MANA_VALUES.slice(0, 3),
    MANA_VALUES.slice(3, 6),
    MANA_VALUES.slice(6, 9),
    MANA_VALUES.slice(9),
  ];

  return (
    <div className="guess-v3-mana-grid" onMouseLeave={onLeaveCost}>
      {manaRows.map((row, rowIndex) => (
        <div key={rowIndex} className="guess-v3-mana-row">
          {row.map((cost) => {
            const isGlowing = !hasAnswered
              ? hoveredCost !== null
                ? cost <= hoveredCost
                : pendingCost !== null && cost <= pendingCost
              : false;
            const classNames = ["guess-v3-mana-button"];

            classNames.push(isGlowing ? "is-on" : "is-off");
            if (!hasAnswered && pendingCost === cost) classNames.push("is-selected");
            if (hasAnswered && cost === correctCost) classNames.push("is-correct");
            if (hasAnswered && cost === selectedCost && cost !== correctCost) classNames.push("is-wrong");

            return (
              <button
                key={cost}
                type="button"
                className={classNames.join(" ")}
                onClick={() => onPickCost(cost)}
                onMouseEnter={() => onHoverCost(cost)}
                onFocus={() => onHoverCost(cost)}
                onBlur={onLeaveCost}
                disabled={hasAnswered}
                aria-pressed={!hasAnswered && pendingCost === cost}
              >
                <img src="/ui/games/guess-mana-v3/mana-crystal.png" alt="" aria-hidden="true" />
                <span>{cost}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default GuessManaSelector;
