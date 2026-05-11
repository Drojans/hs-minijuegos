const REWARD_STORE_KEY = "hearthdle:rewards:v1";

export const REWARDS_UPDATED_EVENT = "hearthdle:rewards-updated";

const DEFAULT_REWARD_STORE = {
  packs: {
    standard: 0,
  },
  history: [],
};

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
  } catch {
    // Keep game playable even if localStorage is blocked.
  }
}

function notifyRewardStoreUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(REWARDS_UPDATED_EVENT));
}

export function getRewardStore() {
  const stored = readJson(REWARD_STORE_KEY, DEFAULT_REWARD_STORE);

  return {
    ...DEFAULT_REWARD_STORE,
    ...stored,
    packs: {
      ...DEFAULT_REWARD_STORE.packs,
      ...(stored.packs ?? {}),
    },
    history: Array.isArray(stored.history) ? stored.history : [],
  };
}

export function getPackCount(packId = "standard") {
  return getRewardStore().packs?.[packId] ?? 0;
}

export function addPackReward({ packId = "standard", amount = 1, source = "unknown", dateKey } = {}) {
  const store = getRewardStore();
  const currentAmount = store.packs?.[packId] ?? 0;
  const nextStore = {
    ...store,
    packs: {
      ...store.packs,
      [packId]: currentAmount + amount,
    },
    history: [
      ...store.history,
      {
        type: "pack",
        packId,
        amount,
        source,
        dateKey,
        createdAt: new Date().toISOString(),
      },
    ],
  };

  writeJson(REWARD_STORE_KEY, nextStore);
  notifyRewardStoreUpdated();
  return nextStore;
}

export function consumePackReward({ packId = "standard", amount = 1, source = "open-pack" } = {}) {
  const store = getRewardStore();
  const currentAmount = store.packs?.[packId] ?? 0;

  if (currentAmount < amount) {
    return {
      ok: false,
      store,
      remaining: currentAmount,
    };
  }

  const nextStore = {
    ...store,
    packs: {
      ...store.packs,
      [packId]: currentAmount - amount,
    },
    history: [
      ...store.history,
      {
        type: "pack-consumed",
        packId,
        amount,
        source,
        createdAt: new Date().toISOString(),
      },
    ],
  };

  writeJson(REWARD_STORE_KEY, nextStore);
  notifyRewardStoreUpdated();

  return {
    ok: true,
    store: nextStore,
    remaining: nextStore.packs[packId],
  };
}
