import GameResultOverlay from "../../../shared/components/GameResultOverlay/GameResultOverlay";

function HigherLowerResultOverlay({ copy, result, rewardMessage, locale, onViewResults }) {
  const isWon = result === "won";
  const statusLabel = locale === "en"
    ? (isWon ? "Streak complete" : "Duel lost")
    : (isWon ? "Racha completa" : "Duelo perdido");

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

export default HigherLowerResultOverlay;
