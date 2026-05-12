function HiddenCardGuessesList({ copy, guesses }) {
  if (!guesses.length) return null;

  return (
    <section className="hidden-card-guesses">
      <p>{copy.guessesLabel}</p>
      <div>
        {guesses.map((guess, index) => (
          <span key={`${guess}-${index}`}>{guess}</span>
        ))}
      </div>
    </section>
  );
}

export default HiddenCardGuessesList;
