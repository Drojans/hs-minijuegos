export const GAME_MODE_IDS = {
  DAILY: "daily",
  INFINITE: "infinite",
  TIMED: "timed",
};

export function hashString(input) {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function getDailyIndex(items, gameId, dateKey) {
  if (!items.length) return -1;
  return hashString(`${gameId}:${dateKey}`) % items.length;
}

export function getDailyItem(items, gameId, dateKey) {
  const index = getDailyIndex(items, gameId, dateKey);
  return index >= 0 ? items[index] : null;
}
