import { getCardName } from "../../../utils/cardLocale";
import { PYRAMID_TARGET_COUNT, getCardImage } from "../pyramidGameConfig";

function PyramidSlots({ foundCards, locale }) {
  const slots = Array.from({ length: PYRAMID_TARGET_COUNT }, (_, index) => foundCards[index] ?? null);
  const rows = [slots.slice(0, 1), slots.slice(1, 3), slots.slice(3, 6), slots.slice(6, 10)];

  return (
    <section className="py-pyramid" aria-label="Pirámide">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="py-pyramid-row">
          {row.map((card, slotIndex) => {
            const absoluteIndex = rows.slice(0, rowIndex).reduce((sum, current) => sum + current.length, 0) + slotIndex;
            const cardName = card ? getCardName(card, locale) : "";

            return (
              <div key={absoluteIndex} className={`py-slot ${card ? "is-filled" : ""}`}>
                {card ? (
                  <>
                    <img src={getCardImage(card, locale)} alt={cardName} />
                    <span>{cardName}</span>
                  </>
                ) : (
                  <strong>{absoluteIndex + 1}</strong>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </section>
  );
}

export default PyramidSlots;
