import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../i18n/LanguageProvider";
import ImpostorNeutralCard from "./ImpostorNeutralCard";
import {
  CORRECT_COUNT,
  IMPOSTOR_COUNT,
  MAX_ROUNDS,
  NEXT_ROUND_PRELOAD_DELAY_MS,
  ROUND_REVEAL_DELAY_MS,
  buildConditions,
  createRoundFromConditions,
  getCardImage,
  getCardName,
  getOriginalCardImage,
  getOriginalCardImageClassName,
  isAllowedType,
  preloadRoundImages,
  translateType,
} from "./impostorGameConfig";
import "./ImpostorGame.css";

function MessagePanel({ title, children, action }) {
  return (
    <main className="im-page">
      <section className="im-message-panel">
        <h1>{title}</h1>
        {children}
        {action}
      </section>
    </main>
  );
}

function EndScreen({ t, score, onRestart, onBack }) {
  const accuracy = Math.round((score / MAX_ROUNDS) * 100);

  return (
    <main className="im-page">
      <section className="im-end-screen">
        <p className="im-eyebrow">{t("impostor.gameFinished")}</p>
        <h1>{t("impostor.title")}</h1>
        <div className="im-end-score">
          {score} / {MAX_ROUNDS}
        </div>
        <p>{t("impostor.finalAccuracy", { accuracy })}</p>
        <div className="im-end-actions">
          <button type="button" className="im-primary-button" onClick={onRestart}>
            {t("common.playAgain")}
          </button>
          <button type="button" className="im-secondary-button" onClick={onBack}>
            {t("impostor.backHome")}
          </button>
        </div>
      </section>
    </main>
  );
}

function GameHeader({ t, round, score }) {
  return (
    <header className="im-header">
      <button type="button" className="im-secondary-button" onClick={t.onBack}>
        {t("common.backHome")}
      </button>

      <div className="im-title-block">
        <p className="im-eyebrow">{t("impostor.minigame")}</p>
        <h1>{t("impostor.title")}</h1>
        <p>{t("impostor.subtitle", { correctCount: CORRECT_COUNT })}</p>
      </div>

      <div className="im-score-pill">
        <span>{t("common.round", { round, maxRounds: MAX_ROUNDS })}</span>
        <strong>{t("common.correctCount", { score })}</strong>
      </div>
    </header>
  );
}

function ConditionPanel({ t, condition }) {
  return (
    <aside className="im-side-panel">
      <p className="im-eyebrow">{t("impostor.category")}</p>
      <h2>{condition.title}</h2>
      <p>{condition.description}</p>

      <div className="im-meta-box">
        <span>{condition.kind}</span>
        <strong>
          {t("impostor.goodAndImpostors", {
            correctCount: CORRECT_COUNT,
            impostorCount: IMPOSTOR_COUNT,
          })}
        </strong>
      </div>

      <div className="im-help-box">
        <strong>{t("impostor.howToPlay")}</strong>
        <p>{t("impostor.howToPlayText", { correctCount: CORRECT_COUNT })}</p>
      </div>
    </aside>
  );
}

function getBoardCardClassName({ roundResult, isSelected, isFound, isRevealed, isCorrect, isImpostor, isRoundLost, isFailedCard }) {
  const classNames = ["im-card"];

  if (roundResult === "playing" && isSelected) classNames.push("is-selected");
  if (isFound || (isRevealed && isCorrect)) classNames.push("is-found-correct");
  if (isRevealed && isImpostor) classNames.push("is-revealed-impostor");
  if (isRoundLost && isFailedCard && isImpostor) classNames.push("is-wrong-pick");
  if (isRevealed) classNames.push("is-flipped");

  return classNames.join(" ");
}

function BoardCard({
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

      {isRevealed && isCorrect ? <div className="im-result-mark im-result-mark-correct">✓</div> : null}
      {isRevealed && isImpostor ? <div className="im-result-mark im-result-mark-wrong">×</div> : null}
    </button>
  );
}

function Board(props) {
  return (
    <section className="im-board-panel">
      <div className="im-board-grid">
        {props.roundData.cards.map((card) => (
          <BoardCard key={card.id} card={card} {...props} />
        ))}
      </div>
    </section>
  );
}

function ActionPanel({
  t,
  round,
  roundResult,
  selectedId,
  foundCount,
  isRoundWon,
  onCheck,
  onNextRound,
}) {
  return (
    <aside className="im-action-panel">
      {roundResult === "playing" ? (
        <>
          <p className="im-eyebrow">{t("impostor.analysis")}</p>
          <h2>{t("impostor.findGood")}</h2>
          <p>{t("impostor.found", { foundCount, correctCount: CORRECT_COUNT })}</p>
          <button
            type="button"
            className="im-primary-button"
            disabled={!selectedId}
            onClick={onCheck}
          >
            {t("impostor.checkCard")}
          </button>
        </>
      ) : (
        <>
          <p className="im-eyebrow">{t("common.result")}</p>
          <h2>{isRoundWon ? t("impostor.perfectRound") : t("impostor.wasImpostor")}</h2>
          <p>
            {isRoundWon
              ? t("impostor.perfectRoundText", { correctCount: CORRECT_COUNT })
              : t("impostor.wasImpostorText")}
          </p>
          <button type="button" className="im-primary-button" onClick={onNextRound}>
            {round >= MAX_ROUNDS ? t("common.seeResult") : t("impostor.nextRound")}
          </button>
        </>
      )}
    </aside>
  );
}

