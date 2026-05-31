import { useEffect, useState, useCallback } from "react";
import { HelpCircle, Swords, BookOpen, Shield, ChevronDown, Scroll } from "lucide-react";
import { useLanguage } from "../../../i18n/LanguageProvider";
import { normalizeLocale } from "../../../i18n/translations";
import { 
  getTodayKey, 
  getDailyGameProgress, 
  getDailyChallengeState, 
  DAILY_CHALLENGE_STATES, 
  DAILY_PROGRESS_UPDATED_EVENT 
} from "../../progress/dailyProgress";
import LanguageToggle from "../LanguageToggle/LanguageToggle";
import "./SiteHeader.css";

const SITE_HEADER_COPY = {
  es: {
    navMinigames: "Minijuegos",
    navCollection: "Colección",
    profileLabel: "Perfil",
    brandLabel: "Hearthdle",
    navInstructions: "Instrucciones",
    challengesTitle: "Retos de la Taberna",
    questStatus: "Progreso Diario",
    pending: "Pendiente",
    completed: "Completado",
    failed: "Fallado",
  },
  en: {
    navMinigames: "Minigames",
    navCollection: "Collection",
    profileLabel: "Profile",
    brandLabel: "Hearthdle",
    navInstructions: "Instructions",
    challengesTitle: "Tavern Challenges",
    questStatus: "Daily Progress",
    pending: "Pending",
    completed: "Completed",
    failed: "Failed",
  },
};

const MINIGAMES_LIST = [
  {
    id: "guessMana",
    gameId: "guess-mana",
    route: "/guess-mana",
    iconSrc: "/ui/home-v2-icons/icon-mode-mana.png",
    es: { title: "Adivina el coste" },
    en: { title: "Guess the Cost" },
  },
  {
    id: "higherLower",
    gameId: "higher-lower",
    route: "/higher-lower",
    iconSrc: "/ui/home-v2-icons/icon-mode-higher-lower.png",
    es: { title: "Mayor o menor" },
    en: { title: "Higher or Lower" },
  },
  {
    id: "hiddenCard",
    gameId: "hidden-card",
    route: "/hidden-card",
    iconSrc: "/ui/home-v2-icons/icon-mode-hidden-card.png",
    es: { title: "La carta oculta" },
    en: { title: "The Hidden Card" },
  },
  {
    id: "impostor",
    gameId: "impostor",
    route: "/impostor",
    iconSrc: "/ui/home-v2-icons/icon-mode-impostor.png",
    es: { title: "El Impostor" },
    en: { title: "The Impostor" },
  },
  {
    id: "pyramid",
    gameId: "pyramid",
    route: "/pyramid",
    iconSrc: "/ui/home-v2-icons/icon-mode-pyramid.png",
    es: { title: "Diez de Diez" },
    en: { title: "Ten out of Ten" },
  },
  {
    id: "grid",
    gameId: "card-grid",
    route: "/grid",
    iconSrc: "/ui/home-v2-icons/icon-mode-grid.png",
    es: { title: "Grid de cartas" },
    en: { title: "Card Grid" },
  },
];

function getActiveSection(pathname) {
  if (pathname === "/collection") return "collection";
  if (pathname === "/player") return "player";
  if (pathname === "/") return "home";
  return "minigames";
}

