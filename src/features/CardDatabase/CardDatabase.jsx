import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../i18n/LanguageProvider";
import {
  getCardName,
  getCardText,
  getDetailImage,
  getSecondaryCardName,
  getThumbImage,
  translateCardClass,
  translateCardRarity,
  translateCardType,
} from "../../utils/cardLocale";
import "./CardDatabase.css";

const CLASS_ORDER = [
  "DEATHKNIGHT",
  "DEMONHUNTER",
  "DRUID",
  "HUNTER",
  "MAGE",
  "PALADIN",
  "PRIEST",
  "ROGUE",
  "SHAMAN",
  "WARLOCK",
  "WARRIOR",
  "NEUTRAL",
];

const TYPE_ORDER = ["MINION", "SPELL", "WEAPON", "LOCATION", "HERO"];
const RARITY_ORDER = ["FREE", "COMMON", "RARE", "EPIC", "LEGENDARY"];
const COST_OPTIONS = ["ALL", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"];

function CardDatabase({ cards, loading, onBack }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [classFilter, setClassFilter] = useState("ALL");
  const [rarityFilter, setRarityFilter] = useState("ALL");
  const [costFilter, setCostFilter] = useState("ALL");
  const [selectedCard, setSelectedCard] = useState(null);
  const { locale, t } = useLanguage();

  const availableClasses = useMemo(() => {
    const values = new Set(cards.map((card) => card.cardClass).filter(Boolean));
    return CLASS_ORDER.filter((cardClass) => values.has(cardClass));
  }, [cards]);

  const availableTypes = useMemo(() => {
    const values = new Set(cards.map((card) => card.type).filter(Boolean));
    return TYPE_ORDER.filter((type) => values.has(type));
  }, [cards]);

  const availableRarities = useMemo(() => {
    const values = new Set(cards.map((card) => card.rarity).filter(Boolean));
    return RARITY_ORDER.filter((rarity) => values.has(rarity));
  }, [cards]);

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const searchText = `${card.name ?? ""} ${card.nameEn ?? ""} ${card.text ?? ""} ${card.textEn ?? ""}`;
      const matchesSearch = searchText.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "ALL" || card.type === typeFilter;
      const matchesClass = classFilter === "ALL" || card.cardClass === classFilter;
      const matchesRarity = rarityFilter === "ALL" || card.rarity === rarityFilter;
      const matchesCost =
        costFilter === "ALL" ||
        (costFilter === "10+" ? typeof card.cost === "number" && card.cost >= 10 : card.cost === Number(costFilter));

      return matchesSearch && matchesType && matchesClass && matchesRarity && matchesCost;
    });
  }, [cards, search, typeFilter, classFilter, rarityFilter, costFilter]);

  const visibleCards = filteredCards.slice(0, 60);

  useEffect(() => {
    if (!selectedCard) return;
    const stillVisible = filteredCards.some((card) => card.id === selectedCard.id);
    if (!stillVisible) setSelectedCard(null);
  }, [filteredCards, selectedCard]);

  function clearFilters() {
    setSearch("");
    setTypeFilter("ALL");
    setClassFilter("ALL");
    setRarityFilter("ALL");
    setCostFilter("ALL");
  }

  return (
    <main className="cb-page">
      <header className="cb-hero">
        <button className="cb-back-button" onClick={onBack}>â† Inicio</button>

        <div className="cb-hero-copy">
          <p>Archivo de cartas</p>
          <h1>Base de datos</h1>
          <span>Explora tus cartas, filtra y abre cualquier carta para verla en grande.</span>
        </div>

        <div className="cb-counter">
          <span>{loading ? t("common.loading") : t("common.cards")}</span>
          <strong>{loading ? "..." : cards.length}</strong>
        </div>
      </header>

      <section className="cb-layout">
        <div className="cb-main-panel">
          <div className="cb-filter-grid">
            <label className="cb-field cb-search-field">
              <span>Buscar</span>
              <input
                type="text"
                placeholder="Nombre, texto o nombre inglÃ©s..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <label className="cb-field cb-field-type">
              <span>Tipo</span>
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option value="ALL">Todos</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>{translateCardType(type, locale)}</option>
                ))}
              </select>
            </label>

            <label className="cb-field cb-field-class">
              <span>Clase</span>
              <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
                <option value="ALL">Todas</option>
                {availableClasses.map((cardClass) => (
                  <option key={cardClass} value={cardClass}>{translateCardClass(cardClass, locale)}</option>
                ))}
              </select>
            </label>

            <label className="cb-field cb-field-rarity">
              <span>Rareza</span>
              <select value={rarityFilter} onChange={(event) => setRarityFilter(event.target.value)}>
                <option value="ALL">Todas</option>
                {availableRarities.map((rarity) => (
                  <option key={rarity} value={rarity}>{translateCardRarity(rarity, locale)}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="cb-cost-row">
            {COST_OPTIONS.map((cost) => (
              <button
                key={cost}
                className={`cb-cost-chip ${costFilter === cost ? "is-active" : ""}`}
                onClick={() => setCostFilter(cost)}
              >
                {cost === "ALL" ? "Todos" : cost}
              </button>
            ))}
          </div>

          <div className="cb-results-row">
            <p>Mostrando <strong>{visibleCards.length}</strong> de <strong>{filteredCards.length}</strong> resultados</p>
            <button className="cb-clear-button" onClick={clearFilters}>Limpiar filtros</button>
          </div>

          <div className="cb-card-grid">
            {visibleCards.map((card) => (
              <button
                type="button"
                className={`cb-card-tile ${selectedCard?.id === card.id ? "is-selected" : ""}`}
                key={card.id}
                onClick={() => setSelectedCard(card)}
              >
                <CardThumb card={card} locale={locale} />
                <div className="cb-card-caption">
                  <strong>{getCardName(card, locale)}</strong>
                  <span>{translateCardType(card.type, locale)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <CardDetailPanel card={selectedCard} locale={locale} t={t} onClose={() => setSelectedCard(null)} />
      </section>
    </main>
  );
}

function CardThumb({ card, locale }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const src = getThumbImage(card, locale);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [src]);

  return (
    <div className={`cb-thumb ${loaded ? "is-loaded" : ""} ${failed ? "is-failed" : ""}`}>
      {!loaded && !failed && <span className="cb-image-placeholder">Cargando</span>}
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
        <span className="cb-image-placeholder">Sin imagen</span>
      )}
    </div>
  );
}

function CardLargeImage({ card, locale }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const src = getDetailImage(card, locale);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [src]);

  return (
    <div className={`cb-detail-image ${loaded ? "is-loaded" : ""} ${failed ? "is-failed" : ""}`}>
      {!loaded && !failed && <span>Preparando carta...</span>}
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
        <span>Imagen no disponible</span>
      )}
    </div>
  );
}

