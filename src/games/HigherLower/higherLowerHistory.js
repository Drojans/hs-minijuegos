import { getQuestionById } from "./higherLowerQuestionUtils";

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
