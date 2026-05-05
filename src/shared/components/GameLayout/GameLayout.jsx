import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import "./GameLayout.css";

const shellVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.03,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
};

function GameLayout({
  children,
  className = "",
  eyebrow,
  title,
  description,
  status,
  onBack,
  backLabel,
}) {
  return (
    <main className={`game-layout-page ${className}`.trim()}>
      <div className="game-layout-bg" aria-hidden="true">
        <span className="game-layout-orb game-layout-orb-a" />
        <span className="game-layout-orb game-layout-orb-b" />
        <span className="game-layout-rune game-layout-rune-a">âœ¦</span>
        <span className="game-layout-rune game-layout-rune-b">âœ§</span>
      </div>

      <motion.section
        className="game-layout-shell"
        variants={shellVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.header className="game-layout-header" variants={itemVariants}>
          <div className="game-layout-back-slot">
            {onBack && (
              <button className="game-layout-back-button" type="button" onClick={onBack}>
                <ArrowLeft size={18} strokeWidth={2.5} aria-hidden="true" />
                <span>{backLabel}</span>
              </button>
            )}
          </div>

          <div className="game-layout-title-block">
            {eyebrow && <p className="game-layout-eyebrow">{eyebrow}</p>}
            <h1>{title}</h1>
            {description && <p className="game-layout-description">{description}</p>}
          </div>

          <div className="game-layout-status-slot">{status}</div>
        </motion.header>

        <motion.div className="game-layout-content" variants={itemVariants}>
          {children}
        </motion.div>
      </motion.section>
    </main>
  );
}

export default GameLayout;

