import ImpostorNeutralCard from "../ImpostorNeutralCard";
import {
  getCardName,
  getOriginalCardImage,
  getOriginalCardImageClassName,
  translateType,
} from "../impostorGameConfig";

function getBoardCardClassName({ roundResult, isSelected, isFound, isRevealed, isCorrect, isImpostor, isRoundLost, isFailedCard }) {
  const classNames = ["im-card"];

  if (roundResult === "playing" && isSelected) classNames.push("is-selected");
  if (isFound || (isRevealed && isCorrect)) classNames.push("is-found-correct");
  if (isRevealed && isImpostor) classNames.push("is-revealed-impostor");
  if (isRoundLost && isFailedCard && isImpostor) classNames.push("is-wrong-pick");
  if (isRevealed) classNames.push("is-flipped");

  return classNames.join(" ");
}

function ImpostorBoardCard({
  card,
  locale,
  roundData,
  selectedId,
  foundCorrectIds,
  failedCardId,
  revealedIds,
  roundResult,
  onSelect,
}) {
  const isSelected = selectedId === card.id;
  const isCorrect = roundData.correctIds.has(card.id);
  const isImpostor = roundData.impostorIds.has(card.id);
  const isFound = foundCorrectIds.has(card.id);
  const isFailedCard = failedCardId === card.id;
  const isRoundLost = roundResult === "lost";
  const isRevealed =
    revealedIds.has(card.id) ||
    (roundResult !== "playing" && revealedIds.size === roundData.cards.length);

  return (
    <button
      type="button"
      className={getBoardCardClassName({
        roundResult,
        isSelected,
        isFound,
        isRevealed,
        isCorrect,
        isImpostor,
        isRoundLost,
        isFailedCard,
      })}
      onClick={() => onSelect(card.id)}
      title={`${getCardName(card, locale)} · ${translateType(card.type, locale)}`}
      disabled={roundResult !== "playing" || isRevealed}
    >
      <div className="im-flip-card">
        <div className="im-flip-face im-flip-front">
          <ImpostorNeutralCard card={card} locale={locale} />
        </div>

        <div className="im-flip-face im-flip-back">
          <img
            className={getOriginalCardImageClassName(card)}
            src={getOriginalCardImage(card, locale)}
            alt={getCardName(card, locale)}
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </div>
      </div>
    </button>
  );
}

function ImpostorBoard(props) {
  return (
    <section className="im-board-panel">
      <div className="im-board-grid">
        {props.roundData.cards.map((card) => (
          <ImpostorBoardCard key={card.id} card={card} {...props} />
        ))}
      </div>
    </section>
  );
}

export default ImpostorBoard;
