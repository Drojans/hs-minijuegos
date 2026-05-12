import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../i18n/LanguageProvider";
import GameModeSelect from "../../shared/components/GameModeSelect/GameModeSelect";
import GamePageShell from "../../shared/components/GamePageShell/GamePageShell";
import { getGameIntroCopy } from "../../shared/config/gameIntroCopy";
import {
  ARCANE_BOX_ID,
  DAILY_REWARD_BOX_AMOUNT,
  GAME_IDS,
  HIGHER_LOWER_DAILY_TARGET,
} from "../../shared/config/gameRules";
import { GAME_MODE_IDS } from "../../shared/gameModes/gameModes";
import {
  completeDailyChallenge,
  getDailyGameProgress,
  getTodayKey,
  markDailyRewardClaimed,
  saveDailyChallengeResult,
} from "../../shared/progress/dailyProgress";
import { addArcaneBoxReward } from "../../shared/rewards/rewardStore";
import HigherLowerDuelStage from "./components/HigherLowerDuelStage";
import HigherLowerMessagePanel from "./components/HigherLowerMessagePanel";
import HigherLowerResultOverlay from "./components/HigherLowerResultOverlay";
import HigherLowerResultsPanel from "./components/HigherLowerResultsPanel";
import HigherLowerTopbar from "./components/HigherLowerTopbar";
import {
  createDailyHigherLowerRun,
  createHigherLowerDuel,
  createInitialHigherLowerDuel,
  getQuestionLabel,
  getQuestionValueLabel,
  hydrateHigherLowerHistory,
  isPlayableHigherLowerCard,
  resolveHigherLowerAnswer,
  serializeHigherLowerHistory,
} from "./higherLowerConfig";
import { getHigherLowerCopy } from "./higherLowerCopy";
import "./HigherLowerGame.css";

const HIGHER_LOWER_GAME_ID = GAME_IDS.HIGHER_LOWER;

