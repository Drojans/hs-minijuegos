const PYRAMID_COPY = {
  es: {
    resultKicker: "Resultado",
    dailyChallenge: "Reto diario",
    infiniteChallenge: "Modo infinito",
    dailyRewardEarned: "Has ganado 1 caja arcana.",
    dailyRewardAlreadyClaimed: "Pirámide diaria completada. Hoy ya tenías esta recompensa.",
    category: "Categoría",
    progress: "Progreso",
    cardPlaceholder: "Escribe una carta...",
    submit: "Comprobar",
    timeLabel: "Tiempo",
    found: "{count}/10 cartas",
    wrongCard: "{name} no cumple la categoría.",
    duplicateCard: "{name} ya se ha usado en esta pirámide.",
    unknownCard: "No encuentro {name}.",
    correctCard: "Correcta.",
    winTitle: "¡Pirámide completa!",
    winText: "Has encontrado 10 cartas que cumplen la categoría.",
    loseTitle: "Se acabó el tiempo",
    loseText: "La pirámide diaria queda marcada como fallada.",
    viewResults: "Ver resultados",
    playAgain: "Otra pirámide",
    backHome: "Volver",
    noCards: "No hay suficientes cartas para crear una pirámide.",
    loading: "Preparando pirámide...",
    resultsHint: "Resultados de la categoría",
  },
  en: {
    resultKicker: "Result",
    dailyChallenge: "Daily challenge",
    infiniteChallenge: "Infinite mode",
    dailyRewardEarned: "You earned 1 arcane box.",
    dailyRewardAlreadyClaimed: "Daily pyramid completed. You already had today’s reward.",
    category: "Category",
    progress: "Progress",
    cardPlaceholder: "Type a card...",
    submit: "Check",
    timeLabel: "Time",
    found: "{count}/10 cards",
    wrongCard: "{name} does not match the category.",
    duplicateCard: "{name} has already been used in this pyramid.",
    unknownCard: "I cannot find {name}.",
    correctCard: "Correct.",
    winTitle: "Pyramid complete!",
    winText: "You found 10 cards that match the category.",
    loseTitle: "Time is up",
    loseText: "The daily pyramid is marked as failed.",
    viewResults: "View results",
    playAgain: "Another pyramid",
    backHome: "Back",
    noCards: "There are not enough cards to create a pyramid.",
    loading: "Preparing pyramid...",
    resultsHint: "Category results",
  },
};

export function getPyramidCopy(locale) {
  return PYRAMID_COPY[locale] ?? PYRAMID_COPY.es;
}

export function formatPyramidText(template, values = {}) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template,
  );
}
