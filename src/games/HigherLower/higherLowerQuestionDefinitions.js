import { getCardName, getCardText } from "../../utils/cardLocale";

const RARITY_RANK = {
  FREE: 0,
  COMMON: 1,
  RARE: 2,
  EPIC: 3,
  LEGENDARY: 4,
};

// Expansion order is only used for the "older/newer" comparison.
const SET_ORDER = [
  "VANILLA",
  "EXPERT1",
  "LEGACY",
  "NAXX",
  "GVG",
  "BRM",
  "TGT",
  "LOE",
  "OG",
  "KARA",
  "GANGS",
  "UNGORO",
  "ICECROWN",
  "LOOTAPALOOZA",
  "GILNEAS",
  "BOOMSDAY",
  "TROLL",
  "DALARAN",
  "ULDUM",
  "DRAGONS",
  "YEAR_OF_THE_DRAGON",
  "DEMON_HUNTER_INITIATE",
  "BLACK_TEMPLE",
  "SCHOLOMANCE",
  "DARKMOON_FAIRE",
  "THE_BARRENS",
  "STORMWIND",
  "ALTERAC_VALLEY",
  "THE_SUNKEN_CITY",
  "REVENDRETH",
  "PATH_OF_ARTHAS",
  "RETURN_OF_THE_LICH_KING",
  "BATTLE_OF_THE_BANDS",
  "TITANS",
  "WILD_WEST",
  "WHIZBANGS_WORKSHOP",
  "ISLAND_VACATION",
  "SPACE",
  "TIME_TRAVEL",
  "WONDERS",
  "CATACLYSM",
  "THE_LOST_CITY",
  "EMERALD_DREAM",
];

const SET_ORDER_MAP = new Map(SET_ORDER.map((set, index) => [set, index]));

function getSetOrder(card) {
  if (!card?.set) return null;
  if (SET_ORDER_MAP.has(card.set)) return SET_ORDER_MAP.get(card.set);
  return null;
}

function normalizeText(value) {
  return String(value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\$|#|\[x\]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(value) {
  const text = normalizeText(value);
  return text ? text.split(" ").length : 0;
}

function totalStats(card) {
  if (typeof card?.attack !== "number" || typeof card?.health !== "number") return null;
  return card.attack + card.health;
}

function costStats(card) {
  const values = [card?.cost, card?.attack, card?.health].filter((value) => typeof value === "number");
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0);
}

function question({ id, labels, direction, metric, valueLabel }) {
  return { id, labels, direction, metric, valueLabel };
}