function HigherLowerGame({ cards = [], onBack }) {
  const { locale } = useLanguage();
  const copy = getHigherLowerCopy(locale);
  const introCopy = useMemo(() => getGameIntroCopy(HIGHER_LOWER_GAME_ID, locale), [locale]);
  const todayKey = useMemo(() => getTodayKey(), []);
  const playableCards = useMemo(() => cards.filter((card) => isPlayableHigherLowerCard(card, locale)), [cards, locale]);
  const dailyRun = useMemo(
    () => createDailyHigherLowerRun(playableCards, todayKey, locale, HIGHER_LOWER_DAILY_TARGET),
    [playableCards, todayKey, locale],
  );

  const [selectedMode, setSelectedMode] = useState(null);
  const [leftCard, setLeftCard] = useState(null);
  const [rightCard, setRightCard] = useState(null);
  const [question, setQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState([]);
  const [dailyProgress, setDailyProgress] = useState(() => getDailyGameProgress(HIGHER_LOWER_GAME_ID, todayKey));
  const [result, setResult] = useState(null);
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [rewardMessage, setRewardMessage] = useState("");
  const [newCardSide, setNewCardSide] = useState("right");

  useEffect(() => {
    setDailyProgress(getDailyGameProgress(HIGHER_LOWER_GAME_ID, todayKey));
  }, [todayKey]);

  function clearRoundState() {
    setScore(0);
    setHistory([]);
    setResult(null);
    setShowResultOverlay(false);
    setShowResults(false);
    setFeedback(null);
    setRewardMessage("");
  }

  function setDuel(duel, nextNewCardSide = "right") {
    setLeftCard(duel?.leftCard ?? null);
    setRightCard(duel?.rightCard ?? null);
    setQuestion(duel?.question ?? null);
    setNewCardSide(nextNewCardSide);
  }

  function setAnchoredDuel(anchorCard, challengerCard, nextQuestion, challengerSide) {
    if (challengerSide === "left") {
      setLeftCard(challengerCard);
      setRightCard(anchorCard);
      setNewCardSide("left");
    } else {
      setLeftCard(anchorCard);
      setRightCard(challengerCard);
      setNewCardSide("right");
    }

    setQuestion(nextQuestion);
  }

  function startDailyReview(progress) {
    const savedHistory = hydrateHigherLowerHistory(progress.lastHistory ?? [], playableCards);
    setHistory(savedHistory);
    setScore(progress.lastScore ?? savedHistory.filter((item) => item.isCorrect).length);
    setResult(progress.lastWasWon ? "won" : "lost");
    setShowResults(true);
    setShowResultOverlay(false);
    setFeedback(null);

    const lastItem = savedHistory[savedHistory.length - 1];
    if (lastItem) {
      setLeftCard(lastItem.leftCard);
      setRightCard(lastItem.rightCard);
      setQuestion(lastItem.question);
    } else if (dailyRun) {
      setDuel({ leftCard: dailyRun.startCard, rightCard: dailyRun.rounds[0].rightCard, question: dailyRun.rounds[0].question }, "right");
    }
  }

  function startMode(modeId) {
    const latestProgress = getDailyGameProgress(HIGHER_LOWER_GAME_ID, todayKey);
    setDailyProgress(latestProgress);
    setSelectedMode(modeId);
    clearRoundState();

    if (modeId === GAME_MODE_IDS.DAILY) {
      if (latestProgress.completed) {
        startDailyReview(latestProgress);
        return;
      }

      setDuel({ leftCard: dailyRun.startCard, rightCard: dailyRun.rounds[0].rightCard, question: dailyRun.rounds[0].question }, "right");
      return;
    }

    setDuel(createInitialHigherLowerDuel(playableCards, locale), "right");
  }

  function handleBack() {
    if (selectedMode === GAME_MODE_IDS.DAILY && !dailyProgress.completed && !result) {
      markDailyLost(history, false);
    }

    onBack?.();
  }

  function saveDailyHistory(nextHistory, won, nextScore) {
    saveDailyChallengeResult(HIGHER_LOWER_GAME_ID, todayKey, {
      completed: true,
      completedAt: new Date().toISOString(),
      lastWasWon: won,
      lastWasCorrect: won,
      lastScore: nextScore,
      lastHistory: serializeHigherLowerHistory(nextHistory),
    });
    setDailyProgress(getDailyGameProgress(HIGHER_LOWER_GAME_ID, todayKey));
  }

  function markDailyWon(nextHistory, nextScore) {
    completeDailyChallenge(HIGHER_LOWER_GAME_ID, todayKey);
    saveDailyHistory(nextHistory, true, nextScore);

    const latestProgress = getDailyGameProgress(HIGHER_LOWER_GAME_ID, todayKey);

    if (!latestProgress.rewardClaimed) {
      addArcaneBoxReward({
        boxId: ARCANE_BOX_ID,
        amount: DAILY_REWARD_BOX_AMOUNT,
        source: HIGHER_LOWER_GAME_ID,
        dateKey: todayKey,
      });
      markDailyRewardClaimed(HIGHER_LOWER_GAME_ID, todayKey);
      saveDailyChallengeResult(HIGHER_LOWER_GAME_ID, todayKey, {
        lastWasWon: true,
        lastWasCorrect: true,
        lastScore: nextScore,
        lastHistory: serializeHigherLowerHistory(nextHistory),
      });
      setRewardMessage(copy.dailyRewardEarned);
    } else {
      setRewardMessage(copy.dailyRewardAlreadyClaimed);
    }

    setDailyProgress(getDailyGameProgress(HIGHER_LOWER_GAME_ID, todayKey));
  }

  function markDailyLost(nextHistory = history, showOverlay = true) {
    saveDailyHistory(nextHistory, false, nextHistory.filter((item) => item.isCorrect).length);
    setResult("lost");
    setShowResultOverlay(showOverlay);
  }

  function advanceDailyRun(nextScore, nextHistory) {
    const nextRound = dailyRun.rounds[nextScore];
    if (!nextRound) {
      setResult("won");
      setShowResultOverlay(true);
      markDailyWon(nextHistory, nextScore);
      return;
    }

    const anchorCard = newCardSide === "left" ? leftCard : rightCard;
    const challengerSide = newCardSide === "left" ? "right" : "left";
    setAnchoredDuel(anchorCard, nextRound.rightCard, nextRound.question, challengerSide);
  }

  function advanceInfiniteRun() {
    const anchorCard = newCardSide === "left" ? leftCard : rightCard;
    const nextDuel = createHigherLowerDuel(playableCards, anchorCard, locale);
    const challengerSide = newCardSide === "left" ? "right" : "left";

    if (nextDuel) {
      setAnchoredDuel(anchorCard, nextDuel.rightCard, nextDuel.question, challengerSide);
    }
  }

  function advanceAfterCorrect(nextScore, nextHistory) {
    if (nextScore >= HIGHER_LOWER_DAILY_TARGET && selectedMode === GAME_MODE_IDS.DAILY) {
      setResult("won");
      setShowResultOverlay(true);
      markDailyWon(nextHistory, nextScore);
      return;
    }

    if (selectedMode === GAME_MODE_IDS.DAILY) {
      advanceDailyRun(nextScore, nextHistory);
      return;
    }

    advanceInfiniteRun();
  }

  function chooseSide(side) {
    if (!leftCard || !rightCard || !question || result || feedback) return;

    const resolved = resolveHigherLowerAnswer({ leftCard, rightCard, question, selectedSide: side, locale });
    const item = {
      leftCard,
      rightCard,
      question,
      selectedSide: side,
      correctSide: resolved.correctSide,
      isCorrect: resolved.isCorrect,
      isTie: resolved.isTie,
      leftValue: resolved.leftValue,
      rightValue: resolved.rightValue,
    };
    const nextHistory = [...history, item];

    setHistory(nextHistory);
    setFeedback({ side, isCorrect: resolved.isCorrect, isTie: resolved.isTie });

    if (!resolved.isCorrect) {
      window.setTimeout(() => {
        setFeedback(null);
        setResult("lost");
        setShowResultOverlay(true);
        if (selectedMode === GAME_MODE_IDS.DAILY) {
          markDailyLost(nextHistory, true);
        }
      }, 420);
      return;
    }

    const nextScore = score + 1;
    setScore(nextScore);

    window.setTimeout(() => {
      setFeedback(null);
      advanceAfterCorrect(nextScore, nextHistory);
    }, resolved.isTie ? 620 : 460);
  }

  function startNextInfiniteRound() {
    clearRoundState();
    setDuel(createInitialHigherLowerDuel(playableCards, locale), "right");
  }

  if (playableCards.length < 2 || !dailyRun) {
    return <HigherLowerMessagePanel copy={copy} title={copy.noCards} onBack={onBack} />;
  }

  if (!selectedMode) {
    return (
      <GamePageShell className="hl-page">
        <section className="hl-shell is-mode-select">
          <GameModeSelect
            copy={introCopy}
            dailyCompleted={dailyProgress.completed}
            onSelectMode={startMode}
          />
        </section>
      </GamePageShell>
    );
  }

  if (!leftCard || !rightCard || !question) {
    return <HigherLowerMessagePanel copy={copy} title={copy.loading} onBack={handleBack} />;
  }

  const isDailyMode = selectedMode === GAME_MODE_IDS.DAILY;
  const isReview = isDailyMode && dailyProgress.completed;
  const questionLabel = getQuestionLabel(question, locale);
  const currentValueLabel = getQuestionValueLabel(question, locale) || copy.value;
  const revealedResult = (showResults || isReview) ? history[history.length - 1] : null;
  const showRevealedState = Boolean(showResults || isReview);

  return (
    <GamePageShell className="hl-page">
      <section className="hl-shell">
        <HigherLowerTopbar copy={copy} selectedMode={selectedMode} score={score} />

        <HigherLowerDuelStage
          copy={copy}
          currentValueLabel={currentValueLabel}
          disabled={Boolean(result || isReview || feedback)}
          feedback={feedback}
          leftCard={leftCard}
          locale={locale}
          newCardSide={newCardSide}
          onChoose={chooseSide}
          questionLabel={questionLabel}
          revealedResult={revealedResult}
          rightCard={rightCard}
          showRevealedState={showRevealedState}
        />

        {showResults || isReview ? (
          <HigherLowerResultsPanel
            copy={copy}
            history={history}
            locale={locale}
            isReview={isReview}
            onNext={!isDailyMode && result ? startNextInfiniteRound : null}
          />
        ) : null}
      </section>

      {showResultOverlay && result ? (
        <HigherLowerResultOverlay
          copy={copy}
          result={result}
          rewardMessage={rewardMessage}
          onViewResults={() => {
            setShowResultOverlay(false);
            setShowResults(true);
          }}
          onBack={onBack}
        />
      ) : null}
    </GamePageShell>
  );
}

export default HigherLowerGame;
