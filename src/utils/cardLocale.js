export function getOppositeLocale(locale) {
  return locale === "en" ? "es" : "en";
}

// CDN fallback: cuando las imágenes locales no están disponibles (e.g. Vercel),
// usa la CDN pública de HearthstoneJSON.
const HSJSON_CDN = "https://art.hearthstonejson.com/v1";

const LOCALE_TO_HSJSON = {
  es: "esES",
  en: "enUS",
};

/**
 * Convierte una ruta local de imagen a una URL de la CDN de HearthstoneJSON.
 * El tipo "thumb" y "game" usan renders completos (con marco).
 * El tipo "adapted" usa solo el arte (tile), sin marco.
 */
function toCdnUrl(localPath, cardId, locale) {
  if (!localPath?.startsWith("/card-images/") || !cardId) return localPath;

  const isAdapted = localPath.includes("/adapted/");
  const lang = LOCALE_TO_HSJSON[locale] ?? "enUS";

  if (isAdapted) {
    // Arte solo (sin marco de carta)
    return `${HSJSON_CDN}/tiles/${cardId}.webp`;
  }
  // Carta renderizada completa con marco
  return `${HSJSON_CDN}/render/latest/${lang}/256x/${cardId}.png`;
}

const IMAGE_VARIANT_ALIASES = {
  thumb: ["thumb"],
  game: ["game"],
  adapted: ["adapted"],
  detail: ["adapted", "game", "thumb"],
};

function getImageVariantAliases(imageType) {
  return IMAGE_VARIANT_ALIASES[imageType] ?? [imageType];
}

function getLocalizedImage(card, imageType, locale) {
  const aliases = getImageVariantAliases(imageType);
  const locales = [locale, getOppositeLocale(locale)];

  for (const localeKey of locales) {
    const localizedImages = card.imagesByLocale?.[localeKey];
    if (!localizedImages) continue;

    for (const alias of aliases) {
      const rawPath = localizedImages[alias];
      if (rawPath) return toCdnUrl(rawPath, card.id, localeKey);
    }
  }

  return "";
}

export function getCardImage(card, imageType, locale = "es") {
  if (!card) return "";
  return getLocalizedImage(card, imageType, locale);
}

export function getThumbImage(card, locale = "es") {
  return getCardImage(card, "thumb", locale);
}

export function getGameImage(card, locale = "es") {
  return getCardImage(card, "game", locale);
}

export function getAdaptedImage(card, locale = "es") {
  return getCardImage(card, "adapted", locale);
}

export function getDetailImage(card, locale = "es") {
  return getCardImage(card, "detail", locale);
}

export function getCardName(card, locale = "es") {
  if (!card) return "";

  return locale === "en"
    ? card.nameEn || card.name || ""
    : card.name || card.nameEn || "";
}

export function getSecondaryCardName(card, locale = "es") {
  if (!card) return "";

  if (locale === "en") {
    return card.name && card.name !== card.nameEn ? card.name : "";
  }

  return card.nameEn && card.nameEn !== card.name ? card.nameEn : "";
}

export function getCardText(card, locale = "es") {
  if (!card) return "";

  return locale === "en"
    ? card.textEn || card.text || ""
    : card.text || card.textEn || "";
}

const CARD_CLASS_LABELS = {
  es: {
    DEATHKNIGHT: "Caballero de la Muerte",
    DEMONHUNTER: "Cazador de Demonios",
    DRUID: "Druida",
    HUNTER: "Cazador",
    MAGE: "Mago",
    PALADIN: "Paladín",
    PRIEST: "Sacerdote",
    ROGUE: "Pícaro",
    SHAMAN: "Chamán",
    WARLOCK: "Brujo",
    WARRIOR: "Guerrero",
    NEUTRAL: "Neutral",
  },
  en: {
    DEATHKNIGHT: "Death Knight",
    DEMONHUNTER: "Demon Hunter",
    DRUID: "Druid",
    HUNTER: "Hunter",
    MAGE: "Mage",
    PALADIN: "Paladin",
    PRIEST: "Priest",
    ROGUE: "Rogue",
    SHAMAN: "Shaman",
    WARLOCK: "Warlock",
    WARRIOR: "Warrior",
    NEUTRAL: "Neutral",
  },
};

const CARD_TYPE_LABELS = {
  es: {
    MINION: "Esbirro",
    SPELL: "Hechizo",
    WEAPON: "Arma",
    HERO: "Héroe",
    HERO_POWER: "Poder de héroe",
    LOCATION: "Lugar",
  },
  en: {
    MINION: "Minion",
    SPELL: "Spell",
    WEAPON: "Weapon",
    HERO: "Hero",
    HERO_POWER: "Hero Power",
    LOCATION: "Location",
  },
};

const CARD_RARITY_LABELS = {
  es: {
    FREE: "Gratis",
    COMMON: "Común",
    RARE: "Rara",
    EPIC: "Épica",
    LEGENDARY: "Legendaria",
  },
  en: {
    FREE: "Free",
    COMMON: "Common",
    RARE: "Rare",
    EPIC: "Epic",
    LEGENDARY: "Legendary",
  },
};

const CARD_RACE_LABELS = {
  es: {
    ALL: "Todos",
    BEAST: "Bestia",
    DEMON: "Demonio",
    DRAGON: "Dragón",
    DRAENEI: "Draenei",
    ELEMENTAL: "Elemental",
    MECHANICAL: "Meca",
    MURLOC: "Múrloc",
    NAGA: "Naga",
    PIRATE: "Pirata",
    QUILBOAR: "Jabaespín",
    TOTEM: "Tótem",
    UNDEAD: "No-muerto",
  },
  en: {
    ALL: "All",
    BEAST: "Beast",
    DEMON: "Demon",
    DRAGON: "Dragon",
    DRAENEI: "Draenei",
    ELEMENTAL: "Elemental",
    MECHANICAL: "Mech",
    MURLOC: "Murloc",
    NAGA: "Naga",
    PIRATE: "Pirate",
    QUILBOAR: "Quilboar",
    TOTEM: "Totem",
    UNDEAD: "Undead",
  },
};

function getLabel(labelMap, value, locale = "es", fallback = "") {
  if (!value) return fallback;
  return labelMap[locale]?.[value] || labelMap.es?.[value] || fallback || value;
}

export function translateCardClass(value, locale = "es") {
  return getLabel(CARD_CLASS_LABELS, value, locale, value || "");
}

export function translateCardType(value, locale = "es") {
  return getLabel(CARD_TYPE_LABELS, value, locale, value || "");
}

export function translateCardRarity(value, locale = "es") {
  return getLabel(CARD_RARITY_LABELS, value, locale, value || "");
}

export function translateCardRace(value, locale = "es") {
  return getLabel(CARD_RACE_LABELS, value, locale, value || "");
}


