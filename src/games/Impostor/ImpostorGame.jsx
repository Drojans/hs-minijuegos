import { useEffect, useMemo, useState } from "react";
import ImpostorNeutralCard from "./ImpostorNeutralCard";
import "./ImpostorGame.css";

const MAX_ROUNDS = 10;
const BOARD_SIZE = 9;
const IMPOSTOR_COUNT = 4;
const CORRECT_COUNT = BOARD_SIZE - IMPOSTOR_COUNT;
const ALLOWED_TYPES = ["MINION", "SPELL", "WEAPON"];

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

const RARITY_LABELS = {
  FREE: "Gratis",
  COMMON: "Común",
  RARE: "Rara",
  EPIC: "Épica",
  LEGENDARY: "Legendaria",
};

const TYPE_LABELS = {
  MINION: "Esbirro",
  SPELL: "Hechizo",
  WEAPON: "Arma",
};

const CLASS_CONDITIONS = [
  "DEATHKNIGHT",
  "DEMONHUNTER",
  "DRUID",
  "HUNTER",
  "MAGE",
  "PALADIN",
  "PRIEST",
  "ROGUE",
  "SHAMAN",
  "WARLOCK",
  "WARRIOR",
  "NEUTRAL",
];

const RARITY_CONDITIONS = ["COMMON", "RARE", "EPIC", "LEGENDARY"];

function translateCardClass(value) {
  return CLASS_LABELS[value] ?? value ?? "Desconocida";
}

function translateRarity(value) {
  return RARITY_LABELS[value] ?? value ?? "Sin rareza";
}

function translateType(value) {
  return TYPE_LABELS[value] ?? value ?? "Carta";
}

function getCardImage(card) {
  return card?.imageArt || card?.imageThumb || card?.imageGame || card?.image || "";
}

function getOriginalCardImage(card) {
  return (
    card?.imageRenderNormalized ||
    card?.imageGame ||
    card?.imageDetail ||
    card?.image ||
    card?.imageThumb ||
    card?.imageArt ||
    ""
  );
}

const PRELOADED_IMAGE_URLS = new Set();
const IMAGE_DECODE_PROMISES = new Map();

function preloadImage(src, priority = "auto") {
  if (!src || typeof window === "undefined") return Promise.resolve();

  if (IMAGE_DECODE_PROMISES.has(src)) {
    return IMAGE_DECODE_PROMISES.get(src);
  }

  const image = new window.Image();
  image.decoding = "async";

  if ("fetchPriority" in image) {
    image.fetchPriority = priority;
  }

  if ("loading" in image) {
    image.loading = "eager";
  }

  const decodePromise = new Promise((resolve) => {
    image.onload = () => resolve();
    image.onerror = () => resolve();
  }).then(() => {
    if (typeof image.decode === "function") {
      return image.decode().catch(() => {});
    }

    return undefined;
  });

  IMAGE_DECODE_PROMISES.set(src, decodePromise);
  PRELOADED_IMAGE_URLS.add(src);
  image.src = src;

  return decodePromise;
}

function waitForImage(src, priority = "high", maxWaitMs = 80) {
  if (!src || typeof window === "undefined") return Promise.resolve();

  return Promise.race([
    preloadImage(src, priority),
    new Promise((resolve) => {
      window.setTimeout(resolve, maxWaitMs);
    }),
  ]);
}

// Algunas cartas normalizadas salen con un poco de aire extra a la derecha.
// Añade aquí más ids si aparece otro caso parecido en el minijuego.
const RIGHT_PAD_RENDER_CARD_IDS = new Set([
  "FIR_901",
]);

function getRevealCardImageClassName(card) {
  const classNames = ["im-original-card-image"];

  if (card?.type === "SPELL" && card?.rarity === "LEGENDARY") {
    classNames.push("is-legendary-spell-render");
  }

  if (RIGHT_PAD_RENDER_CARD_IDS.has(card?.id)) {
    classNames.push("is-tight-right-render");
  }

  return classNames.join(" ");
}

