import { useCallback, useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import GuessManaPage from "./pages/GuessManaPage";
import ImpostorPage from "./pages/ImpostorPage";
import CardGridPage from "./pages/CardGridPage";
import PyramidPage from "./pages/PyramidPage";
import HigherLowerPage from "./pages/HigherLowerPage";
import HiddenCardPage from "./pages/HiddenCardPage";
import CardDatabasePage from "./pages/CardDatabasePage";
import CollectionPage from "./pages/CollectionPage";
import PlayerProfilePage from "./pages/PlayerProfilePage";
import { useCardsData } from "./hooks/useCardsData";
import SiteHeader from "./shared/components/SiteHeader/SiteHeader";
import "./App.css";

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

function App() {
  const { cards, loading } = useCardsData();
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
      <div className="app-page">{page}</div>
    </div>
  );
}

export default App;
