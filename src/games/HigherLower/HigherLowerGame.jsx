import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../i18n/LanguageProvider";
import GameModeSelect from "../../shared/components/GameModeSelect/GameModeSelect";
import GameResultOverlay from "../../shared/components/GameResultOverlay/GameResultOverlay";
import GamePageShell from "../../shared/components/GamePageShell/GamePageShell";
import { getGameIntroCopy } from "../../shared/config/gameIntroCopy";
import ImpostorNeutralCard from "../Impostor/ImpostorNeutralCard";
import { GAME_MODE_IDS } from "../../shared/gameModes/gameModes";
import {
  ARCANE_BOX_ID,
  DAILY_REWARD_BOX_AMOUNT,
  GAME_IDS,
  HIGHER_LOWER_DAILY_TARGET,
} from "../../shared/config/gameRules";
import {
  completeDailyChallenge,
  getDailyGameProgress,
  getTodayKey,
  markDailyRewardClaimed,
  saveDailyChallengeResult,
} from "../../shared/progress/dailyProgress";
import { addArcaneBoxReward } from "../../shared/rewards/rewardStore";
import { getCardName, getDetailImage, getGameImage, getThumbImage } from "../../utils/cardLocale";
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
import "./HigherLowerGame.css";

const HIGHER_LOWER_GAME_ID = GAME_IDS.HIGHER_LOWER;

const COPY = {
  es: {
    resultKicker: "Resultado",
    dailyChallenge: "Reto diario",
    infiniteChallenge: "Modo infinito",
    scoreLabel: "Fases",
    streakLabel: "Racha",
    dailyRewardEarned: "Has ganado 1 caja arcana.",
    dailyRewardAlreadyClaimed: "Reto diario completado. Hoy ya tenías esta recompensa.",
    chooseLeft: "Elegir izquierda",
    chooseRight: "Elegir derecha",
    tieWin: "Empate: cuenta como acierto.",
    correct: "Correcto",
    wrong: "Fallaste",
    winTitle: "¡Racha completada!",
    winText: "Has acertado 10 duelos de cartas.",
    loseTitle: "Fin de la partida",
    loseText: "Has fallado un duelo de cartas.",
    viewResults: "Ver resultados",
    playAgain: "Otra partida",
    backHome: "Volver",
    noCards: "No hay suficientes cartas para crear duelos.",
    loading: "Preparando duelo...",
    resultsTitle: "Resultados",
    value: "valor",
    left: "Izquierda",
    right: "Derecha",
    tie: "Empate",
    selected: "Elegiste",
    correctSide: "Correcta",
    dailyReview: "Reto diario revisado",
  },
  en: {
    resultKicker: "Result",
    dailyChallenge: "Daily challenge",
    infiniteChallenge: "Infinite mode",
    scoreLabel: "Phases",
    streakLabel: "Streak",
    dailyRewardEarned: "You earned 1 arcane box.",
    dailyRewardAlreadyClaimed: "Daily challenge completed. You already had today’s reward.",
    chooseLeft: "Choose left",
    chooseRight: "Choose right",
    tieWin: "Tie: counts as correct.",
    correct: "Correct",
    wrong: "Wrong",
    winTitle: "Streak complete!",
    winText: "You got 10 card duels right.",
    loseTitle: "Game over",
    loseText: "You missed a card duel.",
    viewResults: "View results",
    playAgain: "Another game",
    backHome: "Back",
    noCards: "There are not enough cards to create duels.",
    loading: "Preparing duel...",
    resultsTitle: "Results",
    value: "value",
    left: "Left",
    right: "Right",
    tie: "Tie",
    selected: "Selected",
    correctSide: "Correct",
    dailyReview: "Daily review",
  },
};

function useCopy(locale) {
  return COPY[locale] ?? COPY.es;
}

function getFullCardImage(card, locale) {
  return getDetailImage(card, locale) || getGameImage(card, locale) || getThumbImage(card, locale);
}

