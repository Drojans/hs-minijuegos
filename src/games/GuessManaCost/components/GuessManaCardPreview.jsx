function GuessManaCardPreview({ imageSrc, cardName, imageFailed, onImageError, copy, hideManaCover = false }) {
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
        {!imageFailed && !hideManaCover ? (
          <div className="guess-v3-mana-cover-wrap" aria-hidden="true">
            <img className="guess-v3-mana-cover" src="/ui/games/guess-mana-v3/mana-cover.png" alt="" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default GuessManaCardPreview;
