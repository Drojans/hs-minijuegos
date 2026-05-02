export function getOppositeLocale(locale) {
  return locale === "en" ? "es" : "en";
}

export function getCardImage(card, imageType, locale = "es") {
  if (!card) return "";

  const localized =
    card.imagesByLocale?.[locale]?.[imageType] ||
    card.imagesByLocale?.[getOppositeLocale(locale)]?.[imageType];

  if (localized) return localized;

  if (card[imageType]) return card[imageType];

  if (imageType === "imageThumb") {
    return card.imageGame || card.image || card.imageRenderNormalized || "";
  }

  if (imageType === "imageGame") {
    return card.imageThumb || card.image || card.imageRenderNormalized || "";
  }

  if (imageType === "imageRenderNormalized") {
    return card.imageDetail || card.imageGame || card.image || card.imageThumb || "";
  }

  if (imageType === "imageArt") {
    return card.imageThumb || card.imageGame || card.image || card.imageRenderNormalized || "";
  }

  return card.imageGame || card.imageThumb || card.image || card.imageRenderNormalized || "";
}

export function getThumbImage(card, locale = "es") {
  return getCardImage(card, "imageThumb", locale);
}

export function getGameImage(card, locale = "es") {
  return getCardImage(card, "imageGame", locale);
}

export function getDetailImage(card, locale = "es") {
  return getCardImage(card, "imageRenderNormalized", locale);
}

export function getArtImage(card, locale = "es") {
  return getCardImage(card, "imageArt", locale);
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
