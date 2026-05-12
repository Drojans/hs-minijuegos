import { getAdaptedImage, getCardName, getCardText } from "../../utils/cardLocale";
import { HIGHER_LOWER_DAILY_TARGET } from "../../shared/config/gameRules";

const EXCLUDED_CARD_TYPES = new Set(["HERO", "HERO_POWER"]);

const RARITY_RANK = {
  FREE: 0,
  COMMON: 1,
  RARE: 2,
  EPIC: 3,
  LEGENDARY: 4,
};

// Expansion order is only used for the "older/newer" comparison.
const SET_ORDER = [
  "VANILLA",
  "EXPERT1",
  "LEGACY",
  "NAXX",
  "GVG",
  "BRM",
  "TGT",
  "LOE",
  "OG",
  "KARA",
  "GANGS",
  "UNGORO",
  "ICECROWN",
  "LOOTAPALOOZA",
  "GILNEAS",
  "BOOMSDAY",
  "TROLL",
  "DALARAN",
  "ULDUM",
  "DRAGONS",
  "YEAR_OF_THE_DRAGON",
  "DEMON_HUNTER_INITIATE",
  "BLACK_TEMPLE",
  "SCHOLOMANCE",
  "DARKMOON_FAIRE",
  "THE_BARRENS",
  "STORMWIND",
  "ALTERAC_VALLEY",
  "THE_SUNKEN_CITY",
  "REVENDRETH",
  "PATH_OF_ARTHAS",
  "RETURN_OF_THE_LICH_KING",
  "BATTLE_OF_THE_BANDS",
  "TITANS",
  "WILD_WEST",
  "WHIZBANGS_WORKSHOP",
  "ISLAND_VACATION",
  "SPACE",
  "TIME_TRAVEL",
  "WONDERS",
  "CATACLYSM",
  "THE_LOST_CITY",
  "EMERALD_DREAM",
];

const SET_ORDER_MAP = new Map(SET_ORDER.map((set, index) => [set, index]));

function getSetOrder(card) {
  if (!card?.set) return null;
  if (SET_ORDER_MAP.has(card.set)) return SET_ORDER_MAP.get(card.set);
  return null;
}

function normalizeText(value) {
  return String(value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\$|#|\[x\]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(value) {
  const text = normalizeText(value);
  return text ? text.split(" ").length : 0;
}

function totalStats(card) {
  if (typeof card?.attack !== "number" || typeof card?.health !== "number") return null;
  return card.attack + card.health;
}

function costStats(card) {
  const values = [card?.cost, card?.attack, card?.health].filter((value) => typeof value === "number");
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0);
}

function hasNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function question({ id, labels, direction, metric, valueLabel }) {
  return { id, labels, direction, metric, valueLabel };
}

