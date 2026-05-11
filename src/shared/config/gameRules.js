export const GAME_IDS = {
  GUESS_MANA: "guess-mana",
  IMPOSTOR: "impostor",
  CARD_GRID: "card-grid",
};

export const DAILY_MODE_GAME_IDS_BY_HOME_MODE = {
  guessMana: GAME_IDS.GUESS_MANA,
  impostor: GAME_IDS.IMPOSTOR,
  grid: GAME_IDS.CARD_GRID,
};

// Internal id kept as "standard" to preserve existing localStorage progress.
export const ARCANE_BOX_ID = "standard";
export const DAILY_REWARD_BOX_AMOUNT = 1;
export const ARCANE_BOX_CARD_COUNT = 10;
export const CARD_GRID_DAILY_TIME_SECONDS = 90;
