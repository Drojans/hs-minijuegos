import { getAdaptedImage, getCardName } from "../../utils/cardLocale";

export const MAX_ROUNDS = 10;
export const MANA_VALUES = Array.from({ length: 11 }, (_, index) => index);

const EXCLUDED_CARD_TYPES = new Set(["HERO", "HERO_POWER"]);

export function getGuessManaCardImage(card, locale) {
  return getAdaptedImage(card, locale);
}

export function isPlayableGuessManaCard(card, locale) {
  return (
    typeof card?.cost === "number" &&
    card.cost >= 0 &&
    card.cost <= 10 &&
    !EXCLUDED_CARD_TYPES.has(card.type) &&
    Boolean(getCardName(card, locale)) &&
    Boolean(getGuessManaCardImage(card, locale))
  );
}

export function getRandomItem(array) {
  if (!array.length) return null;
  return array[Math.floor(Math.random() * array.length)];
}

export function getNextRandomCard(cards, previousCardId) {
  if (!cards.length) return null;
  if (cards.length === 1) return cards[0];

  let nextCard = getRandomItem(cards);
  let attempts = 0;

  while (nextCard?.id === previousCardId && attempts < 10) {
    nextCard = getRandomItem(cards);
    attempts += 1;
  }

  return nextCard;
}
