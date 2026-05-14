import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LOCALE, normalizeLocale, translate } from "./translations";

export const LANGUAGE_STORAGE_KEY = "hs-minijuegos-locale";
export const LANGUAGE_UPDATED_EVENT = "hs-minijuegos-locale-updated";

const LanguageContext = createContext({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key, values) => translate(DEFAULT_LOCALE, key, values),
});

function readStoredLocale() {
  if (typeof window === "undefined") return null;

  const savedLocale = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return savedLocale ? normalizeLocale(savedLocale) : null;
}

function writeLocale(nextLocale) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLocale);
  document.documentElement.lang = nextLocale;
}

function notifyLocaleUpdated(nextLocale) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(LANGUAGE_UPDATED_EVENT, {
      detail: { locale: nextLocale },
    }),
  );
}

function getInitialLocale() {
  const savedLocale = readStoredLocale();
  if (savedLocale) return savedLocale;

  if (typeof window === "undefined") return DEFAULT_LOCALE;

  const browserLocale = window.navigator?.language?.toLowerCase();
  if (browserLocale?.startsWith("en")) return "en";
  if (browserLocale?.startsWith("es")) return "es";

  return DEFAULT_LOCALE;
}

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(getInitialLocale);

  const setLocale = useCallback((nextLocale) => {
    const safeLocale = normalizeLocale(nextLocale);

    writeLocale(safeLocale);
    setLocaleState(safeLocale);
    notifyLocaleUpdated(safeLocale);
  }, []);

  useEffect(() => {
    writeLocale(locale);
  }, [locale]);

  useEffect(() => {
    function syncLocale(nextLocale) {
      const safeLocale = normalizeLocale(nextLocale);
      setLocaleState((currentLocale) => (currentLocale === safeLocale ? currentLocale : safeLocale));
    }

    function handleStorage(event) {
      if (event.key !== LANGUAGE_STORAGE_KEY) return;
      syncLocale(event.newValue || DEFAULT_LOCALE);
    }

    function handleLocaleUpdated(event) {
      syncLocale(event.detail?.locale || readStoredLocale() || DEFAULT_LOCALE);
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener(LANGUAGE_UPDATED_EVENT, handleLocaleUpdated);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(LANGUAGE_UPDATED_EVENT, handleLocaleUpdated);
    };
  }, []);

  const value = useMemo(() => {
    return {
      locale,
      setLocale,
      t: (key, values) => translate(locale, key, values),
    };
  }, [locale, setLocale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
