import { ARCANE_BOX_ID } from "../config/gameRules";
import { getCardAliasIds, getCardCanonicalId } from "../cards/cardIdentity";
import { emitWindowEvent, readLocalJson, writeLocalJson } from "../storage/localStorage";

export const COLLECTION_STORE_KEY = "hearthdle:collection:v1";

export const COLLECTION_UPDATED_EVENT = "hearthdle:collection-updated";

const DEFAULT_COLLECTION_STORE = {
  cards: {},
  history: [],
};

function notifyCollectionUpdated() {
  emitWindowEvent(COLLECTION_UPDATED_EVENT);
}

function mergeCollectionEntries(baseEntry = {}, nextEntry = {}) {
  const baseCount = Number(baseEntry?.count) || 0;
  const nextCount = Number(nextEntry?.count) || 0;
  const firstObtainedAt = [baseEntry?.firstObtainedAt, nextEntry?.firstObtainedAt].filter(Boolean).sort()[0];
  const lastObtainedAt = [baseEntry?.lastObtainedAt, nextEntry?.lastObtainedAt].filter(Boolean).sort().at(-1);

  return {
    ...baseEntry,
    ...nextEntry,
    count: baseCount + nextCount,
    firstObtainedAt: firstObtainedAt ?? baseEntry?.firstObtainedAt ?? nextEntry?.firstObtainedAt,
    lastObtainedAt: lastObtainedAt ?? baseEntry?.lastObtainedAt ?? nextEntry?.lastObtainedAt,
  };
}

function createAliasMap(cards = []) {
  const aliases = new Map();

  for (const card of cards) {
    const canonicalId = getCardCanonicalId(card);
    if (!canonicalId) continue;

    for (const id of getCardAliasIds(card)) {
      aliases.set(String(id), canonicalId);
    }
  }

  return aliases;
}

export function getCollectionStore() {
  const stored = readLocalJson(COLLECTION_STORE_KEY, DEFAULT_COLLECTION_STORE);

  return {
    ...DEFAULT_COLLECTION_STORE,
    ...stored,
    cards: stored.cards && typeof stored.cards === "object" ? stored.cards : {},
    history: Array.isArray(stored.history) ? stored.history : [],
  };
}

export function replaceCollectionStore(nextStore = DEFAULT_COLLECTION_STORE) {
  const safeStore = {
    ...DEFAULT_COLLECTION_STORE,
    ...(nextStore && typeof nextStore === "object" ? nextStore : {}),
    cards: nextStore?.cards && typeof nextStore.cards === "object" ? nextStore.cards : {},
    history: Array.isArray(nextStore?.history) ? nextStore.history : [],
  };

  writeLocalJson(COLLECTION_STORE_KEY, safeStore);
  notifyCollectionUpdated();
  return safeStore;
}

export function migrateCollectionCardAliases(cards = []) {
  const aliasMap = createAliasMap(cards);
  if (!aliasMap.size) return getCollectionStore();

  const store = getCollectionStore();
  const nextCards = {};
  let changed = false;

  for (const [cardId, entry] of Object.entries(store.cards ?? {})) {
    const canonicalId = aliasMap.get(String(cardId)) ?? String(cardId);
    if (canonicalId !== String(cardId)) changed = true;
    nextCards[canonicalId] = mergeCollectionEntries(nextCards[canonicalId], entry);
  }

  const nextHistory = store.history.map((historyEntry) => {
    if (!Array.isArray(historyEntry?.cardIds)) return historyEntry;

    const nextCardIds = historyEntry.cardIds.map((cardId) => aliasMap.get(String(cardId)) ?? String(cardId));
    if (nextCardIds.some((cardId, index) => cardId !== historyEntry.cardIds[index])) changed = true;

    return {
      ...historyEntry,
      cardIds: nextCardIds,
    };
  });

  if (!changed) return store;

  const nextStore = {
    ...store,
    cards: nextCards,
    history: nextHistory,
  };

  writeLocalJson(COLLECTION_STORE_KEY, nextStore);
  notifyCollectionUpdated();
  return nextStore;
}

export function clearCollectionStore() {
  return replaceCollectionStore(DEFAULT_COLLECTION_STORE);
}

export function getOwnedCardEntryFromMap(cardMap = {}, cardOrId) {
  const aliases = getCardAliasIds(cardOrId);
  if (!aliases.length) return null;

  let mergedEntry = null;

  for (const id of aliases) {
    const entry = cardMap[String(id)] ?? cardMap[id] ?? null;
    if (!entry) continue;
    mergedEntry = mergeCollectionEntries(mergedEntry ?? {}, entry);
  }

  return mergedEntry && (Number(mergedEntry.count) || 0) > 0 ? mergedEntry : null;
}

export function getOwnedCardCount() {
  return Object.keys(getCollectionStore().cards).length;
}

export function getTotalOwnedCopies() {
  return Object.values(getCollectionStore().cards).reduce((total, entry) => {
    return total + (Number(entry?.count) || 0);
  }, 0);
}

export function getOwnedCardEntry(cardOrId) {
  return getOwnedCardEntryFromMap(getCollectionStore().cards, cardOrId);
}

export function addCardsToCollection(cards, { source = "arcane-box", boxId = ARCANE_BOX_ID, packId } = {}) {
  const store = getCollectionStore();
  const openedAt = new Date().toISOString();
  const results = [];
  const nextCards = { ...store.cards };
  const resolvedBoxId = boxId ?? packId ?? ARCANE_BOX_ID;

  for (const card of cards) {
    const cardId = getCardCanonicalId(card);
    if (!cardId) continue;

    const current = nextCards[cardId] ?? {
      count: 0,
      firstObtainedAt: openedAt,
    };
    const previousCount = Number(current.count) || 0;
    const nextCount = previousCount + 1;

    nextCards[cardId] = {
      ...current,
      count: nextCount,
      firstObtainedAt: current.firstObtainedAt ?? openedAt,
      lastObtainedAt: openedAt,
    };

    results.push({
      card,
      cardId,
      previousCount,
      count: nextCount,
      isNew: previousCount === 0,
    });
  }

  const nextStore = {
    ...store,
    cards: nextCards,
    history: [
      ...store.history,
      {
        type: "arcane-box-opened",
        boxId: resolvedBoxId,
        source,
        cardIds: results.map((result) => result.cardId),
        createdAt: openedAt,
      },
    ],
  };

  writeLocalJson(COLLECTION_STORE_KEY, nextStore);
  notifyCollectionUpdated();

  return {
    store: nextStore,
    results,
  };
}
