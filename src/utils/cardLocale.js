export function getOppositeLocale(locale) {
  return locale === "en" ? "es" : "en";
}

const IMAGE_VARIANT_ALIASES = {
  thumb: ["thumb", "imageThumb"],
  imageThumb: ["imageThumb", "thumb"],
  game: ["game", "imageGame"],
  imageGame: ["imageGame", "game"],
  adapted: ["adapted", "imageRenderNormalized"],
  imageRenderNormalized: ["imageRenderNormalized", "adapted"],
  detail: ["detail", "imageDetail", "adapted", "imageRenderNormalized", "game", "imageGame"],
  imageDetail: ["imageDetail", "detail", "adapted", "imageRenderNormalized", "game", "imageGame"],
  art: ["art", "imageArt"],
  imageArt: ["imageArt", "art"],
  raw: ["raw", "image"],
  image: ["image", "raw"],
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
      if (localizedImages[alias]) return localizedImages[alias];
    }
  }

  return "";
}

function getLegacyImage(card, imageType) {
  for (const alias of getImageVariantAliases(imageType)) {
    if (card[alias]) return card[alias];
  }

  return "";
}

export function getCardImage(card, imageType, locale = "es") {
  if (!card) return "";

  const localized = getLocalizedImage(card, imageType, locale);
  if (localized) return localized;

  const legacy = getLegacyImage(card, imageType);
  if (legacy) return legacy;

  if (imageType === "imageThumb" || imageType === "thumb") {
    return card.imageGame || card.game || card.image || card.imageRenderNormalized || card.adapted || "";
  }

  if (imageType === "imageGame" || imageType === "game") {
    return card.imageThumb || card.thumb || card.image || card.imageRenderNormalized || card.adapted || "";
  }

  if (imageType === "imageRenderNormalized" || imageType === "adapted") {
    return card.imageGame || card.game || card.image || card.imageThumb || card.thumb || "";
  }

  if (imageType === "imageArt" || imageType === "art") {
    return card.imageGame || card.game || card.imageThumb || card.thumb || card.imageRenderNormalized || card.adapted || card.image || "";
  }

  return card.imageGame || card.game || card.imageThumb || card.thumb || card.imageRenderNormalized || card.adapted || card.image || "";
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
  return getAdaptedImage(card, locale) || getGameImage(card, locale);
}

export function getArtImage(card, locale = "es") {
  return getCardImage(card, "art", locale);
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

export function mergeLocaleImages(cards, previewImagesById) {
  if (!previewImagesById?.size) return cards;

  return cards.map((card) => {
    const previewImages = previewImagesById.get(card.id);
    if (!previewImages) return card;

    return {
      ...card,
      imagesByLocale: {
        ...(card.imagesByLocale ?? {}),
        ...previewImages,
      },
      multilangPreview: true,
    };
  });
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
  const localeLabels = labelMap[locale] ?? labelMap.es;
  return localeLabels[value] ?? value;
}

export function translateCardClass(value, locale = "es") {
  return getLabel(
    CARD_CLASS_LABELS,
    value,
    locale,
    locale === "en" ? "Unknown class" : "Clase desconocida"
  );
}

export function translateCardType(value, locale = "es") {
  return getLabel(
    CARD_TYPE_LABELS,
    value,
    locale,
    locale === "en" ? "Unknown type" : "Tipo desconocido"
  );
}

export function translateCardRarity(value, locale = "es") {
  return getLabel(
    CARD_RARITY_LABELS,
    value,
    locale,
    locale === "en" ? "No rarity" : "Sin rareza"
  );
}

export function translateCardRace(value, locale = "es") {
  return getLabel(
    CARD_RACE_LABELS,
    value,
    locale,
    locale === "en" ? "No race" : "Sin raza"
  );
}

export function getCardDisplayData(card, locale = "es") {
  return {
    name: getCardName(card, locale),
    secondaryName: getSecondaryCardName(card, locale),
    text: getCardText(card, locale),
    cardClass: translateCardClass(card?.cardClass, locale),
    type: translateCardType(card?.type, locale),
    rarity: translateCardRarity(card?.rarity, locale),
    race: translateCardRace(card?.race, locale),
    thumbImage: getThumbImage(card, locale),
    gameImage: getGameImage(card, locale),
    detailImage: getDetailImage(card, locale),
    artImage: getArtImage(card, locale),
  };
}
