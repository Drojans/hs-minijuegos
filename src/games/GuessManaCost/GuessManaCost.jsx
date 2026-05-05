import { useEffect, useMemo, useState } from "react";
import GameLayout from "../../shared/components/GameLayout/GameLayout";
import { useLanguage } from "../../i18n/LanguageProvider";
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

function GuessManaStatus({ round, score, t }) {
  return (
    <div className="gm-score-pill">
      <span>{t("common.round", { round, maxRounds: MAX_ROUNDS })}</span>
      <strong>{t("common.correctCount", { score })}</strong>
    </div>
  );
}

function GuessManaShell({ children, eyebrow, title, description, status, onBack, t }) {
  return (
    <GameLayout
      className="gm-game"
      eyebrow={eyebrow}
      title={title}
      description={description}
      status={status}
      onBack={onBack}
      backLabel={t("common.backHome")}
    >
      {children}
    </GameLayout>
  );
}

function EmptyState({ title, buttonLabel, onBack }) {
  return (
    <section className="gm-empty-state game-panel">
      <h2>{title}</h2>
      {buttonLabel ? (
        <button className="gm-secondary-button" type="button" onClick={onBack}>
          {buttonLabel}
        </button>
      ) : null}
    </section>
  );
}

function EndScreen({ score, onBack, onRestart, t }) {
  return (
    <section className="gm-end-screen game-panel">
      <div className="gm-end-score">
        {score} / {MAX_ROUNDS}
      </div>

      <div className="gm-end-actions">
        <button className="gm-primary-button" type="button" onClick={onRestart}>
          {t("common.playAgain")}
        </button>
        <button className="gm-secondary-button" type="button" onClick={onBack}>
          {t("guessMana.backHome")}
        </button>
      </div>
    </section>
  );
}

function CardPreview({ cardName, hasAnswered, imageFailed, imageSrc, onImageError, t }) {
  return (
    <aside className="gm-card-panel game-panel">
      <div className="gm-card-frame">
        <div className="gm-card-image-wrap">
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
            <div className="gm-image-fallback">{t("guessMana.noImage")}</div>
          )}

          {!hasAnswered && !imageFailed ? <div className="gm-mana-cover">?</div> : null}
        </div>
      </div>
    </aside>
  );
}

function CardInfo({ card, cardName, locale, t }) {
  return (
    <section className="gm-info-card">
      <p className="gm-eyebrow">{t("guessMana.cardData")}</p>
      <h2>{cardName}</h2>

      <div className="gm-tag-row">
        <span>{translateCardClass(card.cardClass, locale)}</span>
        <span>{translateCardType(card.type, locale)}</span>
        <span>{translateCardRarity(card.rarity, locale)}</span>
      </div>

      {card.attack !== null && card.health !== null ? (
        <div className="gm-stat-row">
          <div>
            <span>{t("guessMana.attack")}</span>
            <strong>{card.attack}</strong>
          </div>
          <div>
            <span>{t("guessMana.health")}</span>
            <strong>{card.health}</strong>
          </div>
        </div>
      ) : (
        <p className="gm-no-stats">{t("guessMana.noStats")}</p>
      )}
    </section>
  );
}

