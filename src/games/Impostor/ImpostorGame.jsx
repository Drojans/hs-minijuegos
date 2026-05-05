import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../i18n/LanguageProvider";
import {
  getCardName,
  getAdaptedImage,
  getGameImage,
  getThumbImage,
  translateCardClass as translateSharedCardClass,
  translateCardRace as translateSharedCardRace,
  translateCardRarity as translateSharedCardRarity,
  translateCardType as translateSharedCardType,
} from "../../utils/cardLocale";
import ImpostorNeutralCard from "./ImpostorNeutralCard";
import "./ImpostorGame.css";

const MAX_ROUNDS = 10;
const BOARD_SIZE = 10;
const IMPOSTOR_COUNT = 5;
const CORRECT_COUNT = BOARD_SIZE - IMPOSTOR_COUNT;
const ALLOWED_TYPES = ["MINION", "SPELL", "WEAPON"];

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

const RACE_CONDITIONS = [
  "BEAST",
  "DEMON",
  "DRAGON",
  "DRAENEI",
  "ELEMENTAL",
  "MECHANICAL",
  "MURLOC",
  "NAGA",
  "PIRATE",
  "QUILBOAR",
  "TOTEM",
  "UNDEAD",
];

const MECHANIC_LABELS = {
  es: {
    BATTLECRY: "Grito de batalla",
    DEATHRATTLE: "Ãšltimo aliento",
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
    SPELLPOWER: "DaÃ±o con hechizos",
    TRADEABLE: "Comerciable",
    CHARGE: "Cargar",
    SPELLBURST: "RÃ¡faga de hechizos",
    WINDFURY: "Viento furioso",
    ELUSIVE: "Elusivo",
    CORRUPT: "Corruptible",
    OUTCAST: "Proscrito",
    REBORN: "Renacer",
    POISONOUS: "Veneno",
    FREEZE: "Congelar",
    QUEST: "MisiÃ³n",
    INSPIRE: "Inspirar",
    MAGNETIC: "MagnÃ©tico",
    DREDGE: "Dragado",
    HONORABLE_KILL: "Muerte honorable",
    FORGE: "Forja",
    MINIATURIZE: "Miniaturizar",
    FRENZY: "FrenesÃ­",
    MANATHIRST: "Sed de manÃ¡",
    EXCAVATE: "Excavar",
    QUICKDRAW: "Robo rÃ¡pido",
    ECHO: "Eco",
    COLOSSAL: "Colosal",
    TITAN: "TitÃ¡n",
    TWINSPELL: "Hechizo doble",
    OVERHEAL: "SobrecuraciÃ³n",
  },
  en: {
    BATTLECRY: "Battlecry",
    DEATHRATTLE: "Deathrattle",
    TAUNT: "Taunt",
    DISCOVER: "Discover",
    RUSH: "Rush",
    LIFESTEAL: "Lifesteal",
    SECRET: "Secret",
    CHOOSE_ONE: "Choose One",
    DIVINE_SHIELD: "Divine Shield",
    COMBO: "Combo",
    STEALTH: "Stealth",
    OVERLOAD: "Overload",
    SPELLPOWER: "Spell Damage",
    TRADEABLE: "Tradeable",
    CHARGE: "Charge",
    SPELLBURST: "Spellburst",
    WINDFURY: "Windfury",
    ELUSIVE: "Elusive",
    CORRUPT: "Corrupt",
    OUTCAST: "Outcast",
    REBORN: "Reborn",
    POISONOUS: "Poisonous",
    FREEZE: "Freeze",
    QUEST: "Quest",
    INSPIRE: "Inspire",
    MAGNETIC: "Magnetic",
    DREDGE: "Dredge",
    HONORABLE_KILL: "Honorable Kill",
    FORGE: "Forge",
    MINIATURIZE: "Miniaturize",
    FRENZY: "Frenzy",
    MANATHIRST: "Manathirst",
    EXCAVATE: "Excavate",
    QUICKDRAW: "Quickdraw",
    ECHO: "Echo",
    COLOSSAL: "Colossal",
    TITAN: "Titan",
    TWINSPELL: "Twinspell",
    OVERHEAL: "Overheal",
  },
};

const MECHANIC_CONDITIONS = Object.keys(MECHANIC_LABELS.es);

