import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { getArcaneBoxCount, REWARDS_UPDATED_EVENT } from "../../shared/rewards/rewardStore";
import { COLLECTION_UPDATED_EVENT, getOwnedCardCount } from "../../shared/collection/collectionStore";
import { DAILY_MODE_GAME_IDS_BY_HOME_MODE } from "../../shared/config/gameRules";
import { getEligibleCollectionCards } from "../../shared/packs/packOpening";
import {
  DAILY_CHALLENGE_STATES,
  DAILY_PROGRESS_UPDATED_EVENT,
  getDailyChallengeState,
  getDailyGameProgress,
  getTodayKey,
} from "../../shared/progress/dailyProgress";
import { useLanguage } from "../../i18n/LanguageProvider";
import { normalizeLocale } from "../../i18n/translations";
import { HOME_V3_COPY, HOME_V3_MODES } from "./homeV3Config";
import "./HomeV3.css";

function padTimePart(value) {
  return String(value).padStart(2, "0");
}

function getTimeUntilNextLocalMidnight() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0);

  const diffMs = Math.max(0, tomorrow.getTime() - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${padTimePart(hours)}:${padTimePart(minutes)}:${padTimePart(seconds)}`;
}

function HomeV3({ cards = [], loading = false, onNavigate }) {
  const { locale } = useLanguage();
  const activeLocale = normalizeLocale(locale);
  const [resetTime, setResetTime] = useState(() => getTimeUntilNextLocalMidnight());
  const [packCount, setPackCount] = useState(() => getArcaneBoxCount());
  const copy = HOME_V3_COPY[activeLocale] ?? HOME_V3_COPY.es;
  const todayKey = useMemo(() => getTodayKey(), []);

  const readDailyModeProgress = useCallback(() => {
    return Object.fromEntries(
      Object.entries(DAILY_MODE_GAME_IDS_BY_HOME_MODE).map(([modeId, gameId]) => [
        modeId,
        getDailyGameProgress(gameId, todayKey),
      ])
    );
  }, [todayKey]);

  const [dailyModeProgress, setDailyModeProgress] = useState(() => readDailyModeProgress());
  const [ownedCardCount, setOwnedCardCount] = useState(() => getOwnedCardCount());

  const collectibleCardCount = useMemo(() => getEligibleCollectionCards(cards).length, [cards]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setResetTime(getTimeUntilNextLocalMidnight());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    function syncPackCount() {
      setPackCount(getArcaneBoxCount());
    }

    syncPackCount();
    window.addEventListener(REWARDS_UPDATED_EVENT, syncPackCount);
    window.addEventListener("storage", syncPackCount);
    window.addEventListener("focus", syncPackCount);

    return () => {
      window.removeEventListener(REWARDS_UPDATED_EVENT, syncPackCount);
      window.removeEventListener("storage", syncPackCount);
      window.removeEventListener("focus", syncPackCount);
    };
  }, []);

  useEffect(() => {
    function syncHomeProgress() {
      setDailyModeProgress(readDailyModeProgress());
      setOwnedCardCount(getOwnedCardCount());
    }

    syncHomeProgress();
    window.addEventListener(DAILY_PROGRESS_UPDATED_EVENT, syncHomeProgress);
    window.addEventListener(COLLECTION_UPDATED_EVENT, syncHomeProgress);
    window.addEventListener("storage", syncHomeProgress);
    window.addEventListener("focus", syncHomeProgress);

    return () => {
      window.removeEventListener(DAILY_PROGRESS_UPDATED_EVENT, syncHomeProgress);
      window.removeEventListener(COLLECTION_UPDATED_EVENT, syncHomeProgress);
      window.removeEventListener("storage", syncHomeProgress);
      window.removeEventListener("focus", syncHomeProgress);
    };
  }, [readDailyModeProgress]);

  const modes = useMemo(
    () =>
      HOME_V3_MODES.map((mode) => ({
        ...mode,
        title: mode[activeLocale]?.title ?? mode.es.title,
        description: mode[activeLocale]?.description ?? mode.es.description,
      })),
    [activeLocale]
  );

  const gameModes = useMemo(() => modes.filter((mode) => mode.group === "games"), [modes]);
  const libraryModes = useMemo(() => modes.filter((mode) => mode.group === "library"), [modes]);

  function handleNavigate(route) {
    if (!route || loading) return;
    onNavigate?.(route);
  }

  function renderWaxSeal(dailyState) {
    if (dailyState === "won") {
      return (
        <div className="home-v3-seal is-won" title={copy.dailyWon}>
          <svg className="home-v3-seal-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      );
    }
    if (dailyState === "lost") {
      return (
        <div className="home-v3-seal is-lost" title={copy.dailyLost}>
          <svg className="home-v3-seal-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
      );
    }
    return (
      <div className="home-v3-seal is-pending" title={copy.dailyPending}>
        <svg className="home-v3-seal-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
    );
  }

  function renderTileIcon(mode) {
    if (mode.iconSrc) {
      return <img src={mode.iconSrc} alt="" draggable="false" className="home-v3-icon-img" />;
    }
    return <span className="home-v3-tile-emoji">{mode.icon}</span>;
  }

  function renderGameTile(mode, index) {
    const disabled = !mode.route || loading;
    const rawDailyState = getDailyChallengeState(dailyModeProgress[mode.id]);
    const dailyState = rawDailyState === DAILY_CHALLENGE_STATES.PENDING ? null : rawDailyState;

    return (
      <motion.button
        key={mode.id}
        type="button"
        className={`home-v3-tile is-${mode.accent} ${dailyState ? `is-daily-${dailyState}` : "is-daily-pending"}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.36, delay: 0.05 + index * 0.03, ease: [0.25, 1, 0.5, 1] }}
        disabled={disabled}
        onClick={() => handleNavigate(mode.route)}
        aria-label={`${mode.title}. ${dailyState ? (dailyState === "won" ? copy.dailyWon : copy.dailyLost) : copy.dailyPending}`}
      >
        <div className="home-v3-tile-status" aria-hidden="true">
          {renderWaxSeal(dailyState)}
        </div>
        <div className="home-v3-tile-icon" aria-hidden="true">
          {renderTileIcon(mode)}
        </div>
        <div className="home-v3-tile-text">
          <h3>{mode.title}</h3>
          <p>{mode.description}</p>
        </div>
      </motion.button>
    );
  }

  function renderLibraryTile(mode, index) {
    const disabled = !mode.route || loading;

    return (
      <motion.button
        key={mode.id}
        type="button"
        className={`home-v3-library-card is-${mode.accent}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.32, delay: 0.22 + index * 0.03, ease: [0.25, 1, 0.5, 1] }}
        disabled={disabled}
        onClick={() => handleNavigate(mode.route)}
      >
        <div className="home-v3-library-icon" aria-hidden="true">
          {renderTileIcon(mode)}
        </div>
        <h4>{mode.title}</h4>
        <p>{mode.description}</p>
      </motion.button>
    );
  }

  return (
    <main className="home-v3-page">
      {/* 3 Individual Wooden Placards (Tavern Dashboard) */}
      <div className="home-v3-placards-container">
        {/* Collection Placard */}
        <button 
          type="button" 
          className="home-v3-placard is-collection" 
          onClick={() => handleNavigate("/collection")}
        >
          <div className="home-v3-placard-icon-wrapper">
            <img 
              src="/ui/home-v2-icons/icon-mode-collection.png" 
              alt="" 
              draggable="false" 
              className="home-v3-placard-icon" 
            />
          </div>
          <div className="home-v3-placard-text">
            <h4>{copy.collectionProgress}</h4>
          </div>
          <div className="home-v3-circular-progress">
            <svg width="60" height="60" viewBox="0 0 60 60" className="home-v3-circular-svg">
              {/* Outer decorative gold line */}
              <circle 
                cx="30" 
                cy="30" 
                r="27" 
                fill="none" 
                stroke="rgba(240, 201, 106, 0.32)" 
                strokeWidth="1.2" 
              />
              {/* Main background track */}
              <circle 
                className="home-v3-circular-bg" 
                cx="30" 
                cy="30" 
                r="23" 
                fill="none" 
                stroke="rgba(0, 0, 0, 0.55)" 
                strokeWidth="5" 
              />
              {/* Progress fill */}
              <circle 
                className="home-v3-circular-fill" 
                cx="30" 
                cy="30" 
                r="23" 
                fill="none" 
                stroke="#c68936" 
                strokeWidth="5" 
                strokeDasharray="144.5" 
                strokeDashoffset={144.5 - ((collectibleCardCount ? Math.min(100, Math.round((ownedCardCount / collectibleCardCount) * 100)) : 0) / 100) * 144.5}
                strokeLinecap="round"
                transform="rotate(-90 30 30)"
              />
              {/* Inner accent ring */}
              <circle 
                cx="30" 
                cy="30" 
                r="19" 
                fill="none" 
                stroke="rgba(240, 201, 106, 0.18)" 
                strokeWidth="1" 
              />
            </svg>
            <span className="home-v3-circular-text">
              {collectibleCardCount ? Math.min(100, Math.round((ownedCardCount / collectibleCardCount) * 100)) : 0}%
            </span>
          </div>
        </button>

        {/* Reset Clock Placard */}
        <div className="home-v3-placard is-timer">
          <div className="home-v3-placard-text is-centered">
            <h4>{copy.resetPrefix}</h4>
            <div className="home-v3-placard-divider" aria-hidden="true">
              <span className="home-v3-placard-divider-gem" />
            </div>
            <span className="home-v3-timer-display">{resetTime}</span>
          </div>
        </div>

        {/* Chests / Packs Placard */}
        <button 
          type="button" 
          className={`home-v3-placard is-chests ${packCount > 0 ? "has-packs" : ""}`}
          onClick={() => handleNavigate("/collection")}
        >
          <div className="home-v3-placard-icon-wrapper">
            <img 
              src="/ui/rewards/arcane-box-closed.png" 
              alt="" 
              draggable="false" 
              className="home-v3-placard-icon" 
            />
          </div>
          <div className="home-v3-placard-text">
            <h4>{copy.packLabel}</h4>
          </div>
          <div className="home-v3-circular-progress is-chests">
            <svg width="60" height="60" viewBox="0 0 60 60" className="home-v3-circular-svg">
              {/* Outer decorative line (glows if packs > 0) */}
              <circle 
                cx="30" 
                cy="30" 
                r="27" 
                fill="none" 
                stroke={packCount > 0 ? "rgba(235, 152, 78, 0.45)" : "rgba(240, 201, 106, 0.32)"} 
                strokeWidth="1.2" 
                className={packCount > 0 ? "home-v3-chests-glow-ring" : ""}
              />
              {/* Main background track */}
              <circle 
                className="home-v3-circular-bg" 
                cx="30" 
                cy="30" 
                r="23" 
                fill="none" 
                stroke="rgba(0, 0, 0, 0.55)" 
                strokeWidth="5" 
              />
              {/* Progress fill */}
              <circle 
                className={`home-v3-circular-fill ${packCount > 0 ? "has-packs" : "is-empty"}`} 
                cx="30" 
                cy="30" 
                r="23" 
                fill="none" 
                stroke={packCount > 0 ? "#eb984e" : "rgba(240, 201, 106, 0.15)"} 
                strokeWidth="5" 
                strokeDasharray="144.5" 
                strokeDashoffset={packCount > 0 ? 0 : 144.5}
                strokeLinecap="round"
                transform="rotate(-90 30 30)"
              />
              {/* Inner accent ring */}
              <circle 
                cx="30" 
                cy="30" 
                r="19" 
                fill="none" 
                stroke="rgba(240, 201, 106, 0.18)" 
                strokeWidth="1" 
              />
            </svg>
            <span className={`home-v3-circular-text ${packCount > 0 ? "has-packs" : ""}`}>
              {packCount}
            </span>
          </div>
        </button>
      </div>

      {/* Center Board (Active Challenges) */}
      <section className="home-v3-board" aria-label={copy.gamesTitle}>
        <div className="home-v3-board-bezel" aria-hidden="true" />
        
        {/* Grid of active challenges (Square cards layout) */}
        <div className="home-v3-games-grid">
          {gameModes.map(renderGameTile)}
        </div>

        {/* Library utilities section */}
        <div className="home-v3-library-section">
          <div className="home-v3-library-label">
            <span />
            <h3>{copy.libraryTitle}</h3>
            <span />
          </div>
          <div className="home-v3-library-grid">
            {libraryModes.map(renderLibraryTile)}
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomeV3;