function ManaSelector({ correctCost, hasAnswered, onChooseCost, selectedCost, t }) {
  return (
    <section className="gm-mana-panel">
      <p className="gm-eyebrow">{t("guessMana.manaSelector")}</p>
      <h3>{t("guessMana.chooseCost")}</h3>

      <div className="gm-mana-grid">
        {MANA_VALUES.map((cost) => {
          let buttonClass = "gm-mana-button";

          if (hasAnswered && cost === correctCost) buttonClass += " is-correct";
          if (hasAnswered && cost === selectedCost && cost !== correctCost) buttonClass += " is-wrong";

          return (
            <button
              key={cost}
              className={buttonClass}
              type="button"
              disabled={hasAnswered}
              onClick={() => onChooseCost(cost)}
            >
              {cost}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function RoundFeedback({ cardName, correctCost, isCorrect, isFinalRound, onNextRound, t }) {
  return (
    <section className={`gm-feedback ${isCorrect ? "is-correct" : "is-wrong"}`} aria-live="polite">
      <h3>{isCorrect ? t("guessMana.correct") : t("guessMana.wrong")}</h3>
      <p>
        {t("guessMana.costFeedback", {
          name: cardName,
          cost: correctCost,
        })}
      </p>

      <button className="gm-primary-button" type="button" onClick={onNextRound}>
        {isFinalRound ? t("common.seeResult") : t("guessMana.nextCard")}
      </button>
    </section>
  );
}

function GuessManaCost({ cards = [], onBack }) {
  const { locale, t } = useLanguage();

  const playableCards = useMemo(() => {
    return cards.filter((card) => isPlayableGuessManaCard(card, locale));
  }, [cards, locale]);

  const [currentCard, setCurrentCard] = useState(null);
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
    setSelectedCost(null);
    setImageFailed(false);
  }

  function startNewGame() {
    resetRoundState(getNextRandomCard(playableCards));
    setScore(0);
    setRound(1);
    setFinished(false);
  }

  function chooseCost(cost) {
    if (selectedCost !== null || !currentCard) return;

    setSelectedCost(cost);

    if (cost === currentCard.cost) {
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

  const shellProps = {
    eyebrow: t("guessMana.minigame"),
    title: t("guessMana.title"),
    description: t("guessMana.subtitle"),
    onBack,
    t,
  };

  if (playableCards.length === 0) {
    return (
      <GuessManaShell {...shellProps}>
        <EmptyState title={t("guessMana.noCards")} buttonLabel={t("common.back")} onBack={onBack} />
      </GuessManaShell>
    );
  }

  if (!currentCard) {
    return (
      <GuessManaShell {...shellProps}>
        <EmptyState title={t("guessMana.loadingGame")} />
      </GuessManaShell>
    );
  }

  const hasAnswered = selectedCost !== null;
  const isCorrect = selectedCost === currentCard.cost;
  const accuracy = Math.round((score / MAX_ROUNDS) * 100);
  const progressPercent = (round / MAX_ROUNDS) * 100;
  const currentCardName = getCardName(currentCard, locale);
  const imageSrc = getGuessManaCardImage(currentCard, locale);

  if (finished) {
    return (
      <GuessManaShell
        {...shellProps}
        eyebrow={t("guessMana.gameFinished")}
        description={t("guessMana.finalText", {
          score,
          maxRounds: MAX_ROUNDS,
          accuracy,
        })}
      >
        <EndScreen score={score} onBack={onBack} onRestart={startNewGame} t={t} />
      </GuessManaShell>
    );
  }

  return (
    <GuessManaShell
      {...shellProps}
      status={<GuessManaStatus round={round} score={score} t={t} />}
    >
      <div className="gm-progress-track">
        <div className="gm-progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="gm-layout">
        <CardPreview
          cardName={currentCardName}
          hasAnswered={hasAnswered}
          imageFailed={imageFailed}
          imageSrc={imageSrc}
          onImageError={() => setImageFailed(true)}
          t={t}
        />

        <article className="gm-control-panel game-panel">
          <CardInfo card={currentCard} cardName={currentCardName} locale={locale} t={t} />

          <ManaSelector
            correctCost={currentCard.cost}
            hasAnswered={hasAnswered}
            onChooseCost={chooseCost}
            selectedCost={selectedCost}
            t={t}
          />

          {hasAnswered ? (
            <RoundFeedback
              cardName={currentCardName}
              correctCost={currentCard.cost}
              isCorrect={isCorrect}
              isFinalRound={round >= MAX_ROUNDS}
              onNextRound={goNextRound}
              t={t}
            />
          ) : null}
        </article>
      </div>
    </GuessManaShell>
  );
}

export default GuessManaCost;
