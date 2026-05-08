import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import LanguageToggle from "../../shared/components/LanguageToggle/LanguageToggle";
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

function HomeV2({ loading = false, onNavigate }) {
  const { locale } = useLanguage();
  const [resetTime, setResetTime] = useState(() => getTimeUntilNextLocalMidnight());
  const copy = HOME_V2_COPY[locale] ?? HOME_V2_COPY.es;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setResetTime(getTimeUntilNextLocalMidnight());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

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

    return (
      <motion.button
        key={mode.id}
        type="button"
        className={`home-v2-mode-card is-${mode.accent} ${!mode.route ? "is-disabled" : ""}`}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.34, delay: 0.1 + index * 0.035, ease: [0.22, 1, 0.36, 1] }}
        disabled={disabled}
        onClick={() => handleNavigate(mode.route)}
      >
        {showBadge ? <span className={`home-v2-mode-badge is-${mode.kind}`}>{badgeLabel}</span> : null}
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
          <button type="button" disabled>{copy.navCollection}</button>
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
