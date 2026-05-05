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

function getNeutralRender(card, locale) {
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

function ImpostorNeutralCard({ card, locale = "es" }) {
  const cardName = getCardName(card, locale);
  const renderSrc = getNeutralRender(card, locale);
  const overlayConfig = getOverlayConfig(card);
  const legendaryClass = isLegendaryCard(card) ? ` ${overlayConfig.legendaryClass}` : "";

  return (
    <div
      className={`inc-card-shell ${overlayConfig.shellClass}${legendaryClass}`}
      title={cardName}
      aria-label={cardName}
    >
      {renderSrc ? (
        <img
          className="inc-template-overlay-render"
          src={renderSrc}
          alt=""
          loading="eager"
          decoding="sync"
        />
      ) : (
        <div className="inc-template-overlay-fallback">
          {locale === "en" ? "No image" : "Sin imagen"}
        </div>
      )}

      <img
        className="inc-template-overlay-frame"
        src={overlayConfig.overlaySrc}
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}

export default ImpostorNeutralCard;
