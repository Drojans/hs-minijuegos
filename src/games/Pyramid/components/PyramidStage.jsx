import PyramidAnswerPanel from "./PyramidAnswerPanel";
import PyramidCategoryCard from "./PyramidCategoryCard";
import PyramidSlots from "./PyramidSlots";

function PyramidStage({
  copy,
  locale,
  categoryLabel,
  foundCards,
  answer,
  suggestions,
  message,
  result,
  isReview,
  showResults,
  selectedMode,
  onAnswerChange,
  onSubmitAnswer,
  onSuggestionPick,
  onStartNextInfiniteRound,
}) {
  return (
    <section className="py-game-card">
      <PyramidCategoryCard copy={copy} categoryLabel={categoryLabel} foundCount={foundCards.length} />

      <PyramidSlots foundCards={foundCards} locale={locale} />

      <PyramidAnswerPanel
        copy={copy}
        locale={locale}
        result={result}
        isReview={isReview}
        showResults={showResults}
        selectedMode={selectedMode}
        answer={answer}
        suggestions={suggestions}
        message={message}
        onAnswerChange={onAnswerChange}
        onSubmitAnswer={onSubmitAnswer}
        onSuggestionPick={onSuggestionPick}
        onStartNextInfiniteRound={onStartNextInfiniteRound}
      />
    </section>
  );
}

export default PyramidStage;
