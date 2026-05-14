import GameResultOverlay from "../../../shared/components/GameResultOverlay/GameResultOverlay";

function CardGridResultOverlay({ t, result, rewardMessage, onViewResults }) {
  const isWon = result === "won";
  const isSurrender = result === "surrender";

  const title = isWon
    ? t("grid.resultVictoryTitle")
    : isSurrender
      ? t("grid.resultSurrenderTitle")
      : t("grid.resultTimeTitle");

  const text = isWon
    ? t("grid.resultVictoryText")
    : isSurrender
      ? t("grid.resultSurrenderText")
      : t("grid.resultTimeText");

  return (
    <GameResultOverlay
      tone={isWon ? "success" : "danger"}
      kicker={t("grid.resultKicker")}
      title={title}
      text={text}
      rewardMessage={rewardMessage}
      primaryAction={{ label: t("grid.viewResults"), onClick: onViewResults }}
    />
  );
}

export default CardGridResultOverlay;
