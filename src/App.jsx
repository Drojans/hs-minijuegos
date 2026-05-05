import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import CardDatabase from "./features/CardDatabase/CardDatabase";
import LanguageToggle from "./shared/components/LanguageToggle/LanguageToggle";
import { useLanguage } from "./i18n/LanguageProvider";
import { useCardsData } from "./hooks/useCardsData";
import GuessManaCost from "./games/GuessManaCost/GuessManaCost";
import ImpostorGame from "./games/Impostor/ImpostorGame";
import CardGridGame from "./games/CardGrid/CardGridGame";
import "./App.css";
import LayoutEditor from "./dev/LayoutEditor";

const BOOK_ASSET_PATH = "/ui/book/";

const HOME_MODE_CONFIG = [
  {
    id: "guessMana",
    iconSrc: `${BOOK_ASSET_PATH}icon-mode-mana-cartoon.png`,
    titleKey: "home.modes.guessMana.title",
    descriptionKey: "home.modes.guessMana.description",
    dailyStatus: "won",
    featured: true,
  },
  {
    id: "impostor",
    iconSrc: `${BOOK_ASSET_PATH}icon-mode-impostor-cartoon.png`,
    titleKey: "home.modes.impostor.title",
    descriptionKey: "home.modes.impostor.description",
    dailyStatus: "idle",
  },
  {
    id: "grid",
    iconSrc: `${BOOK_ASSET_PATH}icon-mode-grid-cartoon.png`,
    titleKey: "home.modes.grid.title",
    descriptionKey: "home.modes.grid.description",
    dailyStatus: "lost",
  },
  {
    id: "cards",
    iconSrc: `${BOOK_ASSET_PATH}icon-mode-database-cartoon.png`,
    titleKey: "home.modes.cards.title",
    descriptionKey: "home.modes.cards.description",
    dailyStatus: "neutral",
  },
];

const MODE_LAYOUT_CLASS_BY_ID = {
  guessMana: "guess",
  impostor: "impostor",
  grid: "grid",
  cards: "cards",
};

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

const BOOK_HOME_COPY = {
  es: {
    tavern: "Taberna de Hearthdle",
    title: "Diario\nde Misiones",
    wanted: "Se busca",
    innkeeperTitle: "El tabernero ruge:",
    innkeeperQuote: "Â¡Hace frÃ­o ahÃ­ fuera! AcÃ©rcate a la lumbre y baraja.",
    featuredTitle: "MisiÃ³n destacada de la taberna",
    featuredBody: "AquÃ­ irÃ¡ la misiÃ³n especial del dÃ­a, el reto de temporada o el evento destacado.",
    featuredRewardTitle: "PrÃ³ximamente",
    featuredRewardBody: "Un hueco reservado para algo con mÃ¡s personalidad.",
    updatedLabel: "Actualizado:",
    forge: "Forjar misiÃ³n de leyenda",
    signature: "~ Firma aquÃ­ al completar tu gesta ~",
    loading: "Preparando mazo...",
  },
  en: {
    tavern: "Hearthdle Tavern",
    title: "Quest\nJournal",
    wanted: "Wanted",
    innkeeperTitle: "The innkeeper roars:",
    innkeeperQuote: "It is cold out there! Come by the fire and shuffle your deck.",
    featuredTitle: "Featured tavern quest",
    featuredBody: "This space is reserved for the daily special quest, seasonal challenge, or featured event.",
    featuredRewardTitle: "Coming soon",
    featuredRewardBody: "A reserved slot for something with more personality.",
    updatedLabel: "Updated:",
    forge: "Forge legendary quest",
    signature: "~ Sign here when your quest is complete ~",
    loading: "Preparing deck...",
  },
};

const bookContainerVariants = {
  hidden: { opacity: 0, scale: 0.986, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.045 },
  },
};

const bookItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
};

function getStatusSymbol(status) {
  switch (status) {
    case "won":
      return "âœ“";
    case "lost":
      return "âœ•";
    case "idle":
      return "â€”";
    default:
      return "";
  }
}

function App() {
  const { locale, t } = useLanguage();
  const { cards, loading } = useCardsData();
  const [currentView, setCurrentView] = useState("home");
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

  if (currentView === "guessMana") {
    return <GuessManaCost cards={cards} onBack={() => setCurrentView("home")} />;
  }

  if (currentView === "impostor") {
    return <ImpostorGame cards={cards} onBack={() => setCurrentView("home")} />;
  }

  if (currentView === "grid") {
    return <CardGridGame cards={cards} onBack={() => setCurrentView("home")} />;
  }

  if (currentView === "cards") {
    return <CardDatabase cards={cards} loading={loading} onBack={() => setCurrentView("home")} />;
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

        <section className="book-page book-page-left" aria-label="Quest journal">
          <motion.div className="book-kicker" variants={bookItemVariants}>
            <span aria-hidden="true">âœ¦</span>
            <span>{copy.tavern}</span>
          </motion.div>

          <motion.h1 className="book-main-title" variants={bookItemVariants}>
            {copy.title.split("\n").map((line) => (
              <span key={line}>{line}</span>
            ))}
          </motion.h1>

          <motion.article className="book-tavern-note" variants={bookItemVariants}>
            <div className="book-note-heading">
              <span aria-hidden="true">â—Œ</span>
              <strong>{copy.innkeeperTitle}</strong>
            </div>
            <p>â€œ{copy.innkeeperQuote}â€</p>
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
              âœ¹
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
              onClick={() => setCurrentView(featuredMode.id)}
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
                  onClick={() => setCurrentView(mode.id)}
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
            <span aria-hidden="true">âœ¦</span>
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
              onClick={() => setCurrentView(featuredMode.id)}
            />
          </motion.div>

          <motion.p className="book-signature" variants={bookItemVariants}>
            {copy.signature}
          </motion.p>
        </section>
      </motion.section>

      {showLayoutEditor ? <LayoutEditor /> : null}
    </main>
  );
}

export default App;

