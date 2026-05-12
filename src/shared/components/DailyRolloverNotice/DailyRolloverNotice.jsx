import { useLanguage } from "../../../i18n/LanguageProvider";
import "./DailyRolloverNotice.css";

const COPY = {
  es: {
    eyebrow: "Nuevo día",
    title: "La taberna se ha renovado",
    body: "Los retos diarios se han actualizado automáticamente.",
    dismiss: "Entendido",
  },
  en: {
    eyebrow: "New day",
    title: "The tavern has refreshed",
    body: "Daily challenges have been updated automatically.",
    dismiss: "Got it",
  },
};

function DailyRolloverNotice({ notice, onDismiss }) {
  const { locale } = useLanguage();
  const copy = COPY[locale] ?? COPY.es;

  if (!notice) return null;

  return (
    <aside className="daily-rollover-notice" role="status" aria-live="polite">
      <div className="daily-rollover-notice__spark" aria-hidden="true">
        ✦
      </div>
      <div className="daily-rollover-notice__content">
        <span>{copy.eyebrow}</span>
        <strong>{copy.title}</strong>
        <p>{copy.body}</p>
      </div>
      <button type="button" onClick={onDismiss}>
        {copy.dismiss}
      </button>
    </aside>
  );
}

export default DailyRolloverNotice;
