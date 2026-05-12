import { HIGHER_LOWER_QUESTIONS } from "./higherLowerQuestionDefinitions";

export function hasHigherLowerNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
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
  return hasHigherLowerNumber(value) ? value : null;
}

export function getAvailableQuestions(leftCard, rightCard, locale = "es") {
  return HIGHER_LOWER_QUESTIONS.filter((questionToUse) => {
    const leftValue = getQuestionValue(questionToUse, leftCard, locale);
    const rightValue = getQuestionValue(questionToUse, rightCard, locale);
    return hasHigherLowerNumber(leftValue) && hasHigherLowerNumber(rightValue);
  });
}

export function resolveHigherLowerAnswer({ leftCard, rightCard, question: questionToUse, selectedSide, locale = "es" }) {
  const leftValue = getQuestionValue(questionToUse, leftCard, locale);
  const rightValue = getQuestionValue(questionToUse, rightCard, locale);

  if (!hasHigherLowerNumber(leftValue) || !hasHigherLowerNumber(rightValue)) {
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
