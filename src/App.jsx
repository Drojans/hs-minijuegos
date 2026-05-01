import { useEffect, useState } from "react";
import CardBrowser from "./components/CardBrowser";
import GuessManaCost from "./games/GuessManaCost";
import ImpostorGame from "./games/Impostor/ImpostorGame";
import "./App.css";

const MODES = [
  {
    id: "guessMana",
    label: "Guess the Mana",
    title: "Adivina el coste",
    description: "Tapa el cristal y acierta el coste real de la carta.",
    difficulty: "Fácil",
    rounds: "10 rondas",
    cta: "Jugar",
    icon: "?",
    tone: "blue",
  },
  {
    id: "impostor",
    label: "Find the Impostor",
    title: "Encuentra el impostor",
    description: "Encuentra las 5 cartas buenas sin caer en las trampas.",
    difficulty: "Media",
    rounds: "9 cartas",
    cta: "Jugar",
    icon: "✕",
    tone: "gold",
    featured: true,
  },
  {
    id: "cards",
    label: "Card Library",
    title: "Base de datos",
    description: "Busca, filtra y revisa la colección de cartas.",
    difficulty: "Libre",
    rounds: "Colección",
    cta: "Abrir",
    icon: "◆",
    tone: "violet",
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
    <main className="app-page app-inn-home">
      <div className="app-inn-light app-inn-light-left" aria-hidden="true" />
      <div className="app-inn-light app-inn-light-right" aria-hidden="true" />

      <section className="app-inn-shell">
        <header className="app-inn-header">
          <button className="app-logo-plaque" onClick={() => setCurrentView("home")} aria-label="Inicio">
            <span className="app-logo-rune">◇</span>
            <span className="app-logo-copy">
              <strong>HS Minigame Inn</strong>
              <em>Retos de cartas</em>
            </span>
          </button>

          <nav className="app-parchment-nav" aria-label="Modos de juego">
            <button onClick={() => setCurrentView("guessMana")} disabled={loading}>Coste</button>
            <button onClick={() => setCurrentView("impostor")} disabled={loading}>Impostor</button>
            <button onClick={() => setCurrentView("cards")} disabled={loading}>Cartas</button>
          </nav>

          <button
            className="app-play-now"
            disabled={loading}
            onClick={() => setCurrentView("impostor")}
          >
            Jugar ahora
          </button>
        </header>

        <section className="app-inn-stage" aria-labelledby="app-home-title">
          <div className="app-stage-copy">
            <p className="app-eyebrow">Taberna de minijuegos</p>
            <h1 id="app-home-title">Elige tu reto</h1>
            <p>
              Tres modos rápidos para practicar memoria, coste, categorías y reconocimiento de cartas.
            </p>
          </div>

          <div className="app-mode-showcase">
            {MODES.map((mode) => (
              <article
                key={mode.id}
                className={`app-game-tile app-game-tile-${mode.tone} ${
                  mode.featured ? "is-featured" : ""
                }`}
              >
                <div className="app-tile-frame" aria-hidden="true" />
                <div className="app-tile-header">
                  <span>{mode.label}</span>
                </div>

                <div className="app-tile-preview" aria-hidden="true">
                  <div className="app-preview-card app-preview-card-main">
                    <span>{mode.icon}</span>
                  </div>
                  <div className="app-preview-card app-preview-card-side" />
                  <div className="app-preview-spark app-preview-spark-one" />
                  <div className="app-preview-spark app-preview-spark-two" />
                </div>

                <div className="app-tile-body">
                  <h2>{mode.title}</h2>
                  <p>{mode.description}</p>

                  <div className="app-tile-meta">
                    <span>{mode.difficulty}</span>
                    <span>{mode.rounds}</span>
                  </div>

                  <button
                    className="app-tile-button"
                    disabled={loading}
                    onClick={() => setCurrentView(mode.id)}
                  >
                    {loading ? "Cargando..." : mode.cta}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="app-table-dressing" aria-hidden="true">
            <span className="app-gem app-gem-blue" />
            <span className="app-gem app-gem-purple" />
            <span className="app-coin app-coin-one" />
            <span className="app-coin app-coin-two" />
            <span className="app-card-stack" />
            <span className="app-beer-mug" />
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;
