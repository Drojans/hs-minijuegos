import { ARCANE_BOX_ID } from "../config/gameRules";
import { emitWindowEvent, readLocalJson, writeLocalJson } from "../storage/localStorage";

const REWARD_STORE_KEY = "hearthdle:rewards:v1";

export const REWARDS_UPDATED_EVENT = "hearthdle:rewards-updated";

const DEFAULT_REWARD_STORE = {
  // Kept as `packs` for localStorage backward compatibility.
  packs: {
    [ARCANE_BOX_ID]: 0,
  },
  history: [],
};

function notifyRewardStoreUpdated() {
  emitWindowEvent(REWARDS_UPDATED_EVENT);
}

export function getRewardStore() {
  const stored = readLocalJson(REWARD_STORE_KEY, DEFAULT_REWARD_STORE);

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

export function getArcaneBoxCount(boxId = ARCANE_BOX_ID) {
  return getRewardStore().packs?.[boxId] ?? 0;
}

export function addArcaneBoxReward({
  boxId = ARCANE_BOX_ID,
  amount = 1,
  source = "unknown",
  dateKey,
} = {}) {
  const store = getRewardStore();
  const currentAmount = store.packs?.[boxId] ?? 0;
  const nextStore = {
    ...store,
    packs: {
      ...store.packs,
      [boxId]: currentAmount + amount,
    },
    history: [
      ...store.history,
      {
        type: "arcane-box-earned",
        boxId,
        amount,
        source,
        dateKey,
        createdAt: new Date().toISOString(),
      },
    ],
  };

  writeLocalJson(REWARD_STORE_KEY, nextStore);
  notifyRewardStoreUpdated();
  return nextStore;
}

export function consumeArcaneBox({ boxId = ARCANE_BOX_ID, amount = 1, source = "open-box" } = {}) {
  const store = getRewardStore();
  const currentAmount = store.packs?.[boxId] ?? 0;

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
      [boxId]: currentAmount - amount,
    },
    history: [
      ...store.history,
      {
        type: "arcane-box-consumed",
        boxId,
        amount,
        source,
        createdAt: new Date().toISOString(),
      },
    ],
  };

  writeLocalJson(REWARD_STORE_KEY, nextStore);
  notifyRewardStoreUpdated();

  return {
    ok: true,
    store: nextStore,
    remaining: nextStore.packs[boxId],
  };
}

// Backwards-compatible aliases. Keep these until all old code/old browser data is fully migrated.
export const getPackCount = getArcaneBoxCount;
export function addPackReward({ packId = ARCANE_BOX_ID, ...rest } = {}) {
  return addArcaneBoxReward({ boxId: packId, ...rest });
}
export function consumePackReward({ packId = ARCANE_BOX_ID, ...rest } = {}) {
  return consumeArcaneBox({ boxId: packId, ...rest });
}
