import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../i18n/LanguageProvider";
import LanguageToggle from "../../shared/components/LanguageToggle/LanguageToggle";
import GuessManaLayoutEditor from "../../dev/GuessManaLayoutEditor";
import { getCardName } from "../../utils/cardLocale";
import {
  getGuessManaCardImage,
  getNextRandomCard,
  isPlayableGuessManaCard,
  MANA_VALUES,
} from "./guessManaConfig";
import "./GuessManaCost.css";

const LOCAL_COPY = {
  es: {
    navMinigames: "Minijuegos",
    navCards: "Base de datos",
    navCollection: "Colección",
    backHome: "Volver a minijuegos",
    chooseCost: "Elige un coste",
    selectedCost: "Coste seleccionado",
    chooseFirst: "Selecciona una opción para continuar.",
    confirmCost: "Confirmar coste",
    playAgain: "Otra carta",
    correct: "¡Correcto!",
    wrong: "No era ese.",
    costFeedback: "{name} cuesta {cost} de maná.",
    resultCostBefore: "cuesta",
    resultCostAfter: "de maná.",
    loadingGame: "Preparando carta...",
    noCards: "No hay cartas disponibles.",
    noImage: "Sin imagen",
    infoLabel: "Cómo jugar",
    helpTitle: "Cómo jugar",
    helpText:
      "Mira la carta, selecciona el coste que crees correcto y confirma tu respuesta. Después verás el resultado del reto diario.",
    close: "Cerrar",
  },
  en: {
    navMinigames: "Minigames",
    navCards: "Card database",
    navCollection: "Collection",
    backHome: "Back to minigames",
    chooseCost: "Choose a cost",
    selectedCost: "Selected cost",
    chooseFirst: "Select an option to continue.",
    confirmCost: "Confirm cost",
    playAgain: "Another card",
    correct: "Correct!",
    wrong: "Not that one.",
    costFeedback: "{name} costs {cost} mana.",
    resultCostBefore: "costs",
    resultCostAfter: "mana.",
    loadingGame: "Preparing card...",
    noCards: "No cards available.",
    noImage: "No image",
    infoLabel: "How to play",
    helpTitle: "How to play",
    helpText:
      "Look at the card, select the mana cost you think is correct and confirm your answer. Then you will see the result of the daily challenge.",
    close: "Close",
  },
};

function formatText(template, values = {}) {
  return Object.entries(values).reduce((text, [key, value]) => {
    return text.replaceAll(`{${key}}`, value);
  }, template);
}

function useGuessManaCopy(locale) {
  return LOCAL_COPY[locale] ?? LOCAL_COPY.es;
}

function GameHeader({ copy, onBack }) {
  return (
    <header className="guess-v3-header">
      <nav className="guess-v3-nav" aria-label="Principal">
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

      <button type="button" className="guess-v3-brand" onClick={onBack} aria-label="Hearthdle">
        <img className="guess-v3-brand-mug is-left" src="/ui/home-v2/header-mug-cropped.png" alt="" />
        <span>Hearthdle</span>
        <img className="guess-v3-brand-mug" src="/ui/home-v2/header-mug-cropped.png" alt="" />
      </button>

      <div className="guess-v3-actions">
        <LanguageToggle compact className="guess-v3-language" />
      </div>
    </header>
  );
}

