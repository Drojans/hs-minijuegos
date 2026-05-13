import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../i18n/LanguageProvider";
import GameModeSelect from "../../shared/components/GameModeSelect/GameModeSelect";
import GamePageShell from "../../shared/components/GamePageShell/GamePageShell";
import RarityBadge from "../../shared/components/RarityBadge/RarityBadge";
import GamePreparingOverlay from "../../shared/components/GamePreparingOverlay/GamePreparingOverlay";
import { getGameIntroCopy } from "../../shared/config/gameIntroCopy";
import { ARCANE_BOX_ID, DAILY_REWARD_BOX_AMOUNT, GAME_IDS } from "../../shared/config/gameRules";
import { GAME_MODE_IDS } from "../../shared/gameModes/gameModes";
import usePreparationGate from "../../shared/hooks/usePreparationGate";
import {
  completeDailyChallenge,
  getDailyGameProgress,
  getTodayKey,
  markDailyRewardClaimed,
  saveDailyChallengeResult,
} from "../../shared/progress/dailyProgress";
import { addArcaneBoxReward } from "../../shared/rewards/rewardStore";
import ImpostorActionBar from "./components/ImpostorActionBar";
import ImpostorBoard from "./components/ImpostorBoard";
import { getNeutralCardImageSources } from "./ImpostorNeutralCard";
import ImpostorMessagePanel from "./components/ImpostorMessagePanel";
import ImpostorResultOverlay from "./components/ImpostorResultOverlay";
import { getImpostorCopy } from "./impostorCopy";
import {
  ROUND_REVEAL_DELAY_MS,
  buildConditions,
  createDailyRoundFromConditions,
  createRoundFromConditions,
  getCardImage,
  getCardName,
  getOriginalCardImage,
  isAllowedType,
  preloadRoundImages,
} from "./impostorGameConfig";
import "./ImpostorGame.css";

const IMPOSTOR_GAME_ID = GAME_IDS.IMPOSTOR;
function getInitialDailyProgress(todayKey) {
  return getDailyGameProgress(IMPOSTOR_GAME_ID, todayKey);
}

function getSelectedCardName(roundData, selectedId, locale) {
  if (!selectedId) return "";
  return getCardName(roundData.cards.find((card) => card.id === selectedId), locale);
}

function ImpostorConditionTitle({ condition, locale }) {
  if (condition?.rarity) {
    return (
      <h1 className="im-condition-title-with-badge">
        {locale === "en" ? (
          <>
            <RarityBadge rarity={condition.rarity} locale={locale} size="lg" />
            <span>cards</span>
          </>
        ) : (
          <>
            <span>Cartas de rareza</span>
            <RarityBadge rarity={condition.rarity} locale={locale} size="lg" />
          </>
        )}
      </h1>
    );
  }

  return <h1>{condition?.title}</h1>;
}

