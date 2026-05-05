import CardGridGame from "../games/CardGrid/CardGridGame";

function CardGridPage({ cards, onBack }) {
  return <CardGridGame cards={cards} onBack={onBack} />;
}

export default CardGridPage;
