import RarityBadge from "../../../shared/components/RarityBadge/RarityBadge";
import { getHiddenCardHints } from "../hiddenCardConfig";

function HiddenCardHintList({ copy, card, locale, revealLevel }) {
  const hints = getHiddenCardHints(card, locale);
  const items = [
    { key: "cost", label: copy.hintCost, value: hints.cost, unlocked: revealLevel >= 1 },
    { key: "type", label: copy.hintType, value: hints.type, unlocked: revealLevel >= 2 },
    { key: "class", label: copy.hintClass, value: hints.class, unlocked: revealLevel >= 2 },
    { key: "rarity", label: copy.hintRarity, value: hints.rarity, rarity: card?.rarity, unlocked: revealLevel >= 3 },
    {
      key: "name",
      label: copy.hintName,
      value: `${copy.firstLetter} ${hints.firstLetter} · ${hints.nameWords} ${copy.words}`,
      unlocked: revealLevel >= 4,
    },
    { key: "text", label: copy.hintText, value: hints.textSnippet, unlocked: revealLevel >= 4 },
  ];

  return (
    <aside className="hidden-card-hints">
      <p>{copy.hintTitle}</p>
      <div className="hidden-card-hint-grid">
        {items.map((item) => (
          <div key={item.key} className={`hidden-card-hint ${item.unlocked ? "is-unlocked" : ""}`}>
            <span>{item.label}</span>
            <strong>
              {item.unlocked ? (
                item.key === "rarity" ? <RarityBadge rarity={item.rarity} locale={locale} /> : item.value
              ) : "?"}
            </strong>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default HiddenCardHintList;
