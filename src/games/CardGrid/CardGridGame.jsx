import { useEffect, useMemo, useState } from "react";
import "./CardGridGame.css";

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

const CLASS_ICON_PATHS = {
  DEATHKNIGHT: "/grid-icons/class_deathknight.png",
  DEMONHUNTER: "/grid-icons/class_demonhunter.png",
  DRUID: "/grid-icons/class_druid.png",
  HUNTER: "/grid-icons/class_hunter.png",
  MAGE: "/grid-icons/class_mage.png",
  PALADIN: "/grid-icons/class_paladin.png",
  PRIEST: "/grid-icons/class_priest.png",
  ROGUE: "/grid-icons/class_rogue.png",
  SHAMAN: "/grid-icons/class_shaman.png",
  WARLOCK: "/grid-icons/class_warlock.png",
  WARRIOR: "/grid-icons/class_warrior.png",
};

const TYPE_LABELS = {
  MINION: "Esbirro",
  SPELL: "Hechizo",
  WEAPON: "Arma",
};

const RARITY_LABELS = {
  COMMON: "Común",
  RARE: "Rara",
  EPIC: "Épica",
  LEGENDARY: "Legendaria",
};

const RACE_LABELS = {
  BEAST: "Bestia",
  DEMON: "Demonio",
  DRAGON: "Dragón",
  DRAENEI: "Draenei",
  ELEMENTAL: "Elemental",
  MECHANICAL: "Meca",
  MURLOC: "Múrloc",
  NAGA: "Naga",
  PIRATE: "Pirata",
  QUILBOAR: "Jabaespín",
  TOTEM: "Tótem",
  UNDEAD: "No-muerto",
};

const KEYWORD_CONDITIONS = [
  { key: "BATTLECRY", label: "Grito de batalla", terms: ["battlecry", "grito de batalla"] },
  { key: "DEATHRATTLE", label: "Último aliento", terms: ["deathrattle", "último aliento", "ultimo aliento"] },
  { key: "TAUNT", label: "Provocar", terms: ["taunt", "provocar"] },
  { key: "DISCOVER", label: "Descubrir", terms: ["discover", "descubre", "descubrir"] },
  { key: "DIVINE_SHIELD", label: "Escudo divino", terms: ["divine shield", "escudo divino"] },
  { key: "LIFESTEAL", label: "Robo de vida", terms: ["lifesteal", "robo de vida"] },
  { key: "RUSH", label: "Embestir", terms: ["rush", "embestir"] },
];

const MIN_CARDS_IN_CONDITION = 35;
const MIN_CANDIDATES_PER_CELL = 2;
const MAX_GENERATION_ATTEMPTS = 9000;

const GRID_MODES = {
  easy: {
    id: "easy",
    label: "Fácil",
    minCandidatesPerCell: 50,
    minCardsInCondition: 50,
    description: "Cada casilla tiene al menos 50 respuestas posibles.",
  },
  normal: {
    id: "normal",
    label: "Normal",
    minCandidatesPerCell: 1,
    minCardsInCondition: 1,
    description: "Condiciones mucho más libres. Solo se garantiza que cada casilla tenga respuesta.",
  },
};

