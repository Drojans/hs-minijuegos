import CollectionHub from "../features/CollectionHub/CollectionHub";

function CollectionPage({ cards, loading }) {
  return <CollectionHub cards={cards} loading={loading} />;
}

export default CollectionPage;
