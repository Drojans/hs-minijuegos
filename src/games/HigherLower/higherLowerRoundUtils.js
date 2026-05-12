import { HIGHER_LOWER_DAILY_TARGET } from "../../shared/config/gameRules";
import { getAvailableQuestions } from "./higherLowerQuestionUtils";

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
