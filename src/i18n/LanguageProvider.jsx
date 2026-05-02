import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LOCALE, normalizeLocale, translate } from "./translations";

const STORAGE_KEY = "hs-minijuegos-locale";

const LanguageContext = createContext({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key) => translate(DEFAULT_LOCALE, key),
});

function getInitialLocale() {
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  const savedLocale = window.localStorage.getItem(STORAGE_KEY);
  if (savedLocale) return normalizeLocale(savedLocale);

  const browserLocale = window.navigator?.language?.toLowerCase();
  if (browserLocale?.startsWith("en")) return "en";

  return DEFAULT_LOCALE;
}

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(getInitialLocale);

  const setLocale = (nextLocale) => {
    setLocaleState(normalizeLocale(nextLocale));
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, locale);
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const value = useMemo(() => {
    return {
      locale,
      setLocale,
      t: (key) => translate(locale, key),
    };
  }, [locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
