import { useDeferredValue, useEffect, useMemo, useState } from "react";
import "./CardBrowser.css";

const CLASS_LABELS = {
  DEATHKNIGHT: "Caballero de la Muerte",
  DEMONHUNTER: "Cazador de Demonios",
  DRUID: "Druida",
  HUNTER: "Cazador",
  MAGE: "Mago",
  PALADIN: "Paladín",
  PRIEST: "Sacerdote",
  ROGUE: "Pícaro",
  SHAMAN: "Chamán",
  WARLOCK: "Brujo",
  WARRIOR: "Guerrero",
  NEUTRAL: "Neutral",
};

const TYPE_LABELS = {
  MINION: "Esbirro",
  SPELL: "Hechizo",
  WEAPON: "Arma",
  HERO: "Héroe",
  HERO_POWER: "Poder de héroe",
  LOCATION: "Lugar",
};

const RARITY_LABELS = {
  FREE: "Gratis",
  COMMON: "Común",
  RARE: "Rara",
  EPIC: "Épica",
  LEGENDARY: "Legendaria",
};

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
const INITIAL_VISIBLE_COUNT = 24;
const LOAD_MORE_COUNT = 24;
const THUMB_PRELOAD_COUNT = 12;

const PRELOADED_BROWSER_IMAGES = new Set();
const LOADED_BROWSER_IMAGES = new Set();

function translateCardClass(value) {
  return CLASS_LABELS[value] ?? value ?? "Desconocida";
}

function translateType(value) {
  return TYPE_LABELS[value] ?? value ?? "Desconocido";
}

function translateRarity(value) {
  return RARITY_LABELS[value] ?? value ?? "Sin rareza";
}

function getOppositeLocale(locale) {
  return locale === "en" ? "es" : "en";
}

function getCardImage(card, imageType, locale = "es") {
  if (!card) return "";

  const localized =
    card.imagesByLocale?.[locale]?.[imageType] ||
    card.imagesByLocale?.[getOppositeLocale(locale)]?.[imageType];

  if (localized) return localized;

  if (card[imageType]) return card[imageType];

  if (imageType === "imageThumb") {
    return card.imageGame || card.image || card.imageRenderNormalized || "";
  }

  if (imageType === "imageGame") {
    return card.imageThumb || card.image || card.imageRenderNormalized || "";
  }

  if (imageType === "imageRenderNormalized") {
    return card.imageDetail || card.imageGame || card.image || card.imageThumb || "";
  }

  return card.imageGame || card.imageThumb || card.image || card.imageRenderNormalized || "";
}

function getThumbImage(card, locale = "es") {
  // La base de datos muestra muchas cartas a la vez: aquí conviene usar miniaturas.
  return getCardImage(card, "imageThumb", locale);
}

function getDetailImage(card, locale = "es") {
  // En el detalle usamos el render normalizado si existe.
  return getCardImage(card, "imageRenderNormalized", locale);
}

function getCardName(card, locale = "es") {
  if (!card) return "";
  return locale === "en"
    ? card.nameEn || card.name || ""
    : card.name || card.nameEn || "";
}

function getSecondaryCardName(card, locale = "es") {
  if (!card) return "";

  if (locale === "en") {
    return card.name && card.name !== card.nameEn ? card.name : "";
  }

  return card.nameEn && card.nameEn !== card.name ? card.nameEn : "";
}

function getCardText(card, locale = "es") {
  if (!card) return "";
  return locale === "en"
    ? card.textEn || card.text || ""
    : card.text || card.textEn || "";
}

function mergePreviewLocaleImages(cards, previewImagesById) {
  if (!previewImagesById.size) return cards;

  return cards.map((card) => {
    const previewImages = previewImagesById.get(card.id);
    if (!previewImages) return card;

    return {
      ...card,
      imagesByLocale: {
        ...(card.imagesByLocale ?? {}),
        ...previewImages,
      },
      multilangPreview: true,
    };
  });
}

function preloadBrowserImage(src) {
  if (!src || typeof window === "undefined" || PRELOADED_BROWSER_IMAGES.has(src)) return;

  PRELOADED_BROWSER_IMAGES.add(src);

  const image = new window.Image();
  image.decoding = "async";

  if ("fetchPriority" in image) {
    image.fetchPriority = "low";
  }

  image.onload = () => LOADED_BROWSER_IMAGES.add(src);
  image.src = src;
}

