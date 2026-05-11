import PlayerProfile from "../features/PlayerProfile/PlayerProfile";

function PlayerProfilePage({ cards, loading, onNavigate }) {
  return <PlayerProfile cards={cards} loading={loading} onNavigate={onNavigate} />;
}

export default PlayerProfilePage;