export const HIGHER_LOWER_QUESTIONS = [
  question({
    id: "cost-higher",
    labels: { es: "¿Cuál tiene mayor coste de maná?", en: "Which has the higher mana cost?" },
    direction: "higher",
    metric: (card) => card.cost,
    valueLabel: { es: "coste", en: "cost" },
  }),
  question({
    id: "cost-lower",
    labels: { es: "¿Cuál tiene menor coste de maná?", en: "Which has the lower mana cost?" },
    direction: "lower",
    metric: (card) => card.cost,
    valueLabel: { es: "coste", en: "cost" },
  }),
  question({
    id: "attack-higher",
    labels: { es: "¿Cuál tiene más ataque?", en: "Which has more Attack?" },
    direction: "higher",
    metric: (card) => card.attack,
    valueLabel: { es: "ataque", en: "attack" },
  }),
  question({
    id: "attack-lower",
    labels: { es: "¿Cuál tiene menos ataque?", en: "Which has less Attack?" },
    direction: "lower",
    metric: (card) => card.attack,
    valueLabel: { es: "ataque", en: "attack" },
  }),
  question({
    id: "health-higher",
    labels: { es: "¿Cuál tiene más vida?", en: "Which has more Health?" },
    direction: "higher",
    metric: (card) => card.health,
    valueLabel: { es: "vida", en: "health" },
  }),
  question({
    id: "health-lower",
    labels: { es: "¿Cuál tiene menos vida?", en: "Which has less Health?" },
    direction: "lower",
    metric: (card) => card.health,
    valueLabel: { es: "vida", en: "health" },
  }),
  question({
    id: "stats-higher",
    labels: { es: "¿Cuál tiene más ataque + vida?", en: "Which has more Attack + Health?" },
    direction: "higher",
    metric: totalStats,
    valueLabel: { es: "estadísticas", en: "stats" },
  }),
  question({
    id: "stats-lower",
    labels: { es: "¿Cuál tiene menos ataque + vida?", en: "Which has less Attack + Health?" },
    direction: "lower",
    metric: totalStats,
    valueLabel: { es: "estadísticas", en: "stats" },
  }),
  question({
    id: "durability-higher",
    labels: { es: "¿Cuál tiene más durabilidad?", en: "Which has more Durability?" },
    direction: "higher",
    metric: (card) => card.durability,
    valueLabel: { es: "durabilidad", en: "durability" },
  }),
  question({
    id: "durability-lower",
    labels: { es: "¿Cuál tiene menos durabilidad?", en: "Which has less Durability?" },
    direction: "lower",
    metric: (card) => card.durability,
    valueLabel: { es: "durabilidad", en: "durability" },
  }),
  question({
    id: "rarity-higher",
    labels: { es: "¿Cuál tiene mayor rareza?", en: "Which has the higher rarity?" },
    direction: "higher",
    metric: (card) => RARITY_RANK[card.rarity] ?? null,
    valueLabel: { es: "rareza", en: "rarity" },
  }),
  question({
    id: "rarity-lower",
    labels: { es: "¿Cuál tiene menor rareza?", en: "Which has the lower rarity?" },
    direction: "lower",
    metric: (card) => RARITY_RANK[card.rarity] ?? null,
    valueLabel: { es: "rareza", en: "rarity" },
  }),
  question({
    id: "older",
    labels: { es: "¿Cuál es más antigua?", en: "Which is older?" },
    direction: "lower",
    metric: getSetOrder,
    valueLabel: { es: "set", en: "set" },
  }),
  question({
    id: "newer",
    labels: { es: "¿Cuál es más nueva?", en: "Which is newer?" },
    direction: "higher",
    metric: getSetOrder,
    valueLabel: { es: "set", en: "set" },
  }),
  question({
    id: "mechanics-higher",
    labels: { es: "¿Cuál tiene más mecánicas?", en: "Which has more mechanics?" },
    direction: "higher",
    metric: (card) => (Array.isArray(card.mechanics) ? card.mechanics.length : 0),
    valueLabel: { es: "mecánicas", en: "mechanics" },
  }),
  question({
    id: "mechanics-lower",
    labels: { es: "¿Cuál tiene menos mecánicas?", en: "Which has fewer mechanics?" },
    direction: "lower",
    metric: (card) => (Array.isArray(card.mechanics) ? card.mechanics.length : 0),
    valueLabel: { es: "mecánicas", en: "mechanics" },
  }),
  question({
    id: "text-length-higher",
    labels: { es: "¿Cuál tiene más texto de carta?", en: "Which has more card text?" },
    direction: "higher",
    metric: (card, locale) => normalizeText(getCardText(card, locale)).length,
    valueLabel: { es: "texto", en: "text" },
  }),
  question({
    id: "text-length-lower",
    labels: { es: "¿Cuál tiene menos texto de carta?", en: "Which has less card text?" },
    direction: "lower",
    metric: (card, locale) => normalizeText(getCardText(card, locale)).length,
    valueLabel: { es: "texto", en: "text" },
  }),
  question({
    id: "text-words-higher",
    labels: { es: "¿Cuál tiene más palabras en el texto?", en: "Which has more words in its text?" },
    direction: "higher",
    metric: (card, locale) => wordCount(getCardText(card, locale)),
    valueLabel: { es: "palabras", en: "words" },
  }),
  question({
    id: "text-words-lower",
    labels: { es: "¿Cuál tiene menos palabras en el texto?", en: "Which has fewer words in its text?" },
    direction: "lower",
    metric: (card, locale) => wordCount(getCardText(card, locale)),
    valueLabel: { es: "palabras", en: "words" },
  }),
  question({
    id: "name-length-higher",
    labels: { es: "¿Cuál tiene el nombre más largo?", en: "Which has the longer name?" },
    direction: "higher",
    metric: (card, locale) => getCardName(card, locale).length,
    valueLabel: { es: "nombre", en: "name" },
  }),
  question({
    id: "name-length-lower",
    labels: { es: "¿Cuál tiene el nombre más corto?", en: "Which has the shorter name?" },
    direction: "lower",
    metric: (card, locale) => getCardName(card, locale).length,
    valueLabel: { es: "nombre", en: "name" },
  }),
  question({
    id: "name-words-higher",
    labels: { es: "¿Cuál tiene más palabras en el nombre?", en: "Which has more words in its name?" },
    direction: "higher",
    metric: (card, locale) => wordCount(getCardName(card, locale)),
    valueLabel: { es: "palabras", en: "words" },
  }),
  question({
    id: "name-words-lower",
    labels: { es: "¿Cuál tiene menos palabras en el nombre?", en: "Which has fewer words in its name?" },
    direction: "lower",
    metric: (card, locale) => wordCount(getCardName(card, locale)),
    valueLabel: { es: "palabras", en: "words" },
  }),
  question({
    id: "total-value-higher",
    labels: { es: "¿Cuál tiene más valor total?", en: "Which has the higher total value?" },
    direction: "higher",
    metric: costStats,
    valueLabel: { es: "valor", en: "value" },
  }),
  question({
    id: "total-value-lower",
    labels: { es: "¿Cuál tiene menos valor total?", en: "Which has the lower total value?" },
    direction: "lower",
    metric: costStats,
    valueLabel: { es: "valor", en: "value" },
  }),
];

