import CardDatabase from "../features/CardDatabase/CardDatabase";

function CardDatabasePage({ cards, loading, onNavigate, onBack }) {
  return <CardDatabase cards={cards} loading={loading} onNavigate={onNavigate} onBack={onBack} />;
}

export default CardDatabasePage;