function normalize(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[’']/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .toLowerCase();
}

function getCardSearchText(card) {
  return normalize([
    card.name,
    card.nameEn,
    card.text,
    card.textEn,
    card.flavor,
    card.flavorText,
  ].filter(Boolean).join(" "));
}

function getCardImage(card) {
  return card?.imageRenderNormalized || card?.imageGame || card?.image || card?.imageThumb || "";
}

function getRaceValues(card) {
  const values = [
    card.race,
    card.raceName,
    card.minionType,
    card.tribe,
    card.races,
    card.raceIds,
  ].flat().filter(Boolean);

  return values.map((value) => String(value).toUpperCase());
}

function hasRace(card, raceKey) {
  const races = getRaceValues(card);
  if (raceKey === "MECHANICAL" || raceKey === "MECH") {
    return races.includes("MECHANICAL") || races.includes("MECH");
  }
  return races.includes(raceKey);
}

function hasKeyword(card, keywordCondition) {
  const text = getCardSearchText(card);
  return keywordCondition.terms.some((term) => text.includes(normalize(term)));
}

function countMatches(cards, predicate) {
  return cards.reduce((count, card) => count + (predicate(card) ? 1 : 0), 0);
}

function buildConditionPool(cards, minCardsInCondition = MIN_CARDS_IN_CONDITION) {
  const baseCards = cards.filter((card) => ["MINION", "SPELL", "WEAPON"].includes(card.type));
  const conditions = [];

  Object.entries(CLASS_LABELS).forEach(([key, label]) => {
    conditions.push({
      id: `class-${key}`,
      family: "class",
      label,
      shortLabel: label,
      description: "Clase",
      icon: CLASS_ICON_PATHS[key],
      predicate: (card) => card.cardClass === key,
    });
  });

  Object.entries(TYPE_LABELS).forEach(([key, label]) => {
    conditions.push({
      id: `type-${key}`,
      family: "type",
      label,
      shortLabel: label,
      description: "Tipo",
      predicate: (card) => card.type === key,
    });
  });

  Object.entries(RARITY_LABELS).forEach(([key, label]) => {
    conditions.push({
      id: `rarity-${key}`,
      family: "rarity",
      label,
      shortLabel: label,
      description: "Rareza",
      predicate: (card) => card.rarity === key,
    });
  });

  [
    { id: "cost-low", label: "Coste 0-2", predicate: (card) => typeof card.cost === "number" && card.cost <= 2 },
    { id: "cost-mid", label: "Coste 3-4", predicate: (card) => typeof card.cost === "number" && card.cost >= 3 && card.cost <= 4 },
    { id: "cost-high", label: "Coste 5-6", predicate: (card) => typeof card.cost === "number" && card.cost >= 5 && card.cost <= 6 },
    { id: "cost-big", label: "Coste 7+", predicate: (card) => typeof card.cost === "number" && card.cost >= 7 },
  ].forEach((condition) => {
    conditions.push({
      ...condition,
      family: "cost",
      shortLabel: condition.label,
      description: "Coste",
    });
  });

  [
    { id: "attack-3", label: "Ataque 3+", predicate: (card) => card.type === "MINION" && Number(card.attack) >= 3 },
    { id: "attack-5", label: "Ataque 5+", predicate: (card) => card.type === "MINION" && Number(card.attack) >= 5 },
    { id: "health-4", label: "Vida 4+", predicate: (card) => card.type === "MINION" && Number(card.health) >= 4 },
    { id: "health-6", label: "Vida 6+", predicate: (card) => card.type === "MINION" && Number(card.health) >= 6 },
  ].forEach((condition) => {
    conditions.push({
      ...condition,
      family: "stats",
      shortLabel: condition.label,
      description: "Estadística",
    });
  });

  Object.entries(RACE_LABELS).forEach(([key, label]) => {
    conditions.push({
      id: `race-${key}`,
      family: "race",
      label,
      shortLabel: label,
      description: "Raza",
      predicate: (card) => card.type === "MINION" && hasRace(card, key),
    });
  });

  KEYWORD_CONDITIONS.forEach((keyword) => {
    conditions.push({
      id: `keyword-${keyword.key}`,
      family: "keyword",
      label: keyword.label,
      shortLabel: keyword.label,
      description: "Texto",
      predicate: (card) => hasKeyword(card, keyword),
    });
  });

  const uniqueConditions = [];
  const seenDisplayKeys = new Set();

  conditions
    .map((condition) => ({
      ...condition,
      count: countMatches(baseCards, condition.predicate),
    }))
    .filter((condition) => condition.count >= minCardsInCondition)
    .forEach((condition) => {
      const displayKey = getConditionDisplayKey(condition);
      if (seenDisplayKeys.has(displayKey)) return;

      seenDisplayKeys.add(displayKey);
      uniqueConditions.push(condition);
    });

  return uniqueConditions;
}

function shuffle(array) {
  const copy = [...array];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }

  return copy;
}

