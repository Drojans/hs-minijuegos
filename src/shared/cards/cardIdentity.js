const PLACEHOLDER_SET_PREFIX = "PLACEHOLDER";

const SET_PREFERENCE_PENALTY = {
  VANILLA: 50,
  CORE: 40,
  LEGACY: 25,
  EXPERT1: 10,
};

function stripDiacritics(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeIdentityText(value = "") {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/\[x\]/g, "")
    .replace(/[#$]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeIdentityValue(value) {
  return value === null || value === undefined ? "" : String(value);
}

function normalizeMechanics(mechanics = []) {
  return Array.isArray(mechanics) ? [...mechanics].sort().join(",") : "";
}

function getRepresentativeName(card = {}) {
  return card.nameEn || card.name || card.id || "";
}

function getRepresentativeLocalizedName(card = {}) {
  return card.name || card.nameEn || card.id || "";
}

function getRepresentativeText(card = {}) {
  return card.textEn || card.text || "";
}

function getRepresentativeLocalizedText(card = {}) {
  return card.text || card.textEn || "";
}

function getSetPenalty(card = {}) {
  const set = String(card.set || "").toUpperCase();

  if (set.startsWith(PLACEHOLDER_SET_PREFIX)) return 100;
  return SET_PREFERENCE_PENALTY[set] ?? 0;
}

function hasAnyImage(card = {}) {
  return Boolean(
    card.imagesByLocale?.es?.adapted ||
    card.imagesByLocale?.es?.game ||
    card.imagesByLocale?.es?.thumb ||
    card.imagesByLocale?.en?.adapted ||
    card.imagesByLocale?.en?.game ||
    card.imagesByLocale?.en?.thumb
  );
}

function compareCanonicalCandidates(a, b) {
  const imageCompare = Number(hasAnyImage(b.card)) - Number(hasAnyImage(a.card));
  if (imageCompare !== 0) return imageCompare;

  const setCompare = getSetPenalty(a.card) - getSetPenalty(b.card);
  if (setCompare !== 0) return setCompare;

  const dbfA = Number.isFinite(Number(a.card.dbfId)) ? Number(a.card.dbfId) : Number.POSITIVE_INFINITY;
  const dbfB = Number.isFinite(Number(b.card.dbfId)) ? Number(b.card.dbfId) : Number.POSITIVE_INFINITY;
  const dbfCompare = dbfA - dbfB;
  if (dbfCompare !== 0) return dbfCompare;

  return a.index - b.index;
}

export function getCardIdentityKey(card = {}) {
  return [
    normalizeIdentityText(getRepresentativeName(card)),
    normalizeIdentityText(getRepresentativeLocalizedName(card)),
    normalizeIdentityValue(card.type),
    normalizeIdentityValue(card.cardClass),
    normalizeIdentityValue(card.rarity),
    normalizeIdentityValue(card.cost),
    normalizeIdentityValue(card.attack),
    normalizeIdentityValue(card.health),
    normalizeIdentityValue(card.durability),
    normalizeIdentityValue(card.race),
    normalizeIdentityValue(card.spellSchool),
    normalizeMechanics(card.mechanics),
    normalizeIdentityText(getRepresentativeText(card)),
    normalizeIdentityText(getRepresentativeLocalizedText(card)),
  ].join("|");
}

export function getCardAliasIds(cardOrId) {
  if (!cardOrId) return [];
  if (typeof cardOrId === "string") return [cardOrId];

  const ids = [cardOrId.id, ...(cardOrId.duplicateIds ?? [])].filter(Boolean);
  return [...new Set(ids.map(String))];
}

export function getCardCanonicalId(cardOrId) {
  if (!cardOrId) return "";
  if (typeof cardOrId === "string") return cardOrId;
  return String(cardOrId.canonicalId || cardOrId.id || "");
}

export function getCardDuplicateCount(card) {
  return Math.max(0, getCardAliasIds(card).length - 1);
}

export function dedupeCardsByIdentity(cards = []) {
  const groups = new Map();

  cards.forEach((card, index) => {
    if (!card?.id) return;

    const key = getCardIdentityKey(card);
    const current = groups.get(key);

    if (current) {
      current.items.push({ card, index });
    } else {
      groups.set(key, {
        firstIndex: index,
        items: [{ card, index }],
      });
    }
  });

  return [...groups.values()]
    .sort((a, b) => a.firstIndex - b.firstIndex)
    .map((group) => {
      const sortedItems = [...group.items].sort(compareCanonicalCandidates);
      const canonical = sortedItems[0].card;
      const printings = group.items
        .map(({ card, index }) => ({
          id: String(card.id),
          set: card.set ?? null,
          dbfId: card.dbfId ?? null,
          index,
        }))
        .sort((a, b) => a.index - b.index);
      const duplicateIds = printings
        .map((printing) => printing.id)
        .filter((id) => id !== String(canonical.id));

      return {
        ...canonical,
        canonicalId: String(canonical.id),
        duplicateIds,
        printings: printings.map((printing) => ({
          id: printing.id,
          set: printing.set,
          dbfId: printing.dbfId,
        })),
      };
    });
}
