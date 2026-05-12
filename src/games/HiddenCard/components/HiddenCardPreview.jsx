import LoadAwareImage from "../../../shared/components/LoadAwareImage/LoadAwareImage";
import { getCardName } from "../../../utils/cardLocale";
import { getHiddenCardImage } from "../hiddenCardConfig";

function HiddenCardPreview({ card, locale, revealLevel, isRevealed, copy }) {
  const imageSrc = getHiddenCardImage(card, locale);
  const name = getCardName(card, locale);

  return (
    <section className={`hidden-card-preview level-${revealLevel} ${isRevealed ? "is-revealed" : ""}`}>
      <div className="hidden-card-image-frame">
        {imageSrc ? <LoadAwareImage src={imageSrc} alt={isRevealed ? name : copy.hintImage} loading="eager" decoding="async" fetchPriority="high" /> : <span>{name}</span>}
      </div>
      {isRevealed ? <strong className="hidden-card-real-name">{name}</strong> : null}
    </section>
  );
}

export default HiddenCardPreview;
