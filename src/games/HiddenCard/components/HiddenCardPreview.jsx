import { getCardName } from "../../../utils/cardLocale";
import { getHiddenCardImage } from "../hiddenCardConfig";

function HiddenCardPreview({ card, locale, revealLevel, isRevealed, copy }) {
  const imageSrc = getHiddenCardImage(card, locale);
  const name = getCardName(card, locale);

  return (
    <section className={`hidden-card-preview level-${revealLevel} ${isRevealed ? "is-revealed" : ""}`}>
      <div className="hidden-card-image-frame">
        {imageSrc ? <img src={imageSrc} alt={isRevealed ? name : copy.hintImage} /> : <span>{name}</span>}
      </div>
      {isRevealed ? <strong className="hidden-card-real-name">{name}</strong> : null}
    </section>
  );
}

export default HiddenCardPreview;