function isAllowedType(card) {
  return ALLOWED_TYPES.includes(card?.type);
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function uniqueById(cards) {
  const seen = new Set();

  return cards.filter((card) => {
    if (!card?.id || seen.has(card.id)) return false;
    seen.add(card.id);
    return true;
  });
}

function getRoundIdentity(card) {
  return (card?.name || card?.id || "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function countUniqueForRound(cards) {
  const identities = new Set();

  cards.forEach((card) => {
    const identity = getRoundIdentity(card);
    if (identity) identities.add(identity);
  });

  return identities.size;
}

function takeRandomUniqueForRound(cards, amount, usedIdentities) {
  const selectedCards = [];

  for (const card of shuffle(cards)) {
    const identity = getRoundIdentity(card);
    if (!identity || usedIdentities.has(identity)) continue;

    selectedCards.push(card);
    usedIdentities.add(identity);

    if (selectedCards.length === amount) break;
  }

  return selectedCards;
}

function buildConditions(cards) {
  const playableCards = cards.filter((card) => {
    return card.id && card.name && getCardImage(card) && isAllowedType(card);
  });

  const rawConditions = [];

  CLASS_CONDITIONS.forEach((cardClass) => {
    rawConditions.push({
      id: `class-${cardClass}`,
      kind: "Clase",
      title: `Cartas de ${translateCardClass(cardClass)}`,
      description: "Todas las cartas correctas pertenecen a esta clase.",
      poolFilter: () => true,
      test: (card) => card.cardClass === cardClass,
    });
  });

  RARITY_CONDITIONS.forEach((rarity) => {
    rawConditions.push({
      id: `rarity-${rarity}`,
      kind: "Rareza",
      title: `Cartas de rareza ${translateRarity(rarity)}`,
      description: "Todas las cartas correctas tienen esta rareza.",
      poolFilter: () => true,
      test: (card) => card.rarity === rarity,
    });
  });

  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach((cost) => {
    rawConditions.push({
      id: `cost-${cost}`,
      kind: "Coste",
      title: `Cartas de coste ${cost}`,
      description: "Todas las cartas correctas tienen exactamente este coste.",
      poolFilter: () => true,
      test: (card) => card.cost === cost,
    });
  });

  [
    { key: "attack-3", kind: "Ataque", title: "Esbirros con 3 o más de ataque", stat: "attack", value: 3 },
    { key: "attack-5", kind: "Ataque", title: "Esbirros con 5 o más de ataque", stat: "attack", value: 5 },
    { key: "health-4", kind: "Vida", title: "Esbirros con 4 o más de vida", stat: "health", value: 4 },
    { key: "health-6", kind: "Vida", title: "Esbirros con 6 o más de vida", stat: "health", value: 6 },
  ].forEach((rule) => {
    rawConditions.push({
      id: rule.key,
      kind: rule.kind,
      title: rule.title,
      description: "Todas las cartas correctas son esbirros que cumplen esta estadística.",
      poolFilter: (card) => card.type === "MINION",
      test: (card) => typeof card[rule.stat] === "number" && card[rule.stat] >= rule.value,
    });
  });

  return rawConditions
    .map((condition) => {
      const conditionPool = playableCards.filter(condition.poolFilter);
      const validCards = uniqueById(conditionPool.filter(condition.test));
      const invalidCards = uniqueById(conditionPool.filter((card) => !condition.test(card)));

      return {
        ...condition,
        validCards,
        invalidCards,
      };
    })
    .filter((condition) => {
      return (
        countUniqueForRound(condition.validCards) >= CORRECT_COUNT &&
        countUniqueForRound(condition.invalidCards) >= IMPOSTOR_COUNT
      );
    });
}

function createRound(cards, previousConditionId = null) {
  const conditions = buildConditions(cards);
  if (conditions.length === 0) return null;

  const availableConditions = conditions.filter((condition) => condition.id !== previousConditionId);
  const condition = getRandomItem(availableConditions.length > 0 ? availableConditions : conditions);
  const usedIdentities = new Set();

  const correctCardsRaw = takeRandomUniqueForRound(
    condition.validCards,
    CORRECT_COUNT,
    usedIdentities
  );

  const impostorCardsRaw = takeRandomUniqueForRound(
    condition.invalidCards,
    IMPOSTOR_COUNT,
    usedIdentities
  );

  const correctCards = correctCardsRaw.map((card) => ({
    ...card,
    impostorGameIsCorrect: true,
    impostorGameIsImpostor: false,
  }));

  const impostorCards = impostorCardsRaw.map((card) => ({
    ...card,
    impostorGameIsCorrect: false,
    impostorGameIsImpostor: true,
  }));

  return {
    id: `${condition.id}-${Date.now()}-${Math.random()}`,
    condition,
    cards: shuffle([...correctCards, ...impostorCards]),
    correctIds: new Set(correctCards.map((card) => card.id)),
    impostorIds: new Set(impostorCards.map((card) => card.id)),
    correctCount: correctCards.length,
    impostorCount: impostorCards.length,
  };
}

function ImpostorGame({ cards, onBack }) {
  const playableCards = useMemo(() => {
    return cards.filter((card) => card.id && card.name && getCardImage(card) && isAllowedType(card));
  }, [cards]);

  const [roundData, setRoundData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [foundCorrectIds, setFoundCorrectIds] = useState(new Set());
  const [failedCardId, setFailedCardId] = useState(null);
  const [revealedIds, setRevealedIds] = useState(new Set());
  const [roundResult, setRoundResult] = useState("playing");
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (playableCards.length === 0 || roundData) return;
    setRoundData(createRound(playableCards));
  }, [playableCards, roundData]);

  useEffect(() => {
    if (!roundData || typeof window === "undefined") return;

    roundData.cards.forEach((card) => {
      preloadImage(getCardImage(card), "high");
      preloadImage(getOriginalCardImage(card), "high");
    });
  }, [roundData]);

  function revealAllCards(cardsToReveal = roundData?.cards ?? []) {
    setRevealedIds(new Set(cardsToReveal.map((card) => card.id)));
  }

  function selectCard(cardId) {
    if (roundResult !== "playing") return;
    if (revealedIds.has(cardId)) return;

    const selectedCard = roundData?.cards.find((card) => card.id === cardId);
    preloadImage(getOriginalCardImage(selectedCard), "high");

    setSelectedId((previousSelectedId) => {
      return previousSelectedId === cardId ? null : cardId;
    });
  }

  async function checkSelectedCard() {
    if (roundResult !== "playing" || !roundData || !selectedId) return;

    const selectedCard = roundData.cards.find((card) => card.id === selectedId);
    await waitForImage(getOriginalCardImage(selectedCard), "high", 80);

    const selectedIsCorrect = roundData.correctIds.has(selectedId);
    const nextRevealedIds = new Set(revealedIds);
    nextRevealedIds.add(selectedId);
    setRevealedIds(nextRevealedIds);

    if (!selectedIsCorrect) {
      setFailedCardId(selectedId);
      setRoundResult("lost");

      window.setTimeout(() => {
        revealAllCards(roundData.cards);
      }, 450);

      return;
    }

    const nextFoundCorrectIds = new Set(foundCorrectIds);
    nextFoundCorrectIds.add(selectedId);
    setFoundCorrectIds(nextFoundCorrectIds);
    setSelectedId(null);

    if (nextFoundCorrectIds.size >= roundData.correctCount) {
      setScore((previousScore) => previousScore + 1);
      setRoundResult("won");

      window.setTimeout(() => {
        revealAllCards(roundData.cards);
      }, 450);
    }
  }

  function nextRound() {
    if (round >= MAX_ROUNDS) {
      setFinished(true);
      return;
    }

    setRoundData(createRound(playableCards, roundData?.condition?.id));
    setSelectedId(null);
    setFoundCorrectIds(new Set());
    setFailedCardId(null);
    setRevealedIds(new Set());
    setRoundResult("playing");
    setRound((previousRound) => previousRound + 1);
  }

  function restartGame() {
    setRoundData(createRound(playableCards));
    setSelectedId(null);
    setFoundCorrectIds(new Set());
    setFailedCardId(null);
    setRevealedIds(new Set());
    setRoundResult("playing");
    setScore(0);
    setRound(1);
    setFinished(false);
  }

  if (playableCards.length === 0) {
    return (
      <main className="im-page">
        <section className="im-message-panel">
          <h1>Hearthstone Impostor</h1>
          <p>No hay suficientes cartas con arte disponible para este modo.</p>
          <button className="im-secondary-button" onClick={onBack}>Volver</button>
        </section>
      </main>
    );
  }

  if (!roundData) {
    return (
      <main className="im-page">
        <section className="im-message-panel">
          <h1>Cargando impostores...</h1>
        </section>
      </main>
    );
  }

  const progressPercent = (round / MAX_ROUNDS) * 100;
  const foundCount = foundCorrectIds.size;
  const isRoundWon = roundResult === "won";
  const isRoundLost = roundResult === "lost";

  if (finished) {
    const accuracy = Math.round((score / MAX_ROUNDS) * 100);

    return (
      <main className="im-page">
        <section className="im-end-screen">
          <p className="im-eyebrow">Partida terminada</p>
          <h1>Hearthstone Impostor</h1>
          <div className="im-end-score">{score} / {MAX_ROUNDS}</div>
          <p>Precisión final: <strong>{accuracy}%</strong>.</p>
          <div className="im-end-actions">
            <button className="im-primary-button" onClick={restartGame}>Jugar otra vez</button>
            <button className="im-secondary-button" onClick={onBack}>Volver al inicio</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="im-page">
      <section className="im-shell">
        <header className="im-header">
          <button className="im-secondary-button" onClick={onBack}>← Inicio</button>

          <div className="im-title-block">
            <p className="im-eyebrow">Minijuego</p>
            <h1>Hearthstone Impostor</h1>
            <p>Encuentra las 5 cartas que cumplen la categoría. Si eliges un impostor, pierdes la ronda.</p>
          </div>

          <div className="im-score-pill">
            <span>Ronda {round}/{MAX_ROUNDS}</span>
            <strong>{score} aciertos</strong>
          </div>
        </header>

        <div className="im-progress-track">
          <span className="im-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        <section className="im-game-layout">
          <aside className="im-side-panel">
            <p className="im-eyebrow">Categoría</p>
            <h2>{roundData.condition.title}</h2>
            <p>{roundData.condition.description}</p>

            <div className="im-meta-box">
              <span>{roundData.condition.kind}</span>
              <strong>{CORRECT_COUNT} buenas · {IMPOSTOR_COUNT} impostores</strong>
            </div>

            <div className="im-help-box">
              <strong>Cómo jugar</strong>
              <p>Elige una carta que <em>sí cumple</em> la categoría y compruébala. Encuentra las 5 cartas buenas sin caer en un impostor.</p>
            </div>
          </aside>

          <section className="im-board-panel">
            <div className="im-board-grid">
              {roundData.cards.map((card) => {
                const isSelected = selectedId === card.id;
                const isCorrect = roundData.correctIds.has(card.id);
                const isImpostor = roundData.impostorIds.has(card.id);
                const isFound = foundCorrectIds.has(card.id);
                const isFailedCard = failedCardId === card.id;
                const isRevealed = revealedIds.has(card.id) || (roundResult !== "playing" && revealedIds.size === roundData.cards.length);

                let stateClass = "";
                if (roundResult === "playing" && isSelected) stateClass = "is-selected";
                if (isFound) stateClass = "is-found-correct";
                if (isRevealed && isCorrect) stateClass = "is-found-correct";
                if (isRevealed && isImpostor) stateClass = "is-revealed-impostor";
                if (isRoundLost && isFailedCard && isImpostor) stateClass = "is-wrong-pick";

                return (
                  <button
                    type="button"
                    key={card.id}
                    className={`im-card ${stateClass} ${isRevealed ? "is-flipped" : ""}`}
                    onClick={() => selectCard(card.id)}
                    onPointerEnter={() => preloadImage(getOriginalCardImage(card), "high")}
                    onFocus={() => preloadImage(getOriginalCardImage(card), "high")}
                    title={`${card.name} · ${translateType(card.type)}`}
                  >
                    <div className="im-flip-card">
                      <div className="im-flip-face im-flip-front">
                        <ImpostorNeutralCard card={card} />
                      </div>

                      <div className="im-flip-face im-flip-back">
                        {isRevealed ? (
                          <img
                            className={getRevealCardImageClassName(card)}
                            src={getOriginalCardImage(card)}
                            alt={card.name}
                            loading="eager"
                            decoding="async"
                            fetchPriority="high"
                          />
                        ) : (
                          <div className="im-original-card-placeholder" />
                        )}
                      </div>
                    </div>

                    {isRevealed && isCorrect && <div className="im-result-mark im-result-mark-correct">✓</div>}
                    {isRevealed && isImpostor && <div className="im-result-mark im-result-mark-wrong">×</div>}
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="im-action-panel">
            {roundResult === "playing" ? (
              <>
                <p className="im-eyebrow">Análisis</p>
                <h2>Encuentra las buenas</h2>
                <p>Encontradas: <strong>{foundCount}</strong> / {CORRECT_COUNT}</p>
                <button className="im-primary-button" disabled={!selectedId} onClick={checkSelectedCard}>Comprobar carta</button>
              </>
            ) : (
              <>
                <p className="im-eyebrow">Resultado</p>
                <h2>{isRoundWon ? "¡Ronda perfecta!" : "Era un impostor"}</h2>
                <p>{isRoundWon ? "Has encontrado las 5 cartas correctas sin fallar." : "Esa carta no cumplía la categoría. La ronda queda fallida."}</p>
                <button className="im-primary-button" onClick={nextRound}>{round >= MAX_ROUNDS ? "Ver resultado" : "Siguiente ronda"}</button>
              </>
            )}
          </aside>
        </section>
      </section>
    </main>
  );
}

export default ImpostorGame;