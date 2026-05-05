import { useLanguage } from "../../../i18n/LanguageProvider";
import { LOCALE_LABELS } from "../../../i18n/translations";
import "./LanguageToggle.css";

function LanguageToggle({ className = "", compact = false, variant = "default" }) {
  const { locale, setLocale, t } = useLanguage();
  const isBook = variant === "book";

  const rootClassName = [
    "language-toggle",
    compact ? "is-compact" : "",
    isBook ? "is-book" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName} aria-label={t("common.language")}>
      {!compact && <span>{t("common.language")}</span>}

      <div className="language-toggle-options">
        <button
          type="button"
          className={`language-toggle-button language-toggle-button-es ${locale === "es" ? "is-active" : ""}`}
          onClick={() => setLocale("es")}
          aria-label="Cambiar idioma a EspaÃ±ol"
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

