import { useEffect, useMemo, useState } from "react";
import CardBrowser from "./components/CardBrowser";
import LanguageToggle from "./components/LanguageToggle";
import { useLanguage } from "./i18n/LanguageProvider";
import GuessManaCost from "./games/GuessManaCost";
import ImpostorGame from "./games/Impostor/ImpostorGame";
import CardGridGame from "./games/CardGrid/CardGridGame";
import "./App.css";

const HOME_MODE_CONFIG = [
  {
    id: "guessMana",
    icon: "✦",
    titleKey: "home.modes.guessMana.title",
    descriptionKey: "home.modes.guessMana.description",
    ctaKey: "home.modes.play",
    featured: true,
  },
  {
    id: "impostor",
    icon: "◈",
    titleKey: "home.modes.impostor.title",
    descriptionKey: "home.modes.impostor.description",
    ctaKey: "home.modes.play",
    featured: false,
  },
  {
    id: "grid",
    icon: "▦",
    titleKey: "home.modes.grid.title",
    descriptionKey: "home.modes.grid.description",
    ctaKey: "home.modes.play",
    featured: false,
  },
  {
    id: "cards",
    icon: "☰",
    titleKey: "home.modes.cards.title",
    descriptionKey: "home.modes.cards.description",
    ctaKey: "home.modes.open",
    featured: false,
  },
];

function App() {
  const { t } = useLanguage();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("home");

  useEffect(() => {
    fetch("/data/cards.json")
      .then((response) => response.json())
      .then((data) => {
        setCards(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error cargando cartas:", error);
        setLoading(false);
      });
  }, []);

  const homeModes = useMemo(() => {
    return HOME_MODE_CONFIG.map((mode) => ({
      ...mode,
      title: t(mode.titleKey),
      description: t(mode.descriptionKey),
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
    return <CardBrowser cards={cards} loading={loading} onBack={() => setCurrentView("home")} />;
  }

  return (
    <main className="app-page app-home-hearthstone">
      <div className="app-home-bg-layer" aria-hidden="true" />

      <div
        style={{
          position: "fixed",
          top: 14,
          right: 22,
          zIndex: 50,
        }}
      >
        <LanguageToggle compact />
      </div>

      <section className="app-home-centered-shell">
        <header className="app-home-centered-header">
          <p className="app-home-kicker">{t("home.kicker")}</p>
          <h1>Hearthdle</h1>
          <p className="app-home-subtitle">{t("home.subtitle")}</p>
          <h2>{t("home.selectMode")}</h2>
        </header>

        <section className="app-home-mode-grid" aria-label={t("home.gameModesAria")}>
          {homeModes.map((mode) => (
            <article
              key={mode.id}
              className={`app-home-mode-card ${mode.featured ? "app-home-mode-card-featured" : ""}`}
            >
              <div className="app-home-mode-icon" aria-hidden="true">
                {mode.icon}
              </div>
              <h3>{mode.title}</h3>
              <p>{mode.description}</p>
              <button
                className="app-home-mode-button"
                disabled={loading}
                onClick={() => setCurrentView(mode.id)}
              >
                {loading ? t("common.loadingLong") : mode.cta}
              </button>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}

export default App;
