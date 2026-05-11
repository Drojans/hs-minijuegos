import HomeV2 from "../features/HomeV2/HomeV2";

function HomePage({ cards, loading, onNavigate }) {
  return <HomeV2 cards={cards} loading={loading} onNavigate={onNavigate} />;
}

export default HomePage;
