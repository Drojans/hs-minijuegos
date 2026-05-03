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

function FullOverlayMinionCard({ card, locale, cardName }) {
  const renderSrc = getNeutralRender(card, locale);
  const legendaryClass = isLegendaryCard(card)
    ? " inc-card-minion-template-overlay-legendary"
    : "";

  return (
    <div
      className={`inc-card-shell inc-card-minion inc-card-minion-template-overlay${legendaryClass}`}
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
        src={minionNeutralOverlayFull}
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}

function FullOverlaySpellCard({ card, locale, cardName }) {
  const renderSrc = getNeutralRender(card, locale);
  const legendaryClass = isLegendaryCard(card)
    ? " inc-card-spell-template-overlay-legendary"
    : "";

  return (
    <div
      className={`inc-card-shell inc-card-spell inc-card-spell-template-overlay${legendaryClass}`}
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
        src={spellNeutralOverlayFull}
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}

function FullOverlayWeaponCard({ card, locale, cardName }) {
  const renderSrc = getNeutralRender(card, locale);
  const legendaryClass = isLegendaryCard(card)
    ? " inc-card-weapon-template-overlay-legendary"
    : "";

  return (
    <div
      className={`inc-card-shell inc-card-weapon inc-card-weapon-template-overlay${legendaryClass}`}
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
        src={weaponNeutralOverlayFull}
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}

function ImpostorNeutralCard({ card, locale = "es" }) {
  const cardName = getCardName(card, locale);

  if (card?.type === "SPELL") {
    return <FullOverlaySpellCard card={card} locale={locale} cardName={cardName} />;
  }

  if (card?.type === "WEAPON") {
    return <FullOverlayWeaponCard card={card} locale={locale} cardName={cardName} />;
  }

  return <FullOverlayMinionCard card={card} locale={locale} cardName={cardName} />;
}

export default ImpostorNeutralCard;