function getTextConditions(t) {
  return [
    {
      key: "text-damage",
      title: t("impostor.textCondition.damage.title"),
      description: t("impostor.textCondition.damage.description"),
      patterns: ["inflige", "daÃ±o", "damage", "deal"],
    },
    {
      key: "text-summon",
      title: t("impostor.textCondition.summon.title"),
      description: t("impostor.textCondition.summon.description"),
      patterns: ["invoca", "invocar", "summon"],
    },
    {
      key: "text-draw",
      title: t("impostor.textCondition.draw.title"),
      description: t("impostor.textCondition.draw.description"),
      patterns: ["roba", "robar", "robas", "robada", "draw"],
    },
    {
      key: "text-restore",
      title: t("impostor.textCondition.restore.title"),
      description: t("impostor.textCondition.restore.description"),
      patterns: ["restaura", "restaurar", "cura", "curar", "restore", "heal"],
    },
    {
      key: "text-destroy",
      title: t("impostor.textCondition.destroy.title"),
      description: t("impostor.textCondition.destroy.description"),
      patterns: ["destruye", "destruir", "destroy"],
    },
    {
      key: "text-add",
      title: t("impostor.textCondition.add.title"),
      description: t("impostor.textCondition.add.description"),
      patterns: ["aÃ±ade", "anade", "add"],
    },
    {
      key: "text-discard",
      title: t("impostor.textCondition.discard.title"),
      description: t("impostor.textCondition.discard.description"),
      patterns: ["descarta", "descartar", "discard"],
    },
    {
      key: "text-cost",
      title: t("impostor.textCondition.cost.title"),
      description: t("impostor.textCondition.cost.description"),
      patterns: ["cuesta", "coste", "cristal", "cost"],
    },
    {
      key: "text-attack",
      title: t("impostor.textCondition.attack.title"),
      description: t("impostor.textCondition.attack.description"),
      patterns: ["ataque", "attack"],
    },
    {
      key: "text-health",
      title: t("impostor.textCondition.health.title"),
      description: t("impostor.textCondition.health.description"),
      patterns: ["salud", "vida", "health"],
    },
  ];
}



const PRELOADED_IMAGE_SOURCES = new Set();

function translateCardClass(value, locale) {
  return translateSharedCardClass(value, locale);
}

function translateRarity(value, locale) {
  return translateSharedCardRarity(value, locale);
}

function translateType(value, locale) {
  return translateSharedCardType(value, locale);
}

function translateRace(value, locale) {
  return translateSharedCardRace(value, locale);
}

