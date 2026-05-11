import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../i18n/LanguageProvider";
import LanguageToggle from "../../shared/components/LanguageToggle/LanguageToggle";
import {
  COLLECTION_UPDATED_EVENT,
  getCollectionStore,
  getOwnedCardEntry,
} from "../../shared/collection/collectionStore";
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
  hasSelectedCard,
  translateCardClass,
  translateCardRarity,
  translateCardType,
} from "./cardDatabaseConfig";
import "./CardDatabase.css";

const PAGE_SIZE = 20;

function getDatabaseImage(card, locale) {
  return getDetailImage(card, locale) || getThumbImage(card, locale);
}

function formatText(template, values = {}) {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);
}

function DatabaseHeader({ copy, onNavigate, onBack }) {
  function go(path) {
    if (onNavigate) {
      onNavigate(path);
      return;
    }

    if (path === "/") onBack?.();
  }

  return (
    <header className="card-db-header">
      <nav className="card-db-nav" aria-label="Principal">
        <button type="button" onClick={() => go("/")}>{copy.navMinigames}</button>
        <button type="button" className="is-active" onClick={() => go("/cards")}>{copy.navCards}</button>
        <button type="button" onClick={() => go("/collection")}>{copy.navCollection}</button>
      </nav>

      <button type="button" className="card-db-brand" onClick={() => go("/")} aria-label="Hearthdle">
        <img className="card-db-brand-mug is-left" src="/ui/book/prop-right-mug-cartoon.png" alt="" />
        <span>Hearthdle</span>
        <img className="card-db-brand-mug" src="/ui/book/prop-right-mug-cartoon.png" alt="" />
      </button>

      <div className="card-db-actions">
        <LanguageToggle compact className="card-db-language" />
      </div>
    </header>
  );
}

function DatabaseHero({ copy, totalCards, ownedCount, loading }) {
  return (
    <section className="card-db-hero">
      <p>{copy.eyebrow}</p>
      <h1>{copy.title}</h1>
      <span>{copy.subtitle}</span>

      <div className="card-db-hero-stats">
        <div>
          <span>{loading ? copy.loading : copy.cards}</span>
          <strong>{loading ? "..." : totalCards}</strong>
        </div>
        <div>
          <span>{copy.inCollection}</span>
          <strong>{ownedCount}</strong>
        </div>
      </div>
    </section>
  );
}

function FilterSelect({ label, value, options, allLabel, onChange, renderOptionLabel }) {
  return (
    <label className="card-db-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value={FILTER_ALL}>{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>{renderOptionLabel(option)}</option>
        ))}
      </select>
    </label>
  );
}

function DatabaseFilters({ copy, locale, filters, availableTypes, availableClasses, availableRarities, onUpdateFilter, onClearFilters }) {
  return (
    <section className="card-db-filter-panel">
      <div className="card-db-browser-head">
        <div>
          <p>{copy.filters}</p>
          <h2>{copy.browseCards}</h2>
        </div>
        <button type="button" className="card-db-clear-button" onClick={onClearFilters}>{copy.clearFilters}</button>
      </div>

      <div className="card-db-filter-grid">
        <label className="card-db-field card-db-search-field">
          <span>{copy.search}</span>
          <input
            type="search"
            value={filters.search}
            placeholder={copy.searchPlaceholder}
            onChange={(event) => onUpdateFilter("search", event.target.value)}
          />
        </label>

        <FilterSelect
          label={copy.type}
          value={filters.type}
          options={availableTypes}
          allLabel={copy.allPlural}
          onChange={(value) => onUpdateFilter("type", value)}
          renderOptionLabel={(type) => translateCardType(type, locale)}
        />

        <FilterSelect
          label={copy.class}
          value={filters.cardClass}
          options={availableClasses}
          allLabel={copy.allFeminine}
          onChange={(value) => onUpdateFilter("cardClass", value)}
          renderOptionLabel={(cardClass) => translateCardClass(cardClass, locale)}
        />

        <FilterSelect
          label={copy.rarity}
          value={filters.rarity}
          options={availableRarities}
          allLabel={copy.allFeminine}
          onChange={(value) => onUpdateFilter("rarity", value)}
          renderOptionLabel={(rarity) => translateCardRarity(rarity, locale)}
        />
      </div>

      <div className="card-db-cost-row">
        {COST_OPTIONS.map((cost) => (
          <button
            key={cost}
            type="button"
            className={filters.cost === cost ? "is-active" : ""}
            onClick={() => onUpdateFilter("cost", cost)}
          >
            {getCostLabel(cost, copy)}
          </button>
        ))}
      </div>
    </section>
  );
}

