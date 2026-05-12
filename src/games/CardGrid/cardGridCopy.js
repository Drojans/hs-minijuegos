export const CARD_GRID_COPY = {
  es: {
    progressLabel: "Progreso",
    dailyChallenge: "Reto diario",
    infiniteChallenge: "Modo infinito",
    dailyRewardEarned: "Has ganado 1 caja arcana.",
    dailyRewardAlreadyClaimed: "Grid diario completado. Hoy ya tenías esta recompensa.",
    dailyTimeLabel: "Tiempo",
    dailyTimeExpiredMessage: "Se acabó el tiempo. El reto diario queda marcado como fallado.",
    backHome: "Volver",
  },
  en: {
    progressLabel: "Progress",
    dailyChallenge: "Daily challenge",
    infiniteChallenge: "Infinite mode",
    dailyRewardEarned: "You earned 1 arcane box.",
    dailyRewardAlreadyClaimed: "Daily grid completed. You already had today’s reward.",
    dailyTimeLabel: "Time",
    dailyTimeExpiredMessage: "Time is up. The daily challenge is marked as failed.",
    backHome: "Back",
  },
};

export function getCardGridCopy(locale) {
  return CARD_GRID_COPY[locale] ?? CARD_GRID_COPY.es;
}
