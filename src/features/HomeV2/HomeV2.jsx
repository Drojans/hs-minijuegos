import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import LanguageToggle from "../../shared/components/LanguageToggle/LanguageToggle";
import { getPackCount, REWARDS_UPDATED_EVENT } from "../../shared/rewards/rewardStore";
import { COLLECTION_UPDATED_EVENT, getOwnedCardCount } from "../../shared/collection/collectionStore";
import { getEligiblePackCards } from "../../shared/packs/packOpening";
import { DAILY_PROGRESS_UPDATED_EVENT, getDailyGameProgress, getTodayKey } from "../../shared/progress/dailyProgress";
import { useLanguage } from "../../i18n/LanguageProvider";
import { HOME_V2_COPY, HOME_V2_MODES } from "./homeV2Config";
import "./HomeV2.css";

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

function getDailyCardState(progress) {
  if (!progress?.completed) return null;

  const won = progress.lastWasCorrect === true || progress.lastWasWon === true;
  return won ? "won" : "lost";
}

const DAILY_GAME_IDS_BY_MODE_ID = {
  guessMana: "guess-mana",
  impostor: "impostor",
  grid: "card-grid",
};

function HomeV2({ cards = [], loading = false, onNavigate }) {
  const { locale } = useLanguage();
  const [resetTime, setResetTime] = useState(() => getTimeUntilNextLocalMidnight());
  const [packCount, setPackCount] = useState(() => getPackCount());
  const copy = HOME_V2_COPY[locale] ?? HOME_V2_COPY.es;
  const todayKey = useMemo(() => getTodayKey(), []);

  function readDailyModeProgress() {
    return Object.fromEntries(
      Object.entries(DAILY_GAME_IDS_BY_MODE_ID).map(([modeId, gameId]) => [
        modeId,
        getDailyGameProgress(gameId, todayKey),
      ]),
    );
  }

  const [dailyModeProgress, setDailyModeProgress] = useState(readDailyModeProgress);
  const [ownedCardCount, setOwnedCardCount] = useState(() => getOwnedCardCount());

  const collectibleCardCount = useMemo(() => getEligiblePackCards(cards).length, [cards]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setResetTime(getTimeUntilNextLocalMidnight());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    function syncPackCount() {
      setPackCount(getPackCount());
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
  }, [todayKey]);

  const modes = useMemo(
    () =>
      HOME_V2_MODES.map((mode) => ({
        ...mode,
        title: mode[locale]?.title ?? mode.es.title,
        ctaKey: mode[locale]?.cta ?? mode.es.cta,
      })),
    [locale]
  );

  const gameModes = useMemo(() => modes.filter((mode) => mode.group === "games"), [modes]);
  const libraryModes = useMemo(() => modes.filter((mode) => mode.group === "library"), [modes]);

  function handleNavigate(route) {
    if (!route || loading) return;
    onNavigate?.(route);
  }


  function renderModeIcon(mode) {
    if (mode.iconSrc) {
      return <img src={mode.iconSrc} alt="" draggable="false" />;
    }

    return mode.icon;
  }

  function renderModeCard(mode, index) {
    const disabled = !mode.route || loading;
    const showBadge = mode.kind === "soon";
    const badgeLabel = copy[mode.kind] ?? mode.kind;
    const dailyState = getDailyCardState(dailyModeProgress[mode.id]);
    const dailyStateLabel = dailyState === "won" ? copy.dailyWon : dailyState === "lost" ? copy.dailyLost : "";

    return (
      <motion.button
        key={mode.id}
        type="button"
        className={`home-v2-mode-card is-${mode.accent} ${!mode.route ? "is-disabled" : ""} ${dailyState ? `is-daily-${dailyState}` : ""}`}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.34, delay: 0.1 + index * 0.035, ease: [0.22, 1, 0.36, 1] }}
        disabled={disabled}
        onClick={() => handleNavigate(mode.route)}
        aria-label={dailyStateLabel ? `${mode.title}. ${dailyStateLabel}` : mode.title}
      >
        {showBadge ? <span className={`home-v2-mode-badge is-${mode.kind}`}>{badgeLabel}</span> : null}
        {dailyState ? (
          <span className={`home-v2-daily-state-mark is-${dailyState}`} aria-hidden="true">
            {dailyState === "won" ? "✓" : "×"}
          </span>
        ) : null}
        <div className="home-v2-mode-icon" aria-hidden="true">{renderModeIcon(mode)}</div>
        <h3>{mode.title}</h3>
      </motion.button>
    );
  }

  return (
    <main className="home-v2-page">
      <div className="home-v2-bg" aria-hidden="true">
        <span className="home-v2-glow home-v2-glow-a" />
        <span className="home-v2-glow home-v2-glow-b" />
      </div>

      <header className="home-v2-header">
        <nav className="home-v2-nav" aria-label="Principal">
          <button type="button" className="is-active" onClick={() => handleNavigate("/")}>{copy.navMinigames}</button>
          <button type="button" onClick={() => handleNavigate("/cards")}>{copy.navCards}</button>
          <button type="button" onClick={() => handleNavigate("/collection")}>{copy.navCollection}</button>
        </nav>

        <button
          type="button"
          className="home-v2-brand"
          onClick={() => handleNavigate("/")}
          aria-label="Hearthdle"
        >
          <img className="home-v2-brand-mug is-left" src="/ui/book/prop-right-mug-cartoon.png" alt="" />
          <span>Hearthdle</span>
          <img className="home-v2-brand-mug" src="/ui/book/prop-right-mug-cartoon.png" alt="" />
        </button>

        <div className="home-v2-actions">
          <LanguageToggle compact className="home-v2-language" />
          <button type="button" className="home-v2-icon-button" aria-label={copy.infoLabel}>?</button>
        </div>
      </header>

      <section className="home-v2-shell" aria-label={copy.navMinigames}>
        <div className="home-v2-status-row">
          <motion.button
            type="button"
            className="home-v2-collection-pill"
            onClick={() => handleNavigate("/collection")}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.02, ease: [0.22, 1, 0.36, 1] }}
          >
            <span>{copy.collectionProgress}</span>
            <strong>{ownedCardCount} / {collectibleCardCount || "—"}</strong>
          </motion.button>
          <motion.div
            className="home-v2-reset-pill"
            aria-live="polite"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="home-v2-reset-dot" aria-hidden="true" />
            <span>{copy.resetPrefix}</span>
            <strong>{resetTime}</strong>
          </motion.div>

          <motion.div
            className="home-v2-pack-counter"
            aria-live="polite"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="home-v2-pack-icon" aria-hidden="true">✦</span>
            <span>{copy.packLabel}</span>
            <strong>{packCount}</strong>
          </motion.div>
        </div>


        <motion.section
          className="home-v2-modes-section"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="home-v2-section-label">
            <span aria-hidden="true" />
            <h2>{copy.gamesTitle}</h2>
            <span aria-hidden="true" />
          </div>

          <div className="home-v2-mode-grid is-games">
            {gameModes.map(renderModeCard)}
          </div>
        </motion.section>

        <motion.section
          className="home-v2-modes-section is-library"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="home-v2-section-label is-secondary">
            <span aria-hidden="true" />
            <h2>{copy.libraryTitle}</h2>
            <span aria-hidden="true" />
          </div>

          <div className="home-v2-mode-grid is-library">
            {libraryModes.map(renderModeCard)}
          </div>
        </motion.section>
      </section>
    </main>
  );
}

export default HomeV2;
