import { CORRECT_COUNT } from "../impostorGameConfig";

function ImpostorActionBar({ copy, selectedCardName, roundResult, foundCount, onCheck }) {
  if (roundResult !== "playing") return null;

  return (
    <section className="im-action-bar">
      <div className="im-found-counter" aria-live="polite">
        <span>{copy.foundLabel}</span>
        <strong>
          {foundCount} / {CORRECT_COUNT}
        </strong>
      </div>

      {selectedCardName ? (
        <div className="im-selected-card-pill">
          <span>{copy.selectedPrompt}</span>
          <strong>{selectedCardName}</strong>
        </div>
      ) : null}

      <button
        type="button"
        className="im-primary-button"
        disabled={!selectedCardName}
        onClick={onCheck}
      >
        {copy.confirm}
      </button>
    </section>
  );
}

export default ImpostorActionBar;
