import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../i18n/LanguageProvider";
import GameModeSelect from "../../shared/components/GameModeSelect/GameModeSelect";
import GamePageShell from "../../shared/components/GamePageShell/GamePageShell";
import { getGameIntroCopy } from "../../shared/config/gameIntroCopy";
import { ARCANE_BOX_ID, DAILY_REWARD_BOX_AMOUNT, GAME_IDS } from "../../shared/config/gameRules";
import { GAME_MODE_IDS, getDailyItem } from "../../shared/gameModes/gameModes";
import {
  completeDailyChallenge,
  getDailyGameProgress,
  getTodayKey,
  markDailyRewardClaimed,
  saveDailyChallengeResult,
} from "../../shared/progress/dailyProgress";
import { addArcaneBoxReward } from "../../shared/rewards/rewardStore";
import { getCardName } from "../../utils/cardLocale";
import GuessManaEmptyState from "./components/GuessManaEmptyState";
import GuessManaResultOverlay from "./components/GuessManaResultOverlay";
import GuessManaStage from "./components/GuessManaStage";
import { getGuessManaCopy } from "./guessManaCopy";
import {
  getGuessManaCardImage,
  getNextRandomCard,
  isPlayableGuessManaCard,
} from "./guessManaConfig";
import "./GuessManaCost.css";

const GuessManaLayoutEditor = lazy(() => import("../../dev/GuessManaLayoutEditor"));

const GUESS_MANA_GAME_ID = GAME_IDS.GUESS_MANA;

function getLayoutEditorEnabled() {
  return (
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("layoutEditor") === "1"
  );
}

