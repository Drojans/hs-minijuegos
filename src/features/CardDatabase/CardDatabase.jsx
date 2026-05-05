import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../i18n/LanguageProvider";
import {
  CLASS_ORDER,
  COST_OPTIONS,
  FILTER_ALL,
  RARITY_ORDER,
  TYPE_ORDER,
  createInitialFilters,
  filterCards,
  getAvailableValues,
  getCardName,
  getCardText,
  getCostLabel,
  getDatabaseCopy,
  getDetailImage,
  getSecondaryCardName,
  getThumbImage,
  getVisibleCards,
  hasSelectedCard,
  translateCardClass,
  translateCardRarity,
  translateCardType,
} from "./cardDatabaseConfig";
import "./CardDatabase.css";

function Hero({ copy, loading, totalCards, onBack }) {
  return (
    <header className="cb-hero">
      <button type="button" className="cb-back-button" onClick={onBack}>
        {copy.backHome}
      </button>

      <div className="cb-hero-copy">
        <p>{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <span>{copy.subtitle}</span>
      </div>

      <div className="cb-counter">
        <span>{loading ? copy.loading : copy.cards}</span>
        <strong>{loading ? "..." : totalCards}</strong>
      </div>
    </header>
  );
}

function FilterSelect({ label, value, options, allLabel, onChange, renderOptionLabel }) {
  return (
    <label className="cb-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value={FILTER_ALL}>{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {renderOptionLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function Filters({
  copy,
  locale,
  filters,
  availableTypes,
  availableClasses,
  availableRarities,
  onUpdateFilter,
}) {
  return (
    <>
      <div className="cb-filter-grid">
        <label className="cb-field cb-search-field">
          <span>{copy.search}</span>
          <input
            type="text"
            placeholder={copy.searchPlaceholder}
            value={filters.search}
            onChange={(event) => onUpdateFilter("search", event.target.value)}
          />
        </label>

        <div className="cb-field-type">
          <FilterSelect
            label={copy.type}
            value={filters.type}
            options={availableTypes}
            allLabel={copy.allPlural}
            onChange={(value) => onUpdateFilter("type", value)}
            renderOptionLabel={(type) => translateCardType(type, locale)}
          />
        </div>

        <div className="cb-field-class">
          <FilterSelect
            label={copy.class}
            value={filters.cardClass}
            options={availableClasses}
            allLabel={copy.allFeminine}
            onChange={(value) => onUpdateFilter("cardClass", value)}
            renderOptionLabel={(cardClass) => translateCardClass(cardClass, locale)}
          />
        </div>

        <div className="cb-field-rarity">
          <FilterSelect
            label={copy.rarity}
            value={filters.rarity}
            options={availableRarities}
            allLabel={copy.allFeminine}
            onChange={(value) => onUpdateFilter("rarity", value)}
            renderOptionLabel={(rarity) => translateCardRarity(rarity, locale)}
          />
        </div>
      </div>

      <div className="cb-cost-row">
        {COST_OPTIONS.map((cost) => (
          <button
            key={cost}
            type="button"
            className={`cb-cost-chip ${filters.cost === cost ? "is-active" : ""}`}
            onClick={() => onUpdateFilter("cost", cost)}
          >
            {getCostLabel(cost, copy)}
          </button>
        ))}
      </div>
    </>
  );
}

function ResultsHeader({ copy, visibleCount, filteredCount, onClearFilters }) {
  return (
    <div className="cb-results-row">
      <p>
        {copy.showing} <strong>{visibleCount}</strong> {copy.of}{" "}
        <strong>{filteredCount}</strong> {copy.results}
      </p>
      <button type="button" className="cb-clear-button" onClick={onClearFilters}>
        {copy.clearFilters}
      </button>
    </div>
  );
}

function CardThumb({ card, locale, copy }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const src = getThumbImage(card, locale);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [src]);

  return (
    <div className={`cb-thumb ${loaded ? "is-loaded" : ""} ${failed ? "is-failed" : ""}`}>
      {!loaded && !failed ? <span className="cb-image-placeholder">{copy.loadingImage}</span> : null}
      {!failed ? (
        <img
          src={src}
          alt={getCardName(card, locale)}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="cb-image-placeholder">{copy.noImage}</span>
      )}
    </div>
  );
}

function CardTile({ card, locale, copy, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`cb-card-tile ${selected ? "is-selected" : ""}`}
      onClick={() => onSelect(card)}
    >
      <CardThumb card={card} locale={locale} copy={copy} />
      <div className="cb-card-caption">
        <strong>{getCardName(card, locale)}</strong>
        <span>{translateCardType(card.type, locale)}</span>
      </div>
    </button>
  );
}

function CardGrid({ cards, locale, copy, selectedCard, onSelectCard }) {
  return (
    <div className="cb-card-grid">
      {cards.map((card) => (
        <CardTile
          key={card.id}
          card={card}
          locale={locale}
          copy={copy}
          selected={selectedCard?.id === card.id}
          onSelect={onSelectCard}
        />
      ))}
    </div>
  );
}

