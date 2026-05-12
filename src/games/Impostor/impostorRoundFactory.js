import { CORRECT_COUNT, IMPOSTOR_COUNT } from "./impostorConstants";
import {
  getRandomItem,
  getSeededRandom,
  seededShuffle,
  shuffle,
  takeRandomUniqueForRound,
  takeSeededUniqueForRound,
} from "./impostorRoundUtils";

function markCardsForRound(cards, isCorrect) {
  return cards.map((card) => ({
    ...card,
    impostorGameIsCorrect: isCorrect,
    impostorGameIsImpostor: !isCorrect,
  }));
}

function buildRound({ condition, cards, id }) {
  const correctCards = markCardsForRound(cards.correct, true);
  const impostorCards = markCardsForRound(cards.impostor, false);

  return {
    id,
    condition,
    cards: cards.shuffle([...correctCards, ...impostorCards]),
    correctIds: new Set(correctCards.map((card) => card.id)),
    impostorIds: new Set(impostorCards.map((card) => card.id)),
    correctCount: correctCards.length,
    impostorCount: impostorCards.length,
  };
}

export function createRoundFromConditions(conditions, previousConditionId = null) {
  if (!conditions || conditions.length === 0) return null;

  const availableConditions = conditions.filter((condition) => condition.id !== previousConditionId);
  const condition = getRandomItem(availableConditions.length > 0 ? availableConditions : conditions);
  const usedIdentities = new Set();

  return buildRound({
    condition,
    id: `${condition.id}-${Date.now()}-${Math.random()}`,
    cards: {
      correct: takeRandomUniqueForRound(condition.validCards, CORRECT_COUNT, usedIdentities),
      impostor: takeRandomUniqueForRound(condition.invalidCards, IMPOSTOR_COUNT, usedIdentities),
      shuffle,
    },
  });
}

export function createRoundFromCondition(condition, seedInput = "impostor-round") {
  if (!condition) return null;

  const usedIdentities = new Set();

  return buildRound({
    condition,
    id: `${condition.id}-${seedInput}`,
    cards: {
      correct: takeSeededUniqueForRound(
        condition.validCards,
        CORRECT_COUNT,
        usedIdentities,
        `${seedInput}:correct`
      ),
      impostor: takeSeededUniqueForRound(
        condition.invalidCards,
        IMPOSTOR_COUNT,
        usedIdentities,
        `${seedInput}:impostor`
      ),
      shuffle: (cards) => seededShuffle(cards, `${seedInput}:board`),
    },
  });
}

export function createDailyRoundFromConditions(conditions, gameId, dateKey) {
  if (!conditions || conditions.length === 0) return null;

  const random = getSeededRandom(`${gameId}:${dateKey}:condition`);
  const condition = conditions[Math.floor(random() * conditions.length)] ?? conditions[0];

  return createRoundFromCondition(condition, `${gameId}:${dateKey}:${condition.id}`);
}
