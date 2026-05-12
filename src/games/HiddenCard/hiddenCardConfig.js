import {
  getAdaptedImage,
  getCardName,
  getCardText,
  getDetailImage,
  getGameImage,
  getSecondaryCardName,
  getThumbImage,
  translateCardClass,
  translateCardRarity,
  translateCardType,
} from "../../utils/cardLocale";

const EXCLUDED_CARD_TYPES = new Set(["HERO_POWER"]);

export function getHiddenCardImage(card, locale = "es") {
  return getDetailImage(card, locale) || getAdaptedImage(card, locale) || getGameImage(card, locale) || getThumbImage(card, locale);
}

export function isPlayableHiddenCard(card, locale = "es") {
  return (
    card &&
    !EXCLUDED_CARD_TYPES.has(card.type) &&
    Boolean(card.id) &&
    Boolean(getCardName(card, locale)) &&
    Boolean(getHiddenCardImage(card, locale))
  );
}

export function normalizeCardGuess(value = "") {
  return String(value)
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ñ ]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getHiddenCardSearchNames(card, locale = "es") {
  const names = [getCardName(card, locale), getSecondaryCardName(card, locale), getCardName(card, locale === "es" ? "en" : "es")]
    .filter(Boolean);

  return [...new Set(names)];
}

export function isCorrectHiddenCardGuess(card, guess, locale = "es") {
  const normalizedGuess = normalizeCardGuess(guess);
  if (!normalizedGuess) return false;

  return getHiddenCardSearchNames(card, locale).some((name) => normalizeCardGuess(name) === normalizedGuess);
}

export function getHiddenCardSuggestions(cards = [], query = "", locale = "es", limit = 8) {
  const normalizedQuery = normalizeCardGuess(query);
  if (!normalizedQuery) return [];

  const startsWith = [];
  const includes = [];

  for (const card of cards) {
    const names = getHiddenCardSearchNames(card, locale);
    const matchedName = names.find((name) => normalizeCardGuess(name).includes(normalizedQuery));
    if (!matchedName) continue;

    const normalizedName = normalizeCardGuess(matchedName);
    const item = { card, label: getCardName(card, locale), matchedName };

    if (normalizedName.startsWith(normalizedQuery)) {
      startsWith.push(item);
    } else {
      includes.push(item);
    }

    if (startsWith.length >= limit) break;
  }

  return [...startsWith, ...includes].slice(0, limit);
}

function normalizeText(value) {
  return String(value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\$|#|\[x\]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getFirstLetterHint(card, locale) {
  const name = getCardName(card, locale);
  return name ? name.trim().charAt(0).toLocaleUpperCase() : "?";
}

function getNameWordCount(card, locale) {
  const name = getCardName(card, locale).trim();
  return name ? name.split(/\s+/).length : 0;
}

function getTextSnippet(card, locale) {
  const text = normalizeText(getCardText(card, locale));
  if (!text) return "—";
  const words = text.split(" ").slice(0, 5).join(" ");
  return `${words}${text.split(" ").length > 5 ? "…" : ""}`;
}

export function getHiddenCardHints(card, locale = "es") {
  return {
    cost: typeof card?.cost === "number" ? card.cost : "—",
    type: translateCardType(card?.type, locale, card?.type ?? "—"),
    class: translateCardClass(card?.cardClass, locale, card?.cardClass ?? "—"),
    rarity: translateCardRarity(card?.rarity, locale, card?.rarity ?? "—"),
    firstLetter: getFirstLetterHint(card, locale),
    nameWords: getNameWordCount(card, locale),
    textSnippet: getTextSnippet(card, locale),
  };
}

function hashSeed(seed) {
  let hash = 2166136261;
  const text = String(seed);

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function createSeededRandom(seed) {
  let state = hashSeed(seed) || 1;

  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickHiddenCard(cards = [], random = Math.random, excludeId = null) {
  const pool = excludeId ? cards.filter((card) => card.id !== excludeId) : cards;
  const source = pool.length ? pool : cards;
  if (!source.length) return null;
  return source[Math.floor(random() * source.length)];
}