function getCellCandidates(cards, rowCondition, columnCondition) {
  return cards.filter(
    (card) =>
      ["MINION", "SPELL", "WEAPON"].includes(card.type) &&
      rowCondition.predicate(card) &&
      columnCondition.predicate(card)
  );
}

function getConditionDisplayKey(condition) {
  return `${condition.family}-${normalize(condition.shortLabel || condition.label || condition.id)}`;
}

function hasRepeatedDisplayCondition(conditions) {
  const keys = conditions.map(getConditionDisplayKey);
  return new Set(keys).size !== keys.length;
}

function generateGrid(cards, conditionPool, minCandidatesPerCell = MIN_CANDIDATES_PER_CELL) {
  if (conditionPool.length < 6) return null;

  const rowPool = conditionPool.filter((condition) =>
    ["class", "type", "rarity", "cost", "race", "stats"].includes(condition.family)
  );
  const columnPool = conditionPool.filter((condition) =>
    ["class", "type", "rarity", "cost", "race", "stats", "keyword"].includes(condition.family)
  );

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const rows = shuffle(rowPool).slice(0, 3);
    const columns = shuffle(columnPool.filter((condition) => !rows.some((row) => row.id === condition.id))).slice(0, 3);

    if (rows.length < 3 || columns.length < 3) continue;

    const selectedConditions = [...rows, ...columns];
    const usedIds = new Set(selectedConditions.map((condition) => condition.id));

    if (usedIds.size < 6) continue;
    if (hasRepeatedDisplayCondition(selectedConditions)) continue;

    const candidateMap = {};

    const isValid = rows.every((row, rowIndex) =>
      columns.every((column, columnIndex) => {
        const candidates = getCellCandidates(cards, row, column);
        candidateMap[`${rowIndex}-${columnIndex}`] = candidates;
        return candidates.length >= minCandidatesPerCell;
      })
    );

    if (isValid) {
      return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        rows,
        columns,
        candidateMap,
        minCandidatesPerCell,
      };
    }
  }

  return null;
}

function getNormalizedNames(card) {
  return [card.name, card.nameEn].filter(Boolean).map(normalize);
}

function getCardsByExactName(cards, answer) {
  const normalizedAnswer = normalize(answer);
  if (!normalizedAnswer) return [];

  return cards.filter((card) => getNormalizedNames(card).includes(normalizedAnswer));
}

function dedupeCardsByName(cards) {
  const seenNames = new Set();
  const uniqueCards = [];

  cards.forEach((card) => {
    const key = normalize(card.name || card.nameEn || card.id);
    if (seenNames.has(key)) return;

    seenNames.add(key);
    uniqueCards.push(card);
  });

  return uniqueCards;
}

function getSuggestions(cards, answer, usedCardIds) {
  const normalizedAnswer = normalize(answer);
  const uniqueCards = dedupeCardsByName(cards.filter((card) => !usedCardIds.has(card.id)));

  if (normalizedAnswer.length < 2) {
    return uniqueCards.slice(0, 6);
  }

  return uniqueCards
    .filter((card) => {
      const name = normalize(card.name);
      const nameEn = normalize(card.nameEn);

      return name.includes(normalizedAnswer) || nameEn.includes(normalizedAnswer);
    })
    .slice(0, 8);
}

