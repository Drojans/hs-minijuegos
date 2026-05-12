import { useEffect, useState } from "react";
import { dedupeCardsByIdentity } from "../shared/cards/cardIdentity";
import { migrateCollectionCardAliases } from "../shared/collection/collectionStore";

const CARDS_URL = "/data/cards.multilang.generated.json";

export function useCardsData() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCards() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(CARDS_URL);

        if (!response.ok) {
          throw new Error(`No se pudo cargar ${CARDS_URL} (${response.status})`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error(`${CARDS_URL} no contiene un array de cartas.`);
        }

        const uniqueCards = dedupeCardsByIdentity(data);
        migrateCollectionCardAliases(uniqueCards);

        if (!cancelled) {
          setCards(uniqueCards);
        }
      } catch (loadError) {
        if (!cancelled) {
          console.error("Error cargando cartas:", loadError);
          setError(loadError);
          setCards([]);
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

  return { cards, loading, error };
}

