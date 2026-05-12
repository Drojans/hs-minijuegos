import GameResultOverlay from "../../../shared/components/GameResultOverlay/GameResultOverlay";

function CardGridResultOverlay({ t, copy, result, rewardMessage, onViewResults, onBack }) {
  const isWon = result === "won";

  return (
    <GameResultOverlay
      tone={isWon ? "success" : "danger"}
      kicker={t("grid.resultKicker")}
      title={isWon ? t("grid.resultVictoryTitle") : t("grid.resultTimeTitle")}
      text={isWon ? t("grid.resultVictoryText") : t("grid.resultTimeText")}
      rewardMessage={rewardMessage}
      primaryAction={{ label: t("grid.viewResults"), onClick: onViewResults }}
      secondaryActions={[{ label: copy.backHome, onClick: onBack }]}
    />
  );
}

export default CardGridResultOverlay;
