import { getCardName } from "../../../utils/cardLocale";

function PyramidSuggestions({ suggestions, locale, onPick }) {
  if (suggestions.length === 0) return null;

  return (
    <div className="py-suggestions">
      {suggestions.map((card) => (
        <button
          key={card.id}
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onPick(getCardName(card, locale))}
        >
          {getCardName(card, locale)}
        </button>
      ))}
    </div>
  );
}

export default PyramidSuggestions;
