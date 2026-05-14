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

function normalizeRevealValue(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[’']/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .toLowerCase();
}

function getRevealNameKeys(card) {
  return [card?.name, card?.nameEn]
    .map((name) => normalizeRevealValue(name))
    .filter(Boolean);
}

function getUsedRevealNameKeys(cards) {
  return new Set(cards.flatMap((card) => getRevealNameKeys(card)));
}

function pickRandomItem(items) {
  if (!items.length) return null;
  return items[Math.floor(Math.random() * items.length)];
}

function getAvailableRevealCandidates(candidates = [], usedIds, usedNameKeys, { allowSameName = false } = {}) {
  return candidates.filter((card) => {
    if (!card || usedIds.has(card.id)) return false;
    if (allowSameName) return true;

    const nameKeys = getRevealNameKeys(card);
    return nameKeys.every((key) => !usedNameKeys.has(key));
  });
}

function getPendingRevealCells(grid, answers) {
  const pendingCells = [];

  grid.rows.forEach((_, rowIndex) => {
    grid.columns.forEach((__, columnIndex) => {
      const key = getGridCellKey(rowIndex, columnIndex);
      if (answers[key]) return;

      pendingCells.push({
        key,
        candidates: grid.candidateMap[key] ?? [],
      });
    });
  });

  return pendingCells;
}


function getRevealedRefreshCells(grid, revealedCells) {
  const revealedSet = new Set(revealedCells);
  const refreshCells = [];

  grid.rows.forEach((_, rowIndex) => {
    grid.columns.forEach((__, columnIndex) => {
      const key = getGridCellKey(rowIndex, columnIndex);
      if (!revealedSet.has(key)) return;

      refreshCells.push({
        key,
        candidates: grid.candidateMap[key] ?? [],
      });
    });
  });

  return refreshCells;
}

function getDifferentRevealCandidates(candidates = [], previousCard) {
  if (!previousCard) return candidates;

  const previousNameKeys = new Set(getRevealNameKeys(previousCard));

  return candidates.filter((card) => {
    if (!card || card.id === previousCard.id) return false;
    return getRevealNameKeys(card).every((key) => !previousNameKeys.has(key));
  });
}

function buildRevealStateForCells({
  baseAnswers = {},
  targetCells = [],
  revealedCells = [],
  previousAnswers = {},
  preferDifferent = false,
} = {}) {
  const nextAnswers = { ...baseAnswers };
  const nextRevealedCells = new Set(revealedCells);
  const usedIds = new Set(Object.values(nextAnswers).map((card) => card.id));
  const usedNameKeys = getUsedRevealNameKeys(Object.values(nextAnswers));
  const pendingCells = [...targetCells];

  while (pendingCells.length) {
    const bestCell = getBestRevealCell(pendingCells, usedIds, usedNameKeys);
    if (!bestCell) break;

    const fallbackCandidates = bestCell.candidates.filter(Boolean);
    const availableCandidates =
      bestCell.uniqueNameCandidates.length > 0
        ? bestCell.uniqueNameCandidates
        : bestCell.uniqueIdCandidates.length > 0
          ? bestCell.uniqueIdCandidates
          : fallbackCandidates;

    const previousCard = previousAnswers[bestCell.key];
    const differentCandidates = preferDifferent
      ? getDifferentRevealCandidates(availableCandidates, previousCard)
      : [];
    const revealedCard = pickRandomItem(differentCandidates.length ? differentCandidates : availableCandidates);
    if (!revealedCard) break;

    nextAnswers[bestCell.key] = revealedCard;
    usedIds.add(revealedCard.id);
    getRevealNameKeys(revealedCard).forEach((key) => usedNameKeys.add(key));
    nextRevealedCells.add(bestCell.key);

    const pendingIndex = pendingCells.findIndex((cell) => cell.key === bestCell.key);
    if (pendingIndex >= 0) pendingCells.splice(pendingIndex, 1);
  }

  return { answers: nextAnswers, revealedCells: nextRevealedCells };
}

function getBestRevealCell(pendingCells, usedIds, usedNameKeys) {
  const scoredCells = pendingCells.map((cell) => {
    const uniqueNameCandidates = getAvailableRevealCandidates(cell.candidates, usedIds, usedNameKeys);
    const uniqueIdCandidates = getAvailableRevealCandidates(cell.candidates, usedIds, usedNameKeys, {
      allowSameName: true,
    });

    return {
      ...cell,
      uniqueNameCandidates,
      uniqueIdCandidates,
      availableCount: uniqueNameCandidates.length || uniqueIdCandidates.length || cell.candidates.length,
    };
  });

  const cellsWithCandidates = scoredCells.filter((cell) => cell.availableCount > 0);
  if (!cellsWithCandidates.length) return null;

  const lowestCandidateCount = Math.min(...cellsWithCandidates.map((cell) => cell.availableCount));
  const mostConstrainedCells = cellsWithCandidates.filter(
    (cell) => cell.availableCount === lowestCandidateCount
  );

  return pickRandomItem(mostConstrainedCells);
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

  return buildRevealStateForCells({
    baseAnswers: answers,
    targetCells: getPendingRevealCells(grid, answers),
    revealedCells: nextRevealedCells,
    previousAnswers: answers,
  });
}

export function buildRefreshedRevealedAnswerState({
  answers = {},
  grid = null,
  revealedCells = [],
} = {}) {
  const nextRevealedCells = new Set(revealedCells);

  if (!grid || !nextRevealedCells.size) {
    return { answers, revealedCells: nextRevealedCells };
  }

  const preservedAnswers = {};

  Object.entries(answers).forEach(([key, card]) => {
    if (!nextRevealedCells.has(key)) {
      preservedAnswers[key] = card;
    }
  });

  return buildRevealStateForCells({
    baseAnswers: preservedAnswers,
    targetCells: getRevealedRefreshCells(grid, nextRevealedCells),
    revealedCells: nextRevealedCells,
    previousAnswers: answers,
    preferDifferent: true,
  });
}
