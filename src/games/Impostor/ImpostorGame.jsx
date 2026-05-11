import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../i18n/LanguageProvider";
import LanguageToggle from "../../shared/components/LanguageToggle/LanguageToggle";
import GameModeSelect from "../../shared/components/GameModeSelect/GameModeSelect";
import { GAME_MODE_IDS } from "../../shared/gameModes/gameModes";
import { ARCANE_BOX_ID, DAILY_REWARD_BOX_AMOUNT, GAME_IDS } from "../../shared/config/gameRules";
import {
  completeDailyChallenge,
  getDailyGameProgress,
  getTodayKey,
  markDailyRewardClaimed,
  saveDailyChallengeResult,
} from "../../shared/progress/dailyProgress";
import { addArcaneBoxReward } from "../../shared/rewards/rewardStore";
import ImpostorNeutralCard from "./ImpostorNeutralCard";
import {
  CORRECT_COUNT,
  ROUND_REVEAL_DELAY_MS,
  buildConditions,
  createDailyRoundFromConditions,
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

const IMPOSTOR_GAME_ID = GAME_IDS.IMPOSTOR;

const IMPOSTOR_COPY = {
  es: {
    navMinigames: "Minijuegos",
    navCards: "Base de datos",
    navCollection: "Colección",
    title: "Encuentra el impostor",
    exampleLabel: "Ejemplo del minijuego Encuentra el impostor",
    howToPlayTitle: "Cómo se juega",
    stepHiddenIcon: "?",
    stepHiddenTitle: "Hay una categoría",
    stepHiddenText: "Todas las cartas buenas cumplen la categoría del día. Lee bien el objetivo antes de elegir.",
    stepChooseIcon: "✓",
    stepChooseIconSrc: "",
    stepChooseTitle: "Encuentra las correctas",
    stepChooseText: "Selecciona las cartas que encajan. Cada acierto se descubre y te acerca al objetivo.",
    stepModesIcon: "×",
    stepModesTitle: "Evita al impostor",
    stepModesText: "Si eliges una carta que no cumple la categoría, la ronda termina y se revelan los resultados.",
    modeSelectorLabel: "Selecciona modo",
    dailyTitle: "Reto diario",
    infiniteTitle: "Modo infinito",
    completedStatus: "Completado",
    startMode: "Empezar",
    dailyChallenge: "Reto diario",
    infiniteChallenge: "Modo infinito",
    dailyRewardEarned: "Has ganado 1 caja arcana.",
    dailyRewardAlreadyClaimed: "Reto diario completado. Hoy ya tenías esta recompensa.",
    category: "Categoría",
    objective: "Encuentra las cartas correctas y evita los impostores.",
    found: "{found} / {total} encontradas",
    foundLabel: "Cartas encontradas",
    selectPrompt: "Elige una carta",
    selectedPrompt: "Carta seleccionada",
    confirm: "Comprobar carta",
    noCards: "No hay cartas suficientes para crear una partida.",
    loading: "Preparando partida...",
    winTitle: "¡Perfecto!",
    winText: "Has encontrado todas las cartas correctas.",
    loseTitle: "Era un impostor",
    loseText: "La carta elegida no cumplía la categoría.",
    newGame: "Otra partida",
    backHome: "Volver",
    result: "Resultado",
    viewResults: "Ver resultados",
    playAgain: "Otra partida",
    allFound: "Has encontrado todas las cartas correctas.",
    correctMark: "Correcta",
    impostorMark: "Impostor",
  },
  en: {
    navMinigames: "Minigames",
    navCards: "Card database",
    navCollection: "Collection",
    title: "Find the Impostor",
    exampleLabel: "Find the Impostor minigame example",
    howToPlayTitle: "How to play",
    stepHiddenIcon: "?",
    stepHiddenTitle: "There is a category",
    stepHiddenText: "Every good card matches the daily category. Read the target before you pick.",
    stepChooseIcon: "✓",
    stepChooseIconSrc: "",
    stepChooseTitle: "Find the correct ones",
    stepChooseText: "Select the cards that fit. Every correct pick is revealed and gets you closer.",
    stepModesIcon: "×",
    stepModesTitle: "Avoid the impostor",
    stepModesText: "Pick a card that does not match and the round ends with the results revealed.",
    modeSelectorLabel: "Select mode",
    dailyTitle: "Daily challenge",
    infiniteTitle: "Infinite mode",
    completedStatus: "Completed",
    startMode: "Start",
    dailyChallenge: "Daily challenge",
    infiniteChallenge: "Infinite mode",
    dailyRewardEarned: "You earned 1 arcane box.",
    dailyRewardAlreadyClaimed: "Daily challenge completed. You already had today’s reward.",
    category: "Category",
    objective: "Find the correct cards and avoid the impostors.",
    found: "{found} / {total} found",
    foundLabel: "Cards found",
    selectPrompt: "Choose a card",
    selectedPrompt: "Selected card",
    confirm: "Check card",
    noCards: "There are not enough cards to create a game.",
    loading: "Preparing game...",
    winTitle: "Perfect!",
    winText: "You found every correct card.",
    loseTitle: "That was an impostor",
    loseText: "The chosen card did not match the category.",
    newGame: "Another game",
    backHome: "Back",
    result: "Result",
    viewResults: "View results",
    playAgain: "Another game",
    allFound: "You found every correct card.",
    correctMark: "Correct",
    impostorMark: "Impostor",
  },
};

function formatCopy(template, values = {}) {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);
}

