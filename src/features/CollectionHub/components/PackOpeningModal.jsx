import LoadAwareImage from "../../../shared/components/LoadAwareImage/LoadAwareImage";
import { getCardName, getDetailImage, getGameImage, getThumbImage, translateCardRarity } from "../../../utils/cardLocale";
import "./PackOpeningModal.css";

const BOX_ASSETS = {
  closed: "/ui/rewards/arcane-box-closed.png",
  opening: "/ui/rewards/arcane-box-opening.png",
  open: "/ui/rewards/arcane-box-open.png",
};

function formatCopy(template, values = {}) {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);
}

function getCollectionImage(card, locale) {
  return getDetailImage(card, locale) || getGameImage(card, locale) || getThumbImage(card, locale);
}

function getRarityKey(rarity) {
  return String(rarity || "free").toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function ArcaneBoxVisual({ phase = "closed", interactive = false, disabled = false, onClick, label }) {
  const imageSrc = phase === "open" ? BOX_ASSETS.open : phase === "opening" ? BOX_ASSETS.opening : BOX_ASSETS.closed;
  const Tag = interactive ? "button" : "div";

  return (
    <Tag
      type={interactive ? "button" : undefined}
      className={`arcane-box-asset is-${phase} ${interactive ? "is-interactive" : ""}`}
      onClick={interactive && !disabled ? onClick : undefined}
      disabled={interactive ? disabled : undefined}
      aria-label={interactive ? label : undefined}
      aria-hidden={interactive ? undefined : "true"}
    >
      <img className="arcane-box-asset-image" src={imageSrc} alt="" aria-hidden="true" />
    </Tag>
  );
}

function PackCardReveal({ result, index, locale, copy, revealed, onReveal }) {
  const imageSrc = getCollectionImage(result.card, locale);
  const cardName = getCardName(result.card, locale);
  const rarityKey = getRarityKey(result.card.rarity);

  return (
    <article
      className={`pack-reveal-card is-${rarityKey} ${revealed ? "is-revealed" : "is-hidden"} ${result.isNew ? "is-new" : "is-copy"}`}
      style={{ "--pack-card-delay": `${index * 55}ms` }}
    >
      <button
        type="button"
        className="pack-reveal-card-button"
        onClick={onReveal}
        disabled={revealed}
        aria-label={revealed ? cardName : `${copy.revealCard} ${index + 1}`}
      >
        <span className="pack-card-inner">
          <span className="pack-card-face pack-card-back" aria-hidden="true">
            <span className="pack-card-back-rune">?</span>
          </span>
          <span className="pack-card-face pack-card-front">
            <span className="pack-opened-badge">{result.isNew ? copy.newCard : copy.repeatedCard}</span>
            <span className="pack-opened-image">
              {imageSrc ? (
                <LoadAwareImage src={imageSrc} alt={cardName} loading="eager" decoding="async" fetchPriority="high" />
              ) : (
                <span>{copy.noImage}</span>
              )}
            </span>
          </span>
        </span>
      </button>

      <div className="pack-card-caption" aria-hidden={!revealed}>
        <h3>{revealed ? cardName : copy.hiddenCard}</h3>
        <p>{revealed ? translateCardRarity(result.card.rarity, locale) : copy.clickToReveal}</p>
        {revealed && !result.isNew ? <strong>{formatCopy(copy.copyCount, { count: result.count })}</strong> : null}
      </div>
    </article>
  );
}

function getBoxPhase(phase) {
  if (phase === "opening") return "opening";
  if (phase === "cards") return "open";
  return "closed";
}

function getStageText(copy, opening, revealedCount, totalCards) {
  if (opening.phase === "waiting") {
    return {
      title: copy.openingTitle,
      text: copy.tapBoxText,
    };
  }

  if (opening.phase === "opening") {
    return {
      title: copy.openingTitle,
      text: copy.openingInProgress,
    };
  }

  return {
    title: copy.revealTitle,
    text: formatCopy(copy.revealedCount, { count: revealedCount, total: totalCards }),
  };
}

function PackOpeningModal({ copy, locale, opening, onStartOpening, onRevealCard, onRevealAll, onClose, onOpenAnother, canOpenAnother }) {
  if (!opening) return null;

  const totalCards = opening.results.length;
  const revealedCount = opening.revealed.filter(Boolean).length;
  const allRevealed = totalCards > 0 && revealedCount === totalCards;
  const stageText = getStageText(copy, opening, revealedCount, totalCards);
  const showCards = opening.phase === "cards";

  return (
    <div className="pack-opening-backdrop" role="presentation">
      <section
        className={`pack-opening-modal is-${opening.phase}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={showCards ? undefined : "pack-opening-title"}
        aria-label={showCards ? copy.revealTitle : undefined}
      >
        <span className="pack-opening-corner pack-opening-corner-a" aria-hidden="true" />
        <span className="pack-opening-corner pack-opening-corner-b" aria-hidden="true" />

        {!showCards ? (
          <header className="pack-opening-head">
            <p>{copy.openingTitle}</p>
            <h2 id="pack-opening-title">{stageText.title}</h2>
            <span>{stageText.text}</span>
          </header>
        ) : null}

        {!showCards ? (
          <div className="pack-opening-box-stage">
            <ArcaneBoxVisual
              phase={getBoxPhase(opening.phase)}
              interactive={opening.phase === "waiting"}
              disabled={opening.phase !== "waiting"}
              onClick={onStartOpening}
              label={copy.openBox}
            />
            {opening.phase === "waiting" ? <button type="button" className="pack-opening-start" onClick={onStartOpening}>{copy.openBox}</button> : null}
          </div>
        ) : (
          <>
            <div className="pack-opening-grid">
              {opening.results.map((result, index) => (
                <PackCardReveal
                  key={`${result.cardId}-${index}`}
                  result={result}
                  index={index}
                  locale={locale}
                  copy={copy}
                  revealed={opening.revealed[index]}
                  onReveal={() => onRevealCard(index)}
                />
              ))}
            </div>

            <div className="pack-opening-actions">
              {!allRevealed ? (
                <button type="button" className="pack-opening-secondary" onClick={onRevealAll}>{copy.revealAll}</button>
              ) : null}

              {allRevealed && canOpenAnother ? (
                <button type="button" className="pack-opening-secondary" onClick={onOpenAnother}>{copy.openAnotherBox}</button>
              ) : null}

              {allRevealed ? <button type="button" className="pack-opening-continue" onClick={onClose}>{copy.continue}</button> : null}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default PackOpeningModal;
