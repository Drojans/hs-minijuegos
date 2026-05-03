import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../i18n/LanguageProvider";
import {
  getCardName,
  getAdaptedImage,
  translateCardClass,
  translateCardRarity,
  translateCardType,
} from "../../utils/cardLocale";
import "./GuessManaCost.css";

const MAX_ROUNDS = 10;
const MANA_VALUES = Array.from({ length: 11 }, (_, index) => index);

function getGameCardImage(card, locale) {
  return getAdaptedImage(card, locale);
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function GuessManaCost({ cards, onBack }) {
  const { locale, t } = useLanguage();

  const playableCards = useMemo(() => {
    return cards.filter((card) => {
      return (
        typeof card.cost === "number" &&
        card.cost >= 0 &&
        card.cost <= 10 &&
        getCardName(card, locale) &&
        getGameCardImage(card, locale) &&
        card.type !== "HERO" &&
        card.type !== "HERO_POWER"
      );
    });
  }, [cards, locale]);

  const [currentCard, setCurrentCard] = useState(null);
  const [selectedCost, setSelectedCost] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [finished, setFinished] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (playableCards.length === 0 || currentCard) return;
    setCurrentCard(getRandomItem(playableCards));
  }, [playableCards, currentCard]);

  useEffect(() => {
    setImageFailed(false);
  }, [locale, currentCard?.id]);

  function startNewGame() {
    setCurrentCard(getRandomItem(playableCards));
    setSelectedCost(null);
    setScore(0);
    setRound(1);
    setFinished(false);
    setImageFailed(false);
  }

  function chooseCost(cost) {
    if (selectedCost !== null) return;
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

    let newCard = getRandomItem(playableCards);
    let safety = 0;
    while (newCard?.id === currentCard?.id && safety < 10) {
      newCard = getRandomItem(playableCards);
      safety += 1;
    }

    setCurrentCard(newCard);
    setSelectedCost(null);
    setRound((previousRound) => previousRound + 1);
    setImageFailed(false);
  }

  if (playableCards.length === 0) {
    return (
      <main className="gm-page">
        <section className="gm-empty-state">
          <h2>{t("guessMana.title")}</h2>
          <p>{t("guessMana.noCards")}</p>
          <button className="gm-secondary-button" onClick={onBack}>{t("common.back")}</button>
        </section>
      </main>
    );
  }

  if (!currentCard) {
    return (
      <main className="gm-page">
        <section className="gm-empty-state"><h2>{t("guessMana.loadingGame")}</h2></section>
      </main>
    );
  }

  const hasAnswered = selectedCost !== null;
  const isCorrect = selectedCost === currentCard.cost;
  const accuracy = Math.round((score / MAX_ROUNDS) * 100);
  const progressPercent = (round / MAX_ROUNDS) * 100;
  const imageSrc = getGameCardImage(currentCard, locale);
  const currentCardName = getCardName(currentCard, locale);

  if (finished) {
    return (
      <main className="gm-page">
        <section className="gm-end-screen">
          <p className="gm-eyebrow">{t("guessMana.gameFinished")}</p>
          <h1>{t("guessMana.title")}</h1>
          <div className="gm-end-score">{score} / {MAX_ROUNDS}</div>
          <p>
            {t("guessMana.finalText", {
              score,
              maxRounds: MAX_ROUNDS,
              accuracy,
            })}
          </p>
          <div className="gm-end-actions">
            <button className="gm-primary-button" onClick={startNewGame}>{t("common.playAgain")}</button>
            <button className="gm-secondary-button" onClick={onBack}>{t("guessMana.backHome")}</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="gm-page">
      <section className="gm-shell">
        <header className="gm-header">
          <button className="gm-secondary-button" onClick={onBack}>{t("common.backHome")}</button>

          <div className="gm-title-block">
            <p className="gm-eyebrow">{t("guessMana.minigame")}</p>
            <h1>{t("guessMana.title")}</h1>
            <p>{t("guessMana.subtitle")}</p>
          </div>

          <div className="gm-score-pill">
            <span>{t("common.round", { round, maxRounds: MAX_ROUNDS })}</span>
            <strong>{t("common.correctCount", { score })}</strong>
          </div>
        </header>

        <div className="gm-progress-track">
          <div className="gm-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="gm-layout">
          <aside className="gm-card-panel">
            <div className="gm-card-frame">
              <div className="gm-card-image-wrap">
                {!imageFailed ? (
                  <img
                    src={imageSrc}
                    alt={currentCardName}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    onError={() => setImageFailed(true)}
                  />
                ) : (
                  <div className="gm-image-fallback">{t("guessMana.noImage")}</div>
                )}

                {!hasAnswered && !imageFailed && <div className="gm-mana-cover">?</div>}
                {!imageFailed && <div className="gm-scan-beam" />}
              </div>
            </div>
          </aside>

          <article className="gm-control-panel">
            <section className="gm-info-card">
              <p className="gm-eyebrow">{t("guessMana.cardData")}</p>
              <h2>{currentCardName}</h2>

              <div className="gm-tag-row">
                <span>{translateCardClass(currentCard.cardClass, locale)}</span>
                <span>{translateCardType(currentCard.type, locale)}</span>
                <span>{translateCardRarity(currentCard.rarity, locale)}</span>
              </div>

              {currentCard.attack !== null && currentCard.health !== null ? (
                <div className="gm-stat-row">
                  <div><span>{t("guessMana.attack")}</span><strong>{currentCard.attack}</strong></div>
                  <div><span>{t("guessMana.health")}</span><strong>{currentCard.health}</strong></div>
                </div>
              ) : (
                <p className="gm-no-stats">{t("guessMana.noStats")}</p>
              )}
            </section>

            <section className="gm-mana-panel">
              <p className="gm-eyebrow">{t("guessMana.manaSelector")}</p>
              <h3>{t("guessMana.chooseCost")}</h3>

              <div className="gm-mana-grid">
                {MANA_VALUES.map((cost) => {
                  let buttonClass = "gm-mana-button";
                  if (hasAnswered && cost === currentCard.cost) buttonClass += " is-correct";
                  if (hasAnswered && cost === selectedCost && cost !== currentCard.cost) buttonClass += " is-wrong";

                  return (
                    <button key={cost} className={buttonClass} disabled={hasAnswered} onClick={() => chooseCost(cost)}>
                      {cost}
                    </button>
                  );
                })}
              </div>
            </section>

            {hasAnswered && (
              <section className={`gm-feedback ${isCorrect ? "is-correct" : "is-wrong"}`}>
                <h3>{isCorrect ? t("guessMana.correct") : t("guessMana.wrong")}</h3>
                <p>
                  {t("guessMana.costFeedback", {
                    name: currentCardName,
                    cost: currentCard.cost,
                  })}
                </p>
                <button className="gm-primary-button" onClick={goNextRound}>
                  {round >= MAX_ROUNDS ? t("common.seeResult") : t("guessMana.nextCard")}
                </button>
              </section>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}

export default GuessManaCost;