function ImpostorGame({ cards, onBack }) {
  const { locale, t: translate } = useLanguage();
  const t = Object.assign((...args) => translate(...args), { onBack });

  const playableCards = useMemo(() => {
    return cards.filter(
      (card) => card.id && getCardName(card, locale) && getCardImage(card, locale) && isAllowedType(card)
    );
  }, [cards, locale]);

  const availableConditions = useMemo(
    () => buildConditions(playableCards, locale, translate),
    [playableCards, locale, translate]
  );

  const [roundData, setRoundData] = useState(null);
  const [preparedRoundData, setPreparedRoundData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [foundCorrectIds, setFoundCorrectIds] = useState(new Set());
  const [failedCardId, setFailedCardId] = useState(null);
  const [revealedIds, setRevealedIds] = useState(new Set());
  const [roundResult, setRoundResult] = useState("playing");
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (availableConditions.length === 0 || roundData) return;
    setRoundData(createRoundFromConditions(availableConditions));
  }, [availableConditions, roundData]);

  useEffect(() => {
    if (!roundData || typeof window === "undefined") return undefined;

    preloadRoundImages(roundData, locale, "high");

    const prepareTimeout = window.setTimeout(() => {
      if (round >= MAX_ROUNDS || availableConditions.length === 0) return;

      const nextPreparedRound = createRoundFromConditions(
        availableConditions,
        roundData.condition.id
      );

      setPreparedRoundData(nextPreparedRound);
      preloadRoundImages(nextPreparedRound, locale, "low");
    }, NEXT_ROUND_PRELOAD_DELAY_MS);

    return () => {
      window.clearTimeout(prepareTimeout);
    };
  }, [availableConditions, round, roundData, locale]);

  function revealAllCards(cardsToReveal = roundData?.cards ?? []) {
    setRevealedIds(new Set(cardsToReveal.map((card) => card.id)));
  }

  function selectCard(cardId) {
    if (roundResult !== "playing" || revealedIds.has(cardId)) return;

    setSelectedId((previousSelectedId) => {
      return previousSelectedId === cardId ? null : cardId;
    });
  }

  function checkSelectedCard() {
    if (roundResult !== "playing" || !roundData || !selectedId) return;

    const selectedIsCorrect = roundData.correctIds.has(selectedId);
    const nextRevealedIds = new Set(revealedIds);
    nextRevealedIds.add(selectedId);
    setRevealedIds(nextRevealedIds);

    if (!selectedIsCorrect) {
      setFailedCardId(selectedId);
      setRoundResult("lost");

      window.setTimeout(() => {
        revealAllCards(roundData.cards);
      }, ROUND_REVEAL_DELAY_MS);

      return;
    }

    const nextFoundCorrectIds = new Set(foundCorrectIds);
    nextFoundCorrectIds.add(selectedId);

    setFoundCorrectIds(nextFoundCorrectIds);
    setSelectedId(null);

    if (nextFoundCorrectIds.size >= roundData.correctCount) {
      setScore((previousScore) => previousScore + 1);
      setRoundResult("won");

      window.setTimeout(() => {
        revealAllCards(roundData.cards);
      }, ROUND_REVEAL_DELAY_MS);
    }
  }

  function resetRoundState(nextRoundData) {
    setRoundData(nextRoundData);
    setPreparedRoundData(null);
    setSelectedId(null);
    setFoundCorrectIds(new Set());
    setFailedCardId(null);
    setRevealedIds(new Set());
    setRoundResult("playing");
  }

  function nextRound() {
    if (round >= MAX_ROUNDS) {
      setFinished(true);
      return;
    }

    const nextRoundData =
      preparedRoundData || createRoundFromConditions(availableConditions, roundData?.condition?.id);

    resetRoundState(nextRoundData);
    setRound((previousRound) => previousRound + 1);
  }

  function restartGame() {
    resetRoundState(createRoundFromConditions(availableConditions));
    setScore(0);
    setRound(1);
    setFinished(false);
  }

  if (playableCards.length === 0 || availableConditions.length === 0) {
    return (
      <MessagePanel
        title={translate("impostor.title")}
        action={
          <button type="button" className="im-secondary-button" onClick={onBack}>
            {translate("common.back")}
          </button>
        }
      >
        <p>{translate("impostor.noCards")}</p>
      </MessagePanel>
    );
  }

  if (!roundData) {
    return (
      <MessagePanel title={translate("impostor.loadingGame")} />
    );
  }

  if (finished) {
    return <EndScreen t={translate} score={score} onRestart={restartGame} onBack={onBack} />;
  }

  const progressPercent = (round / MAX_ROUNDS) * 100;
  const foundCount = foundCorrectIds.size;
  const isRoundWon = roundResult === "won";

  return (
    <main className="im-page">
      <section className="im-shell">
        <GameHeader t={t} round={round} score={score} />

        <div className="im-progress-track">
          <span className="im-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        <section className="im-game-layout">
          <ConditionPanel t={translate} condition={roundData.condition} />

          <Board
            locale={locale}
            roundData={roundData}
            selectedId={selectedId}
            foundCorrectIds={foundCorrectIds}
            failedCardId={failedCardId}
            revealedIds={revealedIds}
            roundResult={roundResult}
            onSelect={selectCard}
          />

          <ActionPanel
            t={translate}
            round={round}
            roundResult={roundResult}
            selectedId={selectedId}
            foundCount={foundCount}
            isRoundWon={isRoundWon}
            onCheck={checkSelectedCard}
            onNextRound={nextRound}
          />
        </section>
      </section>
    </main>
  );
}

export default ImpostorGame;