function CardLargeImage({ card, locale, copy }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const src = getDetailImage(card, locale);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [src]);

  return (
    <div className={`cb-detail-image ${loaded ? "is-loaded" : ""} ${failed ? "is-failed" : ""}`}>
      {!loaded && !failed ? <span>{copy.preparingCard}</span> : null}
      {!failed ? (
        <img
          src={src}
          alt={getCardName(card, locale)}
          loading="eager"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{copy.imageUnavailable}</span>
      )}
    </div>
  );
}

function CardDetailEmpty({ copy }) {
  return (
    <aside className="cb-detail-panel cb-detail-empty">
      <div className="cb-empty-orb">+</div>
      <h2>{copy.selectCard}</h2>
      <p>{copy.selectCardBody}</p>
    </aside>
  );
}

function DetailTags({ card, locale }) {
  return (
    <div className="cb-detail-tags">
      <span>{translateCardClass(card.cardClass, locale)}</span>
      <span>{translateCardType(card.type, locale)}</span>
      <span>{translateCardRarity(card.rarity, locale)}</span>
    </div>
  );
}

function DetailStats({ card, copy }) {
  const unknown = copy.unknownValue;

  return (
    <div className="cb-detail-stats">
      <div>
        <span>{copy.cost}</span>
        <strong>{card.cost ?? "?"}</strong>
      </div>
      <div>
        <span>{copy.attack}</span>
        <strong>{card.attack ?? unknown}</strong>
      </div>
      <div>
        <span>{copy.health}</span>
        <strong>{card.health ?? unknown}</strong>
      </div>
    </div>
  );
}

function CardDetailPanel({ card, locale, copy, onClose }) {
  if (!card) {
    return <CardDetailEmpty copy={copy} />;
  }

  const secondaryCardName = getSecondaryCardName(card, locale);

  return (
    <aside className="cb-detail-panel">
      <button
        type="button"
        className="cb-detail-close"
        onClick={onClose}
        aria-label={copy.closeDetail}
      >
        ×
      </button>

      <CardLargeImage card={card} locale={locale} copy={copy} />

      <div className="cb-detail-info">
        <p className="cb-detail-kicker">
          {copy.cardDetail} · {locale.toUpperCase()}
        </p>
        <h2>{getCardName(card, locale)}</h2>
        {secondaryCardName ? <p className="cb-detail-english">{secondaryCardName}</p> : null}

        <DetailTags card={card} locale={locale} />
        <DetailStats card={card} copy={copy} />

        <div className="cb-detail-text">
          <span>{copy.text}</span>
          <p>{getCardText(card, locale) || copy.noText}</p>
        </div>

        <dl className="cb-detail-meta">
          <div>
            <dt>Set</dt>
            <dd>{card.set ?? copy.unknownValue}</dd>
          </div>
          <div>
            <dt>ID</dt>
            <dd>{card.id ?? copy.unknownValue}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}

function CardDatabase({ cards, loading, onBack }) {
  const { locale } = useLanguage();
  const copy = getDatabaseCopy(locale);
  const [filters, setFilters] = useState(() => createInitialFilters());
  const [selectedCard, setSelectedCard] = useState(null);

  const availableClasses = useMemo(
    () => getAvailableValues(cards, "cardClass", CLASS_ORDER),
    [cards]
  );

  const availableTypes = useMemo(
    () => getAvailableValues(cards, "type", TYPE_ORDER),
    [cards]
  );

  const availableRarities = useMemo(
    () => getAvailableValues(cards, "rarity", RARITY_ORDER),
    [cards]
  );

  const filteredCards = useMemo(() => filterCards(cards, filters), [cards, filters]);
  const visibleCards = useMemo(() => getVisibleCards(filteredCards), [filteredCards]);

  useEffect(() => {
    if (!hasSelectedCard(filteredCards, selectedCard)) {
      setSelectedCard(null);
    }
  }, [filteredCards, selectedCard]);

  function updateFilter(key, value) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }));
  }

  function clearFilters() {
    setFilters(createInitialFilters());
  }

  return (
    <main className="cb-page">
      <Hero copy={copy} loading={loading} totalCards={cards.length} onBack={onBack} />

      <section className="cb-layout">
        <div className="cb-main-panel">
          <Filters
            copy={copy}
            locale={locale}
            filters={filters}
            availableTypes={availableTypes}
            availableClasses={availableClasses}
            availableRarities={availableRarities}
            onUpdateFilter={updateFilter}
          />

          <ResultsHeader
            copy={copy}
            visibleCount={visibleCards.length}
            filteredCount={filteredCards.length}
            onClearFilters={clearFilters}
          />

          <CardGrid
            cards={visibleCards}
            locale={locale}
            copy={copy}
            selectedCard={selectedCard}
            onSelectCard={setSelectedCard}
          />
        </div>

        <CardDetailPanel
          card={selectedCard}
          locale={locale}
          copy={copy}
          onClose={() => setSelectedCard(null)}
        />
      </section>
    </main>
  );
}

export default CardDatabase;
