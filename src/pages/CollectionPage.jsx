import CollectionHub from "../features/CollectionHub/CollectionHub";

function CollectionPage({ cards, loading, onNavigate }) {
  return <CollectionHub cards={cards} loading={loading} onNavigate={onNavigate} />;
}

export default CollectionPage;
