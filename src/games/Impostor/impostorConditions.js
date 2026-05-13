import {
  translateCardClass as translateSharedCardClass,
  translateCardRace as translateSharedCardRace,
  translateCardRarity as translateSharedCardRarity,
} from "../../utils/cardLocale";
import { CORRECT_COUNT, IMPOSTOR_COUNT } from "./impostorConstants";
import { getCardImage, getCardName, isAllowedType, translateType } from "./impostorCardUtils";
import { countUniqueForRound } from "./impostorRoundUtils";

const CLASS_CONDITIONS = [
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

const RARITY_CONDITIONS = ["COMMON", "RARE", "EPIC", "LEGENDARY"];
const TYPE_CONDITIONS = ["MINION", "SPELL", "WEAPON"];

const RACE_CONDITIONS = [
  "BEAST",
  "DEMON",
  "DRAGON",
  "DRAENEI",
  "ELEMENTAL",
  "MECHANICAL",
  "MURLOC",
  "NAGA",
  "PIRATE",
  "QUILBOAR",
  "TOTEM",
  "UNDEAD",
];

const COST_CONDITIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const STAT_CONDITIONS = [
  { key: "attack-3", stat: "attack", value: 3, titleKey: "impostor.condition.attackTitle", kindKey: "impostor.condition.attackKind" },
  { key: "attack-5", stat: "attack", value: 5, titleKey: "impostor.condition.attackTitle", kindKey: "impostor.condition.attackKind" },
  { key: "health-4", stat: "health", value: 4, titleKey: "impostor.condition.healthTitle", kindKey: "impostor.condition.healthKind" },
  { key: "health-6", stat: "health", value: 6, titleKey: "impostor.condition.healthTitle", kindKey: "impostor.condition.healthKind" },
];

const MECHANIC_LABELS = {
  es: {
    BATTLECRY: "Grito de batalla",
    DEATHRATTLE: "Último aliento",
    TAUNT: "Provocar",
    DISCOVER: "Descubrir",
    RUSH: "Embestir",
    LIFESTEAL: "Robo de vida",
    SECRET: "Secreto",
    CHOOSE_ONE: "Elige una",
    DIVINE_SHIELD: "Escudo divino",
    COMBO: "Combo",
    STEALTH: "Sigilo",
    OVERLOAD: "Sobrecarga",
    SPELLPOWER: "Daño con hechizos",
    TRADEABLE: "Comerciable",
    CHARGE: "Cargar",
    SPELLBURST: "Ráfaga de hechizos",
    WINDFURY: "Viento furioso",
    ELUSIVE: "Elusivo",
    CORRUPT: "Corruptible",
    OUTCAST: "Proscrito",
    REBORN: "Renacer",
    POISONOUS: "Veneno",
    FREEZE: "Congelar",
    QUEST: "Misión",
    INSPIRE: "Inspirar",
    MAGNETIC: "Magnético",
    DREDGE: "Dragado",
    HONORABLE_KILL: "Muerte honorable",
    FORGE: "Forja",
    MINIATURIZE: "Miniaturizar",
    FRENZY: "Frenesí",
    MANATHIRST: "Sed de maná",
    EXCAVATE: "Excavar",
    QUICKDRAW: "Robo rápido",
    ECHO: "Eco",
    COLOSSAL: "Colosal",
    TITAN: "Titán",
    TWINSPELL: "Hechizo doble",
    OVERHEAL: "Sobrecuración",
  },
  en: {
    BATTLECRY: "Battlecry",
    DEATHRATTLE: "Deathrattle",
    TAUNT: "Taunt",
    DISCOVER: "Discover",
    RUSH: "Rush",
    LIFESTEAL: "Lifesteal",
    SECRET: "Secret",
    CHOOSE_ONE: "Choose One",
    DIVINE_SHIELD: "Divine Shield",
    COMBO: "Combo",
    STEALTH: "Stealth",
    OVERLOAD: "Overload",
    SPELLPOWER: "Spell Damage",
    TRADEABLE: "Tradeable",
    CHARGE: "Charge",
    SPELLBURST: "Spellburst",
    WINDFURY: "Windfury",
    ELUSIVE: "Elusive",
    CORRUPT: "Corrupt",
    OUTCAST: "Outcast",
    REBORN: "Reborn",
    POISONOUS: "Poisonous",
    FREEZE: "Freeze",
    QUEST: "Quest",
    INSPIRE: "Inspire",
    MAGNETIC: "Magnetic",
    DREDGE: "Dredge",
    HONORABLE_KILL: "Honorable Kill",
    FORGE: "Forge",
    MINIATURIZE: "Miniaturize",
    FRENZY: "Frenzy",
    MANATHIRST: "Manathirst",
    EXCAVATE: "Excavate",
    QUICKDRAW: "Quickdraw",
    ECHO: "Echo",
    COLOSSAL: "Colossal",
    TITAN: "Titan",
    TWINSPELL: "Twinspell",
    OVERHEAL: "Overheal",
  },
};

const MECHANIC_CONDITIONS = Object.keys(MECHANIC_LABELS.es);

function translateCardClass(value, locale) {
  return translateSharedCardClass(value, locale);
}

function translateRarity(value, locale) {
  return translateSharedCardRarity(value, locale);
}

function translateRace(value, locale) {
  return translateSharedCardRace(value, locale);
}

function translateMechanic(value, locale) {
  const labels = MECHANIC_LABELS[locale] ?? MECHANIC_LABELS.es;
  return labels[value] ?? value ?? (locale === "en" ? "Mechanic" : "Mecánica");
}

function getTextConditions(t, locale) {
  const textKind = locale === "en" ? "Text" : "Texto";

  return [
    {
      key: "text-damage",
      kind: textKind,
      title: t("impostor.textCondition.damage.title"),
      description: t("impostor.textCondition.damage.description"),
      patterns: ["inflige", "daño", "damage", "deal"],
    },
    {
      key: "text-summon",
      kind: textKind,
      title: t("impostor.textCondition.summon.title"),
      description: t("impostor.textCondition.summon.description"),
      patterns: ["invoca", "invocar", "summon"],
    },
    {
      key: "text-draw",
      kind: textKind,
      title: t("impostor.textCondition.draw.title"),
      description: t("impostor.textCondition.draw.description"),
      patterns: ["roba", "robar", "robas", "robada", "draw"],
    },
    {
      key: "text-restore",
      kind: textKind,
      title: t("impostor.textCondition.restore.title"),
      description: t("impostor.textCondition.restore.description"),
      patterns: ["restaura", "restaurar", "cura", "curar", "restore", "heal"],
    },
    {
      key: "text-destroy",
      kind: textKind,
      title: t("impostor.textCondition.destroy.title"),
      description: t("impostor.textCondition.destroy.description"),
      patterns: ["destruye", "destruir", "destroy"],
    },
    {
      key: "text-add",
      kind: textKind,
      title: t("impostor.textCondition.add.title"),
      description: t("impostor.textCondition.add.description"),
      patterns: ["añade", "anade", "add"],
    },
    {
      key: "text-discard",
      kind: textKind,
      title: t("impostor.textCondition.discard.title"),
      description: t("impostor.textCondition.discard.description"),
      patterns: ["descarta", "descartar", "discard"],
    },
    {
      key: "text-cost",
      kind: textKind,
      title: t("impostor.textCondition.cost.title"),
      description: t("impostor.textCondition.cost.description"),
      patterns: ["cuesta", "coste", "cristal", "cost"],
    },
    {
      key: "text-attack",
      kind: textKind,
      title: t("impostor.textCondition.attack.title"),
      description: t("impostor.textCondition.attack.description"),
      patterns: ["ataque", "attack"],
    },
    {
      key: "text-health",
      kind: textKind,
      title: t("impostor.textCondition.health.title"),
      description: t("impostor.textCondition.health.description"),
      patterns: ["salud", "vida", "health"],
    },
  ];
}

function normalizeSearchText(value) {
  return (value ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getSearchableCardText(card) {
  return normalizeSearchText(`${card?.text ?? ""} ${card?.textEn ?? ""}`);
}

function cardHasMechanic(card, mechanic) {
  return Array.isArray(card?.mechanics) && card.mechanics.includes(mechanic);
}

function cardTextHasAnyPattern(card, patterns) {
  const searchableText = getSearchableCardText(card);
  return patterns.some((pattern) => searchableText.includes(normalizeSearchText(pattern)));
}

function isPlayableCard(card, locale) {
  return card.id && getCardName(card, locale) && getCardImage(card, locale) && isAllowedType(card);
}

function uniqueById(cards) {
  const seen = new Set();

  return cards.filter((card) => {
    if (!card?.id || seen.has(card.id)) return false;

    seen.add(card.id);
    return true;
  });
}

function buildClassConditions(rawConditions, locale, t) {
  CLASS_CONDITIONS.forEach((cardClass) => {
    rawConditions.push({
      id: `class-${cardClass}`,
      kind: t("impostor.condition.classKind"),
      title: t("impostor.condition.classTitle", { className: translateCardClass(cardClass, locale) }),
      description: t("impostor.condition.classDescription"),
      poolFilter: () => true,
      test: (card) => card.cardClass === cardClass,
    });
  });
}

function buildRarityConditions(rawConditions, locale, t) {
  RARITY_CONDITIONS.forEach((rarity) => {
    rawConditions.push({
      id: `rarity-${rarity}`,
      kind: t("impostor.condition.rarityKind"),
      title: t("impostor.condition.rarityTitle", { rarity: translateRarity(rarity, locale) }),
      rarity,
      description: t("impostor.condition.rarityDescription"),
      poolFilter: () => true,
      test: (card) => card.rarity === rarity,
    });
  });
}

function buildTypeConditions(rawConditions, locale, t) {
  TYPE_CONDITIONS.forEach((type) => {
    rawConditions.push({
      id: `type-${type}`,
      kind: t("impostor.condition.typeKind"),
      title: t("impostor.condition.typeTitle", { type: translateType(type, locale) }),
      description: t("impostor.condition.typeDescription"),
      poolFilter: () => true,
      test: (card) => card.type === type,
    });
  });
}

function buildRaceConditions(rawConditions, locale, t) {
  RACE_CONDITIONS.forEach((race) => {
    rawConditions.push({
      id: `race-${race}`,
      kind: t("impostor.condition.raceKind"),
      title: t("impostor.condition.raceTitle", { race: translateRace(race, locale) }),
      description: t("impostor.condition.raceDescription"),
      poolFilter: (card) => card.type === "MINION",
      test: (card) => card.race === race,
    });
  });
}

function buildMechanicConditions(rawConditions, locale, t) {
  MECHANIC_CONDITIONS.forEach((mechanic) => {
    rawConditions.push({
      id: `mechanic-${mechanic}`,
      kind: t("impostor.condition.mechanicKind"),
      title: t("impostor.condition.mechanicTitle", { mechanic: translateMechanic(mechanic, locale) }),
      description: t("impostor.condition.mechanicDescription"),
      poolFilter: () => true,
      test: (card) => cardHasMechanic(card, mechanic),
    });
  });
}

function buildTextConditions(rawConditions, locale, t) {
  getTextConditions(t, locale).forEach((rule) => {
    rawConditions.push({
      id: rule.key,
      kind: rule.kind,
      title: rule.title,
      description: rule.description,
      poolFilter: () => true,
      test: (card) => cardTextHasAnyPattern(card, rule.patterns),
    });
  });
}

function buildCostConditions(rawConditions, t) {
  COST_CONDITIONS.forEach((cost) => {
    rawConditions.push({
      id: `cost-${cost}`,
      kind: t("impostor.condition.costKind"),
      title: t("impostor.condition.costTitle", { cost }),
      description: t("impostor.condition.costDescription"),
      poolFilter: () => true,
      test: (card) => card.cost === cost,
    });
  });
}

function buildStatConditions(rawConditions, t) {
  STAT_CONDITIONS.forEach((rule) => {
    rawConditions.push({
      id: rule.key,
      kind: t(rule.kindKey),
      title: t(rule.titleKey, { value: rule.value }),
      description: t("impostor.condition.statDescription"),
      poolFilter: (card) => card.type === "MINION",
      test: (card) => typeof card[rule.stat] === "number" && card[rule.stat] >= rule.value,
    });
  });
}

export function buildConditions(cards, locale = "es", t = (key) => key) {
  const playableCards = cards.filter((card) => isPlayableCard(card, locale));
  const rawConditions = [];

  buildClassConditions(rawConditions, locale, t);
  buildRarityConditions(rawConditions, locale, t);
  buildTypeConditions(rawConditions, locale, t);
  buildRaceConditions(rawConditions, locale, t);
  buildMechanicConditions(rawConditions, locale, t);
  buildTextConditions(rawConditions, locale, t);
  buildCostConditions(rawConditions, t);
  buildStatConditions(rawConditions, t);

  return rawConditions
    .map((condition) => {
      const conditionPool = playableCards.filter(condition.poolFilter);
      const validCards = uniqueById(conditionPool.filter(condition.test));
      const invalidCards = uniqueById(conditionPool.filter((card) => !condition.test(card)));

      return {
        ...condition,
        validCards,
        invalidCards,
      };
    })
    .filter((condition) => {
      return (
        countUniqueForRound(condition.validCards) >= CORRECT_COUNT &&
        countUniqueForRound(condition.invalidCards) >= IMPOSTOR_COUNT
      );
    });
}
