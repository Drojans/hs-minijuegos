import GameResultOverlay from "../../../shared/components/GameResultOverlay/GameResultOverlay";

function CardGridResultOverlay({ t, result, rewardMessage, locale, onViewResults }) {
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

  const statusLabel = locale === "en"
    ? (isWon ? "Completed" : isSurrender ? "Surrendered" : "Time up")
    : (isWon ? "Completado" : isSurrender ? "Rendido" : "Tiempo agotado");

  return (
    <GameResultOverlay
      tone={isWon ? "success" : "danger"}
      kicker={t("grid.resultKicker")}
      title={title}
      text={text}
      rewardMessage={rewardMessage}
      locale={locale}
      statusLabel={statusLabel}
      primaryAction={{ label: t("grid.viewResults"), onClick: onViewResults }}
    />
  );
}

export default CardGridResultOverlay;