function ImpostorGame({ cards, onBack }) {
  const { locale, t: translate } = useLanguage();
  const copy = getImpostorCopy(locale);
  const introCopy = useMemo(() => getGameIntroCopy(IMPOSTOR_GAME_ID, locale), [locale]);
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
  const [foundCorrectIds, setFoundCorrectIds] = useState(() => new Set());
  const [failedCardId, setFailedCardId] = useState(null);
  const [revealedIds, setRevealedIds] = useState(() => new Set());
  const [roundResult, setRoundResult] = useState("playing");
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const [dailyProgress, setDailyProgress] = useState(() => getInitialDailyProgress(todayKey));
  const [rewardMessage, setRewardMessage] = useState("");

  useEffect(() => {
    setDailyProgress(getInitialDailyProgress(todayKey));
  }, [todayKey]);

  useEffect(() => {
    if (!roundData) return;
    preloadRoundImages(roundData, locale, "high");
  }, [roundData, locale]);

  const roundImageSources = useMemo(() => {
    if (!roundData?.cards?.length) return [];

    return roundData.cards.flatMap((card) => [
      getCardImage(card, locale),
      getOriginalCardImage(card, locale),
      ...getNeutralCardImageSources(card, locale),
    ]);
  }, [roundData, locale]);

  const isPreparingRound = usePreparationGate({
    active: Boolean(selectedMode && roundData),
    sources: roundImageSources,
    resetKey: roundData?.id,
    minDurationMs: 1300,
    timeoutMs: 3200,
    fetchPriority: "high",
  });

  function revealAllCards(cardsToReveal = roundData?.cards ?? []) {
    setRevealedIds(new Set(cardsToReveal.map((card) => card.id)));
  }

  function resetRoundState(nextRoundData) {
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
    const latestProgress = getInitialDailyProgress(todayKey);
    setDailyProgress(latestProgress);
    setSelectedMode(modeId);

    if (modeId === GAME_MODE_IDS.DAILY) {
      if (latestProgress.completed && dailyRoundData) {
        restoreCompletedDailyRound(dailyRoundData, latestProgress);
        return;
      }

      resetRoundState(dailyRoundData);
      return;
    }

    resetRoundState(createRoundFromConditions(availableConditions));
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
    setDailyProgress(getInitialDailyProgress(todayKey));
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

    let latestProgress = getInitialDailyProgress(todayKey);

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

  function loseRound(failedId) {
    setFailedCardId(failedId);
    setRoundResult("lost");
    setShowResultOverlay(true);
    saveDailyResult({ isWon: false, failedId });

    window.setTimeout(() => {
      revealAllCards(roundData.cards);
    }, ROUND_REVEAL_DELAY_MS);
  }

  function winRound(nextFoundCorrectIds) {
    setRoundResult("won");
    setShowResultOverlay(true);
    saveDailyResult({ isWon: true, foundIds: nextFoundCorrectIds });

    window.setTimeout(() => {
      revealAllCards(roundData.cards);
    }, ROUND_REVEAL_DELAY_MS);
  }

  function checkSelectedCard() {
    if (roundResult !== "playing" || !roundData || !selectedId) return;

    const selectedIsCorrect = roundData.correctIds.has(selectedId);
    const nextRevealedIds = new Set(revealedIds);
    nextRevealedIds.add(selectedId);
    setRevealedIds(nextRevealedIds);

    if (!selectedIsCorrect) {
      loseRound(selectedId);
      return;
    }

    const nextFoundCorrectIds = new Set(foundCorrectIds);
    nextFoundCorrectIds.add(selectedId);

    setFoundCorrectIds(nextFoundCorrectIds);
    setSelectedId(null);

    if (nextFoundCorrectIds.size >= roundData.correctCount) {
      winRound(nextFoundCorrectIds);
    }
  }

  function startNewGame() {
    if (selectedMode === GAME_MODE_IDS.DAILY) {
      returnToModes();
      return;
    }

    resetRoundState(createRoundFromConditions(availableConditions, roundData?.condition?.id));
  }

  if (playableCards.length === 0 || availableConditions.length === 0) {
    return <ImpostorMessagePanel copy={copy} title={copy.noCards} onBack={onBack} />;
  }

  if (!selectedMode) {
    return (
      <GamePageShell className="im-page">
        <section className="im-shell is-mode-select">
          <GameModeSelect
            copy={introCopy}
            dailyCompleted={dailyProgress.completed}
            onSelectMode={startMode}
          />
        </section>
      </GamePageShell>
    );
  }

  if (!roundData) {
    return <ImpostorMessagePanel copy={copy} title={copy.loading} onBack={onBack} />;
  }

  if (isPreparingRound) {
    return (
      <GamePageShell className="im-page">
        <GamePreparingOverlay
          eyebrow={selectedMode === GAME_MODE_IDS.DAILY ? copy.dailyChallenge : copy.infiniteChallenge}
          title={locale === "en" ? "Shuffling cards..." : "Barajando cartas..."}
          description={
            locale === "en"
              ? "The tavern is preparing this Impostor round."
              : "La taberna está preparando esta ronda de Impostor."
          }
        />
      </GamePageShell>
    );
  }

  const foundCount = foundCorrectIds.size;
  const isRoundWon = roundResult === "won";
  const selectedCardName = getSelectedCardName(roundData, selectedId, locale);

  return (
    <GamePageShell className="im-page">
      <section className="im-shell">
        <div className="im-v2-mode-pill">
          {selectedMode === GAME_MODE_IDS.DAILY ? copy.dailyChallenge : copy.infiniteChallenge}
        </div>

        <section className="im-intro-row" aria-label={copy.category}>
          <div>
            <p className="im-mode-label">{copy.category}</p>
            <ImpostorConditionTitle condition={roundData.condition} locale={locale} />
          </div>
        </section>

        <ImpostorBoard
          locale={locale}
          roundData={roundData}
          selectedId={selectedId}
          foundCorrectIds={foundCorrectIds}
          failedCardId={failedCardId}
          revealedIds={revealedIds}
          roundResult={roundResult}
          onSelect={selectCard}
        />

        <ImpostorActionBar
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
        <ImpostorResultOverlay
          copy={copy}
          isWon={isRoundWon}
          failedCardId={failedCardId}
          roundData={roundData}
          locale={locale}
          rewardMessage={rewardMessage}
          onBack={returnToModes}
          onShowResults={() => setShowResultOverlay(false)}
        />
      ) : null}
    </GamePageShell>
  );
}

export default ImpostorGame;