export const HIGHER_LOWER_QUESTIONS = [
  question({
    id: "cost-higher",
    labels: { es: "¿Cuál tiene mayor coste de maná?", en: "Which has the higher mana cost?" },
    direction: "higher",
    metric: (card) => card.cost,
    valueLabel: { es: "coste", en: "cost" },
  }),
  question({
    id: "cost-lower",
    labels: { es: "¿Cuál tiene menor coste de maná?", en: "Which has the lower mana cost?" },
    direction: "lower",
    metric: (card) => card.cost,
    valueLabel: { es: "coste", en: "cost" },
  }),
  question({
    id: "attack-higher",
    labels: { es: "¿Cuál tiene más ataque?", en: "Which has more Attack?" },
    direction: "higher",
    metric: (card) => card.attack,
    valueLabel: { es: "ataque", en: "attack" },
  }),
  question({
    id: "attack-lower",
    labels: { es: "¿Cuál tiene menos ataque?", en: "Which has less Attack?" },
    direction: "lower",
    metric: (card) => card.attack,
    valueLabel: { es: "ataque", en: "attack" },
  }),
  question({
    id: "health-higher",
    labels: { es: "¿Cuál tiene más vida?", en: "Which has more Health?" },
    direction: "higher",
    metric: (card) => card.health,
    valueLabel: { es: "vida", en: "health" },
  }),
  question({
    id: "health-lower",
    labels: { es: "¿Cuál tiene menos vida?", en: "Which has less Health?" },
    direction: "lower",
    metric: (card) => card.health,
    valueLabel: { es: "vida", en: "health" },
  }),
  question({
    id: "stats-higher",
    labels: { es: "¿Cuál tiene más ataque + vida?", en: "Which has more Attack + Health?" },
    direction: "higher",
    metric: totalStats,
    valueLabel: { es: "estadísticas", en: "stats" },
  }),
  question({
    id: "stats-lower",
    labels: { es: "¿Cuál tiene menos ataque + vida?", en: "Which has less Attack + Health?" },
    direction: "lower",
    metric: totalStats,
    valueLabel: { es: "estadísticas", en: "stats" },
  }),
  question({
    id: "durability-higher",
    labels: { es: "¿Cuál tiene más durabilidad?", en: "Which has more Durability?" },
    direction: "higher",
    metric: (card) => card.durability,
    valueLabel: { es: "durabilidad", en: "durability" },
  }),
  question({
    id: "durability-lower",
    labels: { es: "¿Cuál tiene menos durabilidad?", en: "Which has less Durability?" },
    direction: "lower",
    metric: (card) => card.durability,
    valueLabel: { es: "durabilidad", en: "durability" },
  }),
  question({
    id: "rarity-higher",
    labels: { es: "¿Cuál tiene mayor rareza?", en: "Which has the higher rarity?" },
    direction: "higher",
    metric: (card) => RARITY_RANK[card.rarity] ?? null,
    valueLabel: { es: "rareza", en: "rarity" },
  }),
  question({
    id: "rarity-lower",
    labels: { es: "¿Cuál tiene menor rareza?", en: "Which has the lower rarity?" },
    direction: "lower",
    metric: (card) => RARITY_RANK[card.rarity] ?? null,
    valueLabel: { es: "rareza", en: "rarity" },
  }),
  question({
    id: "older",
    labels: { es: "¿Cuál es más antigua?", en: "Which is older?" },
    direction: "lower",
    metric: getSetOrder,
    valueLabel: { es: "set", en: "set" },
  }),
  question({
    id: "newer",
    labels: { es: "¿Cuál es más nueva?", en: "Which is newer?" },
    direction: "higher",
    metric: getSetOrder,
    valueLabel: { es: "set", en: "set" },
  }),
  question({
    id: "mechanics-higher",
    labels: { es: "¿Cuál tiene más mecánicas?", en: "Which has more mechanics?" },
    direction: "higher",
    metric: (card) => (Array.isArray(card.mechanics) ? card.mechanics.length : 0),
    valueLabel: { es: "mecánicas", en: "mechanics" },
  }),
  question({
    id: "mechanics-lower",
    labels: { es: "¿Cuál tiene menos mecánicas?", en: "Which has fewer mechanics?" },
    direction: "lower",
    metric: (card) => (Array.isArray(card.mechanics) ? card.mechanics.length : 0),
    valueLabel: { es: "mecánicas", en: "mechanics" },
  }),
  question({
    id: "text-length-higher",
    labels: { es: "¿Cuál tiene más texto de carta?", en: "Which has more card text?" },
    direction: "higher",
    metric: (card, locale) => normalizeText(getCardText(card, locale)).length,
    valueLabel: { es: "texto", en: "text" },
  }),
  question({
    id: "text-length-lower",
    labels: { es: "¿Cuál tiene menos texto de carta?", en: "Which has less card text?" },
    direction: "lower",
    metric: (card, locale) => normalizeText(getCardText(card, locale)).length,
    valueLabel: { es: "texto", en: "text" },
  }),
  question({
    id: "text-words-higher",
    labels: { es: "¿Cuál tiene más palabras en el texto?", en: "Which has more words in its text?" },
    direction: "higher",
    metric: (card, locale) => wordCount(getCardText(card, locale)),
    valueLabel: { es: "palabras", en: "words" },
  }),
  question({
    id: "text-words-lower",
    labels: { es: "¿Cuál tiene menos palabras en el texto?", en: "Which has fewer words in its text?" },
    direction: "lower",
    metric: (card, locale) => wordCount(getCardText(card, locale)),
    valueLabel: { es: "palabras", en: "words" },
  }),
  question({
    id: "name-length-higher",
    labels: { es: "¿Cuál tiene el nombre más largo?", en: "Which has the longer name?" },
    direction: "higher",
    metric: (card, locale) => getCardName(card, locale).length,
    valueLabel: { es: "nombre", en: "name" },
  }),
  question({
    id: "name-length-lower",
    labels: { es: "¿Cuál tiene el nombre más corto?", en: "Which has the shorter name?" },
    direction: "lower",
    metric: (card, locale) => getCardName(card, locale).length,
    valueLabel: { es: "nombre", en: "name" },
  }),
  question({
    id: "name-words-higher",
    labels: { es: "¿Cuál tiene más palabras en el nombre?", en: "Which has more words in its name?" },
    direction: "higher",
    metric: (card, locale) => wordCount(getCardName(card, locale)),
    valueLabel: { es: "palabras", en: "words" },
  }),
  question({
    id: "name-words-lower",
    labels: { es: "¿Cuál tiene menos palabras en el nombre?", en: "Which has fewer words in its name?" },
    direction: "lower",
    metric: (card, locale) => wordCount(getCardName(card, locale)),
    valueLabel: { es: "palabras", en: "words" },
  }),
  question({
    id: "total-value-higher",
    labels: { es: "¿Cuál tiene más valor total?", en: "Which has the higher total value?" },
    direction: "higher",
    metric: costStats,
    valueLabel: { es: "valor", en: "value" },
  }),
  question({
    id: "total-value-lower",
    labels: { es: "¿Cuál tiene menos valor total?", en: "Which has the lower total value?" },
    direction: "lower",
    metric: costStats,
    valueLabel: { es: "valor", en: "value" },
  }),
];
