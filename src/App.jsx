import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Eye, Gem, Grid3X3, LibraryBig, Sparkles } from "lucide-react";
import CardDatabase from "./features/CardDatabase/CardDatabase";
import LanguageToggle from "./shared/components/LanguageToggle/LanguageToggle";
import { useLanguage } from "./i18n/LanguageProvider";
import { useCardsData } from "./hooks/useCardsData";
import GuessManaCost from "./games/GuessManaCost/GuessManaCost";
import ImpostorGame from "./games/Impostor/ImpostorGame";
import CardGridGame from "./games/CardGrid/CardGridGame";
import "./App.css";

const HOME_MODE_CONFIG = [
  {
    id: "guessMana",
    Icon: Gem,
    titleKey: "home.modes.guessMana.title",
    descriptionKey: "home.modes.guessMana.description",
    metaKey: "home.modes.guessMana.meta",
    badgeKey: "home.badges.ready",
    ctaKey: "home.modes.play",
    theme: "mana",
    featured: true,
  },
  {
    id: "impostor",
    Icon: Eye,
    titleKey: "home.modes.impostor.title",
    descriptionKey: "home.modes.impostor.description",
    metaKey: "home.modes.impostor.meta",
    badgeKey: "home.badges.multilang",
    ctaKey: "home.modes.play",
    theme: "impostor",
    featured: false,
  },
  {
    id: "grid",
    Icon: Grid3X3,
    titleKey: "home.modes.grid.title",
    descriptionKey: "home.modes.grid.description",
    metaKey: "home.modes.grid.meta",
    badgeKey: "home.badges.strategy",
    ctaKey: "home.modes.play",
    theme: "grid",
    featured: false,
  },
  {
    id: "cards",
    Icon: LibraryBig,
    titleKey: "home.modes.cards.title",
    descriptionKey: "home.modes.cards.description",
    metaKey: "home.modes.cards.meta",
    badgeKey: "home.badges.collection",
    ctaKey: "home.modes.open",
    theme: "database",
    featured: false,
  },
];

const homeContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.085,
      delayChildren: 0.06,
    },
  },
};

const homeItemVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
  },
};

function App() {
  const { t } = useLanguage();
  const { cards, loading } = useCardsData();
  const [currentView, setCurrentView] = useState("home");

  const homeModes = useMemo(() => {
    return HOME_MODE_CONFIG.map((mode) => ({
      ...mode,
      title: t(mode.titleKey),
      description: t(mode.descriptionKey),
      meta: t(mode.metaKey),
      badge: t(mode.badgeKey),
      cta: t(mode.ctaKey),
    }));
  }, [t]);

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
    <main className="app-page app-home-hearthstone">
      <div className="app-home-bg-layer" aria-hidden="true">
        <span className="app-home-orb app-home-orb-a" />
        <span className="app-home-orb app-home-orb-b" />
        <span className="app-home-orb app-home-orb-c" />
        <span className="app-home-rune app-home-rune-a">✦</span>
        <span className="app-home-rune app-home-rune-b">✧</span>
      </div>

      <div className="app-language-anchor">
        <LanguageToggle compact />
      </div>

      <motion.section
        className="app-home-shell"
        variants={homeContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.header className="app-home-hero" variants={homeItemVariants}>
          <div className="app-home-kicker-row">
            <span className="app-home-kicker-icon" aria-hidden="true">
              <Sparkles size={15} />
            </span>
            <p className="app-home-kicker">{t("home.kicker")}</p>
          </div>

          <h1>
            <span>Hearthdle</span>
          </h1>

          <p className="app-home-subtitle">{t("home.subtitle")}</p>
          <p className="app-home-lead">{t("home.heroLead")}</p>
        </motion.header>

        <motion.section
          className="app-home-mode-grid"
          aria-label={t("home.gameModesAria")}
          variants={homeContainerVariants}
        >
          {homeModes.map((mode) => (
            <motion.article
              key={mode.id}
              className={`app-home-mode-card app-home-mode-card-${mode.theme} ${
                mode.featured ? "app-home-mode-card-featured" : ""
              }`}
              variants={homeItemVariants}
              whileHover={{ y: -8, scale: 1.015 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="app-home-card-glow" aria-hidden="true" />

              <div className="app-home-mode-topline">
                <span className="app-home-mode-badge">{mode.badge}</span>
                <span className="app-home-mode-meta">{mode.meta}</span>
              </div>

              <div className="app-home-mode-icon" aria-hidden="true">
                <mode.Icon size={30} strokeWidth={2.35} />
              </div>

              <h2>{mode.title}</h2>
              <p>{mode.description}</p>

              <button
                className="app-home-mode-button"
                disabled={loading}
                onClick={() => setCurrentView(mode.id)}
              >
                <span>{loading ? t("common.loadingLong") : mode.cta}</span>
                <span aria-hidden="true">→</span>
              </button>
            </motion.article>
          ))}
        </motion.section>
      </motion.section>
    </main>
  );
}

export default App;
