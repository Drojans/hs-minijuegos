import { useEffect, useMemo, useState } from "react";
import "./GuessManaCost.css";

const MAX_ROUNDS = 10;
const MANA_VALUES = Array.from({ length: 11 }, (_, index) => index);

const CLASS_LABELS = {
  DEATHKNIGHT: "Caballero de la Muerte",
  DEMONHUNTER: "Cazador de Demonios",
  DRUID: "Druida",
  HUNTER: "Cazador",
  MAGE: "Mago",
  PALADIN: "Paladín",
  PRIEST: "Sacerdote",
  ROGUE: "Pícaro",
  SHAMAN: "Chamán",
  WARLOCK: "Brujo",
  WARRIOR: "Guerrero",
  NEUTRAL: "Neutral",
};

const TYPE_LABELS = {
  MINION: "Esbirro",
  SPELL: "Hechizo",
  WEAPON: "Arma",
  HERO: "Héroe",
  HERO_POWER: "Poder de héroe",
  LOCATION: "Lugar",
};

const RARITY_LABELS = {
  FREE: "Gratis",
  COMMON: "Común",
  RARE: "Rara",
  EPIC: "Épica",
  LEGENDARY: "Legendaria",
};

function translateCardClass(value) {
  return CLASS_LABELS[value] ?? value ?? "Desconocida";
}

function translateType(value) {
  return TYPE_LABELS[value] ?? value ?? "Desconocido";
}

function translateRarity(value) {
  return RARITY_LABELS[value] ?? value ?? "Sin rareza";
}