function CardPreview({ imageSrc, cardName, imageFailed, onImageError, copy }) {
  return (
    <section className="guess-v3-card-wrap">
      <div className="guess-v3-card-frame">
        {!imageFailed ? (
          <img
            src={imageSrc}
            alt={cardName}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            onError={onImageError}
          />
        ) : (
          <div className="guess-v3-card-fallback">{copy.noImage}</div>
        )}
        {!imageFailed ? (
          <div className="guess-v3-mana-cover-wrap" aria-hidden="true">
            <img className="guess-v3-mana-cover" src="/ui/games/guess-mana-v3/mana-cover.png" alt="" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function CrystalDisplay({ value, label, isAnswered, isCorrect }) {
  return (
    <div className={`guess-v3-selected-crystal ${isAnswered ? (isCorrect ? "is-correct" : "is-wrong") : ""}`}>
      <span className="guess-v3-selected-label">{label}</span>
      <div className="guess-v3-crystal-shell" aria-hidden="true">
        <img src="/ui/games/guess-mana-v3/mana-crystal.png" alt="" />
        <strong>{value ?? "?"}</strong>
      </div>
    </div>
  );
}

function ManaSelector({
  hasAnswered,
  pendingCost,
  selectedCost,
  correctCost,
  hoveredCost,
  onHoverCost,
  onLeaveCost,
  onPickCost,
}) {
  const manaRows = [MANA_VALUES.slice(0, 6), MANA_VALUES.slice(6)];

  return (
    <div className="guess-v3-mana-grid" onMouseLeave={onLeaveCost}>
      {manaRows.map((row, rowIndex) => (
        <div key={rowIndex} className="guess-v3-mana-row">
          {row.map((cost) => {
            const isGlowing = !hasAnswered
              ? hoveredCost !== null
                ? cost <= hoveredCost
                : pendingCost !== null && cost <= pendingCost
              : false;
            const classNames = ["guess-v3-mana-button"];

            classNames.push(isGlowing ? "is-on" : "is-off");
            if (!hasAnswered && pendingCost === cost) classNames.push("is-selected");
            if (hasAnswered && cost === correctCost) classNames.push("is-correct");
            if (hasAnswered && cost === selectedCost && cost !== correctCost) classNames.push("is-wrong");

            return (
              <button
                key={cost}
                type="button"
                className={classNames.join(" ")}
                onClick={() => onPickCost(cost)}
                onMouseEnter={() => onHoverCost(cost)}
                onFocus={() => onHoverCost(cost)}
                onBlur={onLeaveCost}
                disabled={hasAnswered}
                aria-pressed={!hasAnswered && pendingCost === cost}
              >
                <img src="/ui/games/guess-mana-v3/mana-crystal.png" alt="" aria-hidden="true" />
                <span>{cost}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function ResultOverlay({ copy, isCorrect, cardName, correctCost, imageSrc, onContinue }) {
  const confettiPieces = Array.from({ length: 42 });

  return (
    <div className="guess-v3-result-backdrop" role="presentation">
      <section className={`guess-v3-result-card ${isCorrect ? "is-correct" : "is-wrong"}`} role="status" aria-live="polite">
        {isCorrect ? (
          <div className="guess-v3-confetti" aria-hidden="true">
            {confettiPieces.map((_, index) => {
              const angle = (Math.PI * 2 * index) / confettiPieces.length;
              const distance = 150 + (index % 6) * 18;
              const x = Math.cos(angle) * distance;
              const y = Math.sin(angle) * distance - 28;
              const rotation = index * 41;

              return (
                <span
                  key={index}
                  style={{
                    "--x": `${x.toFixed(0)}px`,
                    "--y": `${y.toFixed(0)}px`,
                    "--r": `${rotation}deg`,
                    "--delay": `${(index % 9) * 24}ms`,
                  }}
                />
              );
            })}
          </div>
        ) : null}

        <div className="guess-v3-result-layout">
          <div className="guess-v3-result-copy">
            <div className="guess-v3-result-icon" aria-hidden="true">
              <span>{isCorrect ? "✓" : "×"}</span>
            </div>
            <h2>{isCorrect ? copy.correct : copy.wrong}</h2>
            <div className="guess-v3-result-text">
              <strong className="guess-v3-result-card-name">{cardName}</strong>
              <div className="guess-v3-result-cost-row">
                <span className="guess-v3-result-cost-line">{copy.resultCostBefore}</span>
                <div className="guess-v3-result-cost-crystal" aria-hidden="true">
                  <img src="/ui/games/guess-mana-v3/mana-crystal.png" alt="" />
                  <span>{correctCost}</span>
                </div>
                <span className="guess-v3-result-cost-line">{copy.resultCostAfter}</span>
              </div>
            </div>
            <button type="button" className="guess-v3-button is-primary" onClick={onContinue}>
              {copy.playAgain}
            </button>
          </div>

          <div className="guess-v3-result-preview" aria-label={cardName}>
            <img src={imageSrc} alt={cardName} />
          </div>
        </div>
      </section>
    </div>
  );
}

function EmptyState({ copy, title, onBack }) {
  return (
    <main className="guess-v3-page">
      <GameHeader copy={copy} onBack={onBack} />
      <section className="guess-v3-shell">
        <section className="guess-v3-empty-state">
          <h2>{title}</h2>
          <button type="button" className="guess-v3-button is-secondary" onClick={onBack}>
            {copy.backHome}
          </button>
        </section>
      </section>
    </main>
  );
}

function GuessManaCost({ cards = [], onBack }) {
  const { locale } = useLanguage();
  const copy = useGuessManaCopy(locale);
  const showLayoutEditor =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("layoutEditor") === "1";

  const playableCards = useMemo(() => {
    return cards.filter((card) => isPlayableGuessManaCard(card, locale));
  }, [cards, locale]);

  const [currentCard, setCurrentCard] = useState(null);
  const [pendingCost, setPendingCost] = useState(null);
  const [selectedCost, setSelectedCost] = useState(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [hoveredCost, setHoveredCost] = useState(null);

  useEffect(() => {
    if (playableCards.length === 0 || currentCard) return;
    setCurrentCard(getNextRandomCard(playableCards));
  }, [playableCards, currentCard]);

  useEffect(() => {
    setImageFailed(false);
  }, [locale, currentCard?.id]);

  function loadCard(excludeId) {
    const nextCard = getNextRandomCard(playableCards, excludeId);
    setCurrentCard(nextCard);
    setPendingCost(null);
    setSelectedCost(null);
    setImageFailed(false);
    setHoveredCost(null);
  }

  function confirmCost() {
    if (pendingCost === null || selectedCost !== null) return;
    setSelectedCost(pendingCost);
  }

  if (playableCards.length === 0) {
    return <EmptyState copy={copy} title={copy.noCards} onBack={onBack} />;
  }

  if (!currentCard) {
    return <EmptyState copy={copy} title={copy.loadingGame} onBack={onBack} />;
  }

  const hasAnswered = selectedCost !== null;
  const isCorrect = hasAnswered && selectedCost === currentCard.cost;
  const currentCardName = getCardName(currentCard, locale);
  const imageSrc = getGuessManaCardImage(currentCard, locale);
  const displayedCrystalValue = hasAnswered ? selectedCost : pendingCost;

  return (
    <main className="guess-v3-page">
      <GameHeader copy={copy} onBack={onBack} />

      <section className="guess-v3-shell">

        <section className="guess-v3-stage" aria-label={currentCardName}>
          <CardPreview
            imageSrc={imageSrc}
            cardName={currentCardName}
            imageFailed={imageFailed}
            onImageError={() => setImageFailed(true)}
            copy={copy}
          />

          <div className="guess-v3-controls">
            <CrystalDisplay
              value={displayedCrystalValue}
              label={copy.selectedCost}
              isAnswered={hasAnswered}
              isCorrect={isCorrect}
            />

            <p className="guess-v3-selector-title">{copy.chooseCost}</p>

            <ManaSelector
              hasAnswered={hasAnswered}
              pendingCost={pendingCost}
              selectedCost={selectedCost}
              correctCost={currentCard.cost}
              hoveredCost={hoveredCost}
              onHoverCost={setHoveredCost}
              onLeaveCost={() => setHoveredCost(null)}
              onPickCost={(cost) => {
                setPendingCost(cost);
                setHoveredCost(cost);
              }}
            />

            {!hasAnswered ? (
              <button
                type="button"
                className="guess-v3-button is-primary is-confirm"
                disabled={pendingCost === null}
                onClick={confirmCost}
              >
                {copy.confirmCost}
              </button>
            ) : null}
          </div>
        </section>
      </section>

      {hasAnswered ? (
        <ResultOverlay
          copy={copy}
          isCorrect={isCorrect}
          cardName={currentCardName}
          correctCost={currentCard.cost}
          imageSrc={imageSrc}
          onContinue={() => loadCard(currentCard?.id)}
        />
      ) : null}

      {showLayoutEditor ? <GuessManaLayoutEditor /> : null}
    </main>
  );
}

export default GuessManaCost;
