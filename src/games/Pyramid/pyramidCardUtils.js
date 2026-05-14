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

function getSuggestionNameKey(card, locale = "es") {
  const localizedName = normalizePyramidAnswer(getCardName(card, locale));
  const spanishName = normalizePyramidAnswer(card?.name);
  const englishName = normalizePyramidAnswer(card?.nameEn);

  return [localizedName, spanishName, englishName].filter(Boolean).join("|");
}

export function getPyramidSuggestions(cards, answer, usedIds = new Set(), locale = "es") {
  const normalizedAnswer = normalizePyramidAnswer(answer);
  if (normalizedAnswer.length < 2) return [];

  const usedNameKeys = new Set(
    cards
      .filter((card) => usedIds.has(card.id))
      .map((card) => getSuggestionNameKey(card, locale))
      .filter(Boolean),
  );
  const seenNameKeys = new Set();
  const suggestions = [];

  for (const card of cards) {
    if (!card || usedIds.has(card.id)) continue;

    const nameKey = getSuggestionNameKey(card, locale);
    if (!nameKey || usedNameKeys.has(nameKey) || seenNameKeys.has(nameKey)) continue;

    const names = [card.name, card.nameEn, getCardName(card, locale)];
    const matchesAnswer = names.some((name) => normalizePyramidAnswer(name).includes(normalizedAnswer));
    if (!matchesAnswer) continue;

    seenNameKeys.add(nameKey);
    suggestions.push(card);

    if (suggestions.length >= 8) break;
  }

  return suggestions;
}