export function getHigherLowerCardImage(card, locale = "es") {
  return getAdaptedImage(card, locale);
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

export function getQuestionLabel(questionToUse, locale = "es") {
  return questionToUse?.labels?.[locale] ?? questionToUse?.labels?.es ?? "";
}

export function getQuestionById(questionId) {
  return HIGHER_LOWER_QUESTIONS.find((questionToUse) => questionToUse.id === questionId) ?? HIGHER_LOWER_QUESTIONS[0];
}

export function getQuestionValueLabel(questionToUse, locale = "es") {
  return questionToUse?.valueLabel?.[locale] ?? questionToUse?.valueLabel?.es ?? "";
}

export function getQuestionValue(questionToUse, card, locale = "es") {
  const value = questionToUse?.metric?.(card, locale);
  return hasNumber(value) ? value : null;
}

export function getAvailableQuestions(leftCard, rightCard, locale = "es") {
  return HIGHER_LOWER_QUESTIONS.filter((questionToUse) => {
    const leftValue = getQuestionValue(questionToUse, leftCard, locale);
    const rightValue = getQuestionValue(questionToUse, rightCard, locale);
    return hasNumber(leftValue) && hasNumber(rightValue);
  });
}

export function resolveHigherLowerAnswer({ leftCard, rightCard, question: questionToUse, selectedSide, locale = "es" }) {
  const leftValue = getQuestionValue(questionToUse, leftCard, locale);
  const rightValue = getQuestionValue(questionToUse, rightCard, locale);

  if (!hasNumber(leftValue) || !hasNumber(rightValue)) {
    return {
      isCorrect: false,
      isTie: false,
      correctSide: "none",
      leftValue,
      rightValue,
    };
  }

  if (leftValue === rightValue) {
    return {
      isCorrect: true,
      isTie: true,
      correctSide: "tie",
      leftValue,
      rightValue,
    };
  }

  const higherSide = leftValue > rightValue ? "left" : "right";
  const lowerSide = leftValue < rightValue ? "left" : "right";
  const correctSide = questionToUse.direction === "lower" ? lowerSide : higherSide;

  return {
    isCorrect: selectedSide === correctSide,
    isTie: false,
    correctSide,
    leftValue,
    rightValue,
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

function createSeededRandom(seed) {
  let state = hashSeed(seed) || 1;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function pickRandomItem(items, random = Math.random) {
  if (!items.length) return null;
  return items[Math.floor(random() * items.length)];
}

function pickDifferentCard(cards, currentId, random = Math.random) {
  const pool = cards.filter((card) => card.id !== currentId);
  return pickRandomItem(pool.length ? pool : cards, random);
}

export function createHigherLowerDuel(cards, leftCard, locale = "es", random = Math.random) {
  if (!cards.length) return null;

  let rightCard = null;
  let availableQuestions = [];
  let attempts = 0;

  while (attempts < 120) {
    rightCard = pickDifferentCard(cards, leftCard?.id, random);
    availableQuestions = getAvailableQuestions(leftCard, rightCard, locale);

    if (rightCard && availableQuestions.length > 0) break;
    attempts += 1;
  }

  if (!rightCard || availableQuestions.length === 0) return null;

  return {
    leftCard,
    rightCard,
    question: pickRandomItem(availableQuestions, random),
  };
}

export function createInitialHigherLowerDuel(cards, locale = "es", random = Math.random) {
  const leftCard = pickRandomItem(cards, random);
  if (!leftCard) return null;
  return createHigherLowerDuel(cards, leftCard, locale, random);
}

export function createDailyHigherLowerRun(cards, dateKey, locale = "es", targetCount = HIGHER_LOWER_DAILY_TARGET) {
  const random = createSeededRandom(`higher-lower:${dateKey}`);
  const startCard = pickRandomItem(cards, random);
  if (!startCard) return null;

  const rounds = [];
  let currentCard = startCard;

  while (rounds.length < targetCount) {
    const duel = createHigherLowerDuel(cards, currentCard, locale, random);
    if (!duel) break;

    rounds.push({
      rightCard: duel.rightCard,
      question: duel.question,
    });

    currentCard = duel.rightCard;
  }

  if (rounds.length < targetCount) return null;

  return {
    startCard,
    rounds,
  };
}

export function serializeHigherLowerHistory(history = []) {
  return history.map((item) => ({
    leftCardId: item.leftCard?.id ?? item.leftCardId,
    rightCardId: item.rightCard?.id ?? item.rightCardId,
    questionId: item.question?.id ?? item.questionId,
    selectedSide: item.selectedSide,
    correctSide: item.correctSide,
    isCorrect: Boolean(item.isCorrect),
    isTie: Boolean(item.isTie),
    leftValue: item.leftValue,
    rightValue: item.rightValue,
  }));
}

export function hydrateHigherLowerHistory(history = [], cards = []) {
  return history.map((item) => ({
    ...item,
    leftCard: cards.find((card) => card.id === item.leftCardId) ?? null,
    rightCard: cards.find((card) => card.id === item.rightCardId) ?? null,
    question: getQuestionById(item.questionId),
  })).filter((item) => item.leftCard && item.rightCard && item.question);
}
