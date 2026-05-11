const COLLECTION_STORE_KEY = "hearthdle:collection:v1";

export const COLLECTION_UPDATED_EVENT = "hearthdle:collection-updated";

const DEFAULT_COLLECTION_STORE = {
  cards: {},
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
    // Keep the app usable even if localStorage is blocked.
  }
}

function notifyCollectionUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(COLLECTION_UPDATED_EVENT));
}

export function getCollectionStore() {
  const stored = readJson(COLLECTION_STORE_KEY, DEFAULT_COLLECTION_STORE);

  return {
    ...DEFAULT_COLLECTION_STORE,
    ...stored,
    cards: stored.cards && typeof stored.cards === "object" ? stored.cards : {},
    history: Array.isArray(stored.history) ? stored.history : [],
  };
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

export function addCardsToCollection(cards, { source = "pack", packId = "standard" } = {}) {
  const store = getCollectionStore();
  const openedAt = new Date().toISOString();
  const results = [];
  const nextCards = { ...store.cards };

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
        type: "pack-opened",
        packId,
        source,
        cardIds: results.map((result) => result.cardId),
        createdAt: openedAt,
      },
    ],
  };

  writeJson(COLLECTION_STORE_KEY, nextStore);
  notifyCollectionUpdated();

  return {
    store: nextStore,
    results,
  };
}
