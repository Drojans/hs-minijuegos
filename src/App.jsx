import { useEffect, useState } from "react";
import CardBrowser from "./components/CardBrowser";
import GuessManaCost from "./games/GuessManaCost";
import ImpostorGame from "./games/Impostor/ImpostorGame";
import "./App.css";

const HOME_MODES = [
  {
    id: "guessMana",
    icon: "✦",
    title: "Adivina el coste",
    description: "Observa la carta y selecciona su coste real de maná.",
    cta: "Jugar",
    featured: true,
  },
  {
    id: "impostor",
    icon: "◈",
    title: "Encuentra el impostor",
    description: "Encuentra las cartas correctas y evita las trampas de cada ronda.",
    cta: "Jugar",
    featured: false,
  },
  {
    id: "cards",
    icon: "☰",
    title: "Base de datos",
    description: "Explora la colección, filtra cartas y ábrelas en grande.",
    cta: "Abrir",
    featured: false,
  },
];

function App() {
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

  if (currentView === "guessMana") {
    return <GuessManaCost cards={cards} onBack={() => setCurrentView("home")} />;
  }

  if (currentView === "impostor") {
    return <ImpostorGame cards={cards} onBack={() => setCurrentView("home")} />;
  }

  if (currentView === "cards") {
    return <CardBrowser cards={cards} loading={loading} onBack={() => setCurrentView("home")} />;
  }

  return (
    <main className="app-page app-home-hearthstone">
      <div className="app-home-bg-layer" aria-hidden="true" />

      <section className="app-home-centered-shell">
        <header className="app-home-centered-header">
          <p className="app-home-kicker">Hearthstone fan minigames</p>
          <h1>Hearthdle</h1>
          <p className="app-home-subtitle">Adivina cartas de Hearthstone</p>
          <h2>Selecciona un modo</h2>
        </header>

        <section className="app-home-mode-grid" aria-label="Modos de juego">
          {HOME_MODES.map((mode) => (
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
                {loading ? "Cargando..." : mode.cta}
              </button>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}

export default App;
