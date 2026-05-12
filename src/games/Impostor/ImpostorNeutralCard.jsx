import { useEffect, useMemo, useState } from "react";
import LoadAwareImage from "../../shared/components/LoadAwareImage/LoadAwareImage";
import { warmImages } from "../../shared/images/imageCache";
import {
  getAdaptedImage,
  getCardName,
  getGameImage,
  getThumbImage,
} from "../../utils/cardLocale";
import minionNeutralOverlayFull from "./assets/minion-neutral-overlay-full.png";
import spellNeutralOverlayFull from "./assets/spell-neutral-overlay-full.png";
import weaponNeutralOverlayFull from "./assets/weapon-neutral-overlay-full.png";
import "./ImpostorNeutralCard.css";

const OVERLAY_BY_TYPE = {
  MINION: {
    shellClass: "inc-card-minion inc-card-minion-template-overlay",
    legendaryClass: "inc-card-minion-template-overlay-legendary",
    overlaySrc: minionNeutralOverlayFull,
  },
  SPELL: {
    shellClass: "inc-card-spell inc-card-spell-template-overlay",
    legendaryClass: "inc-card-spell-template-overlay-legendary",
    overlaySrc: spellNeutralOverlayFull,
  },
  WEAPON: {
    shellClass: "inc-card-weapon inc-card-weapon-template-overlay",
    legendaryClass: "inc-card-weapon-template-overlay-legendary",
    overlaySrc: weaponNeutralOverlayFull,
  },
};

export function getNeutralRender(card, locale) {
  return (
    getAdaptedImage(card, locale) ||
    getGameImage(card, locale) ||
    getThumbImage(card, locale) ||
    ""
  );
}

function isLegendaryCard(card) {
  return String(card?.rarity || "").toUpperCase() === "LEGENDARY";
}

function getOverlayConfig(card) {
  return OVERLAY_BY_TYPE[card?.type] ?? OVERLAY_BY_TYPE.MINION;
}

export function getNeutralOverlaySource(card) {
  return getOverlayConfig(card).overlaySrc;
}

export function getNeutralCardImageSources(card, locale) {
  return [getNeutralRender(card, locale), getNeutralOverlaySource(card)].filter(Boolean);
}

function ImpostorNeutralCard({ card, locale = "es" }) {
  const cardName = getCardName(card, locale);
  const renderSrc = getNeutralRender(card, locale);
  const overlayConfig = getOverlayConfig(card);
  const overlaySrc = overlayConfig.overlaySrc;
  const legendaryClass = isLegendaryCard(card) ? ` ${overlayConfig.legendaryClass}` : "";
  const preloadSources = useMemo(
    () => [renderSrc, overlaySrc].filter(Boolean),
    [renderSrc, overlaySrc]
  );
  const [isCompositeReady, setIsCompositeReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsCompositeReady(false);

    warmImages(preloadSources, { fetchPriority: "high", decoding: "async" }).then(() => {
      if (!cancelled) {
        setIsCompositeReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [preloadSources]);

  return (
    <div
      className={`inc-card-shell ${overlayConfig.shellClass}${legendaryClass} ${isCompositeReady ? "is-neutral-ready" : "is-neutral-loading"}`}
      title={cardName}
      aria-label={cardName}
    >
      {renderSrc ? (
        <LoadAwareImage
          className="inc-template-overlay-render"
          src={renderSrc}
          alt=""
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      ) : (
        <div className="inc-template-overlay-fallback">
          {locale === "en" ? "No image" : "Sin imagen"}
        </div>
      )}

      <img
        className="inc-template-overlay-frame"
        src={overlaySrc}
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}

export default ImpostorNeutralCard;
