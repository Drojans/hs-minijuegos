import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../../i18n/LanguageProvider";
import { LOCALE_LABELS } from "../../../i18n/translations";
import "./LanguageToggle.css";

const LANGUAGE_OPTIONS = [
  {
    locale: "es",
    label: LOCALE_LABELS.es,
    fullLabel: "Español",
    iconClassName: "language-toggle-flag-es",
  },
  {
    locale: "en",
    label: LOCALE_LABELS.en,
    fullLabel: "English",
    iconClassName: "language-toggle-flag-en",
  },
];

function LanguageFlagIcon({ option }) {
  return <span className={`language-toggle-flag ${option.iconClassName}`} aria-hidden="true" />;
}

function LanguageToggle({ className = "", compact = false, variant = "default" }) {
  const { locale, setLocale, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const isBook = variant === "book";
  const isFlagDropdown = variant === "flag-dropdown";

  const currentOption = LANGUAGE_OPTIONS.find((option) => option.locale === locale) ?? LANGUAGE_OPTIONS[0];
  const otherOptions = LANGUAGE_OPTIONS.filter((option) => option.locale !== currentOption.locale);

  useEffect(() => {
    if (!isFlagDropdown || !isOpen) return undefined;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFlagDropdown, isOpen]);

  function selectLocale(nextLocale) {
    setLocale(nextLocale);
    setIsOpen(false);
  }

  const rootClassName = [
    "language-toggle",
    compact ? "is-compact" : "",
    isBook ? "is-book" : "",
    isFlagDropdown ? "is-flag-dropdown" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (isFlagDropdown) {
    return (
      <div ref={rootRef} className={rootClassName} aria-label={t("common.language")}>
        <button
          type="button"
          className={`language-toggle-current ${isOpen ? "is-open" : ""}`}
          onClick={() => setIsOpen((value) => !value)}
          aria-label={`${t("common.language")}: ${currentOption.fullLabel}`}
          aria-haspopup="menu"
          aria-expanded={isOpen}
        >
          <LanguageFlagIcon option={currentOption} />
          <span className="language-toggle-arrow" aria-hidden="true">▾</span>
        </button>

        {isOpen ? (
          <div className="language-toggle-menu" role="menu" aria-label={t("common.language")}>
            {otherOptions.map((option) => (
              <button
                key={option.locale}
                type="button"
                className="language-toggle-menu-option"
                onClick={() => selectLocale(option.locale)}
                role="menuitem"
                aria-label={option.fullLabel}
              >
                <LanguageFlagIcon option={option} />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={rootClassName} aria-label={t("common.language")}>
      {!compact && <span>{t("common.language")}</span>}

      <div className="language-toggle-options">
        <button
          type="button"
          className={`language-toggle-button language-toggle-button-es ${locale === "es" ? "is-active" : ""}`}
          onClick={() => setLocale("es")}
          aria-label="Cambiar idioma a Español"
          aria-pressed={locale === "es"}
        >
          <span className="language-toggle-text">{LOCALE_LABELS.es}</span>
          {isBook ? <span className="language-toggle-book-icon" aria-hidden="true" /> : null}
        </button>

        <button
          type="button"
          className={`language-toggle-button language-toggle-button-en ${locale === "en" ? "is-active" : ""}`}
          onClick={() => setLocale("en")}
          aria-label="Change language to English"
          aria-pressed={locale === "en"}
        >
          <span className="language-toggle-text">{LOCALE_LABELS.en}</span>
          {isBook ? <span className="language-toggle-book-icon" aria-hidden="true" /> : null}
        </button>
      </div>
    </div>
  );
}

export default LanguageToggle;
