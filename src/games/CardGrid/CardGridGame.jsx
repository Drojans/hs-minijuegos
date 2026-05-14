import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../../i18n/LanguageProvider";
import GameModeSelect from "../../shared/components/GameModeSelect/GameModeSelect";
import GamePageShell from "../../shared/components/GamePageShell/GamePageShell";
import GamePreparingOverlay from "../../shared/components/GamePreparingOverlay/GamePreparingOverlay";
import { getGameIntroCopy } from "../../shared/config/gameIntroCopy";
import { GAME_MODE_IDS } from "../../shared/gameModes/gameModes";
import usePreparationGate from "../../shared/hooks/usePreparationGate";
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
  buildRefreshedRevealedAnswerState,
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
  getCardImage,
  getCardName,
  getCardsByExactName,
  getGridModes,
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
  const [selectedCell, setSelectedCell] = useState(null);
  const [answers, setAnswers] = useState({});
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState("neutral");
  const [feedbackNonce, setFeedbackNonce] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [revealedCells, setRevealedCells] = useState(new Set());
  const [suppressSuggestions, setSuppressSuggestions] = useState(false);
  const [pendingPlacement, setPendingPlacement] = useState(null);
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

  const usedCardNameKeys = useMemo(
    () => new Set(Object.values(answers).flatMap((card) => getCardNameKeyValues(card))),
    [answers, locale]
  );

  const correctCount = Object.keys(answers).length;
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
  const canRefreshRevealedAnswers =
    !endOverlay &&
    (resultsMode === "surrender" || resultsMode === "time") &&
    revealedCells.size > 0;

  function getCardNameKeyValues(card) {
    return [card?.name, card?.nameEn, getCardName(card, locale)]
      .map((name) => normalize(name))
      .filter(Boolean);
  }

  function getSubmittedFallbackName() {
    return answer.trim() || (locale === "en" ? "That card" : "Esa carta");
  }

  const gridPreparationSources = useMemo(() => {
    if (!grid) return [];

    const conditionIcons = [...grid.rows, ...grid.columns]
      .map((condition) => condition.icon)
      .filter(Boolean);
    const answerImages = Object.values(answers).map((card) => getCardImage(card, locale));

    return [...conditionIcons, ...answerImages];
  }, [answers, grid, locale]);

  const isPreparingGrid = usePreparationGate({
    active: Boolean(selectedMode && grid),
    sources: gridPreparationSources,
    resetKey: grid?.id,
    minDurationMs: 1150,
    timeoutMs: 2400,
    fetchPriority: "high",
  });

  const suggestions = useMemo(() => {
    const normalizedAnswer = normalize(answer);
    if (suppressSuggestions || normalizedAnswer.length < 3) return [];

    // When the input already is an exact card name, keep the dropdown closed so
    // Enter submits the answer instead of re-selecting the same suggestion.
    if (getCardsByExactName(playableCards, answer).length > 0) return [];

    return getSuggestions(playableCards, answer, usedCardIds).filter(
      (card) => getCardNameKeyValues(card).every((key) => !usedCardNameKeys.has(key))
    );
  }, [playableCards, answer, usedCardIds, usedCardNameKeys, suppressSuggestions, locale]);

  useEffect(() => {
    setDailyProgress(getDailyGameProgress(CARD_GRID_GAME_ID, todayKey));
  }, [todayKey]);

  function resetGrid(nextGrid, nextMessage, options = {}) {
    const restoredAnswers = options.answers ?? {};

    setGrid(nextGrid);
    setAnswers(restoredAnswers);
    setMistakes(options.mistakes ?? 0);
    setRevealedCells(new Set(options.revealedCells ?? []));
    setSelectedCell(null);
    setAnswer("");
    setSuppressSuggestions(false);
    setPendingPlacement(null);
    setMessageTone("neutral");
    setFeedbackNonce(0);
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

    const storedRevealedCells = Array.isArray(latestProgress.revealedCellKeys)
      ? latestProgress.revealedCellKeys.filter((key) => restoredAnswers[key])
      : null;

    if (latestProgress.lastWasCorrect) {
      return {
        answers: restoredAnswers,
        revealedCells: storedRevealedCells ?? [],
        resultsMode: "won",
      };
    }

    if (storedRevealedCells) {
      return {
        answers: restoredAnswers,
        revealedCells: storedRevealedCells,
        resultsMode: latestProgress.failedReason === "surrender" ? "surrender" : "time",
      };
    }

    const revealedState = buildRevealedAnswerState({ answers: restoredAnswers, grid: nextGrid, revealedCells: Object.keys(restoredAnswers) });

    return {
      answers: revealedState.answers,
      revealedCells: Array.from(revealedState.revealedCells),
      resultsMode: latestProgress.failedReason === "surrender" ? "surrender" : "time",
    };
  }

  function triggerMessage(nextMessage, tone = "neutral") {
    setMessage(nextMessage);
    setMessageTone(tone);

    if (tone === "error") {
      setFeedbackNonce((current) => current + 1);
    }
  }

  function triggerInvalidAnswer(nextMessage) {
    triggerMessage(nextMessage, "error");
    requestAnimationFrame(() => {
      answerInputRef.current?.focus();
    });
  }

  function handleAnswerChange(value) {
    setSuppressSuggestions(false);
    setPendingPlacement(null);
    setSelectedCell(null);
    setMessageTone("neutral");
    setAnswer(value);
  }

  function handleSuggestionPick(value) {
    setAnswer(value);
    setSuppressSuggestions(true);
    setPendingPlacement(null);
    setSelectedCell(null);
    setMessageTone("neutral");
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

  function refreshRevealedAnswers() {
    if (!grid || !revealedCells.size) return;

    const refreshedState = buildRefreshedRevealedAnswerState({
      answers,
      grid,
      revealedCells,
    });

    setAnswers(refreshedState.answers);
    setRevealedCells(refreshedState.revealedCells);
    triggerMessage(t("grid.message.revealedAlternatives"), "neutral");
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
      revealedCellKeys: Array.from(revealedState.revealedCells),
      completedGridMode: snapshot.gridMode,
      lastWasCorrect: false,
      failedReason: reason,
      mistakes: snapshot.mistakes,
    });

    setDailyProgress(nextProgress);
    return revealedState;
  }

  function viewEndResults() {
    if (endOverlay && endOverlay !== "won") {
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
        revealedCellKeys: [],
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
    // Important: do not depend on locale/t/conditionPool here. Switching language
    // should only swap visible text/card images, not rebuild the board or lose
    // which cells were solved by the player.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cards.length,
    playableCards,
    modeConfig.minCandidatesPerCell,
    gridMode,
    selectedMode,
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

  function getOpenPlacementsForCards(candidateCards, currentAnswers = answers) {
    if (!grid) return [];

    const placementsByKey = new Map();

    candidateCards.forEach((card) => {
      grid.rows.forEach((row, rowIndex) => {
        grid.columns.forEach((column, columnIndex) => {
          const key = getGridCellKey(rowIndex, columnIndex);

          if (currentAnswers[key]) return;
          if (!row.predicate(card) || !column.predicate(card)) return;
          if (placementsByKey.has(key)) return;

          placementsByKey.set(key, {
            key,
            row: rowIndex,
            column: columnIndex,
            rowCondition: row,
            columnCondition: column,
            card,
          });
        });
      });
    });

    return Array.from(placementsByKey.values());
  }

  function commitPlacement(placement, sourceAnswers = answers) {
    if (!placement || !grid || sourceAnswers[placement.key]) return;

    const nextAnswers = {
      ...sourceAnswers,
      [placement.key]: placement.card,
    };

    const didCompleteGrid = Object.keys(nextAnswers).length >= TOTAL_CELLS;

    if (selectedMode === GAME_MODE_IDS.DAILY && !didCompleteGrid) {
      saveDailyChallengeResult(CARD_GRID_GAME_ID, todayKey, {
        inProgress: true,
        answerIds: serializeAnswerIds(nextAnswers),
        revealedCellKeys: Array.from(revealedCells),
        completedGridMode: gridMode,
        lastWasCorrect: false,
        failedReason: null,
        mistakes,
      });
    }

    setAnswers(nextAnswers);
    setAnswer("");
    setSuppressSuggestions(false);
    setPendingPlacement(null);
    setSelectedCell(null);

    if (didCompleteGrid) {
      if (selectedMode === GAME_MODE_IDS.DAILY) {
        completeDailyGrid(nextAnswers);
      }

      triggerMessage("");
      setEndOverlay("won");
      setResultsMode(null);
      return;
    }

    triggerMessage(t("grid.message.correct", { name: getCardName(placement.card, locale) }), "success");
  }

  function handleBoardCellPick(cell) {
    if (!pendingPlacement) return;

    const placement = pendingPlacement.placements.find(
      (candidate) => candidate.row === cell.row && candidate.column === cell.column
    );

    if (!placement) return;
    commitPlacement(placement);
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

  function surrenderGrid() {
    if (!grid || isComplete || endOverlay || resultsMode) return;

    const revealedState =
      selectedMode === GAME_MODE_IDS.DAILY
        ? finalizeDailyGridFailure("surrender")
        : buildRevealedAnswerState({ answers, grid, revealedCells });

    if (!revealedState) return;

    setAnswers(revealedState.answers);
    setRevealedCells(revealedState.revealedCells);
    setTimeLeft(0);
    setAnswer("");
    setSuppressSuggestions(true);
    setPendingPlacement(null);
    setSelectedCell(null);
    setMessage(t("grid.message.surrendered"));
    setMessageTone("neutral");
    setRewardMessage("");
    setEndOverlay("surrender");
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
      revealedCellKeys: [],
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

    const rawAnswer = answer.trim();
    const submittedName = getSubmittedFallbackName();

    if (!rawAnswer) {
      setPendingPlacement(null);
      triggerInvalidAnswer(locale === "en" ? "Type a card name first." : "Escribe primero el nombre de una carta.");
      return;
    }

    const exactMatches = getCardsByExactName(playableCards, rawAnswer);

    if (!exactMatches.length) {
      setPendingPlacement(null);
      triggerInvalidAnswer(t("grid.message.cardNotFound", { name: submittedName }));
      return;
    }

    const alreadyUsedMatch = exactMatches.find((card) =>
      usedCardIds.has(card.id) || getCardNameKeyValues(card).some((key) => usedCardNameKeys.has(key))
    );

    if (alreadyUsedMatch) {
      setPendingPlacement(null);
      triggerInvalidAnswer(
        t("grid.message.cardAlreadyUsed", { name: getCardName(alreadyUsedMatch, locale) || submittedName })
      );
      return;
    }

    const unusedMatches = exactMatches.filter(
      (card) =>
        !usedCardIds.has(card.id) &&
        getCardNameKeyValues(card).every((key) => !usedCardNameKeys.has(key))
    );

    const submittedCardName = getCardName(unusedMatches[0] ?? exactMatches[0], locale) || submittedName;
    const placements = getOpenPlacementsForCards(unusedMatches);

    if (!placements.length) {
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes);

      if (selectedMode === GAME_MODE_IDS.DAILY) {
        saveDailyChallengeResult(CARD_GRID_GAME_ID, todayKey, {
          inProgress: true,
          answerIds: serializeAnswerIds(answers),
          revealedCellKeys: Array.from(revealedCells),
          completedGridMode: gridMode,
          lastWasCorrect: false,
          failedReason: null,
          mistakes: nextMistakes,
        });
      }

      setPendingPlacement(null);
      setSelectedCell(null);
      setSuppressSuggestions(true);
      triggerInvalidAnswer(
        t("grid.message.wrongCell", {
          name: submittedCardName,
        })
      );
      return;
    }

    if (placements.length > 1) {
      const pendingCard = placements[0].card;
      setPendingPlacement({ card: pendingCard, placements });
      setSelectedCell(null);
      setSuppressSuggestions(true);
      triggerMessage(
        t("grid.message.chooseCell", { name: getCardName(pendingCard, locale) }),
        "choice"
      );
      return;
    }

    commitPlacement(placements[0]);
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

  if (isPreparingGrid) {
    return (
      <GamePageShell className="cg-page">
        <GamePreparingOverlay
          eyebrow={isDailyMode ? copy.dailyChallenge : copy.infiniteChallenge}
          title={locale === "en" ? "Preparing grid..." : "Preparando grid..."}
          description={
            locale === "en"
              ? "The tavern is setting up the clues and the board."
              : "La taberna está preparando las pistas y el tablero."
          }
        />
      </GamePageShell>
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
            pendingPlacements={pendingPlacement?.placements ?? []}
            locale={locale}
            t={t}
            onSelectCell={handleBoardCellPick}
          />

          <CardGridControls
            t={t}
            pendingPlacement={pendingPlacement}
            message={message}
            messageTone={messageTone}
            feedbackNonce={feedbackNonce}
            answer={answer}
            suggestions={suggestions}
            isComplete={isComplete}
            locale={locale}
            inputRef={answerInputRef}
            onAnswerChange={handleAnswerChange}
            onPickSuggestion={handleSuggestionPick}
            onSubmitAnswer={submitAnswer}
            onChoosePlacement={commitPlacement}
            onSurrender={surrenderGrid}
          />
        </section>

        {resultsMode && !endOverlay ? (
          <div className="cg-post-result-actions">
            {canRefreshRevealedAnswers ? (
              <button type="button" className="cg-secondary-button cg-refresh-revealed-button" onClick={refreshRevealedAnswers}>
                {t("grid.revealOtherAnswers")}
              </button>
            ) : null}
            {selectedMode === GAME_MODE_IDS.INFINITE ? (
              <button type="button" className="cg-primary-button" onClick={startNewGrid}>
                {t("grid.playAgain")}
              </button>
            ) : null}
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