function useImpostorCopy(locale) {
  return IMPOSTOR_COPY[locale] ?? IMPOSTOR_COPY.es;
}

function GameHeader({ copy, onBack }) {
  return (
    <header className="im-v2-header">
      <nav className="im-v2-nav" aria-label="Principal">
        <button type="button" className="is-active" onClick={onBack}>
          {copy.navMinigames}
        </button>
        <button type="button" disabled>
          {copy.navCards}
        </button>
        <button type="button" disabled>
          {copy.navCollection}
        </button>
      </nav>

      <button type="button" className="im-v2-brand" onClick={onBack} aria-label="Hearthdle">
        <img className="im-v2-brand-mug is-left" src="/ui/home-v2/header-mug-cropped.png" alt="" />
        <span>Hearthdle</span>
        <img className="im-v2-brand-mug" src="/ui/home-v2/header-mug-cropped.png" alt="" />
      </button>

      <div className="im-v2-actions">
        <LanguageToggle compact className="im-v2-language" />
      </div>
    </header>
  );
}

function MessagePanel({ copy, title, onBack }) {
  return (
    <main className="im-page">
      <GameHeader copy={copy} onBack={onBack} />
      <section className="im-shell">
        <section className="im-message-panel">
          <h1>{title}</h1>
          <button type="button" className="im-secondary-button" onClick={onBack}>
            {copy.backHome}
          </button>
        </section>
      </section>
    </main>
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

function ActionBar({ copy, selectedCardName, roundResult, foundCount, onCheck }) {
  if (roundResult !== "playing") return null;

  return (
    <section className="im-action-bar">
      <div className="im-found-counter" aria-live="polite">
        <span>{copy.foundLabel}</span>
        <strong>
          {foundCount} / {CORRECT_COUNT}
        </strong>
      </div>

      {selectedCardName ? (
        <div className="im-selected-card-pill">
          <span>{copy.selectedPrompt}</span>
          <strong>{selectedCardName}</strong>
        </div>
      ) : null}

      <button
        type="button"
        className="im-primary-button"
        disabled={!selectedCardName}
        onClick={onCheck}
      >
        {copy.confirm}
      </button>
    </section>
  );
}

function ResultOverlay({
  copy,
  isWon,
  failedCardId,
  roundData,
  locale,
  rewardMessage,
  restartLabel,
  onRestart,
  onShowResults,
}) {
  const failedCard = failedCardId ? roundData.cards.find((card) => card.id === failedCardId) : null;
  const confettiPieces = Array.from({ length: 34 });

  return (
    <div className="im-result-backdrop" role="presentation">
      <section className={`im-result-card ${isWon ? "is-won" : "is-lost"}`} role="status" aria-live="polite">
        {isWon ? (
          <div className="im-result-confetti" aria-hidden="true">
            {confettiPieces.map((_, index) => {
              const angle = (Math.PI * 2 * index) / confettiPieces.length;
              const distance = 120 + (index % 5) * 22;
              const x = Math.cos(angle) * distance;
              const y = Math.sin(angle) * distance - 22;
              const rotation = index * 37;

              return (
                <span
                  key={index}
                  style={{
                    "--x": `${x.toFixed(0)}px`,
                    "--y": `${y.toFixed(0)}px`,
                    "--r": `${rotation}deg`,
                    "--delay": `${(index % 8) * 26}ms`,
                  }}
                />
              );
            })}
          </div>
        ) : null}

        <div className="im-result-icon" aria-hidden="true">
          <span>{isWon ? "✓" : "×"}</span>
        </div>

        {isWon ? (
          <>
            <h2>{copy.winTitle}</h2>
            <p>{copy.allFound}</p>
          </>
        ) : (
          <>
            <div className="im-result-card-name">{failedCard ? getCardName(failedCard, locale) : ""}</div>
            <h2>{copy.loseTitle}</h2>
          </>
        )}

        {rewardMessage ? <p className="im-result-reward-message">{rewardMessage}</p> : null}

        <div className="im-result-actions is-centered">
          <button type="button" className="im-secondary-button" onClick={onShowResults}>
            {copy.viewResults}
          </button>
          <button type="button" className="im-primary-button" onClick={onRestart}>
            {restartLabel ?? copy.playAgain}
          </button>
        </div>
      </section>
    </div>
  );
}

function ImpostorGame({ cards, onBack }) {
  const { locale, t: translate } = useLanguage();
  const copy = useImpostorCopy(locale);
  const todayKey = useMemo(() => getTodayKey(), []);

  const playableCards = useMemo(() => {
    return cards.filter(
      (card) => card.id && getCardName(card, locale) && getCardImage(card, locale) && isAllowedType(card)
    );
  }, [cards, locale]);

  const availableConditions = useMemo(
    () => buildConditions(playableCards, locale, translate),
    [playableCards, locale, translate]
  );

  const dailyRoundData = useMemo(() => {
    return createDailyRoundFromConditions(availableConditions, IMPOSTOR_GAME_ID, todayKey);
  }, [availableConditions, todayKey]);

  const [selectedMode, setSelectedMode] = useState(null);
  const [roundData, setRoundData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [foundCorrectIds, setFoundCorrectIds] = useState(new Set());
  const [failedCardId, setFailedCardId] = useState(null);
  const [revealedIds, setRevealedIds] = useState(new Set());
  const [roundResult, setRoundResult] = useState("playing");
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const [dailyProgress, setDailyProgress] = useState(() => getDailyGameProgress(IMPOSTOR_GAME_ID, todayKey));
  const [rewardMessage, setRewardMessage] = useState("");

  useEffect(() => {
    setDailyProgress(getDailyGameProgress(IMPOSTOR_GAME_ID, todayKey));
  }, [todayKey]);

  useEffect(() => {
    if (!roundData) return;
    preloadRoundImages(roundData, locale, "high");
  }, [roundData, locale]);

  function revealAllCards(cardsToReveal = roundData?.cards ?? []) {
    setRevealedIds(new Set(cardsToReveal.map((card) => card.id)));
  }

  function resetGame(nextRoundData) {
    setRoundData(nextRoundData);
    setSelectedId(null);
    setFoundCorrectIds(new Set());
    setFailedCardId(null);
    setRevealedIds(new Set());
    setRoundResult("playing");
    setShowResultOverlay(false);
    setRewardMessage("");
  }

  function restoreCompletedDailyRound(nextRoundData, progress) {
    setRoundData(nextRoundData);
    setSelectedId(null);
    setFoundCorrectIds(new Set(progress.foundCorrectIds ?? []));
    setFailedCardId(progress.failedCardId ?? null);
    setRevealedIds(new Set(nextRoundData?.cards?.map((card) => card.id) ?? []));
    setRoundResult(progress.lastWasWon ? "won" : "lost");
    setShowResultOverlay(false);
    setRewardMessage("");
  }

  function startMode(modeId) {
    const latestProgress = getDailyGameProgress(IMPOSTOR_GAME_ID, todayKey);
    setDailyProgress(latestProgress);
    setSelectedMode(modeId);

    if (modeId === GAME_MODE_IDS.DAILY) {
      if (latestProgress.completed && dailyRoundData) {
        restoreCompletedDailyRound(dailyRoundData, latestProgress);
        return;
      }

      resetGame(dailyRoundData);
      return;
    }

    resetGame(createRoundFromConditions(availableConditions));
  }

  function returnToModes() {
    setSelectedMode(null);
    setRoundData(null);
    setSelectedId(null);
    setFoundCorrectIds(new Set());
    setFailedCardId(null);
    setRevealedIds(new Set());
    setRoundResult("playing");
    setShowResultOverlay(false);
    setRewardMessage("");
    setDailyProgress(getDailyGameProgress(IMPOSTOR_GAME_ID, todayKey));
  }

  function saveDailyResult({ isWon, failedId = null, foundIds = foundCorrectIds } = {}) {
    if (selectedMode !== GAME_MODE_IDS.DAILY || !roundData) return;

    completeDailyChallenge(IMPOSTOR_GAME_ID, todayKey);
    saveDailyChallengeResult(IMPOSTOR_GAME_ID, todayKey, {
      lastWasWon: isWon,
      lastConditionId: roundData.condition.id,
      lastRoundId: roundData.id,
      failedCardId: failedId,
      foundCorrectIds: Array.from(foundIds),
    });

    let latestProgress = getDailyGameProgress(IMPOSTOR_GAME_ID, todayKey);

    if (isWon) {
      if (!latestProgress.rewardClaimed) {
        addArcaneBoxReward({
          boxId: ARCANE_BOX_ID,
          amount: DAILY_REWARD_BOX_AMOUNT,
          source: IMPOSTOR_GAME_ID,
          dateKey: todayKey,
        });
        latestProgress = markDailyRewardClaimed(IMPOSTOR_GAME_ID, todayKey);
        setRewardMessage(copy.dailyRewardEarned);
      } else {
        setRewardMessage(copy.dailyRewardAlreadyClaimed);
      }
    }

    setDailyProgress(latestProgress);
  }

  function selectCard(cardId) {
    if (roundResult !== "playing" || revealedIds.has(cardId)) return;
    setSelectedId((previousSelectedId) => (previousSelectedId === cardId ? null : cardId));
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
      setShowResultOverlay(true);
      saveDailyResult({ isWon: false, failedId: selectedId });

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
      setRoundResult("won");
      setShowResultOverlay(true);
      saveDailyResult({ isWon: true, foundIds: nextFoundCorrectIds });

      window.setTimeout(() => {
        revealAllCards(roundData.cards);
      }, ROUND_REVEAL_DELAY_MS);
    }
  }

  function startNewGame() {
    if (selectedMode === GAME_MODE_IDS.DAILY) {
      returnToModes();
      return;
    }

    resetGame(createRoundFromConditions(availableConditions, roundData?.condition?.id));
  }

  if (playableCards.length === 0 || availableConditions.length === 0) {
    return <MessagePanel copy={copy} title={copy.noCards} onBack={onBack} />;
  }

  if (!selectedMode) {
    return (
      <main className="im-page">
        <GameHeader copy={copy} onBack={onBack} />
        <section className="im-shell is-mode-select">
          <GameModeSelect
            copy={copy}
            title={copy.title}
            dailyCompleted={dailyProgress.completed}
            previewSrc="/ui/games/impostor-v2/mode-example.svg"
            previewAlt={copy.exampleLabel}
            onSelectMode={startMode}
          />
        </section>
      </main>
    );
  }

  if (!roundData) {
    return <MessagePanel copy={copy} title={copy.loading} onBack={onBack} />;
  }

  const foundCount = foundCorrectIds.size;
  const isRoundWon = roundResult === "won";
  const selectedCardName = selectedId
    ? getCardName(roundData.cards.find((card) => card.id === selectedId), locale)
    : "";

  return (
    <main className="im-page">
      <GameHeader copy={copy} onBack={onBack} />

      <section className="im-shell">
        <div className="im-v2-mode-pill">
          {selectedMode === GAME_MODE_IDS.DAILY ? copy.dailyChallenge : copy.infiniteChallenge}
        </div>

        <section className="im-intro-row" aria-label={copy.category}>
          <div>
            <p className="im-mode-label">{copy.category}</p>
            <h1>{roundData.condition.title}</h1>
          </div>
        </section>

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

        <ActionBar
          copy={copy}
          selectedCardName={selectedCardName}
          roundResult={roundResult}
          foundCount={foundCount}
          onCheck={checkSelectedCard}
        />

        {selectedMode === GAME_MODE_IDS.INFINITE && roundResult !== "playing" && !showResultOverlay ? (
          <div className="im-post-result-actions">
            <button type="button" className="im-primary-button" onClick={startNewGame}>
              {copy.playAgain}
            </button>
          </div>
        ) : null}
      </section>

      {roundResult !== "playing" && showResultOverlay ? (
        <ResultOverlay
          copy={copy}
          isWon={isRoundWon}
          failedCardId={failedCardId}
          roundData={roundData}
          locale={locale}
          rewardMessage={rewardMessage}
          restartLabel={selectedMode === GAME_MODE_IDS.DAILY ? copy.backHome : copy.playAgain}
          onRestart={startNewGame}
          onShowResults={() => setShowResultOverlay(false)}
        />
      ) : null}
    </main>
  );
}
export default ImpostorGame;
