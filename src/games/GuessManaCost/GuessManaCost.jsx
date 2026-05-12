import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../i18n/LanguageProvider";
import LanguageToggle from "../../shared/components/LanguageToggle/LanguageToggle";
import GuessManaLayoutEditor from "../../dev/GuessManaLayoutEditor";
import GameModeSelect from "../../shared/components/GameModeSelect/GameModeSelect";
import GameResultOverlay from "../../shared/components/GameResultOverlay/GameResultOverlay";
import { GAME_MODE_IDS, getDailyItem } from "../../shared/gameModes/gameModes";
import { ARCANE_BOX_ID, DAILY_REWARD_BOX_AMOUNT, GAME_IDS } from "../../shared/config/gameRules";
import {
  completeDailyChallenge,
  getDailyGameProgress,
  getTodayKey,
  markDailyRewardClaimed,
  saveDailyChallengeResult,
} from "../../shared/progress/dailyProgress";
import { addArcaneBoxReward } from "../../shared/rewards/rewardStore";
import { getCardName } from "../../utils/cardLocale";
import {
  getGuessManaCardImage,
  getNextRandomCard,
  isPlayableGuessManaCard,
  MANA_VALUES,
} from "./guessManaConfig";
import "./GuessManaCost.css";

const GUESS_MANA_GAME_ID = GAME_IDS.GUESS_MANA;

const LOCAL_COPY = {
  es: {
    navMinigames: "Minijuegos",
    navCards: "Base de datos",
    navCollection: "Colección",
    backHome: "Volver a minijuegos",
    modeEyebrow: "Modo de juego",
    modeSelectTitle: "Adivina el coste",
    modeSelectDescription:
      "Observa la carta con el coste de maná oculto y elige cuánto crees que cuesta antes de confirmar.",
    dailyTitle: "Reto diario",
    dailyDescription: "La partida fija de hoy.",
    dailyCompleted: "Ya jugaste el reto de hoy. Puedes volver a verlo cuando quieras.",
    dailyCompletedRewardClaimed:
      "Ya jugaste el reto de hoy. Puedes volver a verlo cuando quieras.",
    dailyMeta: "",
    infiniteTitle: "Modo infinito",
    infiniteDescription: "Juega sin límite.",
    infiniteMeta: "",
    rewardStatus: "Da recompensa",
    noRewardStatus: "Sin recompensa",
    completedStatus: "Completado",
    howToPlayTitle: "Cómo se juega",
    stepHiddenTitle: "El coste está oculto",
    stepHiddenText: "La gema de maná aparece tapada. Mira la carta, lee sus pistas y tira de memoria para adivinar el coste.",
    stepChooseTitle: "Elige un cristal",
    stepChooseText: "Selecciona un coste del 0 al 10. La fila se ilumina al pasar por encima y confirmar bloquea tu respuesta.",
    stepModesTitle: "Dos formas de jugar",
    stepModesText: "Reto diario para la carta del día o modo infinito para practicar sin parar.",
    exampleLabel: "Ejemplo visual del minijuego",
    modeSelectorLabel: "Selecciona modo",
    startMode: "Empezar",
    resultKicker: "Resultado",
    dailyRewardEarned: "Has ganado 1 caja arcana.",
    dailyRewardAlreadyClaimed: "Reto diario completado. Hoy ya tenías esta recompensa.",
    dailyChallenge: "Reto diario",
    infiniteChallenge: "Modo infinito",
    chooseCost: "Elige un coste",
    selectedCost: "Coste seleccionado",
    chooseFirst: "Selecciona una opción para continuar.",
    confirmCost: "Confirmar coste",
    playAgain: "Otra carta",
    viewResults: "Ver resultados",
    correct: "¡Correcto!",
    wrong: "No era ese.",
    resultCostBefore: "cuesta",
    resultCostAfter: "de maná.",
    loadingGame: "Preparando carta...",
    noCards: "No hay cartas disponibles.",
    noImage: "Sin imagen",
  },
  en: {
    navMinigames: "Minigames",
    navCards: "Card database",
    navCollection: "Collection",
    backHome: "Back to minigames",
    modeEyebrow: "Game mode",
    modeSelectTitle: "Guess the Cost",
    modeSelectDescription:
      "Look at the card with its mana cost hidden and choose how much you think it costs before confirming.",
    dailyTitle: "Daily challenge",
    dailyDescription: "Today’s fixed run.",
    dailyCompleted: "You already played today’s challenge. You can jump back in to review it.",
    dailyCompletedRewardClaimed:
      "You already played today’s challenge. You can jump back in to review it.",
    dailyMeta: "",
    infiniteTitle: "Infinite mode",
    infiniteDescription: "Play without limits.",
    infiniteMeta: "",
    rewardStatus: "Reward",
    noRewardStatus: "No reward",
    completedStatus: "Completed",
    howToPlayTitle: "How to play",
    stepHiddenTitle: "The cost is hidden",
    stepHiddenText: "The mana gem is covered. Look at the card, read the clues and use your memory to guess the cost.",
    stepChooseTitle: "Pick a crystal",
    stepChooseText: "Choose a cost from 0 to 10. The row lights up on hover and confirm locks your answer.",
    stepModesTitle: "Two ways to play",
    stepModesText: "Daily challenge for today’s card or infinite mode to practise without stopping.",
    exampleLabel: "Visual example of the minigame",
    modeSelectorLabel: "Select mode",
    startMode: "Start",
    resultKicker: "Result",
    dailyRewardEarned: "You earned 1 arcane box.",
    dailyRewardAlreadyClaimed: "Daily challenge completed. You already had today’s reward.",
    dailyChallenge: "Daily challenge",
    infiniteChallenge: "Infinite mode",
    chooseCost: "Choose a cost",
    selectedCost: "Selected cost",
    chooseFirst: "Select an option to continue.",
    confirmCost: "Confirm cost",
    playAgain: "Another card",
    viewResults: "View results",
    correct: "Correct!",
    wrong: "Not that one.",
    resultCostBefore: "costs",
    resultCostAfter: "mana.",
    loadingGame: "Preparing card...",
    noCards: "No cards available.",
    noImage: "No image",
  },
};

