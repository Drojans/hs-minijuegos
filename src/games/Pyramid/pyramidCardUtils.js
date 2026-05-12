import { getAdaptedImage, getCardName } from "../../utils/cardLocale";
import { PYRAMID_EXCLUDED_TYPES } from "./pyramidConstants";

export function normalizePyramidAnswer(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ñ\s'-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getCardImage(card, locale = "es") {
  return getAdaptedImage(card, locale);
}

export function isPlayablePyramidCard(card, locale = "es") {
  return (
    card?.id &&
    !PYRAMID_EXCLUDED_TYPES.has(card.type) &&
    Boolean(getCardName(card, locale)) &&
    Boolean(getCardImage(card, locale))
  );
}

export function findCardByAnswer(cards, answer, locale = "es") {
  const normalizedAnswer = normalizePyramidAnswer(answer);
  if (!normalizedAnswer) return null;

  return cards.find((card) => {
    const names = [card.name, card.nameEn, getCardName(card, locale)];
    return names.some((name) => normalizePyramidAnswer(name) === normalizedAnswer);
  }) ?? null;
}

export function getPyramidSuggestions(cards, answer, usedIds = new Set(), locale = "es") {
  const normalizedAnswer = normalizePyramidAnswer(answer);
  if (normalizedAnswer.length < 2) return [];

  return cards
    .filter((card) => !usedIds.has(card.id))
    .filter((card) => {
      const names = [card.name, card.nameEn, getCardName(card, locale)];
      return names.some((name) => normalizePyramidAnswer(name).includes(normalizedAnswer));
    })
    .slice(0, 8);
}
