import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../i18n/LanguageProvider";
import {
  getCardName,
  getAdaptedImage,
  translateCardClass,
  translateCardRace,
  translateCardRarity,
  translateCardType,
} from "../../utils/cardLocale";
import "./CardGridGame.css";

const GRID_ICON_MODULES = import.meta.glob("./assets/*", {
  eager: true,
  query: "?url",
  import: "default",
});
function gridIcon(fileName) {
  return GRID_ICON_MODULES[`./assets/${fileName}`] || "";
}

const CLASS_ICON_PATHS = {
  DEATHKNIGHT: gridIcon("class_deathknight.png"),
  DEMONHUNTER: gridIcon("class_demonhunter.png"),
  DRUID: gridIcon("class_druid.png"),
  HUNTER: gridIcon("class_hunter.png"),
  MAGE: gridIcon("class_mage.png"),
  PALADIN: gridIcon("class_paladin.png"),
  PRIEST: gridIcon("class_priest.png"),
  ROGUE: gridIcon("class_rogue.png"),
  SHAMAN: gridIcon("class_shaman.png"),
  WARLOCK: gridIcon("class_warlock.png"),
  WARRIOR: gridIcon("class_warrior.png"),
  NEUTRAL: gridIcon("class_neutral.png"),
};

const TYPE_ICON_PATHS = {
  MINION: gridIcon("type_minion.png"),
  SPELL: gridIcon("type_spell.png"),
  WEAPON: gridIcon("type_weapon.png"),
};

const RARITY_ICON_PATHS = {
  COMMON: gridIcon("rarity_common.png"),
  RARE: gridIcon("rarity_rare.png"),
  EPIC: gridIcon("rarity_epic.png"),
  LEGENDARY: gridIcon("rarity_legendary.png"),
};

const COST_ICON_PATHS = {
  "cost-low": gridIcon("cost_0_2.png"),
  "cost-mid": gridIcon("cost_3_4.png"),
  "cost-high": gridIcon("cost_5_6.png"),
  "cost-big": gridIcon("cost_7_plus.png"),
};

const STAT_ICON_PATHS = {
  "attack-3": gridIcon("stat_attack_3_plus.png"),
  "attack-5": gridIcon("stat_attack_5_plus.png"),
  "health-4": gridIcon("stat_health_4_plus.png"),
  "health-6": gridIcon("stat_health_6_plus.png"),
};

const RACE_ICON_PATHS = {
  BEAST: gridIcon("race_beast.png"),
  DEMON: gridIcon("race_demon.png"),
  DRAGON: gridIcon("race_dragon.png"),
  DRAENEI: gridIcon("race_draenei.png"),
  ELEMENTAL: gridIcon("race_elemental.png"),
  MECHANICAL: gridIcon("race_mech.png"),
  MURLOC: gridIcon("race_murloc.png"),
  NAGA: gridIcon("race_naga.png"),
  PIRATE: gridIcon("race_pirate.png"),
  QUILBOAR: gridIcon("race_quilboar.png"),
  TOTEM: gridIcon("race_totem.png"),
  UNDEAD: gridIcon("race_undead.png"),
};

const KEYWORD_ICON_PATHS = {
  BATTLECRY: gridIcon("text_battlecry.png"),
  DEATHRATTLE: gridIcon("text_deathrattle.png"),
  TAUNT: gridIcon("text_taunt.png"),
  DISCOVER: gridIcon("text_discover.png"),
  DIVINE_SHIELD: gridIcon("text_divine_shield.png"),
  LIFESTEAL: gridIcon("text_lifesteal.png"),
  RUSH: gridIcon("text_rush.png"),
};

