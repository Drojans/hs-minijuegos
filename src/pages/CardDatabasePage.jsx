import CardDatabase from "../features/CardDatabase/CardDatabase";

function CardDatabasePage({ cards, loading, onBack }) {
  return <CardDatabase cards={cards} loading={loading} onBack={onBack} />;
}

export default CardDatabasePage;
