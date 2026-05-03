import { useId } from "react";
import {
  getArtImage,
  getCardName,
  getDetailImage,
  getGameImage,
  getThumbImage,
} from "../../utils/cardLocale";
import minionNeutralOverlayFull from "./minion-neutral-overlay-full.png";
import spellNeutralOverlayFull from "./spell-neutral-overlay-full.png";
import weaponNeutralOverlayFull from "./weapon-neutral-overlay-full.png";
import "./ImpostorNeutralCard.css";

const CARD_TEMPLATES = {
  MINION: "/ui/impostor/minion-neutral-template.png",
  SPELL: "/ui/impostor/spell-neutral-template.png",
  WEAPON: "/ui/impostor/weapon-neutral-template.png",
};

const CARD_NAME_PATHS = {
  MINION: "m 95.84071,685 c 30,40 420,-100 587,-20",
  SPELL: "m 107,682 c 0,0 290.367488,-100.96114 598.643108,0",
  WEAPON: "m 105,642 H 695.11632",
};

function getNeutralArt(card, locale) {
  return getArtImage(card, locale) || getThumbImage(card, locale) || getGameImage(card, locale) || card?.image || "";
}

function getNeutralRender(card, locale) {
  return (
    getDetailImage(card, locale) ||
    getGameImage(card, locale) ||
    getThumbImage(card, locale) ||
    card?.image ||
    ""
  );
}

function getTemplateType(card) {
  if (CARD_TEMPLATES[card?.type]) return card.type;
  return "MINION";
}

function getCleanName(name = "") {
  return String(name).replace(/\s+/g, " ").trim();
}

function getNameFontSize(name, templateType) {
  const length = getCleanName(name).length;
  const typeOffset = templateType === "SPELL" ? -1 : 0;

  if (length <= 8) return 64 + typeOffset;
  if (length <= 12) return 60 + typeOffset;
  if (length <= 16) return 56 + typeOffset;
  if (length <= 20) return 52 + typeOffset;
  if (length <= 24) return 48 + typeOffset;
  if (length <= 29) return 43 + typeOffset;
  if (length <= 34) return 39 + typeOffset;
  return 35 + typeOffset;
}

function getNameTextLength(name, templateType) {
  const length = getCleanName(name).length;

  if (templateType === "WEAPON") {
    if (length <= 8) return 360;
    if (length <= 12) return 430;
    if (length <= 16) return 500;
    if (length <= 20) return 555;
    if (length <= 24) return 585;
    return 610;
  }

  if (length <= 8) return 380;
  if (length <= 12) return 455;
  if (length <= 16) return 525;
  if (length <= 20) return 575;
  if (length <= 24) return 610;
  return 635;
}

function getNameFitProps(name, templateType) {
  const length = getCleanName(name).length;

  // Nombres cortos: no forzar ancho, así no se deforman.
  if (length <= 10) {
    return {};
  }

  // Nombres medios: solo reparte espacio entre letras.
  if (length <= 15) {
    return {
      textLength: getNameTextLength(name, templateType),
      lengthAdjust: "spacing",
    };
  }

  // Nombres largos: permite comprimir/estirar un poco los glifos para que quepan.
  return {
    textLength: getNameTextLength(name, templateType),
    lengthAdjust: "spacingAndGlyphs",
  };
}

function CardNameSvg({ name, templateType }) {
  const rawId = useId();
  const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const cleanName = getCleanName(name);
  const fontSize = getNameFontSize(cleanName, templateType);
  const nameFitProps = getNameFitProps(cleanName, templateType);
  const pathData = CARD_NAME_PATHS[templateType] || CARD_NAME_PATHS.MINION;

  return (
    <svg
      className={`inc-name-svg inc-name-svg-${templateType.toLowerCase()}`}
      viewBox="0 590 825 180"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <path id={`inc-card-name-path-${safeId}`} d={pathData} />
      </defs>

      <text
        className="inc-name-svg-text inc-name-svg-text-shadow"
        fontSize={fontSize}
        textAnchor="middle"
      >
        <textPath
          href={`#inc-card-name-path-${safeId}`}
          startOffset="50%"
          {...nameFitProps}
        >
          {cleanName}
        </textPath>
      </text>

      <text
        className="inc-name-svg-text"
        fontSize={fontSize}
        textAnchor="middle"
      >
        <textPath
          href={`#inc-card-name-path-${safeId}`}
          startOffset="50%"
          {...nameFitProps}
        >
          {cleanName}
        </textPath>
      </text>
    </svg>
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

function ClassicNeutralCard({ card, locale, templateType, templateSrc, cardName }) {
  const artSrc = getNeutralArt(card, locale);

  return (
    <div className={`inc-card-shell inc-card-${templateType.toLowerCase()}`}>
      <div className="inc-portrait-mask" aria-hidden="true">
        {artSrc ? (
          <img
            className="inc-portrait-image"
            src={artSrc}
            alt=""
            loading="eager"
            decoding="sync"
          />
        ) : (
          <div className="inc-portrait-fallback">{locale === "en" ? "No art" : "Sin arte"}</div>
        )}
      </div>

      <img
        className="inc-card-template"
        src={templateSrc}
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
      />

      <div className="inc-name-ribbon" title={cardName} aria-label={cardName}>
        <CardNameSvg name={cardName} templateType={templateType} />
      </div>
    </div>
  );
}

function ImpostorNeutralCard({ card, locale = "es" }) {
  const cardName = getCardName(card, locale);
  const templateType = getTemplateType(card);
  const templateSrc = CARD_TEMPLATES[templateType];

  if (templateType === "MINION") {
    return <FullOverlayMinionCard card={card} locale={locale} cardName={cardName} />;
  }

  if (templateType === "SPELL") {
    return <FullOverlaySpellCard card={card} locale={locale} cardName={cardName} />;
  }

  if (templateType === "WEAPON") {
    return <FullOverlayWeaponCard card={card} locale={locale} cardName={cardName} />;
  }

  return (
    <ClassicNeutralCard
      card={card}
      locale={locale}
      templateType={templateType}
      templateSrc={templateSrc}
      cardName={cardName}
    />
  );
}

export default ImpostorNeutralCard;