function getKeywordConditions(t) {
  return [
    { key: "BATTLECRY", label: t("grid.keyword.battlecry"), terms: ["battlecry", "grito de batalla"] },
    { key: "DEATHRATTLE", label: t("grid.keyword.deathrattle"), terms: ["deathrattle", "Ãºltimo aliento", "ultimo aliento"] },
    { key: "TAUNT", label: t("grid.keyword.taunt"), terms: ["taunt", "provocar"] },
    { key: "DISCOVER", label: t("grid.keyword.discover"), terms: ["discover", "descubre", "descubrir"] },
    { key: "DIVINE_SHIELD", label: t("grid.keyword.divineShield"), terms: ["divine shield", "escudo divino"] },
    { key: "LIFESTEAL", label: t("grid.keyword.lifesteal"), terms: ["lifesteal", "robo de vida"] },
    { key: "RUSH", label: t("grid.keyword.rush"), terms: ["rush", "embestir"] },
  ];
}

const MIN_CARDS_IN_CONDITION = 35;
const MIN_CANDIDATES_PER_CELL = 2;
const MAX_GENERATION_ATTEMPTS = 9000;

function getGridModes(t) {
  return {
    easy: {
      id: "easy",
      label: t("grid.mode.easy"),
      minCandidatesPerCell: 50,
      minCardsInCondition: 50,
      description: t("grid.mode.easyDescription"),
    },
    normal: {
      id: "normal",
      label: t("grid.mode.normal"),
      minCandidatesPerCell: 1,
      minCardsInCondition: 1,
      description: t("grid.mode.normalDescription"),
    },
  };
}

