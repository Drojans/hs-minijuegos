import CardDatabase from "../features/CardDatabase/CardDatabase";

function CardDatabasePage({ cards, loading }) {
  return <CardDatabase cards={cards} loading={loading} />;
}

export default CardDatabasePage;