function getGameImage(card) {
  return card?.imageRenderNormalized || card?.imageGame || card?.imageDetail || card?.image || "";
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function GuessManaCost({ cards, onBack }) {
  const playableCards = useMemo(() => {
    return cards.filter((card) => {
      return (
        typeof card.cost === "number" &&
        card.cost >= 0 &&
        card.cost <= 10 &&
        card.name &&
        getGameImage(card) &&
        card.type !== "HERO" &&
        card.type !== "HERO_POWER"
      );
    });
  }, [cards]);

  const [currentCard, setCurrentCard] = useState(null);
  const [selectedCost, setSelectedCost] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [finished, setFinished] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (playableCards.length === 0 || currentCard) return;
    setCurrentCard(getRandomItem(playableCards));
  }, [playableCards, currentCard]);

  function startNewGame() {
    setCurrentCard(getRandomItem(playableCards));
    setSelectedCost(null);
    setScore(0);
    setRound(1);
    setFinished(false);
    setImageFailed(false);
  }

  function chooseCost(cost) {
    if (selectedCost !== null) return;
    setSelectedCost(cost);
    if (cost === currentCard.cost) {
      setScore((previousScore) => previousScore + 1);
    }
  }

  function goNextRound() {
    if (round >= MAX_ROUNDS) {
      setFinished(true);
      return;
    }

    let newCard = getRandomItem(playableCards);
    let safety = 0;
    while (newCard?.id === currentCard?.id && safety < 10) {
      newCard = getRandomItem(playableCards);
      safety += 1;
    }

    setCurrentCard(newCard);
    setSelectedCost(null);
    setRound((previousRound) => previousRound + 1);
    setImageFailed(false);
  }

  if (playableCards.length === 0) {
    return (
      <main className="gm-page">
        <section className="gm-empty-state">
          <h2>Adivina el coste</h2>
          <p>No hay cartas disponibles para este minijuego.</p>
          <button className="gm-secondary-button" onClick={onBack}>Volver</button>
        </section>
      </main>
    );
  }

  if (!currentCard) {
    return (
      <main className="gm-page">
        <section className="gm-empty-state"><h2>Cargando partida...</h2></section>
      </main>
    );
  }

  const hasAnswered = selectedCost !== null;
  const isCorrect = selectedCost === currentCard.cost;
  const accuracy = Math.round((score / MAX_ROUNDS) * 100);
  const progressPercent = (round / MAX_ROUNDS) * 100;
  const imageSrc = getGameImage(currentCard);

  if (finished) {
    return (
      <main className="gm-page">
        <section className="gm-end-screen">
          <p className="gm-eyebrow">Partida terminada</p>
          <h1>Adivina el coste</h1>
          <div className="gm-end-score">{score} / {MAX_ROUNDS}</div>
          <p>Has acertado <strong>{score}</strong> de <strong>{MAX_ROUNDS}</strong> cartas. Precisión final: <strong>{accuracy}%</strong>.</p>
          <div className="gm-end-actions">
            <button className="gm-primary-button" onClick={startNewGame}>Jugar otra vez</button>
            <button className="gm-secondary-button" onClick={onBack}>Volver al inicio</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="gm-page">
      <section className="gm-shell">
        <header className="gm-header">
          <button className="gm-secondary-button" onClick={onBack}>← Inicio</button>

          <div className="gm-title-block">
            <p className="gm-eyebrow">Minijuego</p>
            <h1>Adivina el coste</h1>
            <p>Observa la carta y selecciona su coste real de maná.</p>
          </div>

          <div className="gm-score-pill">
            <span>Ronda {round}/{MAX_ROUNDS}</span>
            <strong>{score} aciertos</strong>
          </div>
        </header>

        <div className="gm-progress-track">
          <div className="gm-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="gm-layout">
          <aside className="gm-card-panel">
            <div className="gm-card-frame">
              <div className="gm-card-image-wrap">
                {!imageFailed ? (
                  <img
                    src={imageSrc}
                    alt={currentCard.name}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    onError={() => setImageFailed(true)}
                  />
                ) : (
                  <div className="gm-image-fallback">Sin imagen</div>
                )}

                {!hasAnswered && !imageFailed && <div className="gm-mana-cover">?</div>}
                {!imageFailed && <div className="gm-scan-beam" />}
              </div>
            </div>
          </aside>

          <article className="gm-control-panel">
            <section className="gm-info-card">
              <p className="gm-eyebrow">Datos de la carta</p>
              <h2>{currentCard.name}</h2>

              <div className="gm-tag-row">
                <span>{translateCardClass(currentCard.cardClass)}</span>
                <span>{translateType(currentCard.type)}</span>
                <span>{translateRarity(currentCard.rarity)}</span>
              </div>

              {currentCard.attack !== null && currentCard.health !== null ? (
                <div className="gm-stat-row">
                  <div><span>Ataque</span><strong>{currentCard.attack}</strong></div>
                  <div><span>Vida</span><strong>{currentCard.health}</strong></div>
                </div>
              ) : (
                <p className="gm-no-stats">Carta sin ataque ni vida.</p>
              )}
            </section>

            <section className="gm-mana-panel">
              <p className="gm-eyebrow">Selector de maná</p>
              <h3>Elige el coste</h3>

              <div className="gm-mana-grid">
                {MANA_VALUES.map((cost) => {
                  let buttonClass = "gm-mana-button";
                  if (hasAnswered && cost === currentCard.cost) buttonClass += " is-correct";
                  if (hasAnswered && cost === selectedCost && cost !== currentCard.cost) buttonClass += " is-wrong";

                  return (
                    <button key={cost} className={buttonClass} disabled={hasAnswered} onClick={() => chooseCost(cost)}>
                      {cost}
                    </button>
                  );
                })}
              </div>
            </section>

            {hasAnswered && (
              <section className={`gm-feedback ${isCorrect ? "is-correct" : "is-wrong"}`}>
                <h3>{isCorrect ? "¡Correcto!" : "No era esa"}</h3>
                <p><strong>{currentCard.name}</strong> cuesta <strong>{currentCard.cost}</strong> de maná.</p>
                <button className="gm-primary-button" onClick={goNextRound}>
                  {round >= MAX_ROUNDS ? "Ver resultado" : "Siguiente carta"}
                </button>
              </section>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}

export default GuessManaCost;
