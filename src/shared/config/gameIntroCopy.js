import { GAME_IDS } from "./gameRules";

const DAILY_REWARD_TEXT = {
  es: "1 caja arcana",
  en: "1 arcane box",
};

const COMMON = {
  es: {
    modeEyebrow: "Modo de juego",
    howToPlayTitle: "Cómo se juega",
    modeSelectorLabel: "Selecciona modo",
    dailyTitle: "Reto diario",
    infiniteTitle: "Modo infinito",
    dailyDescription: "La partida fija del día.",
    infiniteDescription: "Practica sin límite.",
    dailyMeta: "Da recompensa",
    infiniteMeta: "Sin recompensa",
    completedStatus: "Completado",
    startMode: "Empezar",
    startCompletedDaily: "Ver resultado",
    rewardLabel: "Recompensa diaria",
  },
  en: {
    modeEyebrow: "Game mode",
    howToPlayTitle: "How to play",
    modeSelectorLabel: "Select mode",
    dailyTitle: "Daily challenge",
    infiniteTitle: "Infinite mode",
    dailyDescription: "Today’s fixed run.",
    infiniteDescription: "Practice without limits.",
    dailyMeta: "Reward available",
    infiniteMeta: "No reward",
    completedStatus: "Completed",
    startMode: "Start",
    startCompletedDaily: "View result",
    rewardLabel: "Daily reward",
  },
};

