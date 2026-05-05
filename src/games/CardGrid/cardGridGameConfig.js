import {
  getAdaptedImage,
  getCardName as getLocalizedCardName,
  translateCardClass,
  translateCardRace,
  translateCardRarity,
  translateCardType,
} from "../../utils/cardLocale";

export const GRID_SIZE = 3;
export const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
export const MIN_CARDS_IN_CONDITION = 35;
export const MIN_CANDIDATES_PER_CELL = 2;
export const MAX_GENERATION_ATTEMPTS = 9000;

const ALLOWED_TYPES = ["MINION", "SPELL", "WEAPON"];
const ROW_FAMILIES = ["class", "type", "rarity", "cost", "race", "stats"];
const COLUMN_FAMILIES = ["class", "type", "rarity", "cost", "race", "stats", "keyword"];

const GRID_ICON_MODULES = import.meta.glob("./assets/*", {
  eager: true,
  query: "?url",
  import: "default",
});

function gridIcon(fileName) {
  return GRID_ICON_MODULES[`./assets/${fileName}`] || "";
}

const CLASS_ICON_PATHS = {
  DEATHKNIGHT: gridIcon("class_deathknight.png"),
  DEMONHUNTER: gridIcon("class_demonhunter.png"),
  DRUID: gridIcon("class_druid.png"),
  HUNTER: gridIcon("class_hunter.png"),
  MAGE: gridIcon("class_mage.png"),
  PALADIN: gridIcon("class_paladin.png"),
  PRIEST: gridIcon("class_priest.png"),
  ROGUE: gridIcon("class_rogue.png"),
  SHAMAN: gridIcon("class_shaman.png"),
  WARLOCK: gridIcon("class_warlock.png"),
  WARRIOR: gridIcon("class_warrior.png"),
  NEUTRAL: gridIcon("class_neutral.png"),
};

const TYPE_ICON_PATHS = {
  MINION: gridIcon("type_minion.png"),
  SPELL: gridIcon("type_spell.png"),
  WEAPON: gridIcon("type_weapon.png"),
};

const RARITY_ICON_PATHS = {
  COMMON: gridIcon("rarity_common.png"),
  RARE: gridIcon("rarity_rare.png"),
  EPIC: gridIcon("rarity_epic.png"),
  LEGENDARY: gridIcon("rarity_legendary.png"),
};

const COST_ICON_PATHS = {
  "cost-low": gridIcon("cost_0_2.png"),
  "cost-mid": gridIcon("cost_3_4.png"),
  "cost-high": gridIcon("cost_5_6.png"),
  "cost-big": gridIcon("cost_7_plus.png"),
};

const STAT_ICON_PATHS = {
  "attack-3": gridIcon("stat_attack_3_plus.png"),
  "attack-5": gridIcon("stat_attack_5_plus.png"),
  "health-4": gridIcon("stat_health_4_plus.png"),
  "health-6": gridIcon("stat_health_6_plus.png"),
};

const RACE_ICON_PATHS = {
  BEAST: gridIcon("race_beast.png"),
  DEMON: gridIcon("race_demon.png"),
  DRAGON: gridIcon("race_dragon.png"),
  DRAENEI: gridIcon("race_draenei.png"),
  ELEMENTAL: gridIcon("race_elemental.png"),
  MECHANICAL: gridIcon("race_mech.png"),
  MURLOC: gridIcon("race_murloc.png"),
  NAGA: gridIcon("race_naga.png"),
  PIRATE: gridIcon("race_pirate.png"),
  QUILBOAR: gridIcon("race_quilboar.png"),
  TOTEM: gridIcon("race_totem.png"),
  UNDEAD: gridIcon("race_undead.png"),
};

const KEYWORD_ICON_PATHS = {
  BATTLECRY: gridIcon("text_battlecry.png"),
  DEATHRATTLE: gridIcon("text_deathrattle.png"),
  TAUNT: gridIcon("text_taunt.png"),
  DISCOVER: gridIcon("text_discover.png"),
  DIVINE_SHIELD: gridIcon("text_divine_shield.png"),
  LIFESTEAL: gridIcon("text_lifesteal.png"),
  RUSH: gridIcon("text_rush.png"),
};

