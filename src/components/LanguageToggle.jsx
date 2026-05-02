import { useLanguage } from "../i18n/LanguageProvider";
import { LOCALE_LABELS } from "../i18n/translations";
import "./LanguageToggle.css";

function LanguageToggle({ className = "", compact = false }) {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div className={`language-toggle ${compact ? "is-compact" : ""} ${className}`} aria-label={t("common.language")}>
      {!compact && <span>{t("common.language")}</span>}
      <div>
        <button
          type="button"
          className={locale === "es" ? "is-active" : ""}
          onClick={() => setLocale("es")}
          aria-pressed={locale === "es"}
        >
          {LOCALE_LABELS.es}
        </button>
        <button
          type="button"
          className={locale === "en" ? "is-active" : ""}
          onClick={() => setLocale("en")}
          aria-pressed={locale === "en"}
        >
          {LOCALE_LABELS.en}
        </button>
      </div>
    </div>
  );
}

export default LanguageToggle;
