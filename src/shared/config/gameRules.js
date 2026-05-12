export const GAME_IDS = {
  GUESS_MANA: "guess-mana",
  IMPOSTOR: "impostor",
  CARD_GRID: "card-grid",
  PYRAMID: "pyramid",
  HIGHER_LOWER: "higher-lower",
  HIDDEN_CARD: "hidden-card",
};

export const DAILY_MODE_GAME_IDS_BY_HOME_MODE = {
  guessMana: GAME_IDS.GUESS_MANA,
  impostor: GAME_IDS.IMPOSTOR,
  grid: GAME_IDS.CARD_GRID,
  pyramid: GAME_IDS.PYRAMID,
  higherLower: GAME_IDS.HIGHER_LOWER,
  hiddenCard: GAME_IDS.HIDDEN_CARD,
};

// Internal id kept as "standard" to preserve existing localStorage progress.
export const ARCANE_BOX_ID = "standard";
export const DAILY_REWARD_BOX_AMOUNT = 1;
export const ARCANE_BOX_CARD_COUNT = 10;
export const CARD_GRID_DAILY_TIME_SECONDS = 90;
export const PYRAMID_DAILY_TIME_SECONDS = 120;
export const HIGHER_LOWER_DAILY_TIME_SECONDS = 90;
export const HIGHER_LOWER_DAILY_TARGET = 10;
export const HIDDEN_CARD_MAX_ATTEMPTS = 5;