function getKeywordConditions(t) {
  return [
    { key: "BATTLECRY", label: t("grid.keyword.battlecry"), terms: ["battlecry", "grito de batalla"] },
    { key: "DEATHRATTLE", label: t("grid.keyword.deathrattle"), terms: ["deathrattle", "último aliento", "ultimo aliento"] },
    { key: "TAUNT", label: t("grid.keyword.taunt"), terms: ["taunt", "provocar"] },
    { key: "DISCOVER", label: t("grid.keyword.discover"), terms: ["discover", "descubre", "descubrir"] },
    { key: "DIVINE_SHIELD", label: t("grid.keyword.divineShield"), terms: ["divine shield", "escudo divino"] },
    { key: "LIFESTEAL", label: t("grid.keyword.lifesteal"), terms: ["lifesteal", "robo de vida"] },
    { key: "RUSH", label: t("grid.keyword.rush"), terms: ["rush", "embestir"] },
  ];
}

export function getGridModes(t) {
  return {
    easy: {
      id: "easy",
      label: t("grid.mode.easy"),
      minCandidatesPerCell: 50,
      minCardsInCondition: 50,
      description: t("grid.mode.easyDescription"),
    },
    normal: {
      id: "normal",
      label: t("grid.mode.normal"),
      minCandidatesPerCell: 1,
      minCardsInCondition: 1,
      description: t("grid.mode.normalDescription"),
    },
  };
}

export function normalize(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[’']/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .toLowerCase();
}

export function getCardName(card, locale) {
  return getLocalizedCardName(card, locale);
}

export function getCardImage(card, locale) {
  return getAdaptedImage(card, locale);
}

export function isPlayableGridCard(card) {
  return ALLOWED_TYPES.includes(card?.type);
}

function getCardSearchText(card) {
  return normalize(
    [card.name, card.nameEn, card.text, card.textEn, card.flavor, card.flavorText]
      .filter(Boolean)
      .join(" ")
  );
}

function getRaceValues(card) {
  const values = [
    card.race,
    card.raceName,
    card.minionType,
    card.tribe,
    card.races,
    card.raceIds,
  ]
    .flat()
    .filter(Boolean);

  return values.map((value) => String(value).toUpperCase());
}

function hasRace(card, raceKey) {
  const races = getRaceValues(card);

  if (raceKey === "MECHANICAL" || raceKey === "MECH") {
    return races.includes("MECHANICAL") || races.includes("MECH");
  }

  return races.includes(raceKey);
}

function hasKeyword(card, keywordCondition) {
  const text = getCardSearchText(card);
  return keywordCondition.terms.some((term) => text.includes(normalize(term)));
}

function countMatches(cards, predicate) {
  return cards.reduce((count, card) => count + (predicate(card) ? 1 : 0), 0);
}

function getConditionDisplayKey(condition) {
  return `${condition.family}-${normalize(condition.shortLabel || condition.label || condition.id)}`;
}

function hasRepeatedDisplayCondition(conditions) {
  const keys = conditions.map(getConditionDisplayKey);
  return new Set(keys).size !== keys.length;
}

function shuffle(array) {
  const copy = [...array];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }

  return copy;
}

function addClassConditions(conditions, locale, t) {
  Object.keys(CLASS_ICON_PATHS).forEach((key) => {
    const label = translateCardClass(key, locale);

    conditions.push({
      id: `class-${key}`,
      family: "class",
      label,
      shortLabel: label,
      description: t("grid.condition.class"),
      icon: CLASS_ICON_PATHS[key],
      predicate: (card) => card.cardClass === key,
    });
  });
}

function addTypeConditions(conditions, locale, t) {
  Object.keys(TYPE_ICON_PATHS).forEach((key) => {
    const label = translateCardType(key, locale);

    conditions.push({
      id: `type-${key}`,
      family: "type",
      label,
      shortLabel: label,
      description: t("grid.condition.type"),
      icon: TYPE_ICON_PATHS[key],
      predicate: (card) => card.type === key,
    });
  });
}

