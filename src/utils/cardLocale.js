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

  return card.imageGame || card.imageThumb || card.image || card.imageRenderNormalized || "";
}

export function getThumbImage(card, locale = "es") {
  return getCardImage(card, "imageThumb", locale);
}

export function getDetailImage(card, locale = "es") {
  return getCardImage(card, "imageRenderNormalized", locale);
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
