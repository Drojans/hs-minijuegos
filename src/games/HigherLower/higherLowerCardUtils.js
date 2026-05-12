import { getAdaptedImage, getCardName, getDetailImage, getGameImage, getThumbImage } from "../../utils/cardLocale";

const EXCLUDED_CARD_TYPES = new Set(["HERO", "HERO_POWER"]);

export function getHigherLowerCardImage(card, locale = "es") {
  return getAdaptedImage(card, locale);
}

export function getFullHigherLowerCardImage(card, locale = "es") {
  return getDetailImage(card, locale) || getGameImage(card, locale) || getThumbImage(card, locale);
}

export function isPlayableHigherLowerCard(card, locale = "es") {
  return (
    card &&
    !EXCLUDED_CARD_TYPES.has(card.type) &&
    Boolean(getCardName(card, locale)) &&
    Boolean(getHigherLowerCardImage(card, locale)) &&
    typeof card.cost === "number"
  );
}
