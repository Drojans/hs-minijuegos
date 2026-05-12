import HiddenCardGame from "../games/HiddenCard/HiddenCardGame";

function HiddenCardPage({ cards, onBack }) {
  return <HiddenCardGame cards={cards} onBack={onBack} />;
}

export default HiddenCardPage;
