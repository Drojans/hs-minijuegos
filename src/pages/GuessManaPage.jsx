import GuessManaCost from "../games/GuessManaCost/GuessManaCost";

function GuessManaPage({ cards, onBack }) {
  return <GuessManaCost cards={cards} onBack={onBack} />;
}

export default GuessManaPage;
