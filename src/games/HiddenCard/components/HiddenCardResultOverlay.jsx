import GameResultOverlay from "../../../shared/components/GameResultOverlay/GameResultOverlay";

function HiddenCardResultOverlay({ copy, result, rewardMessage, locale, onViewResults }) {
  const isWon = result === "won";
  const statusLabel = locale === "en"
    ? (isWon ? "Discovered" : "Not discovered")
    : (isWon ? "Descubierta" : "Sin descubrir");

  return (
    <GameResultOverlay
      tone={isWon ? "success" : "danger"}
      kicker={copy.resultKicker}
      title={isWon ? copy.winTitle : copy.loseTitle}
      text={isWon ? copy.winText : copy.loseText}
      rewardMessage={rewardMessage}
      locale={locale}
      statusLabel={statusLabel}
      primaryAction={{ label: copy.viewResults, onClick: onViewResults }}
    />
  );
}

export default HiddenCardResultOverlay;