export default function SiteHeader({ pathname = "/", onNavigate, onShowWelcome }) {
  const { locale } = useLanguage();
  const activeLocale = normalizeLocale(locale);
  const copy = SITE_HEADER_COPY[activeLocale] ?? SITE_HEADER_COPY.es;
  const activeSection = getActiveSection(pathname);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dailyStates, setDailyStates] = useState({});
  const [completedDailiesCount, setCompletedDailiesCount] = useState(0);

  const updateDailyStates = useCallback(() => {
    const states = {};
    let count = 0;
    const todayKey = getTodayKey();

    MINIGAMES_LIST.forEach((game) => {
      const prog = getDailyGameProgress(game.gameId, todayKey);
      const challengeState = getDailyChallengeState(prog);
      states[game.id] = challengeState;
      if (challengeState === DAILY_CHALLENGE_STATES.WON || challengeState === DAILY_CHALLENGE_STATES.LOST) {
        count++;
      }
    });

    setDailyStates(states);
    setCompletedDailiesCount(count);
  }, []);

  useEffect(() => {
    function syncStats() {
      updateDailyStates();
    }

    syncStats();
    window.addEventListener(DAILY_PROGRESS_UPDATED_EVENT, syncStats);
    window.addEventListener("storage", syncStats);
    window.addEventListener("focus", syncStats);

    return () => {
      window.removeEventListener(DAILY_PROGRESS_UPDATED_EVENT, syncStats);
      window.removeEventListener("storage", syncStats);
      window.removeEventListener("focus", syncStats);
    };
  }, [updateDailyStates]);

  const go = useCallback((path) => {
    onNavigate?.(path);
  }, [onNavigate]);

  return (
    <header className="site-header">
      {/* 1. Left Section: Tavern Board Navigation */}
      <nav className="site-header__nav" aria-label="Principal">
        <button
          type="button"
          className={`site-header__nav-btn ${activeSection === "collection" ? "is-active" : ""}`}
          onClick={() => go("/collection")}
        >
          <BookOpen size={18} className="site-header__nav-icon" />
          <span>{copy.navCollection}</span>
        </button>
      </nav>

      {/* 2. Center Section: Hearthdle Gold Medallion & Portal Crystal */}
      <button
        type="button"
        className="site-header__brand-container"
        onClick={() => go("/")}
        aria-label={copy.brandLabel}
      >
        <div className="site-header__brand-medallion">
          <div className="site-header__brand-crystal-ring">
            <div className="site-header__brand-crystal" aria-hidden="true"></div>
          </div>
          <span className="site-header__brand-text">{copy.brandLabel}</span>
        </div>
      </button>

      {/* 3. Right Section: Live Stats & Utility Actions */}
      <div className="site-header__actions">
        {/* Daily challenges dropdown trigger button */}
        <div 
          className={`site-header__nav-item has-dropdown ${isDropdownOpen ? "is-open" : ""}`}
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <button
            type="button"
            className="site-header__quick-progress-btn"
            onClick={() => setIsDropdownOpen(prev => !prev)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            title={copy.questStatus}
          >
            <Scroll size={14} className="site-header__quick-progress-icon" />
            <span className="site-header__quick-progress-text">{completedDailiesCount}/6</span>
            <ChevronDown size={12} className="site-header__quick-progress-arrow" aria-hidden="true" />
          </button>

          <div className="site-header__dropdown is-right-aligned">
            <div className="site-header__dropdown-header">
              <span className="site-header__dropdown-title">{copy.challengesTitle}</span>
              <span className="site-header__dropdown-progress" title={copy.questStatus}>
                <Scroll size={13} style={{ marginRight: "4px", verticalAlign: "middle" }} />
                <span>{completedDailiesCount}/6</span>
              </span>
            </div>
            
            <div className="site-header__dropdown-list">
              {MINIGAMES_LIST.map((game) => {
                const status = dailyStates[game.id] || DAILY_CHALLENGE_STATES.PENDING;
                const gameTitle = game[activeLocale]?.title || game.es.title;
                
                let statusIcon = "/ui/book/status-minus-cartoon.png";
                let statusClass = "is-pending";
                let statusLabel = copy.pending;
                
                if (status === DAILY_CHALLENGE_STATES.WON) {
                  statusIcon = "/ui/book/status-check-cartoon.png";
                  statusClass = "is-won";
                  statusLabel = copy.completed;
                } else if (status === DAILY_CHALLENGE_STATES.LOST) {
                  statusIcon = "/ui/book/status-cross-cartoon.png";
                  statusClass = "is-lost";
                  statusLabel = copy.failed;
                }
                
                return (
                  <button
                    key={game.id}
                    type="button"
                    className={`site-header__dropdown-item is-status-${status} ${pathname === game.route ? "is-current" : ""}`}
                    onClick={() => {
                      go(game.route);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <img src={game.iconSrc} alt="" className="site-header__dropdown-item-icon" />
                    <span className="site-header__dropdown-item-title">{gameTitle}</span>
                    <div className={`site-header__dropdown-item-status ${statusClass}`} title={statusLabel}>
                      <img src={statusIcon} alt={statusLabel} className="site-header__dropdown-status-img" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <span className="site-header__actions-separator" aria-hidden="true">|</span>

        {/* Compact dropdown language toggle */}
        <LanguageToggle compact variant="flag-dropdown" className="site-header__language" />

        {/* Help/Instructions Toggle */}
        <button
          type="button"
          className="site-header__instructions-button"
          onClick={onShowWelcome}
          title={copy.navInstructions}
          aria-label={copy.navInstructions}
        >
          <HelpCircle size={18} />
        </button>

        {/* Profile Button styled as a Hearthstone Medallion/Shield */}
        <button 
          type="button" 
          className={`site-header__profile-button ${activeSection === "player" ? "is-active" : ""}`} 
          onClick={() => go("/player")}
        >
          <Shield size={18} className="site-header__profile-shield" />
          <span className="site-header__profile-text">{copy.profileLabel}</span>
        </button>
      </div>
    </header>
  );
}