function DatabaseCardTile({ card, locale, copy, selected, onSelect }) {
  const imageSrc = getDatabaseImage(card, locale);
  const cardName = getCardName(card, locale);
  const entry = getOwnedCardEntry(card.id);
  const owned = Boolean(entry);

  return (
    <button
      type="button"
      className={`card-db-card-tile ${selected ? "is-selected" : ""} ${owned ? "is-owned" : ""}`}
      onClick={() => onSelect(card)}
      title={cardName}
    >
      <div className="card-db-card-image">
        {imageSrc ? <img src={imageSrc} alt={cardName} loading="lazy" decoding="async" /> : <span>{copy.noImage}</span>}
      </div>
      <div className="card-db-card-info">
        <h3>{cardName}</h3>
        <p>{translateCardRarity(card.rarity, locale)} · {translateCardClass(card.cardClass, locale)}</p>
      </div>
      {owned ? <strong className="card-db-owned-badge">{formatText(copy.copyCount, { count: entry.count ?? 1 })}</strong> : null}
    </button>
  );
}

function CardPageControls({ copy, pageIndex, pageCount, onPrevious, onNext }) {
  return (
    <div className="card-db-page-controls">
      <button type="button" onClick={onPrevious} disabled={pageIndex === 0}>← {copy.previous}</button>
      <span>{copy.page} {pageIndex + 1} / {pageCount}</span>
      <button type="button" onClick={onNext} disabled={pageIndex >= pageCount - 1}>{copy.next} →</button>
    </div>
  );
}

function DetailTags({ card, locale }) {
  return (
    <div className="card-db-detail-tags">
      <span>{translateCardClass(card.cardClass, locale)}</span>
      <span>{translateCardType(card.type, locale)}</span>
      <span>{translateCardRarity(card.rarity, locale)}</span>
    </div>
  );
}

function DetailStats({ card, copy }) {
  return (
    <div className="card-db-detail-stats">
      <div><span>{copy.cost}</span><strong>{card.cost ?? copy.unknownValue}</strong></div>
      <div><span>{copy.attack}</span><strong>{card.attack ?? copy.unknownValue}</strong></div>
      <div><span>{copy.health}</span><strong>{card.health ?? copy.unknownValue}</strong></div>
    </div>
  );
}

function CardDetailPanel({ card, locale, copy, onClose }) {
  if (!card) {
    return (
      <aside className="card-db-detail-panel card-db-detail-empty">
        <div className="card-db-empty-orb">+</div>
        <h2>{copy.selectCard}</h2>
        <p>{copy.selectCardBody}</p>
      </aside>
    );
  }

  const imageSrc = getDatabaseImage(card, locale);
  const cardName = getCardName(card, locale);
  const secondaryCardName = getSecondaryCardName(card, locale);
  const collectionEntry = getOwnedCardEntry(card.id);

  return (
    <aside className="card-db-detail-panel">
      <button type="button" className="card-db-detail-close" onClick={onClose} aria-label={copy.closeDetail}>×</button>

      <div className="card-db-detail-image">
        {imageSrc ? <img src={imageSrc} alt={cardName} /> : <span>{copy.imageUnavailable}</span>}
      </div>

      <div className="card-db-detail-info">
        <p className="card-db-detail-kicker">{copy.cardDetail}</p>
        <h2>{cardName}</h2>
        {secondaryCardName ? <p className="card-db-detail-secondary">{secondaryCardName}</p> : null}

        <DetailTags card={card} locale={locale} />
        <DetailStats card={card} copy={copy} />

        <div className={`card-db-detail-collection ${collectionEntry ? "is-owned" : ""}`}>
          <span>{copy.collectionStatus}</span>
          <strong>{collectionEntry ? formatText(copy.ownedCopies, { count: collectionEntry.count ?? 1 }) : copy.notOwned}</strong>
        </div>

        <div className="card-db-detail-text">
          <span>{copy.text}</span>
          <p>{getCardText(card, locale) || copy.noText}</p>
        </div>

        <dl className="card-db-detail-meta">
          <div><dt>Set</dt><dd>{card.set ?? copy.unknownValue}</dd></div>
          <div><dt>ID</dt><dd>{card.id ?? copy.unknownValue}</dd></div>
        </dl>
      </div>
    </aside>
  );
}

