import { useLanguage } from "../../../i18n/LanguageProvider";
import LanguageToggle from "../LanguageToggle/LanguageToggle";
import "./GamePageHeader.css";

const HEADER_COPY = {
  es: {
    navMinigames: "Minijuegos",
    navCards: "Base de datos",
    navCollection: "Colección",
    brandLabel: "Hearthdle",
  },
  en: {
    navMinigames: "Minigames",
    navCards: "Card database",
    navCollection: "Collection",
    brandLabel: "Hearthdle",
  },
};

export default function GamePageHeader({ onBack }) {
  const { locale } = useLanguage();
  const copy = HEADER_COPY[locale] ?? HEADER_COPY.es;

  return (
    <header className="game-page-header">
      <nav className="game-page-header__nav" aria-label="Principal">
        <button type="button" className="is-active" onClick={onBack}>
          {copy.navMinigames}
        </button>
        <button type="button" disabled>
          {copy.navCards}
        </button>
        <button type="button" disabled>
          {copy.navCollection}
        </button>
      </nav>

      <button type="button" className="game-page-header__brand" onClick={onBack} aria-label={copy.brandLabel}>
        <img
          className="game-page-header__mug is-left"
          src="/ui/home-v2/header-mug-cropped.png"
          alt=""
          aria-hidden="true"
        />
        <span>{copy.brandLabel}</span>
        <img
          className="game-page-header__mug"
          src="/ui/home-v2/header-mug-cropped.png"
          alt=""
          aria-hidden="true"
        />
      </button>

      <div className="game-page-header__actions">
        <LanguageToggle compact className="game-page-header__language" />
      </div>
    </header>
  );
}