function MessagePanel({ copy, title, onBack }) {
  return (
    <GamePageShell className="hl-page">
      <section className="hl-shell">
        <div className="hl-message-panel">
          <h2>{title}</h2>
          <button type="button" className="hl-button is-secondary" onClick={onBack}>{copy.backHome}</button>
        </div>
      </section>
    </GamePageShell>
  );
}

function DuelCard({ side, card, locale, copy, disabled, feedback, onChoose, revealResult, isNewCard }) {
  const name = getCardName(card, locale);
  const imageSrc = getFullCardImage(card, locale);
  const isFeedbackSide = feedback?.side === side;
  const feedbackClass = isFeedbackSide ? (feedback.isCorrect ? "is-correct" : "is-wrong") : "";
  const isRevealed = Boolean(revealResult);
  const isAnswerSide = isRevealed && (revealResult.correctSide === side || revealResult.isTie);
  const isWrongSelectedSide = isRevealed && !revealResult.isCorrect && revealResult.selectedSide === side;
  const revealClass = isRevealed ? "is-revealed" : "";
  const answerClass = isAnswerSide ? "is-answer-correct" : isWrongSelectedSide ? "is-answer-wrong" : "";
  const newCardClass = isNewCard && !isRevealed ? "is-new-card" : "";

  return (
    <button
      type="button"
      className={`hl-duel-card is-${side} ${feedbackClass} ${revealClass} ${answerClass} ${newCardClass}`}
      disabled={disabled}
      onClick={() => onChoose(side)}
      aria-label={side === "left" ? copy.chooseLeft : copy.chooseRight}
    >
      {isRevealed ? (
        <div className="hl-full-card-preview" aria-hidden="true">
          {imageSrc ? <img src={imageSrc} alt="" /> : <span>{name}</span>}
        </div>
      ) : (
        <div className="hl-neutral-card-preview" aria-hidden="true">
          <ImpostorNeutralCard card={card} locale={locale} />
        </div>
      )}
      <span className="hl-duel-name">{name}</span>
      {isFeedbackSide ? (
        <strong className="hl-card-feedback">{feedback.isCorrect ? copy.correct : copy.wrong}</strong>
      ) : null}
      {isRevealed && (isAnswerSide || isWrongSelectedSide) ? (
        <strong className="hl-card-feedback is-reveal-badge">
          {isAnswerSide ? copy.correctSide : copy.selected}
        </strong>
      ) : null}
    </button>
  );
}

function ResultOverlay({ copy, result, rewardMessage, onViewResults, onBack }) {
  const isWon = result === "won";

  return (
    <GameResultOverlay
      tone={isWon ? "success" : "danger"}
      kicker={copy.resultKicker}
      title={isWon ? copy.winTitle : copy.loseTitle}
      text={isWon ? copy.winText : copy.loseText}
      rewardMessage={rewardMessage}
      primaryAction={{ label: copy.viewResults, onClick: onViewResults }}
      secondaryActions={onBack ? [{ label: copy.backHome, onClick: onBack }] : []}
    />
  );
}

