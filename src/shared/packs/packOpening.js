import { getGameImage, getThumbImage } from "../../utils/cardLocale";

export const DEFAULT_PACK_SIZE = 10;

const RARITY_WEIGHTS = {
  LEGENDARY: 2,
  EPIC: 5,
  RARE: 18,
  COMMON: 56,
  FREE: 12,
};

function hasUsableImage(card) {
  return Boolean(getThumbImage(card, "es") || getThumbImage(card, "en") || getGameImage(card, "es") || getGameImage(card, "en"));
}

export function getEligiblePackCards(cards = []) {
  return cards.filter((card) => {
    if (!card?.id) return false;
    if (!hasUsableImage(card)) return false;
    if (card.type === "HERO_POWER") return false;
    return true;
  });
}

function getCardWeight(card) {
  return RARITY_WEIGHTS[card.rarity] ?? 10;
}

function pickWeightedCard(cards) {
  const totalWeight = cards.reduce((total, card) => total + getCardWeight(card), 0);
  let roll = Math.random() * totalWeight;

  for (const card of cards) {
    roll -= getCardWeight(card);
    if (roll <= 0) return card;
  }

  return cards[cards.length - 1];
}

export function openCardPack(cards, { size = DEFAULT_PACK_SIZE } = {}) {
  const eligibleCards = getEligiblePackCards(cards);
  if (eligibleCards.length === 0) return [];

  return Array.from({ length: size }, () => pickWeightedCard(eligibleCards));
}
