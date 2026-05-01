import { useEffect, useMemo, useState } from "react";
import ImpostorNeutralCard from "./ImpostorNeutralCard";
import "./ImpostorGame.css";

const MAX_ROUNDS = 10;
const BOARD_SIZE = 10;
const IMPOSTOR_COUNT = 5;
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

const TYPE_CONDITIONS = ["MINION", "SPELL", "WEAPON"];

const RACE_LABELS = {
  BEAST: "Bestia",
  DEMON: "Demonio",
  DRAGON: "Dragón",
  DRAENEI: "Draenei",
  ELEMENTAL: "Elemental",
  MECHANICAL: "Meca",
  MURLOC: "Múrloc",
  NAGA: "Nagas",
  PIRATE: "Pirata",
  QUILBOAR: "Jabaespín",
  TOTEM: "Tótem",
  UNDEAD: "No-muerto",
};

const RACE_CONDITIONS = Object.keys(RACE_LABELS);

const MECHANIC_LABELS = {
  BATTLECRY: "Grito de batalla",
  DEATHRATTLE: "Último aliento",
  TAUNT: "Provocar",
  DISCOVER: "Descubrir",
  RUSH: "Embestir",
  LIFESTEAL: "Robo de vida",
  SECRET: "Secreto",
  CHOOSE_ONE: "Elige una",
  DIVINE_SHIELD: "Escudo divino",
  COMBO: "Combo",
  STEALTH: "Sigilo",
  OVERLOAD: "Sobrecarga",
  SPELLPOWER: "Daño con hechizos",
  TRADEABLE: "Comerciable",
  CHARGE: "Cargar",
  SPELLBURST: "Ráfaga de hechizos",
  WINDFURY: "Viento furioso",
  ELUSIVE: "Elusivo",
  CORRUPT: "Corruptible",
  OUTCAST: "Proscrito",
  REBORN: "Renacer",
  POISONOUS: "Veneno",
  FREEZE: "Congelar",
  QUEST: "Misión",
  INSPIRE: "Inspirar",
  MAGNETIC: "Magnético",
  DREDGE: "Dragado",
  HONORABLE_KILL: "Muerte honorable",
  FORGE: "Forja",
  MINIATURIZE: "Miniaturizar",
  FRENZY: "Frenesí",
  MANATHIRST: "Sed de maná",
  EXCAVATE: "Excavar",
  QUICKDRAW: "Robo rápido",
  ECHO: "Eco",
  COLOSSAL: "Colosal",
  TITAN: "Titán",
  TWINSPELL: "Hechizo doble",
  OVERHEAL: "Sobrecuración",
};

const MECHANIC_CONDITIONS = Object.keys(MECHANIC_LABELS);

const TEXT_CONDITIONS = [
  {
    key: "text-damage",
    title: "Cartas que infligen daño",
    description: "Todas las cartas correctas mencionan daño o infligir daño.",
    patterns: ["inflige", "daño", "damage", "deal"],
  },
  {
    key: "text-summon",
    title: "Cartas que invocan",
    description: "Todas las cartas correctas mencionan invocar o summon.",
    patterns: ["invoca", "invocar", "summon"],
  },
  {
    key: "text-draw",
    title: "Cartas que roban cartas",
    description: "Todas las cartas correctas mencionan robar cartas.",
    patterns: ["roba", "robar", "robas", "robada", "draw"],
  },
  {
    key: "text-restore",
    title: "Cartas que restauran salud",
    description: "Todas las cartas correctas mencionan restaurar salud o curar.",
    patterns: ["restaura", "restaurar", "cura", "curar", "restore", "heal"],
  },
  {
    key: "text-destroy",
    title: "Cartas que destruyen",
    description: "Todas las cartas correctas mencionan destruir.",
    patterns: ["destruye", "destruir", "destroy"],
  },
  {
    key: "text-add",
    title: "Cartas que añaden cartas",
    description: "Todas las cartas correctas mencionan añadir cartas a la mano, mazo o campo.",
    patterns: ["añade", "anade", "add"],
  },
  {
    key: "text-discard",
    title: "Cartas que descartan",
    description: "Todas las cartas correctas mencionan descartar.",
    patterns: ["descarta", "descartar", "discard"],
  },
  {
    key: "text-cost",
    title: "Cartas que modifican coste",
    description: "Todas las cartas correctas mencionan coste, cristales o cambios de coste.",
    patterns: ["cuesta", "coste", "cristal", "cost"],
  },
  {
    key: "text-attack",
    title: "Cartas que mencionan ataque",
    description: "Todas las cartas correctas mencionan ataque o Attack.",
    patterns: ["ataque", "attack"],
  },
  {
    key: "text-health",
    title: "Cartas que mencionan salud",
    description: "Todas las cartas correctas mencionan salud, vida o Health.",
    patterns: ["salud", "vida", "health"],
  },
];


