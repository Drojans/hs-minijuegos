import { getCollectionStore, replaceCollectionStore } from "../collection/collectionStore";
import { getDailyProgressStore, replaceDailyProgressStore } from "../progress/dailyProgress";
import { getRewardStore, replaceRewardStore } from "../rewards/rewardStore";
import { getPlayerProfile, updatePlayerProfile } from "./playerProfileStore";

export const PLAYER_DATA_SCHEMA_VERSION = 1;

function nowIso() {
  return new Date().toISOString();
}

export function getPlayerDataSnapshot() {
  return {
    schemaVersion: PLAYER_DATA_SCHEMA_VERSION,
    exportedAt: nowIso(),
    profile: getPlayerProfile(),
    dailyProgress: getDailyProgressStore(),
    rewards: getRewardStore(),
    collection: getCollectionStore(),
  };
}

export function importPlayerDataSnapshot(snapshot = {}) {
  if (!snapshot || typeof snapshot !== "object") {
    return getPlayerDataSnapshot();
  }

  if (snapshot.profile) {
    updatePlayerProfile(snapshot.profile);
  }

  if (snapshot.dailyProgress && typeof snapshot.dailyProgress === "object") {
    replaceDailyProgressStore(snapshot.dailyProgress);
  }

  if (snapshot.rewards && typeof snapshot.rewards === "object") {
    replaceRewardStore(snapshot.rewards);
  }

  if (snapshot.collection && typeof snapshot.collection === "object") {
    replaceCollectionStore(snapshot.collection);
  }

  return getPlayerDataSnapshot();
}

export function createEmptyPlayerDataSnapshot(profilePatch = {}) {
  return {
    schemaVersion: PLAYER_DATA_SCHEMA_VERSION,
    exportedAt: nowIso(),
    profile: {
      ...getPlayerProfile(),
      ...profilePatch,
      updatedAt: nowIso(),
    },
    dailyProgress: {},
    rewards: {
      packs: {},
      history: [],
    },
    collection: {
      cards: {},
      history: [],
    },
  };
}

export function getPlayerDataForFutureBackend() {
  const snapshot = getPlayerDataSnapshot();

  return {
    schemaVersion: snapshot.schemaVersion,
    playerId: snapshot.profile.playerId,
    profile: snapshot.profile,
    stores: {
      dailyProgress: snapshot.dailyProgress,
      rewards: snapshot.rewards,
      collection: snapshot.collection,
    },
    updatedAt: nowIso(),
  };
}
