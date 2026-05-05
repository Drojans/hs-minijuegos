import HomeBook from "../features/HomeBook/HomeBook";

function HomePage({ loading, onNavigate }) {
  return <HomeBook loading={loading} onNavigate={onNavigate} />;
}

export default HomePage;
