import { useLanguage } from "../../../i18n/LanguageProvider";
import LanguageToggle from "../LanguageToggle/LanguageToggle";
import "./SiteHeader.css";

const SITE_HEADER_COPY = {
  es: {
    navMinigames: "Minijuegos",
    navCards: "Base de datos",
    navCollection: "Colección",
    profileLabel: "Perfil",
    brandLabel: "Hearthdle",
  },
  en: {
    navMinigames: "Minigames",
    navCards: "Card database",
    navCollection: "Collection",
    profileLabel: "Profile",
    brandLabel: "Hearthdle",
  },
};

function getActiveSection(pathname) {
  if (pathname === "/cards") return "cards";
  if (pathname === "/collection") return "collection";
  return "minigames";
}

export default function SiteHeader({ pathname = "/", onNavigate }) {
  const { locale } = useLanguage();
  const copy = SITE_HEADER_COPY[locale] ?? SITE_HEADER_COPY.es;
  const activeSection = getActiveSection(pathname);

  function go(path) {
    onNavigate?.(path);
  }

  return (
    <header className="site-header">
      <nav className="site-header__nav" aria-label="Principal">
        <button
          type="button"
          className={activeSection === "minigames" ? "is-active" : ""}
          onClick={() => go("/")}
        >
          {copy.navMinigames}
        </button>
        <button
          type="button"
          className={activeSection === "cards" ? "is-active" : ""}
          onClick={() => go("/cards")}
        >
          {copy.navCards}
        </button>
        <button
          type="button"
          className={activeSection === "collection" ? "is-active" : ""}
          onClick={() => go("/collection")}
        >
          {copy.navCollection}
        </button>
      </nav>

      <button
        type="button"
        className="site-header__brand"
        onClick={() => go("/")}
        aria-label={copy.brandLabel}
      >
        <img className="site-header__brand-mug is-left" src="/ui/book/prop-right-mug-cartoon.png" alt="" />
        <span>{copy.brandLabel}</span>
        <img className="site-header__brand-mug" src="/ui/book/prop-right-mug-cartoon.png" alt="" />
      </button>

      <div className="site-header__actions">
        <LanguageToggle compact className="site-header__language" />
        <button type="button" className="site-header__profile-button" onClick={() => go("/player")}>
          {copy.profileLabel}
        </button>
      </div>
    </header>
  );
}
