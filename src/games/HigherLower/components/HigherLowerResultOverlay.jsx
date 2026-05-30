import GameResultOverlay from "../../../shared/components/GameResultOverlay/GameResultOverlay";
import { getCardName } from "../../../utils/cardLocale";
import { getFullHigherLowerCardImage } from "../higherLowerConfig";

function HigherLowerResultOverlay({ copy, result, card, rewardMessage, locale, onViewResults }) {
  const isWon = result === "won";
  const statusLabel = locale === "en"
    ? (isWon ? "Streak complete" : "Duel lost")
    : (isWon ? "Racha completa" : "Duelo perdido");

  const imageSrc = card ? getFullHigherLowerCardImage(card, locale) : null;
  const cardName = card ? getCardName(card, locale) : "";

  return (
    <GameResultOverlay
      tone={isWon ? "success" : "danger"}
      kicker={copy.resultKicker}
      title={isWon ? copy.winTitle : copy.loseTitle}
      text={isWon ? copy.winText : copy.loseText}
      preview={!isWon && imageSrc ? <img src={imageSrc} alt={cardName} /> : null}
      rewardMessage={rewardMessage}
      locale={locale}
      statusLabel={statusLabel}
      primaryAction={{ label: copy.viewResults, onClick: onViewResults }}
    />
  );
}

export default HigherLowerResultOverlay;
