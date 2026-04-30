import { useEffect, useState } from "react";
import CardBrowser from "./components/CardBrowser";
import GuessManaCost from "./games/GuessManaCost";
import "./App.css";

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

  if (currentView === "cards") {
    return <CardBrowser cards={cards} loading={loading} onBack={() => setCurrentView("home")} />;
  }

  return (
    <main className="app-page">
      <section className="app-hero">
        <p className="app-eyebrow">HS Cards Project</p>
        <h1>Minijuegos de Hearthstone</h1>
        <p className="app-intro">
          Juega, practica y aprende cartas de Hearthstone con minijuegos rápidos
          basados en tu propia base de datos.
        </p>

        <div className="app-actions">
          <button
            className="app-button app-button-primary"
            disabled={loading}
            onClick={() => setCurrentView("guessMana")}
          >
            Jugar ahora
          </button>

          <button
            className="app-button app-button-secondary"
            disabled={loading}
            onClick={() => setCurrentView("cards")}
          >
            Ver cartas
          </button>
        </div>

        <p className="app-small-note">
          {loading ? "Cargando base de datos..." : `${cards.length} cartas cargadas`}
        </p>
      </section>

      <section className="app-games-grid">
        <article className="app-game-card app-game-card-active">
          <span className="app-badge">Disponible</span>
          <h2>Adivina el coste</h2>
          <p>
            Mira la carta con el maná oculto y elige cuánto cuesta. Una partida
            rápida de 10 rondas.
          </p>
          <button
            className="app-button app-button-primary"
            disabled={loading}
            onClick={() => setCurrentView("guessMana")}
          >
            Jugar
          </button>
        </article>

        <article className="app-game-card app-game-card-muted">
          <span className="app-badge app-badge-muted">Próximamente</span>
          <h2>Adivina la carta</h2>
          <p>Mira el texto de una carta y elige su nombre correcto entre varias opciones.</p>
        </article>

        <article className="app-game-card app-game-card-muted">
          <span className="app-badge app-badge-muted">Próximamente</span>
          <h2>Duelo de stats</h2>
          <p>Compara dos cartas y elige cuál tiene más ataque, vida o coste de maná.</p>
        </article>
      </section>
    </main>
  );
}

export default App;
