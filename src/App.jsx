import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useCardsData } from "./hooks/useCardsData";
import SiteHeader from "./shared/components/SiteHeader/SiteHeader";
import DailyRolloverNotice from "./shared/components/DailyRolloverNotice/DailyRolloverNotice";
import { useDailyRollover } from "./shared/hooks/useDailyRollover";
import "./App.css";

const HomePage = lazy(() => import("./pages/HomePage"));
const GuessManaPage = lazy(() => import("./pages/GuessManaPage"));
const ImpostorPage = lazy(() => import("./pages/ImpostorPage"));
const CardGridPage = lazy(() => import("./pages/CardGridPage"));
const PyramidPage = lazy(() => import("./pages/PyramidPage"));
const HigherLowerPage = lazy(() => import("./pages/HigherLowerPage"));
const HiddenCardPage = lazy(() => import("./pages/HiddenCardPage"));
const CardDatabasePage = lazy(() => import("./pages/CardDatabasePage"));
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
  "/cards": "cards",
  "/collection": "collection",
  "/player": "player",
};

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
  const {
    dateKey: dailyDateKey,
    notice: dailyRolloverNotice,
    dismissNotice: dismissDailyRolloverNotice,
  } = useDailyRollover();
  const [pathname, setPathname] = useState(() => normalizePath(window.location.pathname));

  useEffect(() => {
    function syncPathname() {
      setPathname(normalizePath(window.location.pathname));
    }

    window.addEventListener("popstate", syncPathname);

    return () => {
      window.removeEventListener("popstate", syncPathname);
    };
  }, []);

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

    case "/cards":
      page = <CardDatabasePage cards={cards} loading={loading} />;
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
    <div className="app-shell">
      <SiteHeader pathname={pathname} onNavigate={navigate} />
      <div className="app-page" key={dailyDateKey}>
        <Suspense fallback={<AppRouteFallback />}>{page}</Suspense>
      </div>
      <DailyRolloverNotice notice={dailyRolloverNotice} onDismiss={dismissDailyRolloverNotice} />
    </div>
  );
}

export default App;
