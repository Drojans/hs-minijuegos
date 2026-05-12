import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../../i18n/LanguageProvider";
import GameModeSelect from "../../shared/components/GameModeSelect/GameModeSelect";
import GamePageShell from "../../shared/components/GamePageShell/GamePageShell";
import { getGameIntroCopy } from "../../shared/config/gameIntroCopy";
import { GAME_MODE_IDS } from "../../shared/gameModes/gameModes";
import { ARCANE_BOX_ID, CARD_GRID_DAILY_TIME_SECONDS, DAILY_REWARD_BOX_AMOUNT, GAME_IDS } from "../../shared/config/gameRules";
import {
  completeDailyChallenge,
  getDailyGameProgress,
  getTodayKey,
  markDailyRewardClaimed,
  saveDailyChallengeResult,
} from "../../shared/progress/dailyProgress";
import { addArcaneBoxReward } from "../../shared/rewards/rewardStore";
import CardGridBoard from "./components/CardGridBoard";
import CardGridControls from "./components/CardGridControls";
import CardGridEmptyState from "./components/CardGridEmptyState";
import CardGridResultOverlay from "./components/CardGridResultOverlay";
import CardGridTimer from "./components/CardGridTimer";
import { getCardGridCopy } from "./cardGridCopy";
import {
  buildRevealedAnswerState,
  getDailyGridSeed,
  getGridCellKey,
  restoreAnswersFromIds,
  serializeAnswerIds,
} from "./cardGridState";
import {
  TOTAL_CELLS,
  buildConditionPool,
  generateGrid,
  getCardName,
  getCardsByExactName,
  getGridModes,
  getNextEmptyCell,
  getSuggestions,
  isPlayableGridCard,
  normalize,
} from "./cardGridGameConfig";
import "./CardGridGame.css";

const CARD_GRID_GAME_ID = GAME_IDS.CARD_GRID;