function CardDatabase({ cards = [], loading = false, onNavigate, onBack }) {
  const { locale } = useLanguage();
  const copy = getDatabaseCopy(locale);
  const [filters, setFilters] = useState(() => createInitialFilters());
  const [selectedCard, setSelectedCard] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [, setCollectionVersion] = useState(0);

  const availableClasses = useMemo(() => getAvailableValues(cards, "cardClass", CLASS_ORDER), [cards]);
  const availableTypes = useMemo(() => getAvailableValues(cards, "type", TYPE_ORDER), [cards]);
  const availableRarities = useMemo(() => getAvailableValues(cards, "rarity", RARITY_ORDER), [cards]);

  const filteredCards = useMemo(() => filterCards(cards, filters), [cards, filters]);
  const pageCount = Math.max(1, Math.ceil(filteredCards.length / PAGE_SIZE));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const currentPageCards = useMemo(() => {
    const start = safePageIndex * PAGE_SIZE;
    return filteredCards.slice(start, start + PAGE_SIZE);
  }, [filteredCards, safePageIndex]);

  const ownedCount = useMemo(() => Object.keys(getCollectionStore().cards ?? {}).length, [cards, locale]);

  useEffect(() => {
    setPageIndex(0);
  }, [filters.search, filters.type, filters.cardClass, filters.rarity, filters.cost]);

  useEffect(() => {
    if (!hasSelectedCard(filteredCards, selectedCard)) setSelectedCard(null);
  }, [filteredCards, selectedCard]);

  useEffect(() => {
    function syncCollection() {
      setCollectionVersion((value) => value + 1);
    }

    window.addEventListener(COLLECTION_UPDATED_EVENT, syncCollection);
    window.addEventListener("storage", syncCollection);
    window.addEventListener("focus", syncCollection);

    return () => {
      window.removeEventListener(COLLECTION_UPDATED_EVENT, syncCollection);
      window.removeEventListener("storage", syncCollection);
      window.removeEventListener("focus", syncCollection);
    };
  }, []);

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function clearFilters() {
    setFilters(createInitialFilters());
  }

  return (
    <main className="card-db-page">
      <div className="card-db-bg" aria-hidden="true">
        <span className="card-db-glow card-db-glow-a" />
        <span className="card-db-glow card-db-glow-b" />
      </div>

      <DatabaseHeader copy={copy} onNavigate={onNavigate} onBack={onBack} />

      <section className="card-db-shell">
        <DatabaseHero copy={copy} totalCards={cards.length} ownedCount={ownedCount} loading={loading} />

        <section className="card-db-layout">
          <div className="card-db-main-panel">
            <DatabaseFilters
              copy={copy}
              locale={locale}
              filters={filters}
              availableTypes={availableTypes}
              availableClasses={availableClasses}
              availableRarities={availableRarities}
              onUpdateFilter={updateFilter}
              onClearFilters={clearFilters}
            />

            <div className="card-db-results-row">
              <p>{formatText(copy.showingResults, { visible: currentPageCards.length, total: filteredCards.length })}</p>
              <CardPageControls
                copy={copy}
                pageIndex={safePageIndex}
                pageCount={pageCount}
                onPrevious={() => setPageIndex((page) => Math.max(0, page - 1))}
                onNext={() => setPageIndex((page) => Math.min(pageCount - 1, page + 1))}
              />
            </div>

            <div className="card-db-card-grid">
              {loading ? (
                <p className="card-db-empty-note">{copy.loading}</p>
              ) : currentPageCards.length ? (
                currentPageCards.map((card) => (
                  <DatabaseCardTile
                    key={card.id}
                    card={card}
                    locale={locale}
                    copy={copy}
                    selected={selectedCard?.id === card.id}
                    onSelect={setSelectedCard}
                  />
                ))
              ) : (
                <p className="card-db-empty-note">{copy.noMatches}</p>
              )}
            </div>
          </div>

          <CardDetailPanel card={selectedCard} locale={locale} copy={copy} onClose={() => setSelectedCard(null)} />
        </section>
      </section>
    </main>
  );
}

export default CardDatabase;