const NEUTRAL_CARD_TEMPLATE_IMAGE_SOURCES = [
  "/ui/impostor/minion-neutral-template.png",
  "/ui/impostor/spell-neutral-template.png",
  "/ui/impostor/weapon-neutral-template.png",
];

const PRELOADED_IMAGE_SOURCES = new Set();

function translateCardClass(value) {
  return CLASS_LABELS[value] ?? value ?? "Desconocida";
}

function translateRarity(value) {
  return RARITY_LABELS[value] ?? value ?? "Sin rareza";
}

function translateType(value) {
  return TYPE_LABELS[value] ?? value ?? "Carta";
}

function translateRace(value) {
  return RACE_LABELS[value] ?? value ?? "Raza";
}

function translateMechanic(value) {
  return MECHANIC_LABELS[value] ?? value ?? "Mecánica";
}

function normalizeSearchText(value) {
  return (value ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getSearchableCardText(card) {
  return normalizeSearchText(`${card?.text ?? ""} ${card?.textEn ?? ""}`);
}

function cardHasMechanic(card, mechanic) {
  return Array.isArray(card?.mechanics) && card.mechanics.includes(mechanic);
}

function cardTextHasAnyPattern(card, patterns) {
  const searchableText = getSearchableCardText(card);
  return patterns.some((pattern) => searchableText.includes(normalizeSearchText(pattern)));
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


function getOriginalCardImageClassName(card) {
  const classNames = ["im-original-card-image"];

  if (card?.rarity === "LEGENDARY") {
    classNames.push("is-legendary-render");
  }

  if (card?.type === "SPELL" && card?.rarity === "LEGENDARY") {
    classNames.push("is-legendary-spell-render");
  }

  return classNames.join(" ");
}

function getCardPreloadSources(card) {
  // Importante: precargamos solo las dos imágenes que se usan realmente en Impostor.
  // Antes se pedían hasta 6 versiones por carta y eso saturaba la carga inicial.
  return Array.from(new Set([
    getCardImage(card),
    getOriginalCardImage(card),
  ].filter(Boolean)));
}

function preloadImageSource(src, fetchPriority = "auto") {
  if (!src || PRELOADED_IMAGE_SOURCES.has(src) || typeof window === "undefined") return;

  PRELOADED_IMAGE_SOURCES.add(src);

  const image = new Image();
  image.decoding = "async";

  try {
    image.fetchPriority = fetchPriority;
  } catch {
    // Algunos navegadores no soportan fetchPriority en Image().
  }

  image.src = src;

  if (typeof image.decode === "function") {
    image.decode().catch(() => {
      // Si decode falla, el navegador igualmente puede usar la petición/cache normal.
    });
  }
}

function preloadRoundImages(roundData, fetchPriority = "auto") {
  if (!roundData?.cards) return;

  NEUTRAL_CARD_TEMPLATE_IMAGE_SOURCES.forEach((src) => preloadImageSource(src, "high"));

  roundData.cards.forEach((card) => {
    getCardPreloadSources(card).forEach((src) => preloadImageSource(src, fetchPriority));
  });
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

  TYPE_CONDITIONS.forEach((type) => {
    rawConditions.push({
      id: `type-${type}`,
      kind: "Tipo",
      title: `Cartas de tipo ${translateType(type)}`,
      description: "Todas las cartas correctas son de este tipo.",
      poolFilter: () => true,
      test: (card) => card.type === type,
    });
  });

  RACE_CONDITIONS.forEach((race) => {
    rawConditions.push({
      id: `race-${race}`,
      kind: "Raza",
      title: `Esbirros de raza ${translateRace(race)}`,
      description: "Todas las cartas correctas son esbirros de esta raza.",
      poolFilter: (card) => card.type === "MINION",
      test: (card) => card.race === race,
    });
  });

  MECHANIC_CONDITIONS.forEach((mechanic) => {
    rawConditions.push({
      id: `mechanic-${mechanic}`,
      kind: "Mecánica",
      title: `Cartas con ${translateMechanic(mechanic)}`,
      description: "Todas las cartas correctas tienen esta mecánica o palabra clave.",
      poolFilter: () => true,
      test: (card) => cardHasMechanic(card, mechanic),
    });
  });

  TEXT_CONDITIONS.forEach((rule) => {
    rawConditions.push({
      id: rule.key,
      kind: "Texto",
      title: rule.title,
      description: rule.description,
      poolFilter: () => true,
      test: (card) => cardTextHasAnyPattern(card, rule.patterns),
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

function createRoundFromConditions(conditions, previousConditionId = null) {
  if (!conditions || conditions.length === 0) return null;

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

function createRound(cards, previousConditionId = null) {
  return createRoundFromConditions(buildConditions(cards), previousConditionId);
}

function ImpostorGame({ cards, onBack }) {
  const playableCards = useMemo(() => {
    return cards.filter((card) => card.id && card.name && getCardImage(card) && isAllowedType(card));
  }, [cards]);

  // Con muchas categorías, calcular validCards/invalidCards en cada ronda era caro.
  // Lo calculamos una sola vez mientras no cambie la lista de cartas.
  const availableConditions = useMemo(() => buildConditions(playableCards), [playableCards]);

  const [roundData, setRoundData] = useState(null);
  const [preparedRoundData, setPreparedRoundData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [foundCorrectIds, setFoundCorrectIds] = useState(new Set());
  const [failedCardId, setFailedCardId] = useState(null);
  const [revealedIds, setRevealedIds] = useState(new Set());
  const [roundResult, setRoundResult] = useState("playing");
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (availableConditions.length === 0 || roundData) return;
    setRoundData(createRoundFromConditions(availableConditions));
  }, [availableConditions, roundData]);

  useEffect(() => {
    if (!roundData || typeof window === "undefined") return undefined;

    // Precargamos desde el primer frame tanto la cara frontal como el render revelado.
    // Así el giro no crea la imagen de cero justo al revelar.
    preloadRoundImages(roundData, "high");

    // Mientras el jugador piensa, dejamos preparada la siguiente ronda y sus imágenes.
    const prepareTimeout = window.setTimeout(() => {
      if (round >= MAX_ROUNDS || availableConditions.length === 0) return;

      const nextPreparedRound = createRoundFromConditions(availableConditions, roundData.condition.id);
      setPreparedRoundData(nextPreparedRound);
      // Dejamos respirar a la ronda actual antes de precargar la siguiente.
      preloadRoundImages(nextPreparedRound, "low");
    }, 1200);

    return () => {
      window.clearTimeout(prepareTimeout);
    };
  }, [availableConditions, round, roundData]);

  function revealAllCards(cardsToReveal = roundData?.cards ?? []) {
    setRevealedIds(new Set(cardsToReveal.map((card) => card.id)));
  }

  function selectCard(cardId) {
    if (roundResult !== "playing") return;
    if (revealedIds.has(cardId)) return;

    setSelectedId((previousSelectedId) => {
      return previousSelectedId === cardId ? null : cardId;
    });
  }

  function checkSelectedCard() {
    if (roundResult !== "playing" || !roundData || !selectedId) return;

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

    const nextRoundData = preparedRoundData || createRoundFromConditions(availableConditions, roundData?.condition?.id);

    setRoundData(nextRoundData);
    setPreparedRoundData(null);
    setSelectedId(null);
    setFoundCorrectIds(new Set());
    setFailedCardId(null);
    setRevealedIds(new Set());
    setRoundResult("playing");
    setRound((previousRound) => previousRound + 1);
  }

  function restartGame() {
    setRoundData(createRoundFromConditions(availableConditions));
    setPreparedRoundData(null);
    setSelectedId(null);
    setFoundCorrectIds(new Set());
    setFailedCardId(null);
    setRevealedIds(new Set());
    setRoundResult("playing");
    setScore(0);
    setRound(1);
    setFinished(false);
  }

  if (playableCards.length === 0 || availableConditions.length === 0) {
    return (
      <main className="im-page">
        <section className="im-message-panel">
          <h1>Hearthstone Impostor</h1>
          <p>No hay suficientes cartas o categorías válidas para este modo.</p>
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
                    title={`${card.name} · ${translateType(card.type)}`}
                  >
                    <div className="im-flip-card">
                      <div className="im-flip-face im-flip-front">
                        <ImpostorNeutralCard card={card} />
                      </div>

                      <div className="im-flip-face im-flip-back">
                        <img
                          className={getOriginalCardImageClassName(card)}
                          src={getOriginalCardImage(card)}
                          alt={card.name}
                          loading="eager"
                          decoding="async"
                          fetchPriority="high"
                        />
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