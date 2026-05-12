import { PYRAMID_TARGET_COUNT } from "./pyramidConstants";
import { PYRAMID_CATEGORY_DEFINITIONS } from "./pyramidCategoryDefinitions";
import { isPlayablePyramidCard } from "./pyramidCardUtils";

export function getCategoryLabel(category, locale = "es") {
  return category?.labels?.[locale] ?? category?.labels?.es ?? category?.id ?? "";
}

export function buildPyramidCategories(cards, locale = "es") {
  const playableCards = cards.filter((card) => isPlayablePyramidCard(card, locale));

  return PYRAMID_CATEGORY_DEFINITIONS.map((definition) => {
    const matchingCards = playableCards.filter(definition.predicate);

    return {
      ...definition,
      matchingCards,
      answerIds: new Set(matchingCards.map((card) => card.id)),
    };
  }).filter((category) => category.matchingCards.length >= PYRAMID_TARGET_COUNT);
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
