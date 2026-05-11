import { ARCANE_BOX_ID } from "../config/gameRules";
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

export function clearCollectionStore() {
  return replaceCollectionStore(DEFAULT_COLLECTION_STORE);
}

export function getOwnedCardCount() {
  return Object.keys(getCollectionStore().cards).length;
}

export function getTotalOwnedCopies() {
  return Object.values(getCollectionStore().cards).reduce((total, entry) => {
    return total + (Number(entry?.count) || 0);
  }, 0);
}

export function getOwnedCardEntry(cardId) {
  return getCollectionStore().cards?.[cardId] ?? null;
}

export function addCardsToCollection(cards, { source = "arcane-box", boxId = ARCANE_BOX_ID, packId } = {}) {
  const store = getCollectionStore();
  const openedAt = new Date().toISOString();
  const results = [];
  const nextCards = { ...store.cards };
  const resolvedBoxId = boxId ?? packId ?? ARCANE_BOX_ID;

  for (const card of cards) {
    if (!card?.id) continue;

    const current = nextCards[card.id] ?? {
      count: 0,
      firstObtainedAt: openedAt,
    };
    const previousCount = Number(current.count) || 0;
    const nextCount = previousCount + 1;

    nextCards[card.id] = {
      ...current,
      count: nextCount,
      firstObtainedAt: current.firstObtainedAt ?? openedAt,
      lastObtainedAt: openedAt,
    };

    results.push({
      card,
      cardId: card.id,
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
