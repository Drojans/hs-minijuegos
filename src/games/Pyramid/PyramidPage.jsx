import PyramidGame from "../games/Pyramid/PyramidGame";

function PyramidPage({ cards, onBack }) {
  return <PyramidGame cards={cards} onBack={onBack} />;
}

export default PyramidPage;
