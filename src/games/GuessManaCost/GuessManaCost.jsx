import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../i18n/LanguageProvider";
import GuessManaLayoutEditor from "../../dev/GuessManaLayoutEditor";
import {
  getCardName,
  translateCardClass,
  translateCardRarity,
  translateCardType,
} from "../../utils/cardLocale";
import {
  getGuessManaCardImage,
  getNextRandomCard,
  isPlayableGuessManaCard,
  MANA_VALUES,
  MAX_ROUNDS,
} from "./guessManaConfig";
import "./GuessManaCost.css";


const LOCAL_COPY = {
  es: {
    backHome: "Volver al menú",
    round: "Ronda",
    score: "Puntuación",
    scoreSuffix: "aciertos",
    minigame: "Minijuego",
    title: "Adivina el Coste",
    subtitle: "Observa la carta y selecciona su coste real de maná.",
    cardData: "Datos de la carta",
    attack: "Ataque",
    health: "Vida",
    noStats: "Esta carta no tiene ataque ni vida.",
    manaSelector: "Selector de maná",
    chooseCost: "Elige el coste real de la carta",
    confirmCost: "Confirmar coste",
    selectedCost: "Coste seleccionado",
    chooseFirst: "Elige primero un coste",
    correct: "¡Correcto!",
    wrong: "Fallaste",
    nextCard: "Siguiente carta",
    seeResult: "Ver resultado",
    playAgain: "Jugar otra vez",
    finalTitle: "Gesta completada",
    finalText: "Has acertado {score} de {maxRounds}. Precisión: {accuracy}%.",
    loadingGame: "Preparando carta...",
    noCards: "No hay cartas disponibles.",
    noImage: "Sin imagen",
    signature: "~ Firma aquí al completar tu gesta ~",
    footerSeason: "Temporada Actual: El Gran Torneo",
    costFeedback: "{name} costaba {cost} de maná.",
  },
  en: {
    backHome: "Back to menu",
    round: "Round",
    score: "Score",
    scoreSuffix: "correct",
    minigame: "Minigame",
    title: "Guess the Cost",
    subtitle: "Look at the card and choose its real mana cost.",
    cardData: "Card data",
    attack: "Attack",
    health: "Health",
    noStats: "This card has no attack or health.",
    manaSelector: "Mana selector",
    chooseCost: "Choose the real mana cost",
    confirmCost: "Confirm cost",
    selectedCost: "Selected cost",
    chooseFirst: "Choose a cost first",
    correct: "Correct!",
    wrong: "Wrong",
    nextCard: "Next card",
    seeResult: "See result",
    playAgain: "Play again",
    finalTitle: "Quest complete",
    finalText: "You guessed {score} out of {maxRounds}. Accuracy: {accuracy}%.",
    loadingGame: "Preparing card...",
    noCards: "No cards available.",
    noImage: "No image",
    signature: "~ Sign here when your quest is complete ~",
    footerSeason: "Current Season: The Grand Tournament",
    costFeedback: "{name} cost {cost} mana.",
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

function BookProp({ name }) {
  return <div className={`gm-book-prop gm-book-prop-${name}`} aria-hidden="true" />;
}

function ScorePanel({ copy, round, score }) {
  return (
    <aside className="gm-book-score-panel">
      <span>
        {copy.round}: <strong>{round}/{MAX_ROUNDS}</strong>
      </span>
      <span>
        {copy.score}: <strong>{score}</strong> {copy.scoreSuffix}
      </span>
    </aside>
  );
}

function BackButton({ copy, onBack }) {
  return (
    <button type="button" className="gm-book-back-button" onClick={onBack}>
      <span aria-hidden="true">←</span>
      {copy.backHome}
    </button>
  );
}

function CardPreview({ cardName, hasAnswered, imageFailed, imageSrc, onImageError, copy }) {
  return (
    <aside className="gm-book-card-area">
      <div className="gm-book-card-frame">
        <div className="gm-book-card-image-wrap">
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
            <div className="gm-book-image-fallback">{copy.noImage}</div>
          )}

          {!hasAnswered && !imageFailed ? (
            <div className="gm-book-question-badge" aria-label={copy.chooseCost}>
              ?
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

function CardInfo({ card, cardName, locale, copy }) {
  const hasStats = card.attack !== null && card.health !== null;

  return (
    <section className="gm-book-data-panel">
      <p className="gm-book-eyebrow">{copy.cardData}</p>
      <h2>{cardName}</h2>

      <div className="gm-book-tag-row">
        <span>{translateCardClass(card.cardClass, locale)}</span>
        <span>{translateCardType(card.type, locale)}</span>
        <span>{translateCardRarity(card.rarity, locale)}</span>
      </div>

      {hasStats ? (
        <div className="gm-book-stat-row">
          <div>
            <span>{copy.attack}</span>
            <strong>{card.attack}</strong>
          </div>
          <div>
            <span>{copy.health}</span>
            <strong>{card.health}</strong>
          </div>
        </div>
      ) : (
        <p className="gm-book-no-stats">{copy.noStats}</p>
      )}
    </section>
  );
}

function ManaSelector({
  copy,
  correctCost,
  hasAnswered,
  pendingCost,
  selectedCost,
  onPickCost,
}) {
  return (
    <section className="gm-book-mana-panel">
      <p className="gm-book-eyebrow">{copy.manaSelector}</p>
      <h3>{copy.chooseCost}</h3>

      <div className="gm-book-mana-grid">
        {MANA_VALUES.map((cost) => {
          let buttonClass = "gm-book-mana-button";

          if (!hasAnswered && pendingCost === cost) buttonClass += " is-selected";
          if (hasAnswered && cost === correctCost) buttonClass += " is-correct";
          if (hasAnswered && cost === selectedCost && cost !== correctCost) buttonClass += " is-wrong";

          return (
            <button
              key={cost}
              className={buttonClass}
              type="button"
              data-cost={cost}
              disabled={hasAnswered}
              onClick={() => onPickCost(cost)}
              aria-label={`${copy.chooseCost}: ${cost}`}
              aria-pressed={!hasAnswered && pendingCost === cost}
            >
              <span className="gm-book-mana-button-text">{cost}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ConfirmButton({ copy, disabled, hasAnswered, isFinalRound, onConfirm, onNextRound }) {
  const label = hasAnswered
    ? isFinalRound
      ? copy.seeResult
      : copy.nextCard
    : copy.confirmCost;

  return (
    <button
      type="button"
      className="gm-book-confirm-button"
      disabled={disabled}
      onClick={hasAnswered ? onNextRound : onConfirm}
    >
      <span aria-hidden="true">✦</span>
      {label}
    </button>
  );
}

function RoundFeedback({ cardName, correctCost, copy, isCorrect }) {
  return (
    <section className={`gm-book-feedback ${isCorrect ? "is-correct" : "is-wrong"}`} aria-live="polite">
      <strong>{isCorrect ? copy.correct : copy.wrong}</strong>
      <span>
        {formatText(copy.costFeedback, {
          name: cardName,
          cost: correctCost,
        })}
      </span>
    </section>
  );
}

function EndScreen({ copy, score, accuracy, onBack, onRestart }) {
  return (
    <main className="gm-book-page">
      <section className="gm-book-stage">
        <div className="gm-book-stage-book" aria-hidden="true" />
        <BookProp name="candle" />
        <BookProp name="cards" />
        <BookProp name="coins" />
        <BookProp name="mug" />

        <section className="gm-book-page-panel gm-book-end-panel">
          <h1>{copy.finalTitle}</h1>
          <p>
            {formatText(copy.finalText, {
              score,
              maxRounds: MAX_ROUNDS,
              accuracy,
            })}
          </p>
          <div className="gm-book-end-score">
            {score} / {MAX_ROUNDS}
          </div>
          <div className="gm-book-end-actions">
            <button type="button" className="gm-book-confirm-button" onClick={onRestart}>
              {copy.playAgain}
            </button>
            <button type="button" className="gm-book-back-button is-inline" onClick={onBack}>
              <span aria-hidden="true">←</span>
              {copy.backHome}
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}

function EmptyState({ copy, title, onBack, showBack = true }) {
  return (
    <main className="gm-book-page">
      <section className="gm-book-stage">
        <div className="gm-book-stage-book" aria-hidden="true" />
        <BookProp name="candle" />
        <BookProp name="cards" />
        <BookProp name="coins" />
        <BookProp name="mug" />

        <section className="gm-book-page-panel gm-book-empty-panel">
          <h1>{title}</h1>
          {showBack ? (
            <button type="button" className="gm-book-back-button is-inline" onClick={onBack}>
              <span aria-hidden="true">←</span>
              {copy.backHome}
            </button>
          ) : null}
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
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [finished, setFinished] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (playableCards.length === 0 || currentCard) return;
    setCurrentCard(getNextRandomCard(playableCards));
  }, [playableCards, currentCard]);

  useEffect(() => {
    setImageFailed(false);
  }, [locale, currentCard?.id]);

  function resetRoundState(nextCard) {
    setCurrentCard(nextCard);
    setPendingCost(null);
    setSelectedCost(null);
    setImageFailed(false);
  }

  function startNewGame() {
    resetRoundState(getNextRandomCard(playableCards));
    setScore(0);
    setRound(1);
    setFinished(false);
  }

  function confirmCost() {
    if (pendingCost === null || selectedCost !== null || !currentCard) return;

    setSelectedCost(pendingCost);

    if (pendingCost === currentCard.cost) {
      setScore((previousScore) => previousScore + 1);
    }
  }

  function goNextRound() {
    if (round >= MAX_ROUNDS) {
      setFinished(true);
      return;
    }

    resetRoundState(getNextRandomCard(playableCards, currentCard?.id));
    setRound((previousRound) => previousRound + 1);
  }

  if (playableCards.length === 0) {
    return <EmptyState copy={copy} title={copy.noCards} onBack={onBack} />;
  }

  if (!currentCard) {
    return <EmptyState copy={copy} title={copy.loadingGame} onBack={onBack} showBack={false} />;
  }

  const hasAnswered = selectedCost !== null;
  const isCorrect = selectedCost === currentCard.cost;
  const accuracy = Math.round((score / MAX_ROUNDS) * 100);
  const progressPercent = (round / MAX_ROUNDS) * 100;
  const currentCardName = getCardName(currentCard, locale);
  const imageSrc = getGuessManaCardImage(currentCard, locale);

  if (finished) {
    return (
      <EndScreen
        copy={copy}
        score={score}
        accuracy={accuracy}
        onBack={onBack}
        onRestart={startNewGame}
      />
    );
  }

  return (
    <main className="gm-book-page">
      <section className="gm-book-stage" aria-label={copy.title}>
        <div className="gm-book-stage-book" aria-hidden="true" />
        <BookProp name="candle" />
        <BookProp name="cards" />
        <BookProp name="coins" />
        <BookProp name="mug" />

        <section className="gm-book-left-page">
          <BackButton copy={copy} onBack={onBack} />

          <CardPreview
            cardName={currentCardName}
            hasAnswered={hasAnswered}
            imageFailed={imageFailed}
            imageSrc={imageSrc}
            onImageError={() => setImageFailed(true)}
            copy={copy}
          />

          <p className="gm-book-season">{copy.footerSeason}</p>
        </section>

        <section className="gm-book-right-page">
          <ScorePanel copy={copy} round={round} score={score} />

          <header className="gm-book-title-block">
            <p className="gm-book-eyebrow">{copy.minigame}</p>
            <h1>{copy.title}</h1>
            <span>{copy.subtitle}</span>
          </header>

          <div className="gm-book-divider" aria-hidden="true" />

          <CardInfo card={currentCard} cardName={currentCardName} locale={locale} copy={copy} />

          <ManaSelector
            copy={copy}
            correctCost={currentCard.cost}
            hasAnswered={hasAnswered}
            pendingCost={pendingCost}
            selectedCost={selectedCost}
            onPickCost={setPendingCost}
          />

          {hasAnswered ? (
            <RoundFeedback
              cardName={currentCardName}
              correctCost={currentCard.cost}
              copy={copy}
              isCorrect={isCorrect}
            />
          ) : (
            <p className="gm-book-pending-note">
              {pendingCost === null
                ? copy.chooseFirst
                : `${copy.selectedCost}: ${pendingCost}`}
            </p>
          )}

          <ConfirmButton
            copy={copy}
            disabled={!hasAnswered && pendingCost === null}
            hasAnswered={hasAnswered}
            isFinalRound={round >= MAX_ROUNDS}
            onConfirm={confirmCost}
            onNextRound={goNextRound}
          />

          <p className="gm-book-signature">{copy.signature}</p>
        </section>

        <div className="gm-book-progress-track" aria-hidden="true">
          <span style={{ width: `${progressPercent}%` }} />
        </div>
      </section>

      {showLayoutEditor ? <GuessManaLayoutEditor /> : null}
    </main>
  );
}

export default GuessManaCost;
