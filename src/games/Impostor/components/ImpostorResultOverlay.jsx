import GameResultOverlay from "../../../shared/components/GameResultOverlay/GameResultOverlay";
import { getCardName } from "../impostorGameConfig";

function ImpostorResultOverlay({
  copy,
  isWon,
  failedCardId,
  roundData,
  locale,
  rewardMessage,
  onBack,
  onShowResults,
}) {
  const failedCard = failedCardId ? roundData.cards.find((card) => card.id === failedCardId) : null;

  return (
    <GameResultOverlay
      tone={isWon ? "success" : "danger"}
      kicker={copy.resultKicker}
      title={isWon ? copy.winTitle : copy.loseTitle}
      text={isWon ? copy.winText : copy.loseText}
      detail={!isWon && failedCard ? <strong className="im-result-card-name">{getCardName(failedCard, locale)}</strong> : null}
      rewardMessage={rewardMessage}
      primaryAction={{ label: copy.viewResults, onClick: onShowResults }}
      secondaryActions={[{ label: copy.backHome, onClick: onBack }]}
    />
  );
}

export default ImpostorResultOverlay;