function CardGridGame({ cards, onBack }) {
  const { locale, t } = useLanguage();
  const copy = getCardGridCopy(locale);
  const introCopy = useMemo(() => getGameIntroCopy(CARD_GRID_GAME_ID, locale), [locale]);
  const todayKey = useMemo(() => getTodayKey(), []);
  const [gridMode, setGridMode] = useState("easy");
  const [selectedMode, setSelectedMode] = useState(null);
  const gridModes = useMemo(() => getGridModes(t), [t]);
  const modeConfig = gridModes[gridMode];

  const playableCards = useMemo(() => cards.filter(isPlayableGridCard), [cards]);

  const conditionPool = useMemo(
    () => buildConditionPool(cards, modeConfig.minCardsInCondition, locale, t),
    [cards, modeConfig.minCardsInCondition, locale, t]
  );

  const [grid, setGrid] = useState(null);
  const [selectedCell, setSelectedCell] = useState({ row: 0, column: 0 });
  const [answers, setAnswers] = useState({});
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [mistakes, setMistakes] = useState(0);
  const [revealedCells, setRevealedCells] = useState(new Set());
  const [suppressSuggestions, setSuppressSuggestions] = useState(false);
  const [endOverlay, setEndOverlay] = useState(null);
  const [resultsMode, setResultsMode] = useState(null);
  const [dailyProgress, setDailyProgress] = useState(() => getDailyGameProgress(CARD_GRID_GAME_ID, todayKey));
  const [rewardMessage, setRewardMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const answerInputRef = useRef(null);
  const latestDailyRunRef = useRef(null);
  const didFinalizeDailyRef = useRef(false);

  const usedCardIds = useMemo(
    () => new Set(Object.values(answers).map((card) => card.id)),
    [answers]
  );

  const correctCount = Object.keys(answers).length;
  const selectedKey = getGridCellKey(selectedCell.row, selectedCell.column);
  const selectedRow = grid?.rows[selectedCell.row];
  const selectedColumn = grid?.columns[selectedCell.column];
  const isComplete = correctCount >= TOTAL_CELLS;
  const isDailyMode = selectedMode === GAME_MODE_IDS.DAILY;
  const hasConsumedDailyAttempt = isDailyMode && dailyProgress.completed;
  const isDailyTimerRunning =
    isDailyMode &&
    grid &&
    !hasConsumedDailyAttempt &&
    !isComplete &&
    !endOverlay &&
    !resultsMode &&
    typeof timeLeft === "number";


  const suggestions = useMemo(() => {
    if (suppressSuggestions || normalize(answer).length < 3) return [];

    return getSuggestions(playableCards, answer, usedCardIds);
  }, [playableCards, answer, usedCardIds, suppressSuggestions]);

  useEffect(() => {
    setDailyProgress(getDailyGameProgress(CARD_GRID_GAME_ID, todayKey));
  }, [todayKey]);

  function resetGrid(nextGrid, nextMessage, options = {}) {
    const restoredAnswers = options.answers ?? {};

    setGrid(nextGrid);
    setAnswers(restoredAnswers);
    setMistakes(options.mistakes ?? 0);
    setRevealedCells(new Set(options.revealedCells ?? []));
    setSelectedCell(options.selectedCell ?? { row: 0, column: 0 });
    setAnswer("");
    setSuppressSuggestions(false);
    setEndOverlay(null);
    setResultsMode(options.resultsMode ?? null);
    setRewardMessage("");
    setTimeLeft(null);
    setMessage(nextMessage);
  }

  function makeGridReadyMessage() {
    return "";
  }

  function getDailyReviewState(nextGrid) {
    const latestProgress = getDailyGameProgress(CARD_GRID_GAME_ID, todayKey);

    if (!latestProgress.completed || !latestProgress.answerIds || !nextGrid) {
      return null;
    }

    const restoredAnswers = restoreAnswersFromIds(latestProgress.answerIds, playableCards);

    if (latestProgress.lastWasCorrect) {
      const restoredKeys = Object.keys(restoredAnswers);
      return {
        answers: restoredAnswers,
        revealedCells: restoredKeys,
        resultsMode: "won",
      };
    }

    const revealedState = buildRevealedAnswerState({ answers: restoredAnswers, grid: nextGrid, revealedCells: Object.keys(restoredAnswers) });

    return {
      answers: revealedState.answers,
      revealedCells: Array.from(revealedState.revealedCells),
      resultsMode: latestProgress.failedReason === "time" ? "time" : "time",
    };
  }

  function handleAnswerChange(value) {
    setSuppressSuggestions(false);
    setAnswer(value);
  }

  function handleSuggestionPick(value) {
    setAnswer(value);
    setSuppressSuggestions(true);
    requestAnimationFrame(() => {
      answerInputRef.current?.focus();
    });
  }

  function revealAllPendingAnswers() {
    if (!grid) return;

    const revealedState = buildRevealedAnswerState({ answers, grid, revealedCells });
    setAnswers(revealedState.answers);
    setRevealedCells(revealedState.revealedCells);

    return revealedState;
  }

  function finalizeDailyGridFailure(reason = "exit", snapshot = latestDailyRunRef.current) {
    if (!snapshot?.grid || snapshot.selectedMode !== GAME_MODE_IDS.DAILY || snapshot.dailyProgress?.completed) return null;
    if (didFinalizeDailyRef.current) return null;

    didFinalizeDailyRef.current = true;

    const revealedState = buildRevealedAnswerState({
      answers: snapshot.answers,
      grid: snapshot.grid,
      revealedCells: snapshot.revealedCells,
    });

    const nextProgress = saveDailyChallengeResult(CARD_GRID_GAME_ID, todayKey, {
      completed: true,
      completedAt: new Date().toISOString(),
      rewardClaimed: false,
      inProgress: false,
      answerIds: serializeAnswerIds(revealedState.answers),
      completedGridMode: snapshot.gridMode,
      lastWasCorrect: false,
      failedReason: reason,
      mistakes: snapshot.mistakes,
    });

    setDailyProgress(nextProgress);
    return revealedState;
  }

  function viewEndResults() {
    if (endOverlay === "time") {
      revealAllPendingAnswers();
    }

    setResultsMode(endOverlay ?? "won");
    setEndOverlay(null);
  }

  function createNewGrid(isNewGrid = false, modeOverride = selectedMode) {
    const isDailyMode = modeOverride === GAME_MODE_IDS.DAILY;
    const nextGrid = generateGrid(
      playableCards,
      conditionPool,
      modeConfig.minCandidatesPerCell,
      isDailyMode ? getDailyGridSeed(CARD_GRID_GAME_ID, todayKey, gridMode) : null
    );

    const reviewState = isDailyMode ? getDailyReviewState(nextGrid) : null;
    resetGrid(nextGrid, makeGridReadyMessage(nextGrid, isNewGrid), reviewState ?? {});

    if (isDailyMode && !reviewState) {
      didFinalizeDailyRef.current = false;
      saveDailyChallengeResult(CARD_GRID_GAME_ID, todayKey, {
        inProgress: true,
        startedAt: new Date().toISOString(),
        answerIds: {},
        completedGridMode: gridMode,
        lastWasCorrect: false,
        failedReason: null,
        mistakes: 0,
      });
      setDailyProgress(getDailyGameProgress(CARD_GRID_GAME_ID, todayKey));
      setTimeLeft(CARD_GRID_DAILY_TIME_SECONDS);
    }
  }

  useEffect(() => {
    if (!cards.length || !selectedMode) return;

    createNewGrid(false, selectedMode);
    // createNewGrid depends on current state by design; keep explicit deps to avoid
    // regenerating more often than the previous implementation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cards.length,
    playableCards,
    conditionPool,
    modeConfig.minCandidatesPerCell,
    gridMode,
    selectedMode,
    t,
  ]);

  function returnToModes() {
    setSelectedMode(null);
    setGrid(null);
    resetGrid(null, "");
    setDailyProgress(getDailyGameProgress(CARD_GRID_GAME_ID, todayKey));
  }

  function startNewGrid() {
    if (selectedMode === GAME_MODE_IDS.DAILY) {
      returnToModes();
      return;
    }

    createNewGrid(true);
  }

  function changeGridMode(nextMode) {
    if (nextMode === gridMode) return;
    setGridMode(nextMode);
  }

  function startMode(modeId) {
    setSelectedMode(modeId);
    setDailyProgress(getDailyGameProgress(CARD_GRID_GAME_ID, todayKey));
    resetGrid(null, "");
  }

  function moveToNextEmptyCell(nextAnswers) {
    const nextCell = getNextEmptyCell(selectedKey, nextAnswers);

    if (nextCell) {
      setSelectedCell(nextCell);
    }
  }

  function failDailyGridByTime() {
    if (!grid || selectedMode !== GAME_MODE_IDS.DAILY || dailyProgress.completed) return;

    const revealedState = finalizeDailyGridFailure("time");
    if (!revealedState) return;

    setAnswers(revealedState.answers);
    setRevealedCells(revealedState.revealedCells);
    setTimeLeft(0);
    setMessage(copy.dailyTimeExpiredMessage);
    setRewardMessage("");
    setEndOverlay("time");
    setResultsMode(null);
  }

  useEffect(() => {
    latestDailyRunRef.current = {
      grid,
      answers,
      revealedCells,
      selectedMode,
      dailyProgress,
      gridMode,
      mistakes,
      timeLeft,
    };
  }, [answers, dailyProgress, grid, gridMode, mistakes, revealedCells, selectedMode, timeLeft]);

  useEffect(() => {
    if (!isDailyTimerRunning) return;

    function handlePageHide() {
      finalizeDailyGridFailure("exit", latestDailyRunRef.current);
    }

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handlePageHide);
      finalizeDailyGridFailure("exit", latestDailyRunRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDailyTimerRunning]);

  useEffect(() => {
    if (!isDailyTimerRunning) return;

    const intervalId = window.setInterval(() => {
      setTimeLeft((current) => {
        if (typeof current !== "number") return current;
        return Math.max(0, current - 1);
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isDailyTimerRunning]);

  useEffect(() => {
    if (!isDailyTimerRunning || timeLeft !== 0) return;
    failDailyGridByTime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDailyTimerRunning, timeLeft]);

  function completeDailyGrid(nextAnswers) {
    completeDailyChallenge(CARD_GRID_GAME_ID, todayKey);
    didFinalizeDailyRef.current = true;
    saveDailyChallengeResult(CARD_GRID_GAME_ID, todayKey, {
      answerIds: serializeAnswerIds(nextAnswers),
      completedGridMode: gridMode,
      lastWasCorrect: true,
      failedReason: null,
      inProgress: false,
      mistakes,
    });

    let latestProgress = getDailyGameProgress(CARD_GRID_GAME_ID, todayKey);

    if (!latestProgress.rewardClaimed) {
      addArcaneBoxReward({
        boxId: ARCANE_BOX_ID,
        amount: DAILY_REWARD_BOX_AMOUNT,
        source: CARD_GRID_GAME_ID,
        dateKey: todayKey,
      });
      latestProgress = markDailyRewardClaimed(CARD_GRID_GAME_ID, todayKey);
      setRewardMessage(copy.dailyRewardEarned);
    } else {
      setRewardMessage(copy.dailyRewardAlreadyClaimed);
    }

    setDailyProgress(latestProgress);
  }

  function submitAnswer(event) {
    event?.preventDefault();

    if (!grid || isComplete || hasConsumedDailyAttempt) return;

    if (answers[selectedKey]) {
      setMessage(t("grid.message.cellCompleted"));
      return;
    }

    const exactMatches = getCardsByExactName(playableCards, answer);

    if (!exactMatches.length) {
      setMessage(t("grid.message.cardNotFound"));
      return;
    }

    const unusedMatches = exactMatches.filter((card) => !usedCardIds.has(card.id));

    if (!unusedMatches.length) {
      setMessage(t("grid.message.cardAlreadyUsed"));
      return;
    }

    const validCard = unusedMatches.find(
      (card) => selectedRow?.predicate(card) && selectedColumn?.predicate(card)
    );

    if (!validCard) {
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes);
      if (selectedMode === GAME_MODE_IDS.DAILY) {
        saveDailyChallengeResult(CARD_GRID_GAME_ID, todayKey, {
          inProgress: true,
          answerIds: serializeAnswerIds(answers),
          completedGridMode: gridMode,
          lastWasCorrect: false,
          failedReason: null,
          mistakes: nextMistakes,
        });
      }
      setMessage(
        t("grid.message.wrongCell", {
          name: getCardName(unusedMatches[0], locale),
          row: selectedRow?.shortLabel,
          column: selectedColumn?.shortLabel,
        })
      );
      return;
    }

    const nextAnswers = {
      ...answers,
      [selectedKey]: validCard,
    };

    const didCompleteGrid = Object.keys(nextAnswers).length >= TOTAL_CELLS;

    if (selectedMode === GAME_MODE_IDS.DAILY && !didCompleteGrid) {
      saveDailyChallengeResult(CARD_GRID_GAME_ID, todayKey, {
        inProgress: true,
        answerIds: serializeAnswerIds(nextAnswers),
        completedGridMode: gridMode,
        lastWasCorrect: false,
        failedReason: null,
        mistakes,
      });
    }

    setAnswers(nextAnswers);
    setAnswer("");
    setSuppressSuggestions(false);

    if (didCompleteGrid) {
      if (selectedMode === GAME_MODE_IDS.DAILY) {
        completeDailyGrid(nextAnswers);
      }

      setMessage("");
      setEndOverlay("won");
      setResultsMode(null);
      return;
    }

    setMessage(t("grid.message.correct", { name: getCardName(validCard, locale) }));
    moveToNextEmptyCell(nextAnswers);
  }

  if (!cards.length) {
    return (
      <CardGridEmptyState
        t={t}
        cards={cards}
        gridMode={gridMode}
        gridModes={gridModes}
        modeConfig={modeConfig}
        onBack={onBack}
        onChangeMode={changeGridMode}
        onStartNewGrid={startNewGrid}
      />
    );
  }

  if (!selectedMode) {
    return (
      <GamePageShell className="cg-page">
        <section className="cg-shell is-mode-select">
          <GameModeSelect
            copy={introCopy}
            dailyCompleted={dailyProgress.completed}
            onSelectMode={startMode}
          />
        </section>
      </GamePageShell>
    );
  }

  if (!grid) {
    return (
      <CardGridEmptyState
        t={t}
        cards={cards}
        gridMode={gridMode}
        gridModes={gridModes}
        modeConfig={modeConfig}
        onBack={onBack}
        onChangeMode={changeGridMode}
        onStartNewGrid={startNewGrid}
      />
    );
  }

  return (
    <GamePageShell className={`cg-page ${resultsMode ? `is-results-${resultsMode}` : ""}`}>
      <section className="cg-shell">
        <CardGridTimer copy={copy} timeLeft={isDailyMode && !dailyProgress.completed ? timeLeft : null} />
        <section className="cg-layout cg-layout-single">
          <CardGridBoard
            grid={grid}
            answers={answers}
            revealedCells={revealedCells}
            selectedCell={selectedCell}
            locale={locale}
            t={t}
            onSelectCell={setSelectedCell}
          />

          <CardGridControls
            t={t}
            selectedRow={selectedRow}
            selectedColumn={selectedColumn}
            mistakes={mistakes}
            message={message}
            answer={answer}
            suggestions={suggestions}
            isComplete={isComplete}
            locale={locale}
            inputRef={answerInputRef}
            onAnswerChange={handleAnswerChange}
            onPickSuggestion={handleSuggestionPick}
            onSubmitAnswer={submitAnswer}
          />
        </section>

        {selectedMode === GAME_MODE_IDS.INFINITE && resultsMode && !endOverlay ? (
          <div className="cg-post-result-actions">
            <button type="button" className="cg-primary-button" onClick={startNewGrid}>
              {t("grid.playAgain")}
            </button>
          </div>
        ) : null}
      </section>

      {endOverlay ? (
        <CardGridResultOverlay
          t={t}
          copy={copy}
          result={endOverlay}
          rewardMessage={rewardMessage}
          onViewResults={viewEndResults}
          onBack={returnToModes}
        />
      ) : null}
    </GamePageShell>
  );
}

export default CardGridGame;
