import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import LanguageToggle from "../../shared/components/LanguageToggle/LanguageToggle";
import { useLanguage } from "../../i18n/LanguageProvider";
import {
  BOOK_HOME_COPY,
  HOME_MODE_CONFIG,
  MODE_LAYOUT_CLASS_BY_ID,
  bookContainerVariants,
  bookItemVariants,
  getStatusSymbol,
} from "./homeBookConfig";
import "./HomeBook.css";

const LAYOUT_TEXT_STORAGE_KEY = "hearthdle-home-layout-text-v7";

function readLayoutTextOverrides() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return JSON.parse(window.localStorage.getItem(LAYOUT_TEXT_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function HomeBook({ loading = false, onNavigate }) {
  const { locale, t } = useLanguage();
  const [layoutTextOverrides, setLayoutTextOverrides] = useState(() => readLayoutTextOverrides());
  const [homeHoverTarget, setHomeHoverTarget] = useState(null);

  const showLayoutEditor =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("layoutEditor") === "1";

  useEffect(() => {
    function syncLayoutTextOverrides() {
      setLayoutTextOverrides(readLayoutTextOverrides());
    }

    window.addEventListener("hearthdle-layout-text-change", syncLayoutTextOverrides);
    window.addEventListener("storage", syncLayoutTextOverrides);

    return () => {
      window.removeEventListener("hearthdle-layout-text-change", syncLayoutTextOverrides);
      window.removeEventListener("storage", syncLayoutTextOverrides);
    };
  }, []);

  const copy = BOOK_HOME_COPY[locale] ?? BOOK_HOME_COPY.es;

  const homeModes = useMemo(
    () =>
      HOME_MODE_CONFIG.map((mode) => ({
        ...mode,
        layoutClass: MODE_LAYOUT_CLASS_BY_ID[mode.id] ?? mode.id,
        title: layoutTextOverrides[`${mode.id}.title`] || t(mode.titleKey),
        description: layoutTextOverrides[`${mode.id}.description`] || t(mode.descriptionKey),
      })),
    [layoutTextOverrides, t]
  );

  const featuredMode = homeModes.find((mode) => mode.featured) ?? homeModes[0];
  const wantedTitle = layoutTextOverrides["wanted.title"] || copy.wanted;

  const updatedAt = new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  function goToMode(mode) {
    onNavigate?.(mode.route ?? "/");
  }

  return (
    <main className="app-page book-home-page">
      <motion.section
        className="book-stage"
        variants={bookContainerVariants}
        initial="hidden"
        animate="visible"
        aria-label={t("home.gameModesAria")}
      >
        <div className="book-prop book-prop-candle" aria-hidden="true" />
        <div className="book-prop book-prop-cards" aria-hidden="true" />
        <div className="book-prop book-prop-coins" aria-hidden="true" />
        <div className="book-prop book-prop-mug" aria-hidden="true" />

        <div className="book-language-anchor">
          <LanguageToggle compact variant="book" className="book-language-toggle" />
        </div>

        <section className="book-page book-page-left" aria-label={copy.title.replace("\n", " ")}>
          <motion.div className="book-kicker" variants={bookItemVariants}>
            <span aria-hidden="true">✦</span>
            <span>{copy.tavern}</span>
          </motion.div>

          <motion.h1 className="book-main-title" variants={bookItemVariants}>
            {copy.title.split("\n").map((line) => (
              <span key={line}>{line}</span>
            ))}
          </motion.h1>

          <motion.article className="book-tavern-note" variants={bookItemVariants}>
            <div className="book-note-heading">
              <span aria-hidden="true">◌</span>
              <strong>{copy.innkeeperTitle}</strong>
            </div>
            <p>“{copy.innkeeperQuote}”</p>
          </motion.article>

          <motion.div
            className="book-featured-quest"
            variants={bookItemVariants}
            animate={
              homeHoverTarget === "featured"
                ? { y: -3, rotate: -0.2 }
                : { y: 0, rotate: 0 }
            }
            transition={{ duration: 0.14, ease: "easeOut" }}
          >
            <span className="book-featured-emblem" aria-hidden="true">
              ✹
            </span>
            <span className="book-featured-copy">
              <strong>{copy.featuredTitle}</strong>
              <span>{copy.featuredBody}</span>
            </span>
            <span className="book-featured-reward">
              <b>{copy.featuredRewardTitle}</b>
              <small>{copy.featuredRewardBody}</small>
            </span>
            <motion.button
              type="button"
              className="book-featured-hitbox"
              aria-label={copy.featuredTitle}
              whileTap={{ scale: 0.99 }}
              disabled={loading}
              onPointerEnter={() => setHomeHoverTarget("featured")}
              onPointerLeave={() => setHomeHoverTarget(null)}
              onFocus={() => setHomeHoverTarget("featured")}
              onBlur={() => setHomeHoverTarget(null)}
              onClick={() => goToMode(featuredMode)}
            />
          </motion.div>

          <motion.p className="book-season" variants={bookItemVariants}>
            {copy.updatedLabel} <strong>{updatedAt}</strong>
          </motion.p>
        </section>

        <section className="book-page book-page-right" aria-label={wantedTitle}>
          <motion.h2 className="book-section-title" variants={bookItemVariants}>
            {wantedTitle}
          </motion.h2>

          <motion.div
            className="book-section-divider-extra"
            variants={bookItemVariants}
            aria-hidden="true"
          />

          <motion.div className="book-quest-list" variants={bookContainerVariants}>
            {homeModes.map((mode) => (
              <motion.div
                key={mode.id}
                className={`book-quest-row book-quest-row-${mode.layoutClass}`}
                variants={bookItemVariants}
                animate={
                  homeHoverTarget === mode.id
                    ? { y: -2, scale: 1.01 }
                    : { y: 0, scale: 1 }
                }
                transition={{ duration: 0.14, ease: "easeOut" }}
              >
                <span className={`book-quest-icon-wrap book-quest-icon-${mode.layoutClass}`} aria-hidden="true">
                  <img src={mode.iconSrc} alt="" />
                </span>
                <span className={`book-quest-copy book-quest-copy-${mode.layoutClass}`}>
                  <strong>{mode.title}</strong>
                  <span>{mode.description}</span>
                </span>
                {mode.id !== "cards" ? (
                  <span className={`book-quest-status book-quest-status-${mode.layoutClass} is-${mode.dailyStatus}`}>
                    {getStatusSymbol(mode.dailyStatus)}
                  </span>
                ) : null}
                <motion.button
                  type="button"
                  className={`book-quest-hitbox book-quest-hitbox-${mode.layoutClass}`}
                  aria-label={mode.title}
                  whileTap={{ scale: 0.99 }}
                  disabled={loading}
                  onPointerEnter={() => setHomeHoverTarget(mode.id)}
                  onPointerLeave={() => setHomeHoverTarget(null)}
                  onFocus={() => setHomeHoverTarget(mode.id)}
                  onBlur={() => setHomeHoverTarget(null)}
                  onClick={() => goToMode(mode)}
                />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="book-purple-button"
            variants={bookItemVariants}
            animate={
              homeHoverTarget === "purple"
                ? { y: -2, scale: 1.015 }
                : { y: 0, scale: 1 }
            }
            transition={{ duration: 0.14, ease: "easeOut" }}
          >
            <span aria-hidden="true">✦</span>
            {loading ? copy.loading : copy.forge}
            <motion.button
              type="button"
              className="book-purple-hitbox"
              aria-label={loading ? copy.loading : copy.forge}
              whileTap={{ scale: 0.985 }}
              disabled={loading}
              onPointerEnter={() => setHomeHoverTarget("purple")}
              onPointerLeave={() => setHomeHoverTarget(null)}
              onFocus={() => setHomeHoverTarget("purple")}
              onBlur={() => setHomeHoverTarget(null)}
              onClick={() => goToMode(featuredMode)}
            />
          </motion.div>

          <motion.p className="book-signature" variants={bookItemVariants}>
            {copy.signature}
          </motion.p>
        </section>
      </motion.section>
    </main>
  );
}

export default HomeBook;
