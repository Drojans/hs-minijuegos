import { getAdaptedImage, getCardName } from "../../utils/cardLocale";

export const PYRAMID_TARGET_COUNT = 10;
export const PYRAMID_DAILY_TIME_SECONDS = 120;

const EXCLUDED_TYPES = new Set(["HERO", "HERO_POWER"]);

export function normalizePyramidAnswer(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ñ\s'-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isPlayablePyramidCard(card, locale = "es") {
  return (
    card?.id &&
    !EXCLUDED_TYPES.has(card.type) &&
    Boolean(getCardName(card, locale)) &&
    Boolean(getAdaptedImage(card, locale))
  );
}

function hasMechanic(card, mechanic) {
  return Array.isArray(card.mechanics) && card.mechanics.includes(mechanic);
}

const CATEGORY_DEFINITIONS = [
  {
    id: "taunt",
    labels: { es: "Cartas con Provocar", en: "Cards with Taunt" },
    predicate: (card) => hasMechanic(card, "TAUNT"),
  },
  {
    id: "battlecry",
    labels: { es: "Cartas con Grito de batalla", en: "Cards with Battlecry" },
    predicate: (card) => hasMechanic(card, "BATTLECRY"),
  },
  {
    id: "deathrattle",
    labels: { es: "Cartas con Último aliento", en: "Cards with Deathrattle" },
    predicate: (card) => hasMechanic(card, "DEATHRATTLE"),
  },
  {
    id: "rush",
    labels: { es: "Cartas con Embestir", en: "Cards with Rush" },
    predicate: (card) => hasMechanic(card, "RUSH"),
  },
  {
    id: "discover",
    labels: { es: "Cartas con Descubrir", en: "Cards with Discover" },
    predicate: (card) => hasMechanic(card, "DISCOVER"),
  },
  {
    id: "dragon",
    labels: { es: "Dragones", en: "Dragons" },
    predicate: (card) => card.race === "DRAGON",
  },
  {
    id: "pirate",
    labels: { es: "Piratas", en: "Pirates" },
    predicate: (card) => card.race === "PIRATE",
  },
  {
    id: "murloc",
    labels: { es: "Múrlocs", en: "Murlocs" },
    predicate: (card) => card.race === "MURLOC",
  },
  {
    id: "neutral-legendary",
    labels: { es: "Legendarias neutrales", en: "Neutral Legendaries" },
    predicate: (card) => card.cardClass === "NEUTRAL" && card.rarity === "LEGENDARY",
  },
  {
    id: "cost-zero",
    labels: { es: "Cartas de coste 0", en: "0-Cost cards" },
    predicate: (card) => card.cost === 0,
  },
  {
    id: "cost-ten",
    labels: { es: "Cartas de coste 10", en: "10-Cost cards" },
    predicate: (card) => card.cost === 10,
  },
  {
    id: "mage-spells",
    labels: { es: "Hechizos de Mago", en: "Mage spells" },
    predicate: (card) => card.type === "SPELL" && card.cardClass === "MAGE",
  },
  {
    id: "weapons",
    labels: { es: "Armas", en: "Weapons" },
    predicate: (card) => card.type === "WEAPON",
  },
  {
    id: "demons",
    labels: { es: "Demonios", en: "Demons" },
    predicate: (card) => card.race === "DEMON",
  },
];

export function getCategoryLabel(category, locale = "es") {
  return category?.labels?.[locale] ?? category?.labels?.es ?? category?.id ?? "";
}

export function buildPyramidCategories(cards, locale = "es") {
  const playableCards = cards.filter((card) => isPlayablePyramidCard(card, locale));

  return CATEGORY_DEFINITIONS.map((definition) => {
    const matchingCards = playableCards.filter(definition.predicate);

    return {
      ...definition,
      matchingCards,
      answerIds: new Set(matchingCards.map((card) => card.id)),
    };
  }).filter((category) => category.matchingCards.length >= PYRAMID_TARGET_COUNT);
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

export function getRandomCategory(categories, previousId) {
  if (!categories.length) return null;
  if (categories.length === 1) return categories[0];

  let nextCategory = categories[Math.floor(Math.random() * categories.length)];
  let attempts = 0;

  while (nextCategory?.id === previousId && attempts < 12) {
    nextCategory = categories[Math.floor(Math.random() * categories.length)];
    attempts += 1;
  }

  return nextCategory;
}

export function getCardImage(card, locale = "es") {
  return getAdaptedImage(card, locale);
}
