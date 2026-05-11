import { emitWindowEvent, readLocalJson, writeLocalJson } from "../storage/localStorage";

export const PLAYER_PROFILE_KEY = "hearthdle:player-profile:v1";
export const PLAYER_PROFILE_UPDATED_EVENT = "hearthdle:player-profile-updated";

const DEFAULT_PLAYER_PROFILE = {
  schemaVersion: 1,
  mode: "guest",
  playerId: null,
  displayName: "Invitado",
  createdAt: null,
  updatedAt: null,
};

function createGuestPlayerId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizePlayerProfile(profile = {}) {
  const now = new Date().toISOString();
  const createdAt = profile.createdAt ?? now;

  return {
    ...DEFAULT_PLAYER_PROFILE,
    ...profile,
    schemaVersion: 1,
    mode: profile.mode ?? "guest",
    playerId: profile.playerId ?? createGuestPlayerId(),
    displayName: profile.displayName?.trim() || DEFAULT_PLAYER_PROFILE.displayName,
    createdAt,
    updatedAt: profile.updatedAt ?? createdAt,
  };
}

function notifyPlayerProfileUpdated(profile) {
  emitWindowEvent(PLAYER_PROFILE_UPDATED_EVENT, { profile });
}

export function getPlayerProfile() {
  const stored = readLocalJson(PLAYER_PROFILE_KEY, null);
  const profile = normalizePlayerProfile(stored ?? {});

  if (!stored?.playerId) {
    writeLocalJson(PLAYER_PROFILE_KEY, profile);
  }

  return profile;
}

export function updatePlayerProfile(updater) {
  const current = getPlayerProfile();
  const patch = typeof updater === "function" ? updater(current) : updater;
  const next = normalizePlayerProfile({
    ...current,
    ...(patch ?? {}),
    updatedAt: new Date().toISOString(),
  });

  writeLocalJson(PLAYER_PROFILE_KEY, next);
  notifyPlayerProfileUpdated(next);
  return next;
}

export function setPlayerDisplayName(displayName) {
  return updatePlayerProfile({ displayName });
}

export function resetPlayerProfile() {
  const next = normalizePlayerProfile({});
  writeLocalJson(PLAYER_PROFILE_KEY, next);
  notifyPlayerProfileUpdated(next);
  return next;
}
