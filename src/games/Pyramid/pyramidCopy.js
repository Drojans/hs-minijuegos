const PYRAMID_COPY = {
  es: {
    resultKicker: "Resultado",
    dailyChallenge: "Reto diario",
    infiniteChallenge: "Modo infinito",
    dailyRewardEarned: "Has ganado 1 caja arcana.",
    dailyRewardAlreadyClaimed: "Diez de Diez diario completado. Hoy ya tenías esta recompensa.",
    category: "Categoría",
    progress: "Progreso",
    cardPlaceholder: "Escribe una carta...",
    submit: "Comprobar",
    timeLabel: "Tiempo",
    found: "{count}/10 cartas",
    wrongCard: "{name} no cumple la categoría.",
    duplicateCard: "{name} ya se ha usado en este reto.",
    unknownCard: "No encuentro {name}.",
    correctCard: "Correcta.",
    winTitle: "¡Diez de Diez!",
    winText: "Has encontrado 10 cartas que cumplen la categoría.",
    loseTitle: "Se acabó el tiempo",
    loseText: "Diez de Diez diario queda marcado como fallado.",
    viewResults: "Ver resultados",
    playAgain: "Otro Diez de Diez",
    backHome: "Volver",
    noCards: "No hay suficientes cartas para crear Diez de Diez.",
    loading: "Preparando Diez de Diez...",
    resultsHint: "Resultados de la categoría",
  },
  en: {
    resultKicker: "Result",
    dailyChallenge: "Daily challenge",
    infiniteChallenge: "Infinite mode",
    dailyRewardEarned: "You earned 1 arcane box.",
    dailyRewardAlreadyClaimed: "Daily Ten out of Ten completed. You already had today’s reward.",
    category: "Category",
    progress: "Progress",
    cardPlaceholder: "Type a card...",
    submit: "Check",
    timeLabel: "Time",
    found: "{count}/10 cards",
    wrongCard: "{name} does not match the category.",
    duplicateCard: "{name} has already been used in this challenge.",
    unknownCard: "I cannot find {name}.",
    correctCard: "Correct.",
    winTitle: "Ten out of Ten!",
    winText: "You found 10 cards that match the category.",
    loseTitle: "Time is up",
    loseText: "The daily Ten out of Ten challenge is marked as failed.",
    viewResults: "View results",
    playAgain: "Another Ten out of Ten",
    backHome: "Back",
    noCards: "There are not enough cards to create Ten out of Ten.",
    loading: "Preparing Ten out of Ten...",
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
