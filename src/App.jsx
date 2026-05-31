import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useCardsData } from "./hooks/useCardsData";
import { useLanguage } from "./i18n/LanguageProvider";
import SiteHeader from "./shared/components/SiteHeader/SiteHeader";
import DailyRolloverNotice from "./shared/components/DailyRolloverNotice/DailyRolloverNotice";
import WelcomeModal from "./shared/components/WelcomeModal/WelcomeModal";
import { useDailyRollover } from "./shared/hooks/useDailyRollover";
import "./App.css";
import "./styles/hearthdleButtons.css";
import "./styles/hearthdleInputs.css";

const HomePage = lazy(() => import("./pages/HomePage"));
const GuessManaPage = lazy(() => import("./pages/GuessManaPage"));
const ImpostorPage = lazy(() => import("./pages/ImpostorPage"));
const CardGridPage = lazy(() => import("./pages/CardGridPage"));
const PyramidPage = lazy(() => import("./pages/PyramidPage"));
const HigherLowerPage = lazy(() => import("./pages/HigherLowerPage"));
const HiddenCardPage = lazy(() => import("./pages/HiddenCardPage"));
const CollectionPage = lazy(() => import("./pages/CollectionPage"));
const PlayerProfilePage = lazy(() => import("./pages/PlayerProfilePage"));

const APP_ROUTES = {
  "/": "home",
  "/guess-mana": "guessMana",
  "/impostor": "impostor",
  "/grid": "grid",
  "/pyramid": "pyramid",
  "/higher-lower": "higherLower",
  "/hidden-card": "hiddenCard",
  "/collection": "collection",
  "/player": "player",
};

const FIT_SCREEN_ROUTES = new Set([
  "/",
  "/guess-mana",
  "/impostor",
  "/grid",
  "/pyramid",
  "/higher-lower",
  "/hidden-card",
]);

function normalizePath(pathname) {
  const path = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
  return APP_ROUTES[path] ? path : "/";
}

function AppRouteFallback() {
  return (
    <main className="app-route-loading" aria-live="polite" aria-busy="true">
      <div className="app-route-loading__card">
        <span className="app-route-loading__spinner" aria-hidden="true" />
        <p>Cargando...</p>
      </div>
    </main>
  );
}

function App() {
  const { cards, loading } = useCardsData();
  const { locale } = useLanguage();
  const {
    dateKey: dailyDateKey,
    notice: dailyRolloverNotice,
    dismissNotice: dismissDailyRolloverNotice,
  } = useDailyRollover();
  const [pathname, setPathname] = useState(() => normalizePath(window.location.pathname));
  const isFitScreenRoute = FIT_SCREEN_ROUTES.has(pathname);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Automatically show instructions only on homepage on first visit
    if (window.location.pathname === "/" && localStorage.getItem("hearthdle_hide_welcome") !== "true") {
      setShowWelcome(true);
    }
  }, []);

  useEffect(() => {
    function syncPathname() {
      setPathname(normalizePath(window.location.pathname));
    }

    window.addEventListener("popstate", syncPathname);

    return () => {
      window.removeEventListener("popstate", syncPathname);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("is-fit-screen-route", isFitScreenRoute);
    document.body.classList.toggle("is-fit-screen-route", isFitScreenRoute);

    return () => {
      document.documentElement.classList.remove("is-fit-screen-route");
      document.body.classList.remove("is-fit-screen-route");
    };
  }, [isFitScreenRoute]);

  const navigate = useCallback((path) => {
    const nextPath = normalizePath(path);

    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }

    setPathname(nextPath);
  }, []);

  const goHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  if (loading) {
    const loadingText = locale === "en" ? "Loading tavern cards..." : "Cargando cartas de la taberna...";
    return (
      <div className={`app-shell route-${APP_ROUTES[pathname]} ${isFitScreenRoute ? "is-fit-screen-route" : ""}`}>
        <SiteHeader pathname={pathname} onNavigate={navigate} onShowWelcome={() => setShowWelcome(true)} />
        <main className="app-route-loading" aria-live="polite" aria-busy="true">
          <div className="app-route-loading__card">
            <span className="app-route-loading__spinner" aria-hidden="true" />
            <p>{loadingText}</p>
          </div>
        </main>
      </div>
    );
  }

  let page;

  switch (pathname) {
    case "/guess-mana":
      page = <GuessManaPage cards={cards} onBack={goHome} />;
      break;

    case "/impostor":
      page = <ImpostorPage cards={cards} onBack={goHome} />;
      break;

    case "/grid":
      page = <CardGridPage cards={cards} onBack={goHome} />;
      break;

    case "/pyramid":
      page = <PyramidPage cards={cards} onBack={goHome} />;
      break;

    case "/higher-lower":
      page = <HigherLowerPage cards={cards} onBack={goHome} />;
      break;

    case "/hidden-card":
      page = <HiddenCardPage cards={cards} onBack={goHome} />;
      break;



    case "/collection":
      page = <CollectionPage cards={cards} loading={loading} />;
      break;

    case "/player":
      page = <PlayerProfilePage cards={cards} loading={loading} />;
      break;

    default:
      page = <HomePage cards={cards} loading={loading} onNavigate={navigate} />;
  }

  return (
    <div className={`app-shell route-${APP_ROUTES[pathname]} ${isFitScreenRoute ? "is-fit-screen-route" : ""}`}>
      <SiteHeader pathname={pathname} onNavigate={navigate} onShowWelcome={() => setShowWelcome(true)} />
      <div className="app-page" key={dailyDateKey}>
        <Suspense fallback={<AppRouteFallback />}>{page}</Suspense>
      </div>
      <DailyRolloverNotice notice={dailyRolloverNotice} onDismiss={dismissDailyRolloverNotice} />
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
    </div>
  );
}

export default App;
