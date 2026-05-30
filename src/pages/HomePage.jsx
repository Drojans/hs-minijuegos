import HomeV3 from "../features/HomeV3/HomeV3";

function HomePage({ cards, loading, onNavigate }) {
  return <HomeV3 cards={cards} loading={loading} onNavigate={onNavigate} />;
}

export default HomePage;
