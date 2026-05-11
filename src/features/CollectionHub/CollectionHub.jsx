import { useEffect, useMemo, useState } from "react";
import LanguageToggle from "../../shared/components/LanguageToggle/LanguageToggle";
import { useLanguage } from "../../i18n/LanguageProvider";
import { getCardName, getDetailImage, getGameImage, getThumbImage, translateCardClass, translateCardRarity } from "../../utils/cardLocale";
import {
  COLLECTION_UPDATED_EVENT,
  addCardsToCollection,
  getCollectionStore,
} from "../../shared/collection/collectionStore";
import { DEFAULT_PACK_SIZE, getEligiblePackCards, openCardPack } from "../../shared/packs/packOpening";
import { consumePackReward, getPackCount, REWARDS_UPDATED_EVENT } from "../../shared/rewards/rewardStore";
import "./CollectionHub.css";

const BOX_ID = "standard";
const PAGE_SIZE = 24;

const COPY = {
  es: {
    navMinigames: "Minijuegos",
    navCards: "Base de datos",
    navCollection: "Colección",
    eyebrow: "Inventario de la taberna",
    title: "Cajas arcanas y colección",
    subtitle: "Abre cajas, descubre cartas y completa tu álbum personal de Hearthdle.",
    boxes: "Cajas arcanas",
    openBox: "Abrir caja",
    openAnotherBox: "Abrir otra caja",
    noBoxes: "No tienes cajas todavía",
    boxHint: `Cada caja arcana contiene ${DEFAULT_PACK_SIZE} cartas para tu colección.`,
    collectionProgress: "Progreso de colección",
    uniqueCards: "cartas únicas",
    totalCopies: "copias totales",
    searchPlaceholder: "Buscar carta...",
    collectionDisplay: "Todas las cartas",
    filters: "Filtros",
    ownershipAll: "Todas",
    ownershipOwned: "Conseguidas",
    ownershipMissing: "Bloqueadas",
    allClasses: "Todas las clases",
    allRarities: "Todas las rarezas",
    sortDefault: "Orden por colección",
    sortName: "Nombre",
    sortCost: "Coste",
    sortRarity: "Rareza",
    showing: "Mostrando {count} de {total}",
    page: "Página",
    previous: "Anterior",
    next: "Siguiente",
    newCard: "Nueva",
    repeatedCard: "Copia",
    copyCount: "x{count}",
    locked: "Bloqueada",
    noMatches: "No hay cartas con esa búsqueda.",
    loading: "Cargando cartas...",
    noImage: "Sin imagen",
    openingTitle: "Caja arcana",
    openingText: "La caja está despertando...",
    revealTitle: "Cartas obtenidas",
    revealText: "Las cartas nuevas brillan; las copias se guardan igualmente en tu colección.",
    revealAll: "Revelar todas",
    continue: "Continuar",
    openingSummary: "{newCount} nuevas · {copyCount} copias",
  },
  en: {
    navMinigames: "Minigames",
    navCards: "Card database",
    navCollection: "Collection",
    eyebrow: "Tavern inventory",
    title: "Arcane boxes & collection",
    subtitle: "Open boxes, discover cards, and complete your personal Hearthdle album.",
    boxes: "Arcane boxes",
    openBox: "Open box",
    openAnotherBox: "Open another box",
    noBoxes: "No boxes yet",
    boxHint: `Each arcane box contains ${DEFAULT_PACK_SIZE} cards for your collection.`,
    collectionProgress: "Collection progress",
    uniqueCards: "unique cards",
    totalCopies: "total copies",
    searchPlaceholder: "Search card...",
    collectionDisplay: "All cards",
    filters: "Filters",
    ownershipAll: "All",
    ownershipOwned: "Owned",
    ownershipMissing: "Locked",
    allClasses: "All classes",
    allRarities: "All rarities",
    sortDefault: "Collection order",
    sortName: "Name",
    sortCost: "Cost",
    sortRarity: "Rarity",
    showing: "Showing {count} of {total}",
    page: "Page",
    previous: "Previous",
    next: "Next",
    newCard: "New",
    repeatedCard: "Copy",
    copyCount: "x{count}",
    locked: "Locked",
    noMatches: "No cards match that search.",
    loading: "Loading cards...",
    noImage: "No image",
    openingTitle: "Arcane box",
    openingText: "The box is waking up...",
    revealTitle: "Cards obtained",
    revealText: "New cards glow; copies are still saved in your collection.",
    revealAll: "Reveal all",
    continue: "Continue",
    openingSummary: "{newCount} new · {copyCount} copies",
  },
};

