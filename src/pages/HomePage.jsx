import HomeV2 from "../features/HomeV2/HomeV2";

function HomePage({ loading, onNavigate }) {
  return <HomeV2 loading={loading} onNavigate={onNavigate} />;
}

export default HomePage;
