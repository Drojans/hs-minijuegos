import { useCallback, useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import GuessManaPage from "./pages/GuessManaPage";
import ImpostorPage from "./pages/ImpostorPage";
import CardGridPage from "./pages/CardGridPage";
import PyramidPage from "./pages/PyramidPage";
import CardDatabasePage from "./pages/CardDatabasePage";
import CollectionPage from "./pages/CollectionPage";
import PlayerProfilePage from "./pages/PlayerProfilePage";
import { useCardsData } from "./hooks/useCardsData";
import "./App.css";

const APP_ROUTES = {
  "/": "home",
  "/guess-mana": "guessMana",
  "/impostor": "impostor",
  "/grid": "grid",
  "/pyramid": "pyramid",
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

  switch (pathname) {
    case "/guess-mana":
      return <GuessManaPage cards={cards} onBack={goHome} />;

    case "/impostor":
      return <ImpostorPage cards={cards} onBack={goHome} />;

    case "/grid":
      return <CardGridPage cards={cards} onBack={goHome} />;

    case "/pyramid":
      return <PyramidPage cards={cards} onBack={goHome} />;

    case "/cards":
      return <CardDatabasePage cards={cards} loading={loading} onNavigate={navigate} onBack={goHome} />;

    case "/collection":
      return <CollectionPage cards={cards} loading={loading} onNavigate={navigate} />;

    case "/player":
      return <PlayerProfilePage cards={cards} loading={loading} onNavigate={navigate} />;

    default:
      return <HomePage cards={cards} loading={loading} onNavigate={navigate} />;
  }
}

export default App;