function normalize(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[â€™']/g, "")
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

function getCardImage(card, locale) {
  return getAdaptedImage(card, locale);
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

function buildConditionPool(cards, minCardsInCondition = MIN_CARDS_IN_CONDITION, locale = "es", t = (key) => key) {
  const baseCards = cards.filter((card) => ["MINION", "SPELL", "WEAPON"].includes(card.type));
  const conditions = [];

  Object.keys(CLASS_ICON_PATHS).forEach((key) => {
    const label = translateCardClass(key, locale);
    conditions.push({
      id: `class-${key}`,
      family: "class",
      label,
      shortLabel: label,
      description: t("grid.condition.class"),
      icon: CLASS_ICON_PATHS[key],
      predicate: (card) => card.cardClass === key,
    });
  });

  Object.keys(TYPE_ICON_PATHS).forEach((key) => {
    const label = translateCardType(key, locale);
    conditions.push({
      id: `type-${key}`,
      family: "type",
      label,
      shortLabel: label,
      description: t("grid.condition.type"),
      icon: TYPE_ICON_PATHS[key],
      predicate: (card) => card.type === key,
    });
  });

  Object.keys(RARITY_ICON_PATHS).forEach((key) => {
    const label = translateCardRarity(key, locale);
    conditions.push({
      id: `rarity-${key}`,
      family: "rarity",
      label,
      shortLabel: label,
      description: t("grid.condition.rarity"),
      icon: RARITY_ICON_PATHS[key],
      predicate: (card) => card.rarity === key,
    });
  });

  [
    {
      id: "cost-low",
      label: t("grid.condition.costLow"),
      predicate: (card) => typeof card.cost === "number" && card.cost <= 2,
    },
    {
      id: "cost-mid",
      label: t("grid.condition.costMid"),
      predicate: (card) => typeof card.cost === "number" && card.cost >= 3 && card.cost <= 4,
    },
    {
      id: "cost-high",
      label: t("grid.condition.costHigh"),
      predicate: (card) => typeof card.cost === "number" && card.cost >= 5 && card.cost <= 6,
    },
    {
      id: "cost-big",
      label: t("grid.condition.costBig"),
      predicate: (card) => typeof card.cost === "number" && card.cost >= 7,
    },
  ].forEach((condition) => {
    conditions.push({
      ...condition,
      family: "cost",
      shortLabel: condition.label,
      description: t("grid.condition.cost"),
      icon: COST_ICON_PATHS[condition.id],
    });
  });

  [
    {
      id: "attack-3",
      label: t("grid.condition.attackAtLeast", { value: 3 }),
      predicate: (card) => card.type === "MINION" && Number(card.attack) >= 3,
    },
    {
      id: "attack-5",
      label: t("grid.condition.attackAtLeast", { value: 5 }),
      predicate: (card) => card.type === "MINION" && Number(card.attack) >= 5,
    },
    {
      id: "health-4",
      label: t("grid.condition.healthAtLeast", { value: 4 }),
      predicate: (card) => card.type === "MINION" && Number(card.health) >= 4,
    },
    {
      id: "health-6",
      label: t("grid.condition.healthAtLeast", { value: 6 }),
      predicate: (card) => card.type === "MINION" && Number(card.health) >= 6,
    },
  ].forEach((condition) => {
    conditions.push({
      ...condition,
      family: "stats",
      shortLabel: condition.label,
      description: t("grid.condition.stats"),
      icon: STAT_ICON_PATHS[condition.id],
    });
  });

  Object.keys(RACE_ICON_PATHS).forEach((key) => {
    const label = translateCardRace(key, locale);
    conditions.push({
      id: `race-${key}`,
      family: "race",
      label,
      shortLabel: label,
      description: t("grid.condition.race"),
      icon: RACE_ICON_PATHS[key],
      predicate: (card) => card.type === "MINION" && hasRace(card, key),
    });
  });

  getKeywordConditions(t).forEach((keyword) => {
    conditions.push({
      id: `keyword-${keyword.key}`,
      family: "keyword",
      label: keyword.label,
      shortLabel: keyword.label,
      description: t("grid.condition.text"),
      icon: KEYWORD_ICON_PATHS[keyword.key],
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
  const { locale, t } = useLanguage();
  const [gridMode, setGridMode] = useState("easy");
  const gridModes = useMemo(() => getGridModes(t), [t]);
  const modeConfig = gridModes[gridMode];

  const playableCards = useMemo(
    () => cards.filter((card) => ["MINION", "SPELL", "WEAPON"].includes(card.type)),
    [cards]
  );

  const conditionPool = useMemo(
    () => buildConditionPool(cards, modeConfig.minCardsInCondition, locale, t),
    [cards, modeConfig.minCardsInCondition, locale, t]
  );

  const [grid, setGrid] = useState(null);
  const [selectedCell, setSelectedCell] = useState({ row: 0, column: 0 });
  const [answers, setAnswers] = useState({});
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState(() => t("grid.message.initial"));
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
          ? t("grid.message.easyReady")
          : t("grid.message.normalReady")
      );
    } else {
      setMessage(t("grid.message.generationFailed"));
    }
  }, [cards.length, playableCards, conditionPool, modeConfig.minCandidatesPerCell, gridMode, t]);

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
          ? t("grid.message.easyNewReady")
          : t("grid.message.normalNewReady")
      );
    } else {
      setMessage(t("grid.message.generationFailed"));
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
      setMessage(t("grid.message.cellCompleted"));
      return;
    }

    const exactMatches = getCardsByExactName(playableCards, answer);

    if (!exactMatches.length) {
      setMessage(t("grid.message.cardNotFound"));
      return;
    }

    const unusedMatches = exactMatches.filter((card) => !usedCardIds.has(card.id));

    if (!unusedMatches.length) {
      setMessage(t("grid.message.cardAlreadyUsed"));
      return;
    }

    const validCard = unusedMatches.find(
      (card) => selectedRow?.predicate(card) && selectedColumn?.predicate(card)
    );

    if (!validCard) {
      setMistakes((current) => current + 1);
      setMessage(t("grid.message.wrongCell", { name: getCardName(unusedMatches[0], locale), row: selectedRow?.shortLabel, column: selectedColumn?.shortLabel }));
      return;
    }

    setAnswers((current) => ({
      ...current,
      [selectedKey]: validCard,
    }));

    setAnswer("");
    setMessage(t("grid.message.correct", { name: getCardName(validCard, locale) }));

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
      setMessage(t("grid.message.cellCompleted"));
      return;
    }

    const revealedCard = selectedCandidates.find((card) => !usedCardIds.has(card.id));

    if (!revealedCard) {
      setMessage(t("grid.message.noRevealAvailable"));
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
    setMessage(t("grid.message.revealed", { name: getCardName(revealedCard, locale) }));
    moveToNextEmptyCell(nextAnswers);
  }

  function renderConditionContent(condition) {
    if (condition.icon) {
      return (
        <div
          className="cg-condition-icon-frame"
          title={condition.shortLabel}
          data-label={condition.shortLabel}
        >
          <img
            className="cg-condition-icon"
            src={condition.icon}
            alt={condition.shortLabel}
            loading="eager"
            decoding="async"
            onError={(event) => {
              const icon = event.currentTarget;
              const fallback = icon.parentElement?.querySelector(".cg-condition-icon-fallback");

              icon.style.display = "none";
              if (fallback) fallback.hidden = false;
            }}
          />
          <span className="cg-condition-icon-fallback" hidden>
            {condition.shortLabel}
          </span>
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
            {t("common.backHome")}
          </button>
          <h1>{t("grid.title")}</h1>
          <p>
            {!cards.length
              ? t("grid.preparing")
              : t("grid.generationFailedShort")}
          </p>

          {cards.length ? (
            <>
              <div className="cg-mode-selector cg-mode-selector-empty">
                <span>{t("grid.modeLabelFull")}</span>
                <div className="cg-mode-buttons">
                  {Object.values(gridModes).map((mode) => (
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
                {t("grid.retry")}
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
            {t("common.backHome")}
          </button>

          <div className="cg-title-block">
            <p className="cg-eyebrow">{t("grid.minigame")}</p>
            <h1>{t("grid.title")}</h1>
            <p>{t("grid.subtitle")}</p>
          </div>

          <div className="cg-score-pill">
            <span>{t("grid.progress")}</span>
            <strong>{correctCount}/9</strong>
          </div>
        </header>

        <div className="cg-progress-track">
          <span className="cg-progress-fill" style={{ width: `${(correctCount / 9) * 100}%` }} />
        </div>

        <section className="cg-layout">
          <div className="cg-board-panel">
            <div className="cg-board" role="grid" aria-label={t("grid.title")}>
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
                        title={solvedCard ? getCardName(solvedCard, locale) : t("grid.emptyCell")}
                      >
                        {solvedCard ? (
                          getCardImage(solvedCard, locale) ? (
                            <div className="cg-solved-card-frame">
                              <img
                                className="cg-solved-card-image"
                                src={getCardImage(solvedCard, locale)}
                                alt={getCardName(solvedCard, locale)}
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
                            <strong>{getCardName(solvedCard, locale)}</strong>
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
              <p className="cg-eyebrow">{t("grid.selectedCell")}</p>
              <h2>{selectedRow?.shortLabel} + {selectedColumn?.shortLabel}</h2>
              <span>{t("grid.possibleAnswers", { count: grid.candidateMap[selectedKey]?.length ?? 0 })}</span>
            </div>

            <div className="cg-mode-selector">
              <span>{t("grid.modeLabel")}</span>
              <div className="cg-mode-buttons">
                {Object.values(gridModes).map((mode) => (
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
              <label htmlFor="grid-card-answer">{t("grid.cardLabel")}</label>
              <div className="cg-input-row">
                <input
                  id="grid-card-answer"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder={t("grid.answerPlaceholder")}
                  autoComplete="off"
                  disabled={isComplete}
                />
                <button className="cg-primary-button" type="submit" disabled={isComplete}>
                  {t("grid.tryAnswer")}
                </button>
              </div>

              {suggestions.length > 0 && !isComplete ? (
                <div className="cg-suggestions">
                  {suggestions.map((card) => (
                    <button
                      type="button"
                      key={card.id}
                      onClick={() => setAnswer(getCardName(card, locale))}
                    >
                      {getCardName(card, locale)}
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
                {t("grid.revealAnswer")}
              </button>
            </form>

            <div className="cg-message">
              <p>{isComplete ? t("grid.completed") : message}</p>
              <span>{t("grid.mistakes", { mistakes })}</span>
            </div>

            <button className="cg-secondary-button" onClick={startNewGrid}>
              {t("grid.newGrid")}
            </button>
          </aside>
        </section>
      </section>
    </main>
  );
}

export default CardGridGame;