function useGuessManaCopy(locale) {
  return LOCAL_COPY[locale] ?? LOCAL_COPY.es;
}

function GameHeader({ copy, onBack }) {
  return (
    <header className="guess-v3-header">
      <nav className="guess-v3-nav" aria-label="Principal">
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

      <button type="button" className="guess-v3-brand" onClick={onBack} aria-label="Hearthdle">
        <img className="guess-v3-brand-mug is-left" src="/ui/home-v2/header-mug-cropped.png" alt="" />
        <span>Hearthdle</span>
        <img className="guess-v3-brand-mug" src="/ui/home-v2/header-mug-cropped.png" alt="" />
      </button>

      <div className="guess-v3-actions">
        <LanguageToggle compact className="guess-v3-language" />
      </div>
    </header>
  );
}

function CardPreview({ imageSrc, cardName, imageFailed, onImageError, copy, hideManaCover = false }) {
  return (
    <section className="guess-v3-card-wrap">
      <div className="guess-v3-card-frame">
        {!imageFailed ? (
          <img
            src={imageSrc}
            alt={cardName}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            onError={onImageError}
          />
        ) : (
          <div className="guess-v3-card-fallback">{copy.noImage}</div>
        )}
        {!imageFailed && !hideManaCover ? (
          <div className="guess-v3-mana-cover-wrap" aria-hidden="true">
            <img className="guess-v3-mana-cover" src="/ui/games/guess-mana-v3/mana-cover.png" alt="" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function CrystalDisplay({ value, label, isAnswered, isCorrect }) {
  return (
    <div className={`guess-v3-selected-crystal ${isAnswered ? (isCorrect ? "is-correct" : "is-wrong") : ""}`}>
      <span className="guess-v3-selected-label">{label}</span>
      <div className="guess-v3-crystal-shell" aria-hidden="true">
        <img src="/ui/games/guess-mana-v3/mana-crystal.png" alt="" />
        <strong>{value ?? "?"}</strong>
      </div>
    </div>
  );
}

function ManaSelector({
  hasAnswered,
  pendingCost,
  selectedCost,
  correctCost,
  hoveredCost,
  onHoverCost,
  onLeaveCost,
  onPickCost,
}) {
  const manaRows = [MANA_VALUES.slice(0, 6), MANA_VALUES.slice(6)];

  return (
    <div className="guess-v3-mana-grid" onMouseLeave={onLeaveCost}>
      {manaRows.map((row, rowIndex) => (
        <div key={rowIndex} className="guess-v3-mana-row">
          {row.map((cost) => {
            const isGlowing = !hasAnswered
              ? hoveredCost !== null
                ? cost <= hoveredCost
                : pendingCost !== null && cost <= pendingCost
              : false;
            const classNames = ["guess-v3-mana-button"];

            classNames.push(isGlowing ? "is-on" : "is-off");
            if (!hasAnswered && pendingCost === cost) classNames.push("is-selected");
            if (hasAnswered && cost === correctCost) classNames.push("is-correct");
            if (hasAnswered && cost === selectedCost && cost !== correctCost) classNames.push("is-wrong");

            return (
              <button
                key={cost}
                type="button"
                className={classNames.join(" ")}
                onClick={() => onPickCost(cost)}
                onMouseEnter={() => onHoverCost(cost)}
                onFocus={() => onHoverCost(cost)}
                onBlur={onLeaveCost}
                disabled={hasAnswered}
                aria-pressed={!hasAnswered && pendingCost === cost}
              >
                <img src="/ui/games/guess-mana-v3/mana-crystal.png" alt="" aria-hidden="true" />
                <span>{cost}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function ResultOverlay({ copy, isCorrect, cardName, correctCost, rewardMessage, onViewResults, onBack }) {
  return (
    <GameResultOverlay
      tone={isCorrect ? "success" : "danger"}
      kicker={copy.resultKicker}
      title={isCorrect ? copy.correct : copy.wrong}
      rewardMessage={rewardMessage}
      detail={(
        <>
          <strong className="guess-v3-result-card-name">{cardName}</strong>
          <div className="guess-v3-result-cost-row">
            <span className="guess-v3-result-cost-line">{copy.resultCostBefore}</span>
            <div className="guess-v3-result-cost-crystal" aria-hidden="true">
              <img src="/ui/games/guess-mana-v3/mana-crystal.png" alt="" />
              <span>{correctCost}</span>
            </div>
            <span className="guess-v3-result-cost-line">{copy.resultCostAfter}</span>
          </div>
        </>
      )}
      primaryAction={{ label: copy.viewResults, onClick: onViewResults }}
      secondaryActions={[{ label: copy.backHome, onClick: onBack }]}
    />
  );
}

function EmptyState({ copy, title, onBack }) {
  return (
    <main className="guess-v3-page">
      <GameHeader copy={copy} onBack={onBack} />
      <section className="guess-v3-shell">
        <section className="guess-v3-empty-state">
          <h2>{title}</h2>
          <button type="button" className="guess-v3-button is-secondary" onClick={onBack}>
            {copy.backHome}
          </button>
        </section>
      </section>
    </main>
  );
}

function GuessManaCost({ cards = [], onBack }) {
  const { locale } = useLanguage();
  const copy = useGuessManaCopy(locale);
  const showLayoutEditor =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("layoutEditor") === "1";
  const todayKey = useMemo(() => getTodayKey(), []);

  const playableCards = useMemo(() => {
    return cards.filter((card) => isPlayableGuessManaCard(card, locale));
  }, [cards, locale]);

  const sortedPlayableCards = useMemo(() => {
    return [...playableCards].sort((a, b) => String(a.id).localeCompare(String(b.id)));
  }, [playableCards]);

  const [selectedMode, setSelectedMode] = useState(null);
  const [currentCard, setCurrentCard] = useState(null);
  const [pendingCost, setPendingCost] = useState(null);
  const [selectedCost, setSelectedCost] = useState(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [hoveredCost, setHoveredCost] = useState(null);
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const [dailyProgress, setDailyProgress] = useState(() => getDailyGameProgress(GUESS_MANA_GAME_ID, todayKey));
  const [rewardMessage, setRewardMessage] = useState("");

  const dailyCard = useMemo(() => {
    return getDailyItem(sortedPlayableCards, GUESS_MANA_GAME_ID, todayKey);
  }, [sortedPlayableCards, todayKey]);

  useEffect(() => {
    setDailyProgress(getDailyGameProgress(GUESS_MANA_GAME_ID, todayKey));
  }, [todayKey]);

  useEffect(() => {
    if (playableCards.length === 0 || currentCard || !selectedMode) return;

    if (selectedMode === GAME_MODE_IDS.DAILY) {
      setCurrentCard(dailyCard);
      return;
    }

    setCurrentCard(getNextRandomCard(playableCards));
  }, [playableCards, currentCard, selectedMode, dailyCard]);

  useEffect(() => {
    setImageFailed(false);
  }, [locale, currentCard?.id]);

  function resetAnswerState() {
    setPendingCost(null);
    setSelectedCost(null);
    setImageFailed(false);
    setHoveredCost(null);
    setRewardMessage("");
    setShowResultOverlay(false);
  }

  function loadCard(excludeId) {
    const nextCard = getNextRandomCard(playableCards, excludeId);
    setCurrentCard(nextCard);
    resetAnswerState();
  }

  function startMode(modeId) {
    const latestDailyProgress = getDailyGameProgress(GUESS_MANA_GAME_ID, todayKey);
    setDailyProgress(latestDailyProgress);
    setSelectedMode(modeId);
    resetAnswerState();

    if (modeId === GAME_MODE_IDS.DAILY) {
      setCurrentCard(dailyCard);

      if (
        latestDailyProgress.completed &&
        latestDailyProgress.lastCardId === dailyCard?.id &&
        typeof latestDailyProgress.lastSelectedCost === "number"
      ) {
        setPendingCost(latestDailyProgress.lastSelectedCost);
        setSelectedCost(latestDailyProgress.lastSelectedCost);
      }

      return;
    }

    setCurrentCard(getNextRandomCard(playableCards));
  }

  function returnToModes() {
    setSelectedMode(null);
    setCurrentCard(null);
    resetAnswerState();
    setDailyProgress(getDailyGameProgress(GUESS_MANA_GAME_ID, todayKey));
  }

  function confirmCost() {
    if (pendingCost === null || selectedCost !== null) return;

    const nextSelectedCost = pendingCost;
    const answeredCorrectly = nextSelectedCost === currentCard.cost;

    setSelectedCost(nextSelectedCost);
    setShowResultOverlay(true);

    if (selectedMode !== GAME_MODE_IDS.DAILY) return;

    completeDailyChallenge(GUESS_MANA_GAME_ID, todayKey);
    saveDailyChallengeResult(GUESS_MANA_GAME_ID, todayKey, {
      lastSelectedCost: nextSelectedCost,
      lastCorrectCost: currentCard.cost,
      lastCardId: currentCard.id,
      lastWasCorrect: answeredCorrectly,
    });

    let latestProgress = getDailyGameProgress(GUESS_MANA_GAME_ID, todayKey);

    if (!answeredCorrectly) {
      setDailyProgress(latestProgress);
      return;
    }

    if (!latestProgress.rewardClaimed) {
      addArcaneBoxReward({
        boxId: ARCANE_BOX_ID,
        amount: DAILY_REWARD_BOX_AMOUNT,
        source: GUESS_MANA_GAME_ID,
        dateKey: todayKey,
      });
      latestProgress = markDailyRewardClaimed(GUESS_MANA_GAME_ID, todayKey);
      setRewardMessage(copy.dailyRewardEarned);
    } else {
      setRewardMessage(copy.dailyRewardAlreadyClaimed);
    }

    setDailyProgress(latestProgress);
  }

  if (playableCards.length === 0) {
    return <EmptyState copy={copy} title={copy.noCards} onBack={onBack} />;
  }

  if (!selectedMode) {
    return (
      <main className="guess-v3-page">
        <GameHeader copy={copy} onBack={onBack} />
        <section className="guess-v3-shell is-mode-select">
          <GameModeSelect
            copy={copy}
            title={copy.modeSelectTitle}
            dailyCompleted={dailyProgress.completed}
            previewSrc="/ui/games/guess-mana-v3/mode-example.png"
            previewAlt={copy.exampleLabel}
            onSelectMode={startMode}
          />
        </section>
        {showLayoutEditor ? <GuessManaLayoutEditor /> : null}
      </main>
    );
  }

  if (!currentCard) {
    return <EmptyState copy={copy} title={copy.loadingGame} onBack={onBack} />;
  }

  const hasAnswered = selectedCost !== null;
  const isCorrect = hasAnswered && selectedCost === currentCard.cost;
  const currentCardName = getCardName(currentCard, locale);
  const imageSrc = getGuessManaCardImage(currentCard, locale);
  const displayedCrystalValue = hasAnswered ? selectedCost : pendingCost;

  return (
    <main className="guess-v3-page">
      <GameHeader copy={copy} onBack={onBack} />

      <section className="guess-v3-shell">
        <div className="guess-v3-mode-pill">
          {selectedMode === GAME_MODE_IDS.DAILY ? copy.dailyChallenge : copy.infiniteChallenge}
        </div>

        <section className="guess-v3-stage" aria-label={currentCardName}>
          <CardPreview
            imageSrc={imageSrc}
            cardName={currentCardName}
            imageFailed={imageFailed}
            onImageError={() => setImageFailed(true)}
            copy={copy}
            hideManaCover={hasAnswered}
          />

          <div className="guess-v3-controls">
            <CrystalDisplay
              value={displayedCrystalValue}
              label={copy.selectedCost}
              isAnswered={hasAnswered}
              isCorrect={isCorrect}
            />

            <p className="guess-v3-selector-title">{copy.chooseCost}</p>

            <ManaSelector
              hasAnswered={hasAnswered}
              pendingCost={pendingCost}
              selectedCost={selectedCost}
              correctCost={currentCard.cost}
              hoveredCost={hoveredCost}
              onHoverCost={setHoveredCost}
              onLeaveCost={() => setHoveredCost(null)}
              onPickCost={(cost) => {
                setPendingCost(cost);
                setHoveredCost(cost);
              }}
            />

            {!hasAnswered ? (
              <button
                type="button"
                className="guess-v3-button is-primary is-confirm"
                disabled={pendingCost === null}
                onClick={confirmCost}
              >
                {copy.confirmCost}
              </button>
            ) : null}

            {hasAnswered && !showResultOverlay && selectedMode === GAME_MODE_IDS.INFINITE ? (
              <button type="button" className="guess-v3-button is-primary is-confirm" onClick={() => loadCard(currentCard?.id)}>
                {copy.playAgain}
              </button>
            ) : null}
          </div>
        </section>
      </section>

      {showResultOverlay && hasAnswered ? (
        <ResultOverlay
          copy={copy}
          isCorrect={isCorrect}
          cardName={currentCardName}
          correctCost={currentCard.cost}
          rewardMessage={rewardMessage}
          onViewResults={() => setShowResultOverlay(false)}
          onBack={returnToModes}
        />
      ) : null}

      {showLayoutEditor ? <GuessManaLayoutEditor /> : null}
    </main>
  );
}

export default GuessManaCost;