function CardBrowser({ cards, loading, onBack }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [classFilter, setClassFilter] = useState("ALL");
  const [rarityFilter, setRarityFilter] = useState("ALL");
  const [costFilter, setCostFilter] = useState("ALL");
  const [selectedCard, setSelectedCard] = useState(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [locale, setLocale] = useState("es");
  const [previewImagesById, setPreviewImagesById] = useState(new Map());
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  useEffect(() => {
    let cancelled = false;

    fetch("/data/cards.multilang.preview.json")
      .then((response) => {
        if (!response.ok) throw new Error("Preview multiidioma no disponible.");
        return response.json();
      })
      .then((data) => {
        if (cancelled || !Array.isArray(data)) return;

        const imagesMap = new Map();

        data.forEach((card) => {
          if (card?.id && card.imagesByLocale) {
            imagesMap.set(card.id, card.imagesByLocale);
          }
        });

        setPreviewImagesById(imagesMap);
      })
      .catch(() => {
        // Es normal que este archivo no exista cuando no estamos probando multiidioma.
        setPreviewImagesById(new Map());
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const displayCards = useMemo(() => {
    return mergePreviewLocaleImages(cards, previewImagesById);
  }, [cards, previewImagesById]);

  const searchIndexById = useMemo(() => {
    const index = new Map();

    displayCards.forEach((card) => {
      index.set(
        card.id,
        `${card.name ?? ""} ${card.nameEn ?? ""} ${card.text ?? ""} ${card.textEn ?? ""}`.toLowerCase()
      );
    });

    return index;
  }, [displayCards]);

  const availableClasses = useMemo(() => {
    const values = new Set(displayCards.map((card) => card.cardClass).filter(Boolean));
    return CLASS_ORDER.filter((cardClass) => values.has(cardClass));
  }, [displayCards]);

  const availableTypes = useMemo(() => {
    const values = new Set(displayCards.map((card) => card.type).filter(Boolean));
    return TYPE_ORDER.filter((type) => values.has(type));
  }, [displayCards]);

  const availableRarities = useMemo(() => {
    const values = new Set(displayCards.map((card) => card.rarity).filter(Boolean));
    return RARITY_ORDER.filter((rarity) => values.has(rarity));
  }, [displayCards]);

  const filteredCards = useMemo(() => {
    return displayCards.filter((card) => {
      const matchesSearch = !deferredSearch || (searchIndexById.get(card.id) ?? "").includes(deferredSearch);
      const matchesType = typeFilter === "ALL" || card.type === typeFilter;
      const matchesClass = classFilter === "ALL" || card.cardClass === classFilter;
      const matchesRarity = rarityFilter === "ALL" || card.rarity === rarityFilter;
      const matchesCost =
        costFilter === "ALL" ||
        (costFilter === "10+" ? typeof card.cost === "number" && card.cost >= 10 : card.cost === Number(costFilter));

      return matchesSearch && matchesType && matchesClass && matchesRarity && matchesCost;
    });
  }, [displayCards, deferredSearch, searchIndexById, typeFilter, classFilter, rarityFilter, costFilter]);

  const visibleCards = filteredCards.slice(0, visibleCount);
  const hasMoreCards = visibleCount < filteredCards.length;

  useEffect(() => {
    if (!selectedCard) return;
    const stillVisible = filteredCards.some((card) => card.id === selectedCard.id);
    if (!stillVisible) setSelectedCard(null);
  }, [filteredCards, selectedCard]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [deferredSearch, typeFilter, classFilter, rarityFilter, costFilter]);

  useEffect(() => {
    visibleCards.slice(0, THUMB_PRELOAD_COUNT).forEach((card) => {
      preloadBrowserImage(getThumbImage(card, locale));
    });
  }, [visibleCards, locale]);

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
        <button className="cb-back-button" onClick={onBack}>← Inicio</button>

        <div className="cb-hero-copy">
          <p>Archivo de cartas</p>
          <h1>Base de datos</h1>
          <span>Explora tus cartas, filtra y abre cualquier carta para verla en grande.</span>
        </div>

        <div className="cb-locale-switch" aria-label="Idioma de cartas">
          <span>Idioma</span>
          <div>
            <button
              type="button"
              className={locale === "es" ? "is-active" : ""}
              onClick={() => setLocale("es")}
            >
              ES
            </button>
            <button
              type="button"
              className={locale === "en" ? "is-active" : ""}
              onClick={() => setLocale("en")}
            >
              EN
            </button>
          </div>
        </div>

        <div className="cb-counter">
          <span>{loading ? "Cargando" : "Cartas"}</span>
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
                placeholder="Nombre, texto o nombre inglés..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <label className="cb-field cb-field-type">
              <span>Tipo</span>
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option value="ALL">Todos</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>{translateType(type)}</option>
                ))}
              </select>
            </label>

            <label className="cb-field cb-field-class">
              <span>Clase</span>
              <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
                <option value="ALL">Todas</option>
                {availableClasses.map((cardClass) => (
                  <option key={cardClass} value={cardClass}>{translateCardClass(cardClass)}</option>
                ))}
              </select>
            </label>

            <label className="cb-field cb-field-rarity">
              <span>Rareza</span>
              <select value={rarityFilter} onChange={(event) => setRarityFilter(event.target.value)}>
                <option value="ALL">Todas</option>
                {availableRarities.map((rarity) => (
                  <option key={rarity} value={rarity}>{translateRarity(rarity)}</option>
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
            {visibleCards.map((card, index) => (
              <button
                type="button"
                className={`cb-card-tile ${selectedCard?.id === card.id ? "is-selected" : ""}`}
                key={card.id}
                onClick={() => setSelectedCard(card)}
              >
                <CardThumb card={card} locale={locale} priority={index < 8} />
                <div className="cb-card-caption">
                  <strong>{getCardName(card, locale)}</strong>
                  <span>{translateType(card.type)}</span>
                </div>
              </button>
            ))}
          </div>

          {hasMoreCards && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
              <button
                className="cb-clear-button"
                onClick={() => setVisibleCount((current) => current + LOAD_MORE_COUNT)}
              >
                Mostrar {Math.min(LOAD_MORE_COUNT, filteredCards.length - visibleCards.length)} más
              </button>
            </div>
          )}
        </div>

        <CardDetailPanel card={selectedCard} locale={locale} onClose={() => setSelectedCard(null)} />
      </section>
    </main>
  );
}

function CardThumb({ card, locale, priority = false }) {
  const src = getThumbImage(card, locale);
  const [loaded, setLoaded] = useState(() => Boolean(src && LOADED_BROWSER_IMAGES.has(src)));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoaded(Boolean(src && LOADED_BROWSER_IMAGES.has(src)));
    setFailed(false);
  }, [src]);

  return (
    <div className={`cb-thumb ${loaded ? "is-loaded" : ""} ${failed ? "is-failed" : ""}`}>
      {!loaded && !failed && <span className="cb-image-placeholder">Cargando</span>}
      {!failed ? (
        <img
          src={src}
          alt={getCardName(card, locale)}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "low"}
          onLoad={() => {
            LOADED_BROWSER_IMAGES.add(src);
            setLoaded(true);
          }}
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

function CardDetailPanel({ card, locale, onClose }) {
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
      <button className="cb-detail-close" onClick={onClose} aria-label="Cerrar detalle">×</button>
      <CardLargeImage card={card} locale={locale} />

      <div className="cb-detail-info">
        <p className="cb-detail-kicker">Detalle de carta · {locale.toUpperCase()}</p>
        <h2>{getCardName(card, locale)}</h2>
        {getSecondaryCardName(card, locale) && (
          <p className="cb-detail-english">{getSecondaryCardName(card, locale)}</p>
        )}

        <div className="cb-detail-tags">
          <span>{translateCardClass(card.cardClass)}</span>
          <span>{translateType(card.type)}</span>
          <span>{translateRarity(card.rarity)}</span>
        </div>

        <div className="cb-detail-stats">
          <div><span>Coste</span><strong>{card.cost ?? "?"}</strong></div>
          <div><span>Ataque</span><strong>{card.attack ?? "—"}</strong></div>
          <div><span>Vida</span><strong>{card.health ?? "—"}</strong></div>
        </div>

        <div className="cb-detail-text">
          <span>Texto</span>
          <p>{getCardText(card, locale) || "Sin texto."}</p>
        </div>

        <dl className="cb-detail-meta">
          <div><dt>Set</dt><dd>{card.set ?? "—"}</dd></div>
          <div><dt>ID</dt><dd>{card.id ?? "—"}</dd></div>
        </dl>
      </div>
    </aside>
  );
}

export default CardBrowser;