function CardDetailPanel({ card, locale, t, onClose }) {
  if (!card) {
    return (
      <aside className="cb-detail-panel cb-detail-empty">
        <div className="cb-empty-orb">+</div>
        <h2>Selecciona una carta</h2>
        <p>Haz click en cualquier carta del archivo para abrir su ficha ampliada.</p>
      </aside>
    );
  }

  return (
    <aside className="cb-detail-panel">
      <button className="cb-detail-close" onClick={onClose} aria-label="Cerrar detalle">Ã—</button>
      <CardLargeImage card={card} locale={locale} />

      <div className="cb-detail-info">
        <p className="cb-detail-kicker">{t("database.cardDetail")} Â· {locale.toUpperCase()}</p>
        <h2>{getCardName(card, locale)}</h2>
        {getSecondaryCardName(card, locale) && <p className="cb-detail-english">{getSecondaryCardName(card, locale)}</p>}

        <div className="cb-detail-tags">
          <span>{translateCardClass(card.cardClass, locale)}</span>
          <span>{translateCardType(card.type, locale)}</span>
          <span>{translateCardRarity(card.rarity, locale)}</span>
        </div>

        <div className="cb-detail-stats">
          <div><span>Coste</span><strong>{card.cost ?? "?"}</strong></div>
          <div><span>Ataque</span><strong>{card.attack ?? "â€”"}</strong></div>
          <div><span>Vida</span><strong>{card.health ?? "â€”"}</strong></div>
        </div>

        <div className="cb-detail-text">
          <span>Texto</span>
          <p>{getCardText(card, locale) || t("database.noText")}</p>
        </div>

        <dl className="cb-detail-meta">
          <div><dt>Set</dt><dd>{card.set ?? "â€”"}</dd></div>
          <div><dt>ID</dt><dd>{card.id ?? "â€”"}</dd></div>
        </dl>
      </div>
    </aside>
  );
}

export default CardDatabase;