function CardGridGame({ cards, onBack }) {
  const [gridMode, setGridMode] = useState("easy");
  const modeConfig = GRID_MODES[gridMode];

  const playableCards = useMemo(
    () => cards.filter((card) => ["MINION", "SPELL", "WEAPON"].includes(card.type)),
    [cards]
  );

  const conditionPool = useMemo(
    () => buildConditionPool(cards, modeConfig.minCardsInCondition),
    [cards, modeConfig.minCardsInCondition]
  );

  const [grid, setGrid] = useState(null);
  const [selectedCell, setSelectedCell] = useState({ row: 0, column: 0 });
  const [answers, setAnswers] = useState({});
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("Selecciona una casilla y escribe una carta válida.");
  const [mistakes, setMistakes] = useState(0);
  const [revealedCells, setRevealedCells] = useState(new Set());

  useEffect(() => {
    if (!cards.length) return;

    const nextGrid = generateGrid(playableCards, conditionPool, modeConfig.minCandidatesPerCell);

    setGrid(nextGrid);
    setAnswers({});
    setMistakes(0);
    setRevealedCells(new Set());
    setSelectedCell({ row: 0, column: 0 });
    setAnswer("");

    if (nextGrid) {
      setMessage(
        gridMode === "easy"
          ? "Modo fácil: mínimo 50 respuestas por casilla y sin condiciones repetidas."
          : "Modo normal: cuadrícula libre, pero sin condiciones repetidas."
      );
    } else {
      setMessage("No se pudo generar una cuadrícula con este modo. Prueba otra vez o cambia de modo.");
    }
  }, [cards.length, playableCards, conditionPool, modeConfig.minCandidatesPerCell, gridMode]);

  const usedCardIds = useMemo(
    () => new Set(Object.values(answers).map((card) => card.id)),
    [answers]
  );

  const correctCount = Object.keys(answers).length;
  const selectedKey = `${selectedCell.row}-${selectedCell.column}`;
  const selectedRow = grid?.rows[selectedCell.row];
  const selectedColumn = grid?.columns[selectedCell.column];

  const selectedCandidates = useMemo(() => {
    if (!grid) return [];
    return (grid.candidateMap[selectedKey] ?? []).filter((card) => !usedCardIds.has(card.id));
  }, [grid, selectedKey, usedCardIds]);

  const suggestions = useMemo(() => {
    if (normalize(answer).length < 3) return [];
    return getSuggestions(playableCards, answer, usedCardIds);
  }, [playableCards, answer, usedCardIds]);

  const isComplete = correctCount >= 9;

  function startNewGrid() {
    const nextGrid = generateGrid(playableCards, conditionPool, modeConfig.minCandidatesPerCell);

    setGrid(nextGrid);
    setAnswers({});
    setMistakes(0);
    setRevealedCells(new Set());
    setSelectedCell({ row: 0, column: 0 });
    setAnswer("");

    if (nextGrid) {
      setMessage(
        gridMode === "easy"
          ? "Nueva cuadrícula fácil preparada: mínimo 50 respuestas por casilla y sin repetidas."
          : "Nueva cuadrícula normal preparada sin condiciones repetidas."
      );
    } else {
      setMessage("No se pudo generar una cuadrícula con este modo. Prueba otra vez o cambia de modo.");
    }
  }

  function changeGridMode(nextMode) {
    if (nextMode === gridMode) return;
    setGridMode(nextMode);
  }

  function submitAnswer(event) {
    event?.preventDefault();

    if (!grid || isComplete) return;

    if (answers[selectedKey]) {
      setMessage("Esa casilla ya está completada. Elige otra.");
      return;
    }

    const exactMatches = getCardsByExactName(playableCards, answer);

    if (!exactMatches.length) {
      setMessage("No encuentro esa carta. Prueba una pista o escribe el nombre completo.");
      return;
    }

    const unusedMatches = exactMatches.filter((card) => !usedCardIds.has(card.id));

    if (!unusedMatches.length) {
      setMessage("Esa carta ya se ha usado en otra casilla.");
      return;
    }

    const validCard = unusedMatches.find(
      (card) => selectedRow?.predicate(card) && selectedColumn?.predicate(card)
    );

    if (!validCard) {
      setMistakes((current) => current + 1);
      setMessage(`${unusedMatches[0].name} no cumple ${selectedRow?.shortLabel} + ${selectedColumn?.shortLabel}.`);
      return;
    }

    setAnswers((current) => ({
      ...current,
      [selectedKey]: validCard,
    }));

    setAnswer("");
    setMessage(`Correcto: ${validCard.name}.`);

    moveToNextEmptyCell({
      ...answers,
      [selectedKey]: validCard,
    });
  }

  function moveToNextEmptyCell(nextAnswers) {
    const nextIndex = Array.from({ length: 9 }, (_, index) => index).find((index) => {
      const row = Math.floor(index / 3);
      const column = index % 3;
      const key = `${row}-${column}`;
      return key !== selectedKey && !nextAnswers[key];
    });

    if (nextIndex !== undefined) {
      setSelectedCell({
        row: Math.floor(nextIndex / 3),
        column: nextIndex % 3,
      });
    }
  }

  function revealSelectedAnswer() {
    if (!grid || isComplete) return;

    if (answers[selectedKey]) {
      setMessage("Esa casilla ya está completada. Elige otra.");
      return;
    }

    const revealedCard = selectedCandidates.find((card) => !usedCardIds.has(card.id));

    if (!revealedCard) {
      setMessage("No hay respuestas disponibles para revelar en esta casilla.");
      return;
    }

    const nextAnswers = {
      ...answers,
      [selectedKey]: revealedCard,
    };

    setAnswers(nextAnswers);
    setRevealedCells((current) => {
      const updated = new Set(current);
      updated.add(selectedKey);
      return updated;
    });
    setAnswer("");
    setMessage(`Respuesta revelada: ${revealedCard.name}.`);
    moveToNextEmptyCell(nextAnswers);
  }

  function renderConditionContent(condition) {
    if (condition.icon) {
      return (
        <div className="cg-condition-icon-frame" title={condition.shortLabel}>
          <img
            className="cg-condition-icon"
            src={condition.icon}
            alt={condition.shortLabel}
            loading="eager"
            decoding="async"
          />
        </div>
      );
    }

    return (
      <>
        <span>{condition.description}</span>
        <strong>{condition.shortLabel}</strong>
      </>
    );
  }

  if (!cards.length || !grid) {
    return (
      <main className="cg-page">
        <section className="cg-empty">
          <button className="cg-secondary-button" onClick={onBack}>
            ← Inicio
          </button>
          <h1>Grid de cartas</h1>
          <p>
            {!cards.length
              ? "Preparando condiciones y cartas disponibles..."
              : "No se pudo generar una cuadrícula con este modo. Prueba de nuevo o cambia de dificultad."}
          </p>

          {cards.length ? (
            <>
              <div className="cg-mode-selector cg-mode-selector-empty">
                <span>Modo de juego</span>
                <div className="cg-mode-buttons">
                  {Object.values(GRID_MODES).map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      className={gridMode === mode.id ? "is-active" : ""}
                      onClick={() => changeGridMode(mode.id)}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
                <p>{modeConfig.description}</p>
              </div>

              <button className="cg-primary-button" onClick={startNewGrid}>
                Reintentar cuadrícula
              </button>
            </>
          ) : null}
        </section>
      </main>
    );
  }

  return (
    <main className="cg-page">
      <section className="cg-shell">
        <header className="cg-header">
          <button className="cg-secondary-button" onClick={onBack}>
            ← Inicio
          </button>

          <div className="cg-title-block">
            <p className="cg-eyebrow">Minijuego</p>
            <h1>Grid de cartas</h1>
            <p>Completa cada casilla con una carta que cumpla fila y columna.</p>
          </div>

          <div className="cg-score-pill">
            <span>Progreso</span>
            <strong>{correctCount}/9</strong>
          </div>
        </header>

        <div className="cg-progress-track">
          <span className="cg-progress-fill" style={{ width: `${(correctCount / 9) * 100}%` }} />
        </div>

        <section className="cg-layout">
          <div className="cg-board-panel">
            <div className="cg-board" role="grid" aria-label="Grid de cartas">
              <div className="cg-corner-cell">
                <span>GRID</span>
              </div>

              {grid.columns.map((column) => (
                <div className="cg-condition-cell cg-column-cell" key={column.id}>
                  {renderConditionContent(column)}
                </div>
              ))}

              {grid.rows.map((row, rowIndex) => (
                <div className="cg-row-fragment" key={row.id}>
                  <div className="cg-condition-cell cg-row-cell">
                    {renderConditionContent(row)}
                  </div>

                  {grid.columns.map((column, columnIndex) => {
                    const key = `${rowIndex}-${columnIndex}`;
                    const solvedCard = answers[key];
                    const selected = selectedCell.row === rowIndex && selectedCell.column === columnIndex;

                    const revealed = revealedCells.has(key);

                    return (
                      <button
                        type="button"
                        className={`cg-answer-cell ${selected ? "is-selected" : ""} ${solvedCard ? "is-solved" : ""} ${revealed ? "is-revealed" : ""}`}
                        key={column.id}
                        onClick={() => setSelectedCell({ row: rowIndex, column: columnIndex })}
                        title={solvedCard?.name || "Casilla vacía"}
                      >
                        {solvedCard ? (
                          getCardImage(solvedCard) ? (
                            <div className="cg-solved-card-frame">
                              <img
                                className="cg-solved-card-image"
                                src={getCardImage(solvedCard)}
                                alt={solvedCard.name}
                                loading="lazy"
                                decoding="async"
                                style={{
                                  width: "auto",
                                  height: "auto",
                                  maxWidth: "100%",
                                  maxHeight: "100%",
                                  objectFit: "contain",
                                  objectPosition: "center",
                                }}
                              />
                            </div>
                          ) : (
                            <strong>{solvedCard.name}</strong>
                          )
                        ) : (
                          <span>+</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <aside className="cg-control-panel">
            <div className="cg-current-cell">
              <p className="cg-eyebrow">Casilla seleccionada</p>
              <h2>{selectedRow?.shortLabel} + {selectedColumn?.shortLabel}</h2>
              <span>{grid.candidateMap[selectedKey]?.length ?? 0} respuestas posibles en la base.</span>
            </div>

            <div className="cg-mode-selector">
              <span>Modo</span>
              <div className="cg-mode-buttons">
                {Object.values(GRID_MODES).map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    className={gridMode === mode.id ? "is-active" : ""}
                    onClick={() => changeGridMode(mode.id)}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
              <p>{modeConfig.description}</p>
            </div>

            <form className="cg-answer-form" onSubmit={submitAnswer}>
              <label htmlFor="grid-card-answer">Carta</label>
              <div className="cg-input-row">
                <input
                  id="grid-card-answer"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="Escribe el nombre de la carta"
                  autoComplete="off"
                  disabled={isComplete}
                />
                <button className="cg-primary-button" type="submit" disabled={isComplete}>
                  Probar
                </button>
              </div>

              {suggestions.length > 0 && !isComplete ? (
                <div className="cg-suggestions">
                  {suggestions.map((card) => (
                    <button
                      type="button"
                      key={card.id}
                      onClick={() => setAnswer(card.name)}
                    >
                      {card.name}
                    </button>
                  ))}
                </div>
              ) : null}

              <button
                type="button"
                className="cg-reveal-button"
                onClick={revealSelectedAnswer}
                disabled={isComplete || Boolean(answers[selectedKey])}
              >
                Me rindo: revelar respuesta
              </button>
            </form>

            <div className="cg-message">
              <p>{isComplete ? "¡Grid completado!" : message}</p>
              <span>Errores: {mistakes}</span>
            </div>

            <button className="cg-secondary-button" onClick={startNewGrid}>
              Nueva cuadrícula
            </button>
          </aside>
        </section>
      </section>
    </main>
  );
}

export default CardGridGame;