const GAME_INTRO_COPY = {
  [GAME_IDS.GUESS_MANA]: {
    es: {
      title: "Adivina el coste",
      description: "Observa la carta con el coste de maná oculto y elige cuánto cuesta antes de confirmar.",
      exampleLabel: "Ejemplo visual del minijuego Adivina el coste",
      previewSrc: "/ui/games/guess-mana-v3/mode-example.png",
      steps: [
        {
          icon: "?",
          title: "El coste está oculto",
          text: "La gema de maná aparece tapada. Mira la carta, lee sus pistas y tira de memoria.",
        },
        {
          iconSrc: "/ui/games/guess-mana-v3/mana-crystal.png",
          iconClassName: "is-crystal",
          title: "Elige un cristal",
          text: "Selecciona un coste del 0 al 10. Confirmar bloquea tu respuesta.",
        },
        {
          icon: "⚔",
          title: "Dos formas de jugar",
          text: "Reto diario para la carta del día o modo infinito para practicar sin parar.",
        },
      ],
    },
    en: {
      title: "Guess the Cost",
      description: "Look at the card with its mana cost hidden and choose how much it costs before confirming.",
      exampleLabel: "Guess the Cost minigame example",
      previewSrc: "/ui/games/guess-mana-v3/mode-example.png",
      steps: [
        {
          icon: "?",
          title: "The cost is hidden",
          text: "The mana gem is covered. Look at the card, read the clues and use your memory.",
        },
        {
          iconSrc: "/ui/games/guess-mana-v3/mana-crystal.png",
          iconClassName: "is-crystal",
          title: "Pick a crystal",
          text: "Choose a cost from 0 to 10. Confirming locks your answer.",
        },
        {
          icon: "⚔",
          title: "Two ways to play",
          text: "Daily challenge for today’s card or infinite mode to practise without stopping.",
        },
      ],
    },
  },

  [GAME_IDS.HIGHER_LOWER]: {
    es: {
      title: "Mayor o menor",
      description: "Compara dos cartas y decide cuál gana según la pregunta de cada ronda.",
      exampleLabel: "Ejemplo visual del minijuego Mayor o menor",
      previewSrc: "/ui/games/higher-lower/mode-example.svg",
      steps: [
        {
          icon: "VS",
          title: "Dos cartas, una pregunta",
          text: "Compara las dos cartas y elige cuál cumple mejor la condición del centro.",
        },
        {
          icon: "↕",
          title: "La pregunta cambia",
          text: "Puede ser coste, ataque, vida, rareza, antigüedad, texto, mecánicas y más.",
        },
        {
          icon: "✓",
          title: "Encadena aciertos",
          text: "Si hay empate, cuenta como acierto. En diario necesitas 10 fases sin fallar.",
        },
      ],
    },
    en: {
      title: "Higher or Lower",
      description: "Compare two cards and decide which one wins based on each round’s question.",
      exampleLabel: "Higher or Lower minigame example",
      previewSrc: "/ui/games/higher-lower/mode-example.svg",
      steps: [
        {
          icon: "VS",
          title: "Two cards, one question",
          text: "Compare both cards and choose which one best matches the central condition.",
        },
        {
          icon: "↕",
          title: "The question changes",
          text: "It can ask about cost, Attack, Health, rarity, age, text, mechanics, and more.",
        },
        {
          icon: "✓",
          title: "Chain correct picks",
          text: "Ties count as correct. In daily mode you need 10 correct phases without missing.",
        },
      ],
    },
  },

  [GAME_IDS.HIDDEN_CARD]: {
    es: {
      title: "La carta oculta",
      description: "Adivina una carta misteriosa a partir de su imagen tapada y pistas progresivas.",
      exampleLabel: "Ejemplo visual del minijuego La carta oculta",
      previewSrc: "/ui/games/hidden-card/mode-example.svg",
      steps: [
        {
          icon: "?",
          title: "Una carta misteriosa",
          text: "La carta empieza borrosa y tapada. Observa la silueta, el arte y las pistas.",
        },
        {
          icon: "⌕",
          title: "Escribe el nombre",
          text: "Tienes 5 intentos. Usa el buscador para escribir o elegir la carta que crees que es.",
        },
        {
          icon: "✦",
          title: "Pistas progresivas",
          text: "Cada fallo revela más información: coste, tipo, clase, rareza y nombre.",
        },
      ],
    },
    en: {
      title: "The Hidden Card",
      description: "Guess a mysterious card from its covered image and progressive clues.",
      exampleLabel: "The Hidden Card minigame example",
      previewSrc: "/ui/games/hidden-card/mode-example.svg",
      steps: [
        {
          icon: "?",
          title: "One mysterious card",
          text: "The card starts blurred and covered. Watch its silhouette, art, and clues.",
        },
        {
          icon: "⌕",
          title: "Type the name",
          text: "You have 5 attempts. Use search to type or pick the card you think it is.",
        },
        {
          icon: "✦",
          title: "Progressive clues",
          text: "Each miss reveals more information: cost, type, class, rarity, and name.",
        },
      ],
    },
  },

  [GAME_IDS.IMPOSTOR]: {
    es: {
      title: "Hearthstone Impostor",
      description: "Encuentra las cartas que cumplen la categoría y evita elegir al impostor.",
      exampleLabel: "Ejemplo visual del minijuego Hearthstone Impostor",
      previewSrc: "/ui/games/impostor-v2/mode-example.svg",
      steps: [
        {
          icon: "?",
          title: "Hay una categoría",
          text: "Todas las cartas buenas cumplen el objetivo de la ronda. Léelo bien antes de elegir.",
        },
        {
          icon: "✓",
          title: "Encuentra las correctas",
          text: "Selecciona las cartas que encajan. Cada acierto se revela y te acerca al objetivo.",
        },
        {
          icon: "×",
          title: "Evita al impostor",
          text: "Si eliges una carta incorrecta, la ronda termina y se revelan los resultados.",
        },
      ],
    },
    en: {
      title: "Hearthstone Impostor",
      description: "Find the cards that match the category and avoid picking the impostor.",
      exampleLabel: "Hearthstone Impostor minigame example",
      previewSrc: "/ui/games/impostor-v2/mode-example.svg",
      steps: [
        {
          icon: "?",
          title: "There is a category",
          text: "Every good card matches the round target. Read it carefully before you pick.",
        },
        {
          icon: "✓",
          title: "Find the correct ones",
          text: "Select the cards that fit. Every correct pick is revealed and gets you closer.",
        },
        {
          icon: "×",
          title: "Avoid the impostor",
          text: "Pick a wrong card and the round ends with the results revealed.",
        },
      ],
    },
  },

  [GAME_IDS.PYRAMID]: {
    es: {
      title: "Pirámide de cartas",
      description: "Completa la pirámide escribiendo cartas válidas para una categoría concreta.",
      exampleLabel: "Ejemplo visual del minijuego Pirámide de cartas",
      previewSrc: "/ui/games/pyramid/mode-example.svg",
      steps: [
        {
          icon: "10",
          title: "Hay una categoría",
          text: "Te damos una condición. Escribe cartas que encajen para llenar la pirámide.",
        },
        {
          icon: "✎",
          title: "Escribe cartas válidas",
          text: "Cada acierto ocupa un hueco. No puedes repetir carta dentro de la misma pirámide.",
        },
        {
          icon: "⌛",
          title: "Completa a tiempo",
          text: "El reto diario tiene 120 segundos. En infinito puedes practicar sin recompensa.",
        },
      ],
    },
    en: {
      title: "Card Pyramid",
      description: "Complete the pyramid by typing valid cards for a specific category.",
      exampleLabel: "Card Pyramid minigame example",
      previewSrc: "/ui/games/pyramid/mode-example.svg",
      steps: [
        {
          icon: "10",
          title: "There is a category",
          text: "You get one condition. Type cards that match it to fill the pyramid.",
        },
        {
          icon: "✎",
          title: "Type valid cards",
          text: "Every correct answer fills one slot. You cannot repeat a card in the same pyramid.",
        },
        {
          icon: "⌛",
          title: "Complete it in time",
          text: "Daily challenge has 120 seconds. Infinite mode is free practice with no reward.",
        },
      ],
    },
  },

  [GAME_IDS.CARD_GRID]: {
    es: {
      title: "Grid de cartas",
      description: "Completa un 3×3 escribiendo cartas que cumplan la fila y la columna a la vez.",
      exampleLabel: "Ejemplo visual del minijuego Grid de cartas",
      previewSrc: "/ui/games/card-grid-v2/mode-example.svg",
      steps: [
        {
          icon: "3×3",
          title: "Cruza fila y columna",
          text: "Cada casilla mezcla dos condiciones. Busca una carta que cumpla ambas a la vez.",
        },
        {
          icon: "+",
          title: "Escribe la carta",
          text: "Selecciona una casilla, escribe el nombre y pulsa Enter para colocarla.",
        },
        {
          icon: "⚔",
          title: "Dos formas de jugar",
          text: "Reto diario para la cuadrícula del día o modo infinito para practicar sin parar.",
        },
      ],
    },
    en: {
      title: "Card Grid",
      description: "Complete a 3×3 grid by typing cards that match both row and column.",
      exampleLabel: "Card Grid minigame example",
      previewSrc: "/ui/games/card-grid-v2/mode-example.svg",
      steps: [
        {
          icon: "3×3",
          title: "Match row and column",
          text: "Each cell combines two conditions. Find one card that satisfies both at once.",
        },
        {
          icon: "+",
          title: "Type the card",
          text: "Select a cell, type the card name and press Enter to place it.",
        },
        {
          icon: "⚔",
          title: "Two ways to play",
          text: "Daily challenge for today’s grid or infinite mode to practice without limits.",
        },
      ],
    },
  },
};

function mergeLocaleCopy(gameCopy, locale = "es") {
  const common = COMMON[locale] ?? COMMON.es;
  const fallbackCommon = COMMON.es;
  const localized = gameCopy?.[locale] ?? gameCopy?.es ?? {};
  const fallback = gameCopy?.es ?? {};

  return {
    ...fallbackCommon,
    ...common,
    ...fallback,
    ...localized,
    dailyRewardText: DAILY_REWARD_TEXT[locale] ?? DAILY_REWARD_TEXT.es,
  };
}

export function getGameIntroCopy(gameId, locale = "es") {
  return mergeLocaleCopy(GAME_INTRO_COPY[gameId], locale);
}
