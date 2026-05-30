import GameResultOverlay from "../../../shared/components/GameResultOverlay/GameResultOverlay";
import { getCardName } from "../../../utils/cardLocale";
import { getHiddenCardImage } from "../hiddenCardConfig";

function HiddenCardResultOverlay({ copy, result, card, rewardMessage, locale, onViewResults }) {
  const isWon = result === "won";
  const statusLabel = locale === "en"
    ? (isWon ? "Discovered" : "Not discovered")
    : (isWon ? "Descubierta" : "Sin descubrir");

  const imageSrc = getHiddenCardImage(card, locale);
  const name = getCardName(card, locale);

  return (
    <GameResultOverlay
      tone={isWon ? "success" : "danger"}
      kicker={copy.resultKicker}
      title={isWon ? copy.winTitle : copy.loseTitle}
      text={isWon ? copy.winText : copy.loseText}
      preview={imageSrc ? <img src={imageSrc} alt={name} /> : null}
      rewardMessage={rewardMessage}
      locale={locale}
      statusLabel={statusLabel}
      primaryAction={{ label: copy.viewResults, onClick: onViewResults }}
    />
  );
}

export default HiddenCardResultOverlay;