function ResultsPanel({ copy, history, locale, onNext, isReview }) {
  if (!history.length) return null;

  function sideLabel(side) {
    if (side === "left") return copy.left;
    if (side === "right") return copy.right;
    return copy.tie;
  }

  return (
    <section className="hl-results-panel">
      <header>
        <span>{isReview ? copy.dailyReview : copy.resultsTitle}</span>
        {onNext ? <button type="button" className="hl-button is-secondary" onClick={onNext}>{copy.playAgain}</button> : null}
      </header>
      <div className="hl-results-list">
        {history.map((item, index) => {
          const label = getQuestionValueLabel(item.question, locale) || copy.value;
          return (
            <article key={`${item.leftCard.id}-${item.rightCard.id}-${index}`} className={`hl-result-row ${item.isCorrect ? "is-correct" : "is-wrong"}`}>
              <strong>{index + 1}</strong>
              <div>
                <p>{getQuestionLabel(item.question, locale)}</p>
                <small>
                  {getCardName(item.leftCard, locale)}: {item.leftValue} {label} · {getCardName(item.rightCard, locale)}: {item.rightValue} {label}
                </small>
              </div>
              <span>{item.isTie ? copy.tie : `${copy.selected}: ${sideLabel(item.selectedSide)}`}</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function HigherLowerGame({ cards = [], onBack }) {
  const { locale } = useLanguage();
  const copy = useCopy(locale);
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

    let latestProgress = getDailyGameProgress(HIGHER_LOWER_GAME_ID, todayKey);

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

  function advanceAfterCorrect(nextScore, nextHistory) {
    if (nextScore >= HIGHER_LOWER_DAILY_TARGET && selectedMode === GAME_MODE_IDS.DAILY) {
      setResult("won");
      setShowResultOverlay(true);
      markDailyWon(nextHistory, nextScore);
      return;
    }

    if (selectedMode === GAME_MODE_IDS.DAILY) {
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
      return;
    }

    const anchorCard = newCardSide === "left" ? leftCard : rightCard;
    const nextDuel = createHigherLowerDuel(playableCards, anchorCard, locale);
    const challengerSide = newCardSide === "left" ? "right" : "left";

    if (nextDuel) {
      setAnchoredDuel(anchorCard, nextDuel.rightCard, nextDuel.question, challengerSide);
    }
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
    return <MessagePanel copy={copy} title={copy.noCards} onBack={onBack} />;
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
    return <MessagePanel copy={copy} title={copy.loading} onBack={handleBack} />;
  }

  const isDailyMode = selectedMode === GAME_MODE_IDS.DAILY;
  const isReview = isDailyMode && dailyProgress.completed;
  const questionLabel = getQuestionLabel(question, locale);
  const currentValueLabel = getQuestionValueLabel(question, locale) || copy.value;
  const revealedResult = (showResults || isReview) ? history[history.length - 1] : null;

  return (
    <GamePageShell className="hl-page">

      <section className="hl-shell">
        <div className="hl-topbar">
          <div className="hl-mode-pill">{isDailyMode ? copy.dailyChallenge : copy.infiniteChallenge}</div>
          <div className="hl-score-pill">
            <span>{isDailyMode ? copy.scoreLabel : copy.streakLabel}</span>
            <strong>{score}/{isDailyMode ? HIGHER_LOWER_DAILY_TARGET : "∞"}</strong>
          </div>
        </div>

        <section className="hl-duel-stage">
          <DuelCard
            side="left"
            card={leftCard}
            locale={locale}
            copy={copy}
            disabled={Boolean(result || isReview || feedback)}
            feedback={feedback}
            revealResult={revealedResult}
            isNewCard={newCardSide === "left" && !showResults && !isReview}
            onChoose={chooseSide}
          />

          <div className="hl-versus-panel">
            <span>VS</span>
            <h1>{questionLabel}</h1>
            <small>{feedback?.isTie ? copy.tieWin : currentValueLabel}</small>
          </div>

          <DuelCard
            side="right"
            card={rightCard}
            locale={locale}
            copy={copy}
            disabled={Boolean(result || isReview || feedback)}
            feedback={feedback}
            revealResult={revealedResult}
            isNewCard={newCardSide === "right" && !showResults && !isReview}
            onChoose={chooseSide}
          />
        </section>

        {showResults || isReview ? (
          <ResultsPanel
            copy={copy}
            history={history}
            locale={locale}
            isReview={isReview}
            onNext={!isDailyMode && result ? startNextInfiniteRound : null}
          />
        ) : null}
      </section>

      {showResultOverlay && result ? (
        <ResultOverlay
          copy={copy}
          result={result}
          rewardMessage={rewardMessage}
          onViewResults={() => {
            setShowResultOverlay(false);
            setShowResults(true);
          }}
          onNext={!isDailyMode ? startNextInfiniteRound : null}
          onBack={onBack}
        />
      ) : null}
    </GamePageShell>
  );
}

export default HigherLowerGame;
