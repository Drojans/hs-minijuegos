import { useEffect, useMemo, useState } from "react";
import CardBrowser from "./components/CardBrowser";
import GuessManaCost from "./games/GuessManaCost";
import ImpostorGame from "./games/Impostor/ImpostorGame";
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

  const stats = useMemo(() => {
    const classCount = new Set(cards.map((card) => card.cardClass).filter(Boolean)).size;
    const typeCount = new Set(cards.map((card) => card.type).filter(Boolean)).size;
    const spellCount = cards.filter((card) => card.type === "SPELL").length;
    const minionCount = cards.filter((card) => card.type === "MINION").length;

    return {
      totalCards: cards.length,
      classCount,
      typeCount,
      spellCount,
      minionCount,
    };
  }, [cards]);

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
    <main className="app-page">
      <section className="app-home-shell">
        <section className="app-home-hero">
          <div className="app-home-copy">
            <p className="app-eyebrow">HS Cards Project</p>
            <h1>Minijuegos y base de datos de Hearthstone</h1>
            <p className="app-intro">
              Explora tu colección, practica con minijuegos y construye poco a poco
              una web más completa sobre cartas de Hearthstone.
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
                Abrir base de datos
              </button>

              <button
                className="app-button app-button-secondary"
                disabled={loading}
                onClick={() => setCurrentView("impostor")}
              >
                Hearthstone Impostor
              </button>
            </div>

            <div className="app-status-row">
              <span className="app-status-pill">
                {loading ? "Cargando datos..." : "Proyecto estable"}
              </span>
              <span className="app-status-text">
                {loading ? "Preparando cartas y módulos..." : `${stats.totalCards} cartas listas para usar`}
              </span>
            </div>
          </div>

          <aside className="app-hero-panel">
            <div className="app-panel-head">
              <span>Estado del proyecto</span>
              <strong>v0.1</strong>
            </div>

            <div className="app-hero-stats-grid">
              <article className="app-hero-stat-card">
                <span>Cartas</span>
                <strong>{loading ? "..." : stats.totalCards}</strong>
              </article>
              <article className="app-hero-stat-card">
                <span>Clases</span>
                <strong>{loading ? "..." : stats.classCount}</strong>
              </article>
              <article className="app-hero-stat-card">
                <span>Tipos</span>
                <strong>{loading ? "..." : stats.typeCount}</strong>
              </article>
              <article className="app-hero-stat-card">
                <span>Minijuegos</span>
                <strong>2</strong>
              </article>
            </div>

            <div className="app-progress-card">
              <div className="app-progress-labels">
                <span>Progreso del proyecto</span>
                <strong>Base funcional</strong>
              </div>
              <div className="app-progress-track">
                <span className="app-progress-fill" />
              </div>
              <p>
                Ya tienes una base sólida: visor de cartas, dos minijuegos,
                imágenes optimizadas y estructura separada por componentes.
              </p>
            </div>
          </aside>
        </section>

        <section className="app-dashboard-grid">
          <article className="app-dashboard-card app-dashboard-card-featured">
            <div className="app-card-topline">
              <span className="app-badge">Disponible</span>
              <span className="app-card-meta">Minijuego</span>
            </div>
            <h2>Adivina el coste</h2>
            <p>
              Observa una carta con el maná oculto y elige su coste real. Perfecto
              para memorizar cartas y practicar rápido.
            </p>
            <ul className="app-feature-list">
              <li>10 rondas por partida</li>
              <li>Respuesta inmediata</li>
              <li>Uso de imágenes optimizadas</li>
            </ul>
            <button
              className="app-button app-button-primary"
              disabled={loading}
              onClick={() => setCurrentView("guessMana")}
            >
              Entrar al minijuego
            </button>
          </article>

          <article className="app-dashboard-card">
            <div className="app-card-topline">
              <span className="app-badge app-badge-alt">Archivo</span>
              <span className="app-card-meta">Base de datos</span>
            </div>
            <h2>Visor de cartas</h2>
            <p>
              Filtra por coste, clase, tipo o rareza y abre cada carta en grande
              para consultar sus datos desde el panel lateral.
            </p>
            <div className="app-mini-stats">
              <div>
                <span>Esbirros</span>
                <strong>{loading ? "..." : stats.minionCount}</strong>
              </div>
              <div>
                <span>Hechizos</span>
                <strong>{loading ? "..." : stats.spellCount}</strong>
              </div>
            </div>
            <button
              className="app-button app-button-secondary"
              disabled={loading}
              onClick={() => setCurrentView("cards")}
            >
              Explorar cartas
            </button>
          </article>

          <article className="app-dashboard-card app-dashboard-card-roadmap">
            <div className="app-card-topline">
              <span className="app-badge app-badge-alt">Nuevo</span>
              <span className="app-card-meta">Minijuego</span>
            </div>
            <h2>Hearthstone Impostor</h2>
            <p>
              Encuentra las cartas que no pertenecen a la categoría. Selecciona los impostores y comprueba tu ronda.
            </p>
            <ul className="app-feature-list">
              <li>9 cartas por ronda</li>
              <li>1 o 2 impostores ocultos</li>
              <li>Categorías de clase, tipo, rareza, coste y estadísticas</li>
            </ul>
            <button
              className="app-button app-button-primary"
              disabled={loading}
              onClick={() => setCurrentView("impostor")}
            >
              Detectar impostores
            </button>
          </article>
        </section>

        <section className="app-info-grid">
          <article className="app-info-card">
            <p className="app-eyebrow">Qué hay ahora</p>
            <h3>Base funcional del proyecto</h3>
            <p>
              La web ya carga tu JSON de cartas, muestra imágenes optimizadas y
              separa bien la lógica entre home, visor y minijuegos.
            </p>
          </article>

          <article className="app-info-card">
            <p className="app-eyebrow">Qué falta más adelante</p>
            <h3>Capas extra de calidad</h3>
            <p>
              Traducciones completas de imágenes, efectos visuales finos,
              estadísticas persistentes, más minijuegos y quizá rutas reales con React Router.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}

export default App;
