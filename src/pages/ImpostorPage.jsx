import ImpostorGame from "../games/Impostor/ImpostorGame";

function ImpostorPage({ cards, onBack }) {
  return <ImpostorGame cards={cards} onBack={onBack} />;
}

export default ImpostorPage;
