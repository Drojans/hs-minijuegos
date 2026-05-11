const DAILY_PROGRESS_KEY = "hearthdle:daily-progress:v1";

export const DAILY_PROGRESS_UPDATED_EVENT = "hearthdle:daily-progress-updated";

function readJson(key, fallback) {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(DAILY_PROGRESS_UPDATED_EVENT));
  } catch {
    // localStorage can fail in private browsing; game should keep working.
  }
}

function getDefaultProgress() {
  return {
    completed: false,
    rewardClaimed: false,
    completedAt: null,
    lastSelectedCost: null,
    lastCorrectCost: null,
    lastCardId: null,
    lastWasCorrect: false,
  };
}

export function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getDailyProgressStore() {
  return readJson(DAILY_PROGRESS_KEY, {});
}

export function getDailyGameProgress(gameId, dateKey = getTodayKey()) {
  return {
    ...getDefaultProgress(),
    ...(getDailyProgressStore()?.[gameId]?.[dateKey] ?? {}),
  };
}

export function updateDailyGameProgress(gameId, dateKey, updater) {
  const store = getDailyProgressStore();
  const gameStore = store[gameId] ?? {};
  const current = {
    ...getDefaultProgress(),
    ...(gameStore[dateKey] ?? {}),
  };

  const next = updater(current);
  const nextStore = {
    ...store,
    [gameId]: {
      ...gameStore,
      [dateKey]: next,
    },
  };

  writeJson(DAILY_PROGRESS_KEY, nextStore);
  return next;
}

export function completeDailyChallenge(gameId, dateKey = getTodayKey()) {
  return updateDailyGameProgress(gameId, dateKey, (current) => ({
    ...current,
    completed: true,
    completedAt: current.completedAt ?? new Date().toISOString(),
  }));
}

export function markDailyRewardClaimed(gameId, dateKey = getTodayKey()) {
  return updateDailyGameProgress(gameId, dateKey, (current) => ({
    ...current,
    completed: true,
    completedAt: current.completedAt ?? new Date().toISOString(),
    rewardClaimed: true,
    rewardClaimedAt: current.rewardClaimedAt ?? new Date().toISOString(),
  }));
}

export function saveDailyChallengeResult(gameId, dateKey = getTodayKey(), result = {}) {
  return updateDailyGameProgress(gameId, dateKey, (current) => ({
    ...current,
    ...result,
  }));
}
