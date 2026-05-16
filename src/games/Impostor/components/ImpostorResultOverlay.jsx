import GameResultOverlay from "../../../shared/components/GameResultOverlay/GameResultOverlay";
import { getCardName } from "../impostorGameConfig";

function ImpostorResultOverlay({
  copy,
  isWon,
  failedCardId,
  roundData,
  locale,
  rewardMessage,
  onShowResults,
}) {
  const failedCard = failedCardId ? roundData.cards.find((card) => card.id === failedCardId) : null;
  const failedCardName = failedCard ? getCardName(failedCard, locale) : "";
  const statusLabel = locale === "en"
    ? (isWon ? "Perfect" : "Impostor")
    : (isWon ? "Perfecto" : "Impostor");

  return (
    <GameResultOverlay
      tone={isWon ? "success" : "danger"}
      kicker={copy.resultKicker}
      title={isWon ? copy.winTitle : copy.loseTitle}
      text={isWon ? copy.winText : copy.loseText}
      detail={!isWon && failedCard ? <strong className="im-result-card-name">{failedCardName}</strong> : null}
      rewardMessage={rewardMessage}
      locale={locale}
      statusLabel={statusLabel}
      primaryAction={{ label: copy.viewResults, onClick: onShowResults }}
    />
  );
}

export default ImpostorResultOverlay;
