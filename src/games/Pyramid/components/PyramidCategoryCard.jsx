import { PYRAMID_TARGET_COUNT } from "../pyramidGameConfig";
import { formatPyramidText } from "../pyramidCopy";

function PyramidCategoryCard({ copy, categoryLabel, foundCount }) {
  return (
    <header className="py-category-card">
      <span>{copy.category}</span>
      <h1>{categoryLabel}</h1>
      <p>{formatPyramidText(copy.found, { count: Math.min(foundCount, PYRAMID_TARGET_COUNT) })}</p>
    </header>
  );
}

export default PyramidCategoryCard;
