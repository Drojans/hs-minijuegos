function hasMechanic(card, mechanic) {
  return Array.isArray(card.mechanics) && card.mechanics.includes(mechanic);
}

export const PYRAMID_CATEGORY_DEFINITIONS = [
  {
    id: "taunt",
    labels: { es: "Cartas con Provocar", en: "Cards with Taunt" },
    predicate: (card) => hasMechanic(card, "TAUNT"),
  },
  {
    id: "battlecry",
    labels: { es: "Cartas con Grito de batalla", en: "Cards with Battlecry" },
    predicate: (card) => hasMechanic(card, "BATTLECRY"),
  },
  {
    id: "deathrattle",
    labels: { es: "Cartas con Último aliento", en: "Cards with Deathrattle" },
    predicate: (card) => hasMechanic(card, "DEATHRATTLE"),
  },
  {
    id: "rush",
    labels: { es: "Cartas con Embestir", en: "Cards with Rush" },
    predicate: (card) => hasMechanic(card, "RUSH"),
  },
  {
    id: "discover",
    labels: { es: "Cartas con Descubrir", en: "Cards with Discover" },
    predicate: (card) => hasMechanic(card, "DISCOVER"),
  },
  {
    id: "dragon",
    labels: { es: "Dragones", en: "Dragons" },
    predicate: (card) => card.race === "DRAGON",
  },
  {
    id: "pirate",
    labels: { es: "Piratas", en: "Pirates" },
    predicate: (card) => card.race === "PIRATE",
  },
  {
    id: "murloc",
    labels: { es: "Múrlocs", en: "Murlocs" },
    predicate: (card) => card.race === "MURLOC",
  },
  {
    id: "neutral-legendary",
    labels: { es: "Legendarias neutrales", en: "Neutral Legendaries" },
    predicate: (card) => card.cardClass === "NEUTRAL" && card.rarity === "LEGENDARY",
  },
  {
    id: "cost-zero",
    labels: { es: "Cartas de coste 0", en: "0-Cost cards" },
    predicate: (card) => card.cost === 0,
  },
  {
    id: "cost-ten",
    labels: { es: "Cartas de coste 10", en: "10-Cost cards" },
    predicate: (card) => card.cost === 10,
  },
  {
    id: "mage-spells",
    labels: { es: "Hechizos de Mago", en: "Mage spells" },
    predicate: (card) => card.type === "SPELL" && card.cardClass === "MAGE",
  },
  {
    id: "weapons",
    labels: { es: "Armas", en: "Weapons" },
    predicate: (card) => card.type === "WEAPON",
  },
  {
    id: "demons",
    labels: { es: "Demonios", en: "Demons" },
    predicate: (card) => card.race === "DEMON",
  },
  {
    id: "beasts",
    labels: { es: "Bestias", en: "Beasts" },
    predicate: (card) => card.race === "BEAST",
  },
  {
    id: "elementals",
    labels: { es: "Elementales", en: "Elementals" },
    predicate: (card) => card.race === "ELEMENTAL",
  },
  {
    id: "undead",
    labels: { es: "No-muertos", en: "Undead" },
    predicate: (card) => card.race === "UNDEAD",
  },
  {
    id: "totems",
    labels: { es: "Tótems", en: "Totems" },
    predicate: (card) => card.race === "TOTEM",
  },
  {
    id: "nagas",
    labels: { es: "Nagas", en: "Nagas" },
    predicate: (card) => card.race === "NAGA",
  },
  {
    id: "mechs",
    labels: { es: "Mecas", en: "Mechs" },
    predicate: (card) => card.race === "MECHANICAL",
  },
  {
    id: "cost-one",
    labels: { es: "Cartas de coste 1", en: "1-Cost cards" },
    predicate: (card) => card.cost === 1,
  },
  {
    id: "cost-two",
    labels: { es: "Cartas de coste 2", en: "2-Cost cards" },
    predicate: (card) => card.cost === 2,
  },
  {
    id: "cost-three",
    labels: { es: "Cartas de coste 3", en: "3-Cost cards" },
    predicate: (card) => card.cost === 3,
  },
  {
    id: "neutral-spells",
    labels: { es: "Hechizos neutrales", en: "Neutral spells" },
    predicate: (card) => card.type === "SPELL" && card.cardClass === "NEUTRAL",
  },
  {
    id: "mage-minions",
    labels: { es: "Esbirros de Mago", en: "Mage minions" },
    predicate: (card) => card.type === "MINION" && card.cardClass === "MAGE",
  },
  {
    id: "hunter-minions",
    labels: { es: "Esbirros de Cazador", en: "Hunter minions" },
    predicate: (card) => card.type === "MINION" && card.cardClass === "HUNTER",
  },
  {
    id: "druid-minions",
    labels: { es: "Esbirros de Druida", en: "Druid minions" },
    predicate: (card) => card.type === "MINION" && card.cardClass === "DRUID",
  },
  {
    id: "warlock-minions",
    labels: { es: "Esbirros de Brujo", en: "Warlock minions" },
    predicate: (card) => card.type === "MINION" && card.cardClass === "WARLOCK",
  },
  {
    id: "divine-shield",
    labels: { es: "Cartas con Escudo divino", en: "Cards with Divine Shield" },
    predicate: (card) => hasMechanic(card, "DIVINE_SHIELD"),
  },
  {
    id: "lifesteal",
    labels: { es: "Cartas con Robo de vida", en: "Cards with Lifesteal" },
    predicate: (card) => hasMechanic(card, "LIFESTEAL"),
  },
  {
    id: "charge",
    labels: { es: "Cartas con Cargar", en: "Cards with Charge" },
    predicate: (card) => hasMechanic(card, "CHARGE"),
  },
  {
    id: "stealth",
    labels: { es: "Cartas con Sigilo", en: "Cards with Stealth" },
    predicate: (card) => hasMechanic(card, "STEALTH"),
  },
  {
    id: "epic-cards",
    labels: { es: "Cartas épicas", en: "Epic cards" },
    predicate: (card) => card.rarity === "EPIC",
  },
  {
    id: "common-cards",
    labels: { es: "Cartas comunes", en: "Common cards" },
    predicate: (card) => card.rarity === "COMMON",
  },
  {
    id: "rare-cards",
    labels: { es: "Cartas raras", en: "Rare cards" },
    predicate: (card) => card.rarity === "RARE",
  },
  {
    id: "legendary-cards",
    labels: { es: "Cartas legendarias", en: "Legendary cards" },
    predicate: (card) => card.rarity === "LEGENDARY",
  },
];