function addRarityConditions(conditions, locale, t) {
  Object.keys(RARITY_ICON_PATHS).forEach((key) => {
    const label = translateCardRarity(key, locale);

    conditions.push({
      id: `rarity-${key}`,
      family: "rarity",
      label,
      shortLabel: label,
      description: t("grid.condition.rarity"),
      icon: RARITY_ICON_PATHS[key],
      predicate: (card) => card.rarity === key,
    });
  });
}

function addCostConditions(conditions, t) {
  [
    {
      id: "cost-low",
      label: t("grid.condition.costLow"),
      predicate: (card) => typeof card.cost === "number" && card.cost <= 2,
    },
    {
      id: "cost-mid",
      label: t("grid.condition.costMid"),
      predicate: (card) => typeof card.cost === "number" && card.cost >= 3 && card.cost <= 4,
    },
    {
      id: "cost-high",
      label: t("grid.condition.costHigh"),
      predicate: (card) => typeof card.cost === "number" && card.cost >= 5 && card.cost <= 6,
    },
    {
      id: "cost-big",
      label: t("grid.condition.costBig"),
      predicate: (card) => typeof card.cost === "number" && card.cost >= 7,
    },
  ].forEach((condition) => {
    conditions.push({
      ...condition,
      family: "cost",
      shortLabel: condition.label,
      description: t("grid.condition.cost"),
      icon: COST_ICON_PATHS[condition.id],
    });
  });
}

function addStatConditions(conditions, t) {
  [
    {
      id: "attack-3",
      label: t("grid.condition.attackAtLeast", { value: 3 }),
      predicate: (card) => card.type === "MINION" && Number(card.attack) >= 3,
    },
    {
      id: "attack-5",
      label: t("grid.condition.attackAtLeast", { value: 5 }),
      predicate: (card) => card.type === "MINION" && Number(card.attack) >= 5,
    },
    {
      id: "health-4",
      label: t("grid.condition.healthAtLeast", { value: 4 }),
      predicate: (card) => card.type === "MINION" && Number(card.health) >= 4,
    },
    {
      id: "health-6",
      label: t("grid.condition.healthAtLeast", { value: 6 }),
      predicate: (card) => card.type === "MINION" && Number(card.health) >= 6,
    },
  ].forEach((condition) => {
    conditions.push({
      ...condition,
      family: "stats",
      shortLabel: condition.label,
      description: t("grid.condition.stats"),
      icon: STAT_ICON_PATHS[condition.id],
    });
  });
}

function addRaceConditions(conditions, locale, t) {
  Object.keys(RACE_ICON_PATHS).forEach((key) => {
    const label = translateCardRace(key, locale);

    conditions.push({
      id: `race-${key}`,
      family: "race",
      label,
      shortLabel: label,
      description: t("grid.condition.race"),
      icon: RACE_ICON_PATHS[key],
      predicate: (card) => card.type === "MINION" && hasRace(card, key),
    });
  });
}

function addKeywordConditions(conditions, t) {
  getKeywordConditions(t).forEach((keyword) => {
    conditions.push({
      id: `keyword-${keyword.key}`,
      family: "keyword",
      label: keyword.label,
      shortLabel: keyword.label,
      description: t("grid.condition.text"),
      icon: KEYWORD_ICON_PATHS[keyword.key],
      predicate: (card) => hasKeyword(card, keyword),
    });
  });
}

export function buildConditionPool(
  cards,
  minCardsInCondition = MIN_CARDS_IN_CONDITION,
  locale = "es",
  t = (key) => key
) {
  const baseCards = cards.filter(isPlayableGridCard);
  const conditions = [];

  addClassConditions(conditions, locale, t);
  addTypeConditions(conditions, locale, t);
  addRarityConditions(conditions, locale, t);
  addCostConditions(conditions, t);
  addStatConditions(conditions, t);
  addRaceConditions(conditions, locale, t);
  addKeywordConditions(conditions, t);

  const uniqueConditions = [];
  const seenDisplayKeys = new Set();

  conditions
    .map((condition) => ({
      ...condition,
      count: countMatches(baseCards, condition.predicate),
    }))
    .filter((condition) => condition.count >= minCardsInCondition)
    .forEach((condition) => {
      const displayKey = getConditionDisplayKey(condition);
      if (seenDisplayKeys.has(displayKey)) return;

      seenDisplayKeys.add(displayKey);
      uniqueConditions.push(condition);
    });

  return uniqueConditions;
}

