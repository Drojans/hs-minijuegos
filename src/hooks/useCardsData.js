import { useEffect, useMemo, useState } from "react";
import { mergeLocaleImages } from "../utils/cardLocale";

function buildPreviewImagesMap(data) {
  const imagesMap = new Map();

  if (!Array.isArray(data)) return imagesMap;

  data.forEach((card) => {
    if (card?.id && card.imagesByLocale) {
      imagesMap.set(card.id, card.imagesByLocale);
    }
  });

  return imagesMap;
}

export function useCardsData() {
  const [baseCards, setBaseCards] = useState([]);
  const [previewImagesById, setPreviewImagesById] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCards() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/data/cards.json");
        if (!response.ok) {
          throw new Error(`No se pudo cargar /data/cards.json (${response.status})`);
        }

        const data = await response.json();

        if (!cancelled) {
          setBaseCards(Array.isArray(data) ? data : []);
        }
      } catch (loadError) {
        if (!cancelled) {
          console.error("Error cargando cartas:", loadError);
          setError(loadError);
          setBaseCards([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    async function loadPreviewImages() {
      try {
        const response = await fetch("/data/cards.multilang.preview.json");
        if (!response.ok) {
          throw new Error("Preview multiidioma no disponible.");
        }

        const data = await response.json();

        if (!cancelled) {
          setPreviewImagesById(buildPreviewImagesMap(data));
        }
      } catch {
        // Es normal que este archivo no exista si no estamos probando multiidioma.
        if (!cancelled) {
          setPreviewImagesById(new Map());
        }
      }
    }

    loadCards();
    loadPreviewImages();

    return () => {
      cancelled = true;
    };
  }, []);

  const cards = useMemo(() => {
    return mergeLocaleImages(baseCards, previewImagesById);
  }, [baseCards, previewImagesById]);

  return {
    cards,
    baseCards,
    previewImagesById,
    loading,
    error,
  };
}
