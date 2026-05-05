const BOOK_ASSET_PATH = "/ui/book/";

export const HOME_MODE_CONFIG = [
  {
    id: "guessMana",
    route: "/guess-mana",
    iconSrc: `${BOOK_ASSET_PATH}icon-mode-mana-cartoon.png`,
    titleKey: "home.modes.guessMana.title",
    descriptionKey: "home.modes.guessMana.description",
    dailyStatus: "won",
    featured: true,
  },
  {
    id: "impostor",
    route: "/impostor",
    iconSrc: `${BOOK_ASSET_PATH}icon-mode-impostor-cartoon.png`,
    titleKey: "home.modes.impostor.title",
    descriptionKey: "home.modes.impostor.description",
    dailyStatus: "idle",
  },
  {
    id: "grid",
    route: "/grid",
    iconSrc: `${BOOK_ASSET_PATH}icon-mode-grid-cartoon.png`,
    titleKey: "home.modes.grid.title",
    descriptionKey: "home.modes.grid.description",
    dailyStatus: "lost",
  },
  {
    id: "cards",
    route: "/cards",
    iconSrc: `${BOOK_ASSET_PATH}icon-mode-database-cartoon.png`,
    titleKey: "home.modes.cards.title",
    descriptionKey: "home.modes.cards.description",
    dailyStatus: "neutral",
  },
];

export const MODE_LAYOUT_CLASS_BY_ID = {
  guessMana: "guess",
  impostor: "impostor",
  grid: "grid",
    route: "/grid",
  cards: "cards",
};

export const BOOK_HOME_COPY = {
  es: {
    tavern: "Taberna de Hearthdle",
    title: "Diario\nde Misiones",
    wanted: "Se busca",
    innkeeperTitle: "El tabernero ruge:",
    innkeeperQuote: "¡Hace frío ahí fuera! Acércate a la lumbre y baraja.",
    featuredTitle: "Misión destacada de la taberna",
    featuredBody: "Aquí irá la misión especial del día, el reto de temporada o el evento destacado.",
    featuredRewardTitle: "Próximamente",
    featuredRewardBody: "Un hueco reservado para algo con más personalidad.",
    updatedLabel: "Actualizado:",
    forge: "Forjar misión de leyenda",
    signature: "~ Firma aquí al completar tu gesta ~",
    loading: "Preparando mazo...",
  },
  en: {
    tavern: "Hearthdle Tavern",
    title: "Quest\nJournal",
    wanted: "Wanted",
    innkeeperTitle: "The innkeeper roars:",
    innkeeperQuote: "It is cold out there! Come by the fire and shuffle your deck.",
    featuredTitle: "Featured tavern quest",
    featuredBody: "This space is reserved for the daily special quest, seasonal challenge, or featured event.",
    featuredRewardTitle: "Coming soon",
    featuredRewardBody: "A reserved slot for something with more personality.",
    updatedLabel: "Updated:",
    forge: "Forge legendary quest",
    signature: "~ Sign here when your quest is complete ~",
    loading: "Preparing deck...",
  },
};

export const bookContainerVariants = {
  hidden: { opacity: 0, scale: 0.986, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.045 },
  },
};

export const bookItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
};

export function getStatusSymbol(status) {
  switch (status) {
    case "won":
      return "✓";
    case "lost":
      return "✕";
    case "idle":
      return "—";
    default:
      return "";
  }
}