export function getCellCandidates(cards, rowCondition, columnCondition) {
  return cards.filter(
    (card) =>
      isPlayableGridCard(card) &&
      rowCondition.predicate(card) &&
      columnCondition.predicate(card)
  );
}

export function generateGrid(
  cards,
  conditionPool,
  minCandidatesPerCell = MIN_CANDIDATES_PER_CELL
) {
  if (conditionPool.length < GRID_SIZE * 2) return null;

  const rowPool = conditionPool.filter((condition) => ROW_FAMILIES.includes(condition.family));
  const columnPool = conditionPool.filter((condition) =>
    COLUMN_FAMILIES.includes(condition.family)
  );

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const rows = shuffle(rowPool).slice(0, GRID_SIZE);
    const columns = shuffle(
      columnPool.filter((condition) => !rows.some((row) => row.id === condition.id))
    ).slice(0, GRID_SIZE);

    if (rows.length < GRID_SIZE || columns.length < GRID_SIZE) continue;

    const selectedConditions = [...rows, ...columns];
    const usedIds = new Set(selectedConditions.map((condition) => condition.id));

    if (usedIds.size < GRID_SIZE * 2) continue;
    if (hasRepeatedDisplayCondition(selectedConditions)) continue;

    const candidateMap = {};

    const isValid = rows.every((row, rowIndex) =>
      columns.every((column, columnIndex) => {
        const candidates = getCellCandidates(cards, row, column);
        candidateMap[`${rowIndex}-${columnIndex}`] = candidates;

        return candidates.length >= minCandidatesPerCell;
      })
    );

    if (isValid) {
      return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        rows,
        columns,
        candidateMap,
        minCandidatesPerCell,
      };
    }
  }

  return null;
}

function getNormalizedNames(card) {
  return [card.name, card.nameEn].filter(Boolean).map(normalize);
}

export function getCardsByExactName(cards, answer) {
  const normalizedAnswer = normalize(answer);
  if (!normalizedAnswer) return [];

  return cards.filter((card) => getNormalizedNames(card).includes(normalizedAnswer));
}

function dedupeCardsByName(cards) {
  const seenNames = new Set();
  const uniqueCards = [];

  cards.forEach((card) => {
    const key = normalize(card.name || card.nameEn || card.id);
    if (seenNames.has(key)) return;

    seenNames.add(key);
    uniqueCards.push(card);
  });

  return uniqueCards;
}

export function getSuggestions(cards, answer, usedCardIds) {
  const normalizedAnswer = normalize(answer);
  const uniqueCards = dedupeCardsByName(cards.filter((card) => !usedCardIds.has(card.id)));

  if (normalizedAnswer.length < 2) {
    return uniqueCards.slice(0, 6);
  }

  return uniqueCards
    .filter((card) => {
      const name = normalize(card.name);
      const nameEn = normalize(card.nameEn);

      return name.includes(normalizedAnswer) || nameEn.includes(normalizedAnswer);
    })
    .slice(0, 8);
}

export function getNextEmptyCell(selectedKey, nextAnswers) {
  const nextIndex = Array.from({ length: TOTAL_CELLS }, (_, index) => index).find((index) => {
    const row = Math.floor(index / GRID_SIZE);
    const column = index % GRID_SIZE;
    const key = `${row}-${column}`;

    return key !== selectedKey && !nextAnswers[key];
  });

  if (nextIndex === undefined) return null;

  return {
    row: Math.floor(nextIndex / GRID_SIZE),
    column: nextIndex % GRID_SIZE,
  };
}
