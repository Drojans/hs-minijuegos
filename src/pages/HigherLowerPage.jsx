import HigherLowerGame from "../games/HigherLower/HigherLowerGame";

function HigherLowerPage({ cards, onBack }) {
  return <HigherLowerGame cards={cards} onBack={onBack} />;
}

export default HigherLowerPage;
