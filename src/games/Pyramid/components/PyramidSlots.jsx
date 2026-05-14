import LoadAwareImage from "../../../shared/components/LoadAwareImage/LoadAwareImage";
import { getCardName } from "../../../utils/cardLocale";
import { PYRAMID_TARGET_COUNT, getCardImage } from "../pyramidGameConfig";

const SLOTS_PER_ROW = 5;

function PyramidSlots({ foundCards, locale }) {
  const slots = Array.from({ length: PYRAMID_TARGET_COUNT }, (_, index) => foundCards[index] ?? null);
  const rows = Array.from({ length: Math.ceil(PYRAMID_TARGET_COUNT / SLOTS_PER_ROW) }, (_, rowIndex) =>
    slots.slice(rowIndex * SLOTS_PER_ROW, rowIndex * SLOTS_PER_ROW + SLOTS_PER_ROW),
  );

  return (
    <section className="py-category-board" aria-label="Cartas de la categoría">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="py-category-board-row">
          {row.map((card, slotIndex) => {
            const absoluteIndex = rowIndex * SLOTS_PER_ROW + slotIndex;
            const cardName = card ? getCardName(card, locale) : "";

            return (
              <div key={absoluteIndex} className={`py-category-slot ${card ? "is-filled" : ""}`}>
                {card ? (
                  <>
                    <LoadAwareImage src={getCardImage(card, locale)} alt={cardName} loading="eager" decoding="async" />
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
