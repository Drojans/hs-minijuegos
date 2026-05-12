import PlayerProfile from "../features/PlayerProfile/PlayerProfile";

function PlayerProfilePage({ cards, loading }) {
  return <PlayerProfile cards={cards} loading={loading} />;
}

export default PlayerProfilePage;
