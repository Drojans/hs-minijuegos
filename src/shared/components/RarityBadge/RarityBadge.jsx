import { translateCardRarity } from "../../../utils/cardLocale";
import "./RarityBadge.css";

const RARITY_CLASS_NAMES = {
  FREE: "free",
  COMMON: "common",
  RARE: "rare",
  EPIC: "epic",
  LEGENDARY: "legendary",
};

function normalizeRarity(value) {
  return String(value || "FREE").trim().toUpperCase();
}

function RarityBadge({ rarity, locale = "es", label, size = "default", className = "" }) {
  const normalizedRarity = normalizeRarity(rarity);
  const rarityClass = RARITY_CLASS_NAMES[normalizedRarity] ?? "free";
  const sizeClass = size && size !== "default" ? `rarity-badge--${size}` : "";
  const text = label || translateCardRarity(normalizedRarity, locale);

  return (
    <span className={`rarity-badge rarity-badge--${rarityClass} ${sizeClass} ${className}`.trim()}>
      {text}
    </span>
  );
}

export default RarityBadge;
