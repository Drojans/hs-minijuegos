export function getDailyGridSeed(gameId, dateKey, gridMode) {
  return `${gameId}:${dateKey}:${gridMode}`;
}

export function getGridCellKey(rowIndex, columnIndex) {
  return `${rowIndex}-${columnIndex}`;
}

export function serializeAnswerIds(answers) {
  return Object.fromEntries(
    Object.entries(answers).map(([key, card]) => [key, card.id])
  );
}

export function restoreAnswersFromIds(answerIds = {}, cards = []) {
  const cardById = new Map(cards.map((card) => [card.id, card]));
  const restored = {};

  Object.entries(answerIds).forEach(([key, cardId]) => {
    const card = cardById.get(cardId);
    if (card) restored[key] = card;
  });

  return restored;
}

export function formatGridTime(totalSeconds) {
  const minutes = Math.floor(Math.max(0, totalSeconds) / 60);
  const seconds = Math.max(0, totalSeconds) % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function buildRevealedAnswerState({
  answers = {},
  grid = null,
  revealedCells = [],
} = {}) {
  const nextRevealedCells = new Set(revealedCells);

  if (!grid) {
    return { answers, revealedCells: nextRevealedCells };
  }

  const nextAnswers = { ...answers };
  const usedIds = new Set(Object.values(nextAnswers).map((card) => card.id));

  grid.rows.forEach((_, rowIndex) => {
    grid.columns.forEach((__, columnIndex) => {
      const key = getGridCellKey(rowIndex, columnIndex);
      if (nextAnswers[key]) return;

      const fallbackCard = (grid.candidateMap[key] ?? []).find((card) => !usedIds.has(card.id));
      if (!fallbackCard) return;

      nextAnswers[key] = fallbackCard;
      usedIds.add(fallbackCard.id);
      nextRevealedCells.add(key);
    });
  });

  return { answers: nextAnswers, revealedCells: nextRevealedCells };
}