function GuessManaCost({ cards = [], onBack }) {
  const { locale } = useLanguage();
  const copy = useMemo(() => getGuessManaCopy(locale), [locale]);
  const introCopy = useMemo(() => getGameIntroCopy(GUESS_MANA_GAME_ID, locale), [locale]);
  const showLayoutEditor = useMemo(() => getLayoutEditorEnabled(), []);
  const todayKey = useMemo(() => getTodayKey(), []);

  const playableCards = useMemo(() => {
    return cards.filter((card) => isPlayableGuessManaCard(card, locale));
  }, [cards, locale]);

  const sortedPlayableCards = useMemo(() => {
    return [...playableCards].sort((a, b) => String(a.id).localeCompare(String(b.id)));
  }, [playableCards]);

  const dailyCard = useMemo(() => {
    return getDailyItem(sortedPlayableCards, GUESS_MANA_GAME_ID, todayKey);
  }, [sortedPlayableCards, todayKey]);

  const [selectedMode, setSelectedMode] = useState(null);
  const [currentCard, setCurrentCard] = useState(null);
  const [pendingCost, setPendingCost] = useState(null);
  const [selectedCost, setSelectedCost] = useState(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [hoveredCost, setHoveredCost] = useState(null);
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const [dailyProgress, setDailyProgress] = useState(() => getDailyGameProgress(GUESS_MANA_GAME_ID, todayKey));
  const [rewardMessage, setRewardMessage] = useState("");

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

  function restoreDailyAnswer(latestDailyProgress, card) {
    if (
      latestDailyProgress.completed &&
      latestDailyProgress.lastCardId === card?.id &&
      typeof latestDailyProgress.lastSelectedCost === "number"
    ) {
      setPendingCost(latestDailyProgress.lastSelectedCost);
      setSelectedCost(latestDailyProgress.lastSelectedCost);
    }
  }

  function startMode(modeId) {
    const latestDailyProgress = getDailyGameProgress(GUESS_MANA_GAME_ID, todayKey);
    setDailyProgress(latestDailyProgress);
    setSelectedMode(modeId);
    resetAnswerState();

    if (modeId === GAME_MODE_IDS.DAILY) {
      setCurrentCard(dailyCard);
      restoreDailyAnswer(latestDailyProgress, dailyCard);
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

  function grantDailyReward() {
    let latestProgress = getDailyGameProgress(GUESS_MANA_GAME_ID, todayKey);

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

  function saveDailyAnswer(nextSelectedCost, answeredCorrectly) {
    completeDailyChallenge(GUESS_MANA_GAME_ID, todayKey);
    saveDailyChallengeResult(GUESS_MANA_GAME_ID, todayKey, {
      lastSelectedCost: nextSelectedCost,
      lastCorrectCost: currentCard.cost,
      lastCardId: currentCard.id,
      lastWasCorrect: answeredCorrectly,
    });

    if (answeredCorrectly) {
      grantDailyReward();
      return;
    }

    setDailyProgress(getDailyGameProgress(GUESS_MANA_GAME_ID, todayKey));
  }

  function confirmCost() {
    if (pendingCost === null || selectedCost !== null) return;

    const nextSelectedCost = pendingCost;
    const answeredCorrectly = nextSelectedCost === currentCard.cost;

    setSelectedCost(nextSelectedCost);
    setShowResultOverlay(true);

    if (selectedMode === GAME_MODE_IDS.DAILY) {
      saveDailyAnswer(nextSelectedCost, answeredCorrectly);
    }
  }

  if (playableCards.length === 0) {
    return <GuessManaEmptyState copy={copy} title={copy.noCards} onBack={onBack} />;
  }

  if (!selectedMode) {
    return (
      <GamePageShell className="guess-v3-page">
        <section className="guess-v3-shell is-mode-select">
          <GameModeSelect
            copy={introCopy}
            dailyCompleted={dailyProgress.completed}
            onSelectMode={startMode}
          />
        </section>
        {showLayoutEditor ? (
          <Suspense fallback={null}>
            <GuessManaLayoutEditor />
          </Suspense>
        ) : null}
      </GamePageShell>
    );
  }

  if (!currentCard) {
    return <GuessManaEmptyState copy={copy} title={copy.loadingGame} onBack={onBack} />;
  }

  const hasAnswered = selectedCost !== null;
  const isCorrect = hasAnswered && selectedCost === currentCard.cost;
  const currentCardName = getCardName(currentCard, locale);
  const imageSrc = getGuessManaCardImage(currentCard, locale);
  const displayedCrystalValue = hasAnswered ? selectedCost : pendingCost;
  const isInfiniteMode = selectedMode === GAME_MODE_IDS.INFINITE;
  const isDailyMode = selectedMode === GAME_MODE_IDS.DAILY;

  return (
    <GamePageShell className="guess-v3-page">
      <section className="guess-v3-shell">
        <div className="guess-v3-mode-pill">
          {isDailyMode ? copy.dailyChallenge : copy.infiniteChallenge}
        </div>

        <GuessManaStage
          copy={copy}
          cardName={currentCardName}
          imageSrc={imageSrc}
          imageFailed={imageFailed}
          onImageError={() => setImageFailed(true)}
          hasAnswered={hasAnswered}
          isCorrect={isCorrect}
          displayedCrystalValue={displayedCrystalValue}
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
          onConfirmCost={confirmCost}
          onPlayAgain={() => loadCard(currentCard?.id)}
          showPlayAgain={hasAnswered && !showResultOverlay && isInfiniteMode}
        />
      </section>

      {showResultOverlay && hasAnswered ? (
        <GuessManaResultOverlay
          copy={copy}
          isCorrect={isCorrect}
          cardName={currentCardName}
          correctCost={currentCard.cost}
          rewardMessage={rewardMessage}
          onViewResults={() => setShowResultOverlay(false)}
          onBack={returnToModes}
        />
      ) : null}

      {showLayoutEditor ? (
        <Suspense fallback={null}>
          <GuessManaLayoutEditor />
        </Suspense>
      ) : null}
    </GamePageShell>
  );
}

export default GuessManaCost;