const RARITY_ORDER = {
  LEGENDARY: 0,
  EPIC: 1,
  RARE: 2,
  COMMON: 3,
  FREE: 4,
};

function formatCopy(template, values = {}) {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);
}

function normalizeText(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getCollectionImage(card, locale) {
  return getDetailImage(card, locale) || getGameImage(card, locale) || getThumbImage(card, locale);
}

function sortCollectionCards(cards, locale, sortMode = "default") {
  return [...cards].sort((a, b) => {
    if (sortMode === "name") {
      return getCardName(a, locale).localeCompare(getCardName(b, locale));
    }

    if (sortMode === "cost") {
      const costCompare = (Number(a.cost) || 0) - (Number(b.cost) || 0);
      if (costCompare !== 0) return costCompare;
      return getCardName(a, locale).localeCompare(getCardName(b, locale));
    }

    if (sortMode === "rarity") {
      const rarityCompare = (RARITY_ORDER[a.rarity] ?? 9) - (RARITY_ORDER[b.rarity] ?? 9);
      if (rarityCompare !== 0) return rarityCompare;
      return getCardName(a, locale).localeCompare(getCardName(b, locale));
    }

    const classCompare = String(a.cardClass ?? "").localeCompare(String(b.cardClass ?? ""));
    if (classCompare !== 0) return classCompare;

    const rarityCompare = (RARITY_ORDER[a.rarity] ?? 9) - (RARITY_ORDER[b.rarity] ?? 9);
    if (rarityCompare !== 0) return rarityCompare;

    const costCompare = (Number(a.cost) || 0) - (Number(b.cost) || 0);
    if (costCompare !== 0) return costCompare;

    return getCardName(a, locale).localeCompare(getCardName(b, locale));
  });
}

function CollectionHeader({ copy, onNavigate }) {
  return (
    <header className="collection-header">
      <nav className="collection-nav" aria-label="Principal">
        <button type="button" onClick={() => onNavigate?.("/")}>{copy.navMinigames}</button>
        <button type="button" onClick={() => onNavigate?.("/cards")}>{copy.navCards}</button>
        <button type="button" className="is-active" onClick={() => onNavigate?.("/collection")}>{copy.navCollection}</button>
      </nav>

      <button type="button" className="collection-brand" onClick={() => onNavigate?.("/")} aria-label="Hearthdle">
        <img className="collection-brand-mug is-left" src="/ui/book/prop-right-mug-cartoon.png" alt="" />
        <span>Hearthdle</span>
        <img className="collection-brand-mug" src="/ui/book/prop-right-mug-cartoon.png" alt="" />
      </button>

      <div className="collection-actions">
        <LanguageToggle compact className="collection-language" />
      </div>
    </header>
  );
}

function ArcaneBoxVisual({ isOpening = false }) {
  return (
    <div className={`collection-arcane-box ${isOpening ? "is-opening" : ""}`} aria-hidden="true">
      <div className="collection-arcane-box-core">
        <span className="collection-arcane-box-gem" />
      </div>
    </div>
  );
}

function CollectionCardTile({ card, entry, locale, copy }) {
  const unlocked = Boolean(entry);
  const imageSrc = getCollectionImage(card, locale);
  const cardName = getCardName(card, locale);
  const count = Number(entry?.count) || 0;

  return (
    <article className={`collection-card-tile ${unlocked ? "is-owned" : "is-locked"}`} title={cardName}>
      <div className="collection-card-image">
        {imageSrc ? <img src={imageSrc} alt={cardName} loading="lazy" /> : <span>{copy.noImage}</span>}
      </div>

      <div className="collection-card-info">
        <h3>{cardName}</h3>
        <p>{translateCardRarity(card.rarity, locale)} · {translateCardClass(card.cardClass, locale)}</p>
      </div>

      {unlocked ? (
        <strong className="collection-card-count">{formatCopy(copy.copyCount, { count })}</strong>
      ) : (
        <span className="collection-card-lock">{copy.locked}</span>
      )}
    </article>
  );
}

function OpenedCardTile({ result, locale, copy }) {
  const imageSrc = getCollectionImage(result.card, locale);
  const cardName = getCardName(result.card, locale);

  return (
    <article className={`collection-opened-card ${result.isNew ? "is-new" : "is-copy"}`}>
      <span className="collection-opened-badge">{result.isNew ? copy.newCard : copy.repeatedCard}</span>
      <div className="collection-opened-image">
        {imageSrc ? <img src={imageSrc} alt={cardName} /> : <span>{copy.noImage}</span>}
      </div>
      <h3>{cardName}</h3>
      <p>{translateCardRarity(result.card.rarity, locale)}</p>
      {!result.isNew ? <strong>{formatCopy(copy.copyCount, { count: result.count })}</strong> : null}
    </article>
  );
}

function BoxOpeningModal({ copy, locale, opening, onClose, onOpenAnother, canOpenAnother }) {
  if (!opening) return null;

  const isReveal = opening.phase === "revealed";
  const newCount = opening.results.filter((result) => result.isNew).length;
  const copyCount = opening.results.length - newCount;

  return (
    <div className="collection-opening-backdrop" role="presentation">
      <section className={`collection-opening-modal ${isReveal ? "is-revealed" : "is-opening"}`} role="dialog" aria-modal="true">
        {!isReveal ? (
          <div className="collection-opening-loading">
            <ArcaneBoxVisual isOpening />
            <h2>{copy.openingTitle}</h2>
            <p>{copy.openingText}</p>
          </div>
        ) : (
          <>
            <header className="collection-opening-head">
              <p>{copy.openingTitle}</p>
              <h2>{copy.revealTitle}</h2>
              <span>{copy.revealText}</span>
              <strong>{formatCopy(copy.openingSummary, { newCount, copyCount })}</strong>
            </header>

            <div className="collection-opening-grid">
              {opening.results.map((result, index) => (
                <OpenedCardTile key={`${result.cardId}-${index}`} result={result} locale={locale} copy={copy} />
              ))}
            </div>

            <div className="collection-opening-actions">
              {canOpenAnother ? (
                <button type="button" className="collection-opening-secondary" onClick={onOpenAnother}>
                  {copy.openAnotherBox}
                </button>
              ) : null}
              <button type="button" className="collection-opening-continue" onClick={onClose}>
                {copy.continue}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function CollectionHub({ cards = [], loading = false, onNavigate }) {
  const { locale } = useLanguage();
  const copy = COPY[locale] ?? COPY.es;
  const [boxCount, setBoxCount] = useState(() => getPackCount(BOX_ID));
  const [collectionStore, setCollectionStore] = useState(() => getCollectionStore());
  const [query, setQuery] = useState("");
  const [ownershipFilter, setOwnershipFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [sortMode, setSortMode] = useState("default");
  const [pageIndex, setPageIndex] = useState(0);
  const [opening, setOpening] = useState(null);

  const eligibleCards = useMemo(() => getEligiblePackCards(cards), [cards]);
  const ownedEntries = collectionStore.cards ?? {};

  const classOptions = useMemo(() => {
    return [...new Set(eligibleCards.map((card) => card.cardClass).filter(Boolean))].sort((a, b) => {
      return translateCardClass(a, locale).localeCompare(translateCardClass(b, locale));
    });
  }, [eligibleCards, locale]);

  const rarityOptions = useMemo(() => {
    return [...new Set(eligibleCards.map((card) => card.rarity).filter(Boolean))].sort((a, b) => {
      return (RARITY_ORDER[a] ?? 9) - (RARITY_ORDER[b] ?? 9);
    });
  }, [eligibleCards]);

  const filteredCards = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    const visibleCards = eligibleCards.filter((card) => {
      const entry = ownedEntries[String(card.id)] ?? ownedEntries[card.id] ?? null;
      const isOwned = Boolean(entry);

      if (ownershipFilter === "owned" && !isOwned) return false;
      if (ownershipFilter === "missing" && isOwned) return false;
      if (classFilter !== "all" && card.cardClass !== classFilter) return false;
      if (rarityFilter !== "all" && card.rarity !== rarityFilter) return false;

      if (!normalizedQuery) return true;

      const haystack = [
        getCardName(card, locale),
        card.name,
        card.nameEn,
        translateCardClass(card.cardClass, locale),
        translateCardRarity(card.rarity, locale),
      ]
        .map(normalizeText)
        .join(" ");

      return haystack.includes(normalizedQuery);
    });

    return sortCollectionCards(visibleCards, locale, sortMode);
  }, [eligibleCards, ownedEntries, ownershipFilter, classFilter, rarityFilter, locale, query, sortMode]);

  const pageCount = Math.max(1, Math.ceil(filteredCards.length / PAGE_SIZE));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const currentPageCards = filteredCards.slice(safePageIndex * PAGE_SIZE, safePageIndex * PAGE_SIZE + PAGE_SIZE);

  const uniqueOwned = Object.values(ownedEntries).filter(Boolean).length;
  const totalCopies = Object.values(ownedEntries).reduce((total, entry) => total + (Number(entry?.count) || 0), 0);
  const totalCards = eligibleCards.length;
  const progressPercent = totalCards > 0 ? Math.round((uniqueOwned / totalCards) * 100) : 0;

  useEffect(() => {
    setPageIndex(0);
  }, [query, ownershipFilter, classFilter, rarityFilter, sortMode, eligibleCards.length]);

  useEffect(() => {
    function syncStores() {
      setBoxCount(getPackCount(BOX_ID));
      setCollectionStore(getCollectionStore());
    }

    syncStores();
    window.addEventListener(REWARDS_UPDATED_EVENT, syncStores);
    window.addEventListener(COLLECTION_UPDATED_EVENT, syncStores);
    window.addEventListener("storage", syncStores);
    window.addEventListener("focus", syncStores);

    return () => {
      window.removeEventListener(REWARDS_UPDATED_EVENT, syncStores);
      window.removeEventListener(COLLECTION_UPDATED_EVENT, syncStores);
      window.removeEventListener("storage", syncStores);
      window.removeEventListener("focus", syncStores);
    };
  }, []);

  function openBox() {
    if (loading || boxCount <= 0 || opening?.phase === "opening") return;

    const consumeResult = consumePackReward({ packId: BOX_ID, amount: 1, source: "collection" });
    if (!consumeResult.ok) return;

    const openedCards = openCardPack(cards);
    const collectionResult = addCardsToCollection(openedCards, { packId: BOX_ID, source: "collection" });

    setBoxCount(getPackCount(BOX_ID));
    setCollectionStore(getCollectionStore());
    setOpening({ phase: "opening", results: collectionResult.results });

    window.setTimeout(() => {
      setOpening({ phase: "revealed", results: collectionResult.results });
    }, 1050);
  }

  function handleOpenAnotherBox() {
    setOpening(null);
    window.setTimeout(openBox, 80);
  }

  function goToPreviousPage() {
    setPageIndex((current) => Math.max(0, current - 1));
  }

  function goToNextPage() {
    setPageIndex((current) => Math.min(pageCount - 1, current + 1));
  }

  return (
    <main className="collection-page">
      <div className="collection-bg" aria-hidden="true">
        <span className="collection-glow collection-glow-a" />
        <span className="collection-glow collection-glow-b" />
      </div>

      <CollectionHeader copy={copy} onNavigate={onNavigate} />

      <section className="collection-shell">
        <header className="collection-hero">
          <p>{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <span>{copy.subtitle}</span>
        </header>

        <section className="collection-dashboard">
          <article className="collection-box-panel">
            <ArcaneBoxVisual />
            <div className="collection-box-copy">
              <span>{copy.boxes}</span>
              <strong>{boxCount}</strong>
              <p>{copy.boxHint}</p>
              <button type="button" onClick={openBox} disabled={loading || boxCount <= 0 || Boolean(opening)}>
                {boxCount > 0 ? copy.openBox : copy.noBoxes}
              </button>
            </div>
          </article>

          <article className="collection-progress-panel">
            <span>{copy.collectionProgress}</span>
            <strong>{progressPercent}%</strong>
            <div className="collection-progress-bar" aria-hidden="true">
              <span style={{ width: `${Math.min(100, progressPercent)}%` }} />
            </div>
            <p>
              <b>{uniqueOwned}</b> / {totalCards || "..."} {copy.uniqueCards}
            </p>
            <p>
              <b>{totalCopies}</b> {copy.totalCopies}
            </p>
          </article>
        </section>

        <section className="collection-browser">
          <div className="collection-browser-head">
            <div>
              <p>{copy.collectionDisplay}</p>
              <h2>{copy.collectionProgress}</h2>
              <span>{formatCopy(copy.showing, { count: filteredCards.length, total: totalCards })}</span>
            </div>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.searchPlaceholder}
              aria-label={copy.searchPlaceholder}
            />
          </div>

          <div className="collection-filters" aria-label={copy.filters}>
            <div className="collection-filter-pills">
              <button type="button" className={ownershipFilter === "all" ? "is-active" : ""} onClick={() => setOwnershipFilter("all")}>
                {copy.ownershipAll}
              </button>
              <button type="button" className={ownershipFilter === "owned" ? "is-active" : ""} onClick={() => setOwnershipFilter("owned")}>
                {copy.ownershipOwned}
              </button>
              <button type="button" className={ownershipFilter === "missing" ? "is-active" : ""} onClick={() => setOwnershipFilter("missing")}>
                {copy.ownershipMissing}
              </button>
            </div>

            <div className="collection-filter-selects">
              <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
                <option value="all">{copy.allClasses}</option>
                {classOptions.map((cardClass) => (
                  <option key={cardClass} value={cardClass}>{translateCardClass(cardClass, locale)}</option>
                ))}
              </select>

              <select value={rarityFilter} onChange={(event) => setRarityFilter(event.target.value)}>
                <option value="all">{copy.allRarities}</option>
                {rarityOptions.map((rarity) => (
                  <option key={rarity} value={rarity}>{translateCardRarity(rarity, locale)}</option>
                ))}
              </select>

              <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
                <option value="default">{copy.sortDefault}</option>
                <option value="name">{copy.sortName}</option>
                <option value="cost">{copy.sortCost}</option>
                <option value="rarity">{copy.sortRarity}</option>
              </select>
            </div>
          </div>

          <div className="collection-page-controls">
            <button type="button" onClick={goToPreviousPage} disabled={safePageIndex === 0}>
              ← {copy.previous}
            </button>
            <span>
              {copy.page} {safePageIndex + 1} / {pageCount}
            </span>
            <button type="button" onClick={goToNextPage} disabled={safePageIndex >= pageCount - 1}>
              {copy.next} →
            </button>
          </div>

          <div className="collection-card-viewport">
            {loading ? (
              <p className="collection-empty-note">{copy.loading}</p>
            ) : currentPageCards.length > 0 ? (
              <div className="collection-card-page" key={`${safePageIndex}-${query}-${ownershipFilter}-${classFilter}-${rarityFilter}-${sortMode}`}>
                {currentPageCards.map((card) => {
                  const entry = ownedEntries[String(card.id)] ?? ownedEntries[card.id] ?? null;
                  return <CollectionCardTile key={card.id} card={card} entry={entry} locale={locale} copy={copy} />;
                })}
              </div>
            ) : (
              <p className="collection-empty-note">{copy.noMatches}</p>
            )}
          </div>
        </section>
      </section>

      <BoxOpeningModal
        copy={copy}
        locale={locale}
        opening={opening}
        onClose={() => setOpening(null)}
        onOpenAnother={handleOpenAnotherBox}
        canOpenAnother={boxCount > 0}
      />
    </main>
  );
}

export default CollectionHub;
