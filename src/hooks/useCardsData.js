import { useEffect, useState } from "react";

const MULTILANG_CARDS_URL = "/data/cards.multilang.generated.json";
const LEGACY_CARDS_URL = "/data/cards.json";

export function useCardsData() {
  const [cards, setCards] = useState([]);
  const [baseCards, setBaseCards] = useState([]);
  const [activeCardsSource, setActiveCardsSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchCardsJson(url) {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`No se pudo cargar ${url} (${response.status})`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error(`${url} no contiene un array de cartas.`);
      }

      return data;
    }

    async function loadCards() {
      try {
        setLoading(true);
        setError(null);

        let data;
        let source;

        try {
          data = await fetchCardsJson(MULTILANG_CARDS_URL);
          source = MULTILANG_CARDS_URL;
        } catch (multilangError) {
          console.info("Base multiidioma no disponible; usando cards.json.", multilangError);
          data = await fetchCardsJson(LEGACY_CARDS_URL);
          source = LEGACY_CARDS_URL;
        }

        if (!cancelled) {
          setCards(data);
          setBaseCards(data);
          setActiveCardsSource(source);
        }
      } catch (loadError) {
        if (!cancelled) {
          console.error("Error cargando cartas:", loadError);
          setError(loadError);
          setCards([]);
          setBaseCards([]);
          setActiveCardsSource(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCards();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    cards,
    baseCards,
    activeCardsSource,
    loading,
    error,
  };
}
