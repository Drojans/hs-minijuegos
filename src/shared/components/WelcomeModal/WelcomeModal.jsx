import { useCallback, useState } from "react";
import { motion } from "motion/react";
import { useLanguage } from "../../../i18n/LanguageProvider";
import { normalizeLocale } from "../../../i18n/translations";
import "./WelcomeModal.css";

const WELCOME_COPY = {
  es: {
    welcomeTitle: "¡Bienvenido a la taberna!",
    welcomeSubtitle: "Tu rincón de minijuegos de Hearthstone",
    welcomeMinigamesTitle: "Minijuegos diarios",
    welcomeMinigamesDesc: "Pásalo en grande con 6 modos de juego únicos: adivina costes, compara estadísticas, completa la cuadrícula y más.",
    welcomeDailyTitle: "Retos y cofres",
    welcomeDailyDesc: "Completa el reto de cada minijuego diariamente para conseguir cofres arcanos de recompensa.",
    welcomeCollectionTitle: "Colección y álbum",
    welcomeCollectionDesc: "Abre tus cofres en la Colección para desbloquear y coleccionar todas las cartas de la taberna.",
    welcomeDontShow: "No volver a mostrar esta bienvenida",
    welcomeAccept: "Entrar a la taberna",
  },
  en: {
    welcomeTitle: "Welcome to the tavern!",
    welcomeSubtitle: "Your corner for Hearthstone minigames",
    welcomeMinigamesTitle: "Daily minigames",
    welcomeMinigamesDesc: "Have fun with 6 unique game modes: guess costs, compare stats, complete grids, and more.",
    welcomeDailyTitle: "Challenges and chests",
    welcomeDailyDesc: "Complete each game's daily challenge to earn arcane chests as rewards.",
    welcomeCollectionTitle: "Album and collection",
    welcomeCollectionDesc: "Open your chests in the Collection to unlock and collect every card in the tavern.",
    welcomeDontShow: "Don't show this welcome again",
    welcomeAccept: "Enter the tavern",
  },
};

export default function WelcomeModal({ onClose }) {
  const { locale } = useLanguage();
  const activeLocale = normalizeLocale(locale);
  const copy = WELCOME_COPY[activeLocale] ?? WELCOME_COPY.es;
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = useCallback(() => {
    if (dontShowAgain) {
      localStorage.setItem("hearthdle_hide_welcome", "true");
    }
    onClose?.();
  }, [dontShowAgain, onClose]);

  return (
    <div className="home-welcome-backdrop">
      <motion.div
        className="home-welcome-modal"
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
      >
        <header className="home-welcome-header">
          <h2>{copy.welcomeTitle}</h2>
          <p className="home-welcome-subtitle">{copy.welcomeSubtitle}</p>
          <div className="home-welcome-divider" />
        </header>

        <div className="home-welcome-content">
          <div className="home-welcome-feature">
            <div className="home-welcome-feature-icon">
              <img src="/ui/home-v2-icons/icon-mode-impostor.png" alt="" draggable="false" />
            </div>
            <div className="home-welcome-feature-text">
              <h3>{copy.welcomeMinigamesTitle}</h3>
              <p>{copy.welcomeMinigamesDesc}</p>
            </div>
          </div>

          <div className="home-welcome-feature">
            <div className="home-welcome-feature-icon">
              <img src="/ui/rewards/arcane-box-closed.png" alt="" draggable="false" />
            </div>
            <div className="home-welcome-feature-text">
              <h3>{copy.welcomeDailyTitle}</h3>
              <p>{copy.welcomeDailyDesc}</p>
            </div>
          </div>

          <div className="home-welcome-feature">
            <div className="home-welcome-feature-icon">
              <img src="/ui/home-v2-icons/icon-mode-collection.png" alt="" draggable="false" />
            </div>
            <div className="home-welcome-feature-text">
              <h3>{copy.welcomeCollectionTitle}</h3>
              <p>{copy.welcomeCollectionDesc}</p>
            </div>
          </div>
        </div>

        <footer className="home-welcome-footer">
          <label className="home-welcome-checkbox-label">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="home-welcome-checkbox"
            />
            <span>{copy.welcomeDontShow}</span>
          </label>

          <button
            type="button"
            className="home-welcome-btn"
            onClick={handleClose}
          >
            {copy.welcomeAccept}
          </button>
        </footer>
      </motion.div>
    </div>
  );
}
