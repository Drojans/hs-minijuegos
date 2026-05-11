import {
  getCardName,
  getCardText,
  getDetailImage,
  getSecondaryCardName,
  getThumbImage,
  translateCardClass,
  translateCardRarity,
  translateCardType,
} from "../../utils/cardLocale";

export {
  getCardName,
  getCardText,
  getDetailImage,
  getSecondaryCardName,
  getThumbImage,
  translateCardClass,
  translateCardRarity,
  translateCardType,
};

export const FILTER_ALL = "ALL";
export const VISIBLE_CARD_LIMIT = 60;

export const CLASS_ORDER = [
  "DEATHKNIGHT",
  "DEMONHUNTER",
  "DRUID",
  "HUNTER",
  "MAGE",
  "PALADIN",
  "PRIEST",
  "ROGUE",
  "SHAMAN",
  "WARLOCK",
  "WARRIOR",
  "NEUTRAL",
];

export const TYPE_ORDER = ["MINION", "SPELL", "WEAPON", "LOCATION", "HERO"];
export const RARITY_ORDER = ["FREE", "COMMON", "RARE", "EPIC", "LEGENDARY"];
export const COST_OPTIONS = [FILTER_ALL, "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"];

export const DATABASE_COPY = {
  es: {
    navMinigames: "Minijuegos",
    navCards: "Base de datos",
    navCollection: "Colección",
    eyebrow: "Archivo de la taberna",
    title: "Base de datos",
    subtitle: "Consulta todas las cartas, filtra la colección global y abre cualquier carta para verla en detalle.",
    loading: "Cargando cartas...",
    cards: "Cartas",
    inCollection: "En colección",
    filters: "Filtros",
    browseCards: "Todas las cartas",
    search: "Buscar",
    searchPlaceholder: "Nombre, texto o nombre inglés...",
    type: "Tipo",
    class: "Clase",
    rarity: "Rareza",
    allPlural: "Todos",
    allFeminine: "Todas",
    showingResults: "Mostrando {visible} de {total} resultados",
    clearFilters: "Limpiar filtros",
    previous: "Anterior",
    next: "Siguiente",
    page: "Página",
    noMatches: "No hay cartas con esos filtros.",
    noImage: "Sin imagen",
    imageUnavailable: "Imagen no disponible",
    selectCard: "Selecciona una carta",
    selectCardBody: "Haz click en cualquier carta de la base de datos para abrir su ficha ampliada.",
    closeDetail: "Cerrar detalle",
    cost: "Coste",
    attack: "Ataque",
    health: "Vida",
    text: "Texto",
    noText: "Sin texto.",
    cardDetail: "Detalle de carta",
    unknownValue: "—",
    collectionStatus: "Colección",
    notOwned: "No conseguida",
    ownedCopies: "Conseguida · x{count}",
    copyCount: "x{count}",
  },
  en: {
    navMinigames: "Minigames",
    navCards: "Card database",
    navCollection: "Collection",
    eyebrow: "Tavern archive",
    title: "Card database",
    subtitle: "Browse every card, filter the global archive, and open any card for a detailed view.",
    loading: "Loading cards...",
    cards: "Cards",
    inCollection: "In collection",
    filters: "Filters",
    browseCards: "All cards",
    search: "Search",
    searchPlaceholder: "Name, text, or Spanish name...",
    type: "Type",
    class: "Class",
    rarity: "Rarity",
    allPlural: "All",
    allFeminine: "All",
    showingResults: "Showing {visible} of {total} results",
    clearFilters: "Clear filters",
    previous: "Previous",
    next: "Next",
    page: "Page",
    noMatches: "No cards match those filters.",
    noImage: "No image",
    imageUnavailable: "Image unavailable",
    selectCard: "Select a card",
    selectCardBody: "Click any card in the database to open its detail panel.",
    closeDetail: "Close detail",
    cost: "Cost",
    attack: "Attack",
    health: "Health",
    text: "Text",
    noText: "No text.",
    cardDetail: "Card detail",
    unknownValue: "—",
    collectionStatus: "Collection",
    notOwned: "Not owned",
    ownedCopies: "Owned · x{count}",
    copyCount: "x{count}",
  },
};

export function getDatabaseCopy(locale) {
  return DATABASE_COPY[locale] ?? DATABASE_COPY.es;
}

export function createInitialFilters() {
  return {
    search: "",
    type: FILTER_ALL,
    cardClass: FILTER_ALL,
    rarity: FILTER_ALL,
    cost: FILTER_ALL,
  };
}

export function getAvailableValues(cards, property, order) {
  const values = new Set(cards.map((card) => card[property]).filter(Boolean));
  return order.filter((value) => values.has(value));
}

function normalizeSearch(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

function getSearchText(card) {
  return normalizeSearch(`${card.name ?? ""} ${card.nameEn ?? ""} ${card.text ?? ""} ${card.textEn ?? ""}`);
}

function matchesCostFilter(card, costFilter) {
  if (costFilter === FILTER_ALL) return true;
  if (costFilter === "10+") return typeof card.cost === "number" && card.cost >= 10;

  return card.cost === Number(costFilter);
}

export function filterCards(cards, filters) {
  const normalizedSearch = normalizeSearch(filters.search);

  return cards.filter((card) => {
    const matchesSearch = getSearchText(card).includes(normalizedSearch);
    const matchesType = filters.type === FILTER_ALL || card.type === filters.type;
    const matchesClass = filters.cardClass === FILTER_ALL || card.cardClass === filters.cardClass;
    const matchesRarity = filters.rarity === FILTER_ALL || card.rarity === filters.rarity;
    const matchesCost = matchesCostFilter(card, filters.cost);

    return matchesSearch && matchesType && matchesClass && matchesRarity && matchesCost;
  });
}

export function getVisibleCards(cards) {
  return cards.slice(0, VISIBLE_CARD_LIMIT);
}

export function getCostLabel(cost, copy) {
  return cost === FILTER_ALL ? copy.allPlural : cost;
}

export function hasSelectedCard(filteredCards, selectedCard) {
  if (!selectedCard) return false;
  return filteredCards.some((card) => card.id === selectedCard.id);
}
