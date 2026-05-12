import {
  getAdaptedImage,
  getCardName as getLocalizedCardName,
  getGameImage,
  getThumbImage,
  translateCardType as translateSharedCardType,
} from "../../utils/cardLocale";
import { ALLOWED_CARD_TYPES } from "./impostorConstants";

const PRELOADED_IMAGE_SOURCES = new Set();

export function getCardName(card, locale) {
  return getLocalizedCardName(card, locale);
}

export function translateType(value, locale) {
  return translateSharedCardType(value, locale);
}

export function getCardImage(card, locale) {
  return getAdaptedImage(card, locale) || getGameImage(card, locale) || getThumbImage(card, locale);
}

export function getOriginalCardImage(card, locale) {
  return getAdaptedImage(card, locale) || getGameImage(card, locale) || getThumbImage(card, locale);
}

export function getOriginalCardImageClassName(card) {
  const classNames = ["im-original-card-image"];

  if (card?.rarity === "LEGENDARY") {
    classNames.push("is-legendary-render");
  }

  if (card?.type === "SPELL" && card?.rarity === "LEGENDARY") {
    classNames.push("is-legendary-spell-render");
  }

  return classNames.join(" ");
}

function getCardPreloadSources(card, locale) {
  return Array.from(
    new Set([getCardImage(card, locale), getOriginalCardImage(card, locale)].filter(Boolean))
  );
}

function preloadImageSource(src, fetchPriority = "auto") {
  if (!src || PRELOADED_IMAGE_SOURCES.has(src) || typeof window === "undefined") return;

  PRELOADED_IMAGE_SOURCES.add(src);

  const image = new Image();
  image.decoding = "async";

  try {
    image.fetchPriority = fetchPriority;
  } catch {
    // fetchPriority is not available in every browser.
  }

  image.src = src;

  if (typeof image.decode === "function") {
    image.decode().catch(() => {
      // If decode fails, the browser can still use the normal request/cache.
    });
  }
}

export function preloadRoundImages(roundData, locale, fetchPriority = "auto") {
  roundData?.cards?.forEach((card) => {
    getCardPreloadSources(card, locale).forEach((src) => preloadImageSource(src, fetchPriority));
  });
}

export function isAllowedType(card) {
  return ALLOWED_CARD_TYPES.includes(card?.type);
}