function translateMechanic(value, locale) {
  const labels = MECHANIC_LABELS[locale] ?? MECHANIC_LABELS.es;
  return labels[value] ?? value ?? (locale === "en" ? "Mechanic" : "MecÃ¡nica");
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

function getCardImage(card, locale) {
  return getAdaptedImage(card, locale) || getGameImage(card, locale) || getThumbImage(card, locale);
}

function getOriginalCardImage(card, locale) {
  return getAdaptedImage(card, locale) || getGameImage(card, locale) || getThumbImage(card, locale);
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

function getCardPreloadSources(card, locale) {
  // Importante: precargamos solo las dos imÃ¡genes que se usan realmente en Impostor.
  // Antes se pedÃ­an hasta 6 versiones por carta y eso saturaba la carga inicial.
  return Array.from(new Set([
    getCardImage(card, locale),
    getOriginalCardImage(card, locale),
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
      // Si decode falla, el navegador igualmente puede usar la peticiÃ³n/cache normal.
    });
  }
}

function preloadRoundImages(roundData, locale, fetchPriority = "auto") {
  if (!roundData?.cards) return;


  roundData.cards.forEach((card) => {
    getCardPreloadSources(card, locale).forEach((src) => preloadImageSource(src, fetchPriority));
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

function buildConditions(cards, locale = "es", t = (key) => key) {
  const playableCards = cards.filter((card) => {
    return card.id && getCardName(card, locale) && getCardImage(card, locale) && isAllowedType(card);
  });

  const rawConditions = [];

  CLASS_CONDITIONS.forEach((cardClass) => {
    rawConditions.push({
      id: `class-${cardClass}`,
      kind: t("impostor.condition.classKind"),
      title: t("impostor.condition.classTitle", { className: translateCardClass(cardClass, locale) }),
      description: t("impostor.condition.classDescription"),
      poolFilter: () => true,
      test: (card) => card.cardClass === cardClass,
    });
  });

  RARITY_CONDITIONS.forEach((rarity) => {
    rawConditions.push({
      id: `rarity-${rarity}`,
      kind: t("impostor.condition.rarityKind"),
      title: t("impostor.condition.rarityTitle", { rarity: translateRarity(rarity, locale) }),
      description: t("impostor.condition.rarityDescription"),
      poolFilter: () => true,
      test: (card) => card.rarity === rarity,
    });
  });

  TYPE_CONDITIONS.forEach((type) => {
    rawConditions.push({
      id: `type-${type}`,
      kind: t("impostor.condition.typeKind"),
      title: t("impostor.condition.typeTitle", { type: translateType(type, locale) }),
      description: t("impostor.condition.typeDescription"),
      poolFilter: () => true,
      test: (card) => card.type === type,
    });
  });

  RACE_CONDITIONS.forEach((race) => {
    rawConditions.push({
      id: `race-${race}`,
      kind: t("impostor.condition.raceKind"),
      title: t("impostor.condition.raceTitle", { race: translateRace(race, locale) }),
      description: t("impostor.condition.raceDescription"),
      poolFilter: (card) => card.type === "MINION",
      test: (card) => card.race === race,
    });
  });

  MECHANIC_CONDITIONS.forEach((mechanic) => {
    rawConditions.push({
      id: `mechanic-${mechanic}`,
      kind: t("impostor.condition.mechanicKind"),
      title: t("impostor.condition.mechanicTitle", { mechanic: translateMechanic(mechanic, locale) }),
      description: t("impostor.condition.mechanicDescription"),
      poolFilter: () => true,
      test: (card) => cardHasMechanic(card, mechanic),
    });
  });

  getTextConditions(t).forEach((rule) => {
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
      kind: t("impostor.condition.costKind"),
      title: t("impostor.condition.costTitle", { cost }),
      description: t("impostor.condition.costDescription"),
      poolFilter: () => true,
      test: (card) => card.cost === cost,
    });
  });

  [
    { key: "attack-3", kind: t("impostor.condition.attackKind"), title: t("impostor.condition.attackTitle", { value: 3 }), stat: "attack", value: 3 },
    { key: "attack-5", kind: t("impostor.condition.attackKind"), title: t("impostor.condition.attackTitle", { value: 5 }), stat: "attack", value: 5 },
    { key: "health-4", kind: t("impostor.condition.healthKind"), title: t("impostor.condition.healthTitle", { value: 4 }), stat: "health", value: 4 },
    { key: "health-6", kind: t("impostor.condition.healthKind"), title: t("impostor.condition.healthTitle", { value: 6 }), stat: "health", value: 6 },
  ].forEach((rule) => {
    rawConditions.push({
      id: rule.key,
      kind: rule.kind,
      title: rule.title,
      description: t("impostor.condition.statDescription"),
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

function createRound(cards, previousConditionId = null, locale = "es", t = (key) => key) {
  return createRoundFromConditions(buildConditions(cards, locale, t), previousConditionId);
}

function ImpostorGame({ cards, onBack }) {
  const { locale, t } = useLanguage();

  const playableCards = useMemo(() => {
    return cards.filter((card) => card.id && getCardName(card, locale) && getCardImage(card, locale) && isAllowedType(card));
  }, [cards, locale]);

  // Con muchas categorÃ­as, calcular validCards/invalidCards en cada ronda era caro.
  // Lo calculamos una sola vez mientras no cambie la lista de cartas.
  const availableConditions = useMemo(() => buildConditions(playableCards, locale, t), [playableCards, locale, t]);

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
    // AsÃ­ el giro no crea la imagen de cero justo al revelar.
    preloadRoundImages(roundData, locale, "high");

    // Mientras el jugador piensa, dejamos preparada la siguiente ronda y sus imÃ¡genes.
    const prepareTimeout = window.setTimeout(() => {
      if (round >= MAX_ROUNDS || availableConditions.length === 0) return;

      const nextPreparedRound = createRoundFromConditions(availableConditions, roundData.condition.id);
      setPreparedRoundData(nextPreparedRound);
      // Dejamos respirar a la ronda actual antes de precargar la siguiente.
      preloadRoundImages(nextPreparedRound, locale, "low");
    }, 1200);

    return () => {
      window.clearTimeout(prepareTimeout);
    };
  }, [availableConditions, round, roundData, locale]);

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
          <h1>{t("impostor.title")}</h1>
          <p>{t("impostor.noCards")}</p>
          <button className="im-secondary-button" onClick={onBack}>{t("common.back")}</button>
        </section>
      </main>
    );
  }

  if (!roundData) {
    return (
      <main className="im-page">
        <section className="im-message-panel">
          <h1>{t("impostor.loadingGame")}</h1>
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
          <p className="im-eyebrow">{t("impostor.gameFinished")}</p>
          <h1>{t("impostor.title")}</h1>
          <div className="im-end-score">{score} / {MAX_ROUNDS}</div>
          <p>{t("impostor.finalAccuracy", { accuracy })}</p>
          <div className="im-end-actions">
            <button className="im-primary-button" onClick={restartGame}>{t("common.playAgain")}</button>
            <button className="im-secondary-button" onClick={onBack}>{t("impostor.backHome")}</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="im-page">
      <section className="im-shell">
        <header className="im-header">
          <button className="im-secondary-button" onClick={onBack}>{t("common.backHome")}</button>

          <div className="im-title-block">
            <p className="im-eyebrow">{t("impostor.minigame")}</p>
            <h1>{t("impostor.title")}</h1>
            <p>{t("impostor.subtitle", { correctCount: CORRECT_COUNT })}</p>
          </div>

          <div className="im-score-pill">
            <span>{t("common.round", { round, maxRounds: MAX_ROUNDS })}</span>
            <strong>{t("common.correctCount", { score })}</strong>
          </div>
        </header>

        <div className="im-progress-track">
          <span className="im-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        <section className="im-game-layout">
          <aside className="im-side-panel">
            <p className="im-eyebrow">{t("impostor.category")}</p>
            <h2>{roundData.condition.title}</h2>
            <p>{roundData.condition.description}</p>

            <div className="im-meta-box">
              <span>{roundData.condition.kind}</span>
              <strong>{t("impostor.goodAndImpostors", { correctCount: CORRECT_COUNT, impostorCount: IMPOSTOR_COUNT })}</strong>
            </div>

            <div className="im-help-box">
              <strong>{t("impostor.howToPlay")}</strong>
              <p>{t("impostor.howToPlayText", { correctCount: CORRECT_COUNT })}</p>
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
                    title={`${getCardName(card, locale)} Â· ${translateType(card.type, locale)}`}
                  >
                    <div className="im-flip-card">
                      <div className="im-flip-face im-flip-front">
                        <ImpostorNeutralCard card={card} locale={locale} />
                      </div>

                      <div className="im-flip-face im-flip-back">
                        <img
                          className={getOriginalCardImageClassName(card)}
                          src={getOriginalCardImage(card, locale)}
                          alt={getCardName(card, locale)}
                          loading="eager"
                          decoding="async"
                          fetchPriority="high"
                        />
                      </div>
                    </div>

                    {isRevealed && isCorrect && <div className="im-result-mark im-result-mark-correct">âœ“</div>}
                    {isRevealed && isImpostor && <div className="im-result-mark im-result-mark-wrong">Ã—</div>}
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="im-action-panel">
            {roundResult === "playing" ? (
              <>
                <p className="im-eyebrow">{t("impostor.analysis")}</p>
                <h2>{t("impostor.findGood")}</h2>
                <p>{t("impostor.found", { foundCount, correctCount: CORRECT_COUNT })}</p>
                <button className="im-primary-button" disabled={!selectedId} onClick={checkSelectedCard}>{t("impostor.checkCard")}</button>
              </>
            ) : (
              <>
                <p className="im-eyebrow">{t("common.result")}</p>
                <h2>{isRoundWon ? t("impostor.perfectRound") : t("impostor.wasImpostor")}</h2>
                <p>{isRoundWon ? t("impostor.perfectRoundText", { correctCount: CORRECT_COUNT }) : t("impostor.wasImpostorText")}</p>
                <button className="im-primary-button" onClick={nextRound}>{round >= MAX_ROUNDS ? t("common.seeResult") : t("impostor.nextRound")}</button>
              </>
            )}
          </aside>
        </section>
      </section>
    </main>
  );
}

export default ImpostorGame;
