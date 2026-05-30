import GameResultOverlay from "../../../shared/components/GameResultOverlay/GameResultOverlay";

function stripTrailingPeriod(value) {
  return typeof value === "string" ? value.replace(/[.!?]+$/u, "") : value;
}

function GuessManaResultOverlay({ copy, isCorrect, cardName, correctCost, imageSrc, locale, rewardMessage, onViewResults }) {
  const rewardLabel = stripTrailingPeriod(rewardMessage);
  const costBefore = stripTrailingPeriod(copy.resultCostBefore);
  const costAfter = stripTrailingPeriod(copy.resultCostAfter);

  return (
    <GameResultOverlay
      tone={isCorrect ? "success" : "danger"}
      kicker={copy.resultKicker}
      title={isCorrect ? copy.correct : copy.wrong}
      preview={imageSrc ? <img src={imageSrc} alt={cardName} /> : null}
      rewardMessage={rewardLabel}
      locale={locale}
      statusLabel={isCorrect ? (locale === "en" ? "Correct" : "Acierto") : (locale === "en" ? "Wrong" : "Fallo")}
      icon={null}
      detail={(
        <>
          <strong className="guess-v3-result-card-name">{cardName}</strong>
          <div className="guess-v3-result-cost-row">
            <span className="guess-v3-result-cost-line">{costBefore}</span>
            <div className="guess-v3-result-cost-crystal" aria-hidden="true">
              <img src="/ui/games/guess-mana-v3/mana-crystal.png" alt="" />
              <span>{correctCost}</span>
            </div>
            <span className="guess-v3-result-cost-line">{costAfter}</span>
          </div>
        </>
      )}
      primaryAction={{ label: copy.viewResults, onClick: onViewResults }}
    />
  );
}

export default GuessManaResultOverlay;
