export const SUPPORTED_LOCALES = ["es", "en"];
export const DEFAULT_LOCALE = "es";

export const LOCALE_LABELS = {
  es: "ES",
  en: "EN",
};

export const translations = {
  es: {
    "common.language": "Idioma",
    "common.loading": "Cargando",
    "common.loadingLong": "Cargando...",
    "common.cards": "Cartas",
    "common.unknown": "Desconocido",
    "common.back": "Volver",
    "common.backHome": "← Inicio",
    "common.next": "Siguiente",
    "common.play": "Jugar",
    "common.playAgain": "Jugar otra vez",
    "common.result": "Resultado",
    "common.seeResult": "Ver resultado",
    "common.round": "Ronda {round}/{maxRounds}",
    "common.correctCount": "{score} aciertos",

    "home.kicker": "Hearthstone fan minigames",
    "home.subtitle": "Adivina cartas de Hearthstone",
    "home.selectMode": "Selecciona un modo",
    "home.gameModesAria": "Modos de juego",
    "home.modes.play": "Jugar",
    "home.modes.open": "Abrir",
    "home.modes.guessMana.title": "Adivina el coste",
    "home.modes.guessMana.description": "Observa la carta y selecciona su coste real de maná.",
    "home.modes.impostor.title": "Encuentra el impostor",
    "home.modes.impostor.description": "Encuentra las cartas correctas y evita las trampas de cada ronda.",
    "home.modes.grid.title": "Grid de cartas",
    "home.modes.grid.description": "Completa un 3x3 escribiendo cartas que cumplan fila y columna.",
    "home.modes.cards.title": "Base de datos",
    "home.modes.cards.description": "Explora la colección, filtra cartas y ábrelas en grande.",

    "database.cardDetail": "Detalle de carta",
    "database.noText": "Sin texto.",
  },
  en: {
    "common.language": "Language",
    "common.loading": "Loading",
    "common.loadingLong": "Loading...",
    "common.cards": "Cards",
    "common.unknown": "Unknown",
    "common.back": "Back",
    "common.backHome": "← Home",
    "common.next": "Next",
    "common.play": "Play",
    "common.playAgain": "Play again",
    "common.result": "Result",
    "common.seeResult": "See result",
    "common.round": "Round {round}/{maxRounds}",
    "common.correctCount": "{score} correct",

    "home.kicker": "Hearthstone fan minigames",
    "home.subtitle": "Guess Hearthstone cards",
    "home.selectMode": "Select a mode",
    "home.gameModesAria": "Game modes",
    "home.modes.play": "Play",
    "home.modes.open": "Open",
    "home.modes.guessMana.title": "Guess the Cost",
    "home.modes.guessMana.description": "Look at the card and choose its real mana cost.",
    "home.modes.impostor.title": "Find the Impostor",
    "home.modes.impostor.description": "Find the correct cards and avoid each round's traps.",
    "home.modes.grid.title": "Card Grid",
    "home.modes.grid.description": "Complete a 3x3 grid with cards that match row and column.",
    "home.modes.cards.title": "Card Database",
    "home.modes.cards.description": "Explore the collection, filter cards, and open them in detail.",

    "database.cardDetail": "Card detail",
    "database.noText": "No text.",
  },
};

export function normalizeLocale(locale) {
  return SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
}

export function translate(locale, key, values = {}) {
  const safeLocale = normalizeLocale(locale);
  const template = translations[safeLocale]?.[key] ?? translations[DEFAULT_LOCALE]?.[key] ?? key;

  return Object.entries(values).reduce((text, [name, value]) => {
    return text.replaceAll(`{${name}}`, String(value));
  }, template);
}
