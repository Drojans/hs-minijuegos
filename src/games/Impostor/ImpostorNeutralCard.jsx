import "./ImpostorNeutralCard.css";

const CARD_TEMPLATES = {
  MINION: "/ui/impostor/minion-neutral-template.png",
  SPELL: "/ui/impostor/spell-neutral-template.png",
  WEAPON: "/ui/impostor/weapon-neutral-template.png",
};

function getNeutralArt(card) {
  return card?.imageArt || card?.imageThumb || card?.imageGame || card?.image || "";
}

function getTemplateType(card) {
  if (CARD_TEMPLATES[card?.type]) return card.type;
  return "MINION";
}

function ImpostorNeutralCard({ card }) {
  const artSrc = getNeutralArt(card);
  const templateType = getTemplateType(card);
  const templateSrc = CARD_TEMPLATES[templateType];

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
          <div className="inc-portrait-fallback">Sin arte</div>
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

      <div className="inc-name-ribbon" title={card.name}>
        <span>{card.name}</span>
      </div>
    </div>
  );
}

export default ImpostorNeutralCard;
