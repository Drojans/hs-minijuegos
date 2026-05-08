import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const LEGACY_STORAGE_KEY = "hearthdle-guess-mana-layout-editor-v2";
const PANEL_STORAGE_KEY = "hearthdle-guess-mana-layout-editor-panel-v2";

const SECTIONS = [
  [
    "Escena / libro",
    [
      ["--gm-book-stage-max-w", "Stage max width", 1000, 3200, 10, "px", 2400],
      ["--gm-book-stage-pad-x", "Stage pad X", 0, 120, 1, "px", 8],
      ["--gm-book-stage-pad-y", "Stage pad Y", 0, 120, 1, "px", 4],
      ["--gm-backdrop-brightness", "Fondo brillo", 0.5, 1.7, 0.01, "", 1.15],
      ["--gm-backdrop-saturation", "Fondo saturación", 0.5, 1.8, 0.01, "", 0.99],
      ["--gm-book-x", "Libro X", -80, 80, 0.1, "%", 0],
      ["--gm-book-y", "Libro Y", -80, 80, 0.1, "%", -4.9],
      ["--gm-book-scale", "Libro escala", 0.3, 2.3, 0.01, "", 1.09],
    ],
  ],
  [
    "Páginas",
    [
      ["--gm-left-page-x", "Página izq X", -30, 130, 0.1, "%", 15],
      ["--gm-left-page-y", "Página izq Y", -30, 130, 0.1, "%", 11.2],
      ["--gm-left-page-w", "Página izq ancho", 5, 160, 0.1, "%", 36.8],
      ["--gm-left-page-h", "Página izq alto", 5, 160, 0.1, "%", 79.3],
      ["--gm-right-page-x", "Página der X", -30, 130, 0.1, "%", 52.2],
      ["--gm-right-page-y", "Página der Y", -30, 130, 0.1, "%", 11.5],
      ["--gm-right-page-w", "Página der ancho", 5, 160, 0.1, "%", 37.7],
      ["--gm-right-page-h", "Página der alto", 5, 160, 0.1, "%", 79.3],
    ],
  ],
  [
    "Props",
    [
      ["--gm-candle-x", "Vela X", -160, 200, 0.1, "%", -26.4],
      ["--gm-candle-y", "Vela Y", -160, 200, 0.1, "%", 12.1],
      ["--gm-candle-w", "Vela ancho", 1, 180, 0.1, "%", 50.5],
      ["--gm-candle-h", "Vela alto", 1, 180, 0.1, "%", 50.5],
      ["--gm-cards-x", "Cartas X", -160, 200, 0.1, "%", -17.2],
      ["--gm-cards-bottom", "Cartas bottom", -160, 200, 0.1, "%", -5],
      ["--gm-cards-w", "Cartas ancho", 1, 180, 0.1, "%", 42.4],
      ["--gm-cards-h", "Cartas alto", 1, 180, 0.1, "%", 45.9],
      ["--gm-cards-rotate", "Cartas rotación", -180, 180, 1, "deg", 36],
      ["--gm-coins-x", "Monedas X", -160, 200, 0.1, "%", 76],
      ["--gm-coins-bottom", "Monedas bottom", -160, 200, 0.1, "%", 25.1],
      ["--gm-coins-w", "Monedas ancho", 1, 180, 0.1, "%", 43],
      ["--gm-coins-h", "Monedas alto", 1, 180, 0.1, "%", 40],
      ["--gm-mug-x", "Jarra right", -160, 200, 0.1, "%", -25.6],
      ["--gm-mug-bottom", "Jarra bottom", -160, 200, 0.1, "%", -10.2],
      ["--gm-mug-w", "Jarra ancho", 1, 180, 0.1, "%", 53.4],
      ["--gm-mug-h", "Jarra alto", 1, 180, 0.1, "%", 55.1],
    ],
  ],
  [
    "Izquierda / carta",
    [
      ["--gm-back-x", "Volver X", -80, 140, 0.1, "%", 1.5],
      ["--gm-back-y", "Volver Y", -80, 140, 0.1, "%", -0.5],
      ["--gm-back-w", "Volver ancho", 1, 140, 0.1, "%", 36],
      ["--gm-back-h", "Volver alto", 1, 80, 0.1, "%", 9],
      ["--gm-card-area-x", "Carta bloque X", -80, 160, 0.1, "%", 10.8],
      ["--gm-card-area-y", "Carta bloque Y", -80, 160, 0.1, "%", 10.2],
      ["--gm-card-area-w", "Carta bloque ancho", 1, 160, 0.1, "%", 69],
      ["--gm-card-area-h", "Carta bloque alto", 1, 160, 0.1, "%", 70],
      ["--gm-card-frame-scale-x", "Marco escala X", 0, 3, 0.01, "", 1],
      ["--gm-card-frame-scale-y", "Marco escala Y", 0, 3, 0.01, "", 1],
      ["--gm-card-render-w", "Render carta ancho", 1, 160, 0.1, "%", 64],
      ["--gm-card-render-h", "Render carta alto", 1, 160, 0.1, "%", 96],
      ["--gm-card-render-x", "Render carta X", -80, 80, 0.1, "%", 0],
      ["--gm-card-render-y", "Render carta Y", -80, 80, 0.1, "%", 0],
      ["--gm-card-render-scale", "Render carta escala", 0.1, 2.4, 0.01, "", 1],
      ["--gm-question-x", "Pregunta X", -80, 160, 0.1, "%", 5.5],
      ["--gm-question-y", "Pregunta Y", -80, 160, 0.1, "%", 2.5],
      ["--gm-question-size", "Pregunta tamaño", 1, 180, 1, "px", 84],
      ["--gm-season-x", "Temporada X", -80, 160, 0.1, "%", 6],
      ["--gm-season-bottom", "Temporada bottom", -80, 160, 0.1, "%", 5.2],
    ],
  ],
  [
    "Derecha / cabecera",
    [
      ["--gm-score-x", "Score X", -80, 160, 0.1, "%", 59.2],
      ["--gm-score-y", "Score Y", -80, 160, 0.1, "%", -1.3],
      ["--gm-score-w", "Score ancho", 1, 130, 0.1, "%", 39],
      ["--gm-score-h", "Score alto", 1, 80, 0.1, "%", 13],
      ["--gm-title-x", "Título X", -80, 160, 0.1, "%", 3.6],
      ["--gm-title-y", "Título Y", -80, 160, 0.1, "%", 4.5],
      ["--gm-title-font", "Título tamaño", 12, 120, 1, "px", 58],
      ["--gm-title-pr", "Título padding der", 0, 80, 0.1, "%", 36],
      ["--gm-subtitle-font", "Subtítulo tamaño", 8, 32, 1, "px", 16],
      ["--gm-subtitle-w", "Subtítulo ancho", 1, 120, 0.1, "%", 72],
      ["--gm-divider-x", "Divisor X", -80, 160, 0.1, "%", 9],
      ["--gm-divider-y", "Divisor Y", -80, 160, 0.1, "%", 1.5],
      ["--gm-divider-w", "Divisor ancho", 1, 140, 0.1, "%", 56],
      ["--gm-divider-h", "Divisor alto", 1, 80, 0.1, "%", 5],
    ],
  ],
  [
    "Datos / maná / botón",
    [
      ["--gm-data-x", "Datos X", -80, 160, 0.1, "%", 5.8],
      ["--gm-data-y", "Datos Y", -80, 160, 0.1, "%", 2.6],
      ["--gm-data-w", "Datos ancho", 1, 140, 0.1, "%", 87],
      ["--gm-data-h", "Datos alto", 1, 100, 0.1, "%", 25],
      ["--gm-mana-x", "Maná X", -80, 160, 0.1, "%", 4.8],
      ["--gm-mana-y", "Maná Y", -80, 160, 0.1, "%", 4.4],
      ["--gm-mana-w", "Maná ancho", 1, 140, 0.1, "%", 89.5],
      ["--gm-cost-size", "Moneda tamaño", 12, 140, 1, "px", 56],
      ["--gm-cost-gap", "Moneda separación", 0, 40, 0.5, "px", 12],
      ["--gm-feedback-x", "Feedback X", -80, 160, 0.1, "%", 8],
      ["--gm-feedback-y", "Feedback Y", -80, 160, 0.1, "%", 2.2],
      ["--gm-feedback-w", "Feedback ancho", 1, 140, 0.1, "%", 84],
      ["--gm-confirm-w", "Confirmar ancho", 1, 140, 0.1, "%", 62],
      ["--gm-confirm-h", "Confirmar alto", 10, 160, 1, "px", 78],
      ["--gm-confirm-top", "Confirmar top", -60, 120, 0.1, "%", 2.5],
    ],
  ],
  [
    "Idiomas",
    [
      ["--gm-lang-right", "Idiomas right", -80, 160, 0.1, "%", -8.2],
      ["--gm-lang-top", "Idiomas top", -80, 160, 0.1, "%", 3.8],
      ["--gm-lang-scale", "Idiomas escala", 0.1, 3, 0.01, "", 1.27],
      ["--gm-lang-button-size", "Idiomas tamaño", 8, 90, 1, "px", 37],
      ["--gm-lang-gap", "Idiomas separación", 0, 30, 0.5, "px", 6],
      ["--gm-lang-radius", "Idiomas radio", 0, 30, 1, "px", 9],
      ["--gm-z-language", "Idiomas capa", 0, 250, 1, "", 90],
    ],
  ],
  [
    "Capas",
    [
      ["--gm-z-book", "Libro capa", 0, 250, 1, "", 10],
      ["--gm-z-page", "Páginas capa", 0, 250, 1, "", 20],
      ["--gm-z-props", "Props capa base", 0, 250, 1, "", 30],
      ["--gm-z-candle", "Vela capa", 0, 250, 1, "", 0],
      ["--gm-z-cards", "Cartas capa", 0, 250, 1, "", 10],
      ["--gm-z-coins", "Monedas capa", 0, 250, 1, "", 5],
      ["--gm-z-mug", "Jarra capa", 0, 250, 1, "", 10],
      ["--gm-z-ui", "UI capa", 0, 250, 1, "", 40],
    ],
  ],
];

const CONTROLS = SECTIONS.flatMap(([, controls]) => controls);

const EXTRA_ROOT_VARIABLES = [
  ["--gm-z-backdrop", "0"],
  ["--gm-z-vignette", "1"],
  ["--gm-z-stage", "2"],
  ["--gm-ink", "#2b1208"],
  ["--gm-deep-ink", "#1c0b04"],
  ["--gm-gold", "#c97825"],
  ["--gm-gold-bright", "#ffd46e"],
  ["--gm-purple", "#6d29a9"],
  ["--gm-success", "#2f8f3f"],
  ["--gm-danger", "#b72d2d"],
];

function removeEditorInlineVariables() {
  if (typeof document === "undefined") return;

  CONTROLS.forEach(([name]) => {
    document.documentElement.style.removeProperty(name);
  });
}

function readCurrentCssValues(defaultValues, { clearInline = false } = {}) {
  if (typeof window === "undefined") return defaultValues;

  if (clearInline) {
    removeEditorInlineVariables();
  }

  const styles = window.getComputedStyle(document.documentElement);
  const nextValues = { ...defaultValues };

  CONTROLS.forEach(([name, , , , , unit, fallback]) => {
    const rawValue = styles.getPropertyValue(name);
    const defaultValue = defaultValues[name] ?? fallback;
    nextValues[name] = parseVariableValue(rawValue, unit, defaultValue);
  });

  return nextValues;
}

function getExtraRootLines() {
  if (typeof window === "undefined") {
    return EXTRA_ROOT_VARIABLES.map(([name, fallback]) => `  ${name}: ${fallback};`);
  }

  const styles = window.getComputedStyle(document.documentElement);

  return EXTRA_ROOT_VARIABLES.map(([name, fallback]) => {
    const value = styles.getPropertyValue(name).trim() || fallback;
    return `  ${name}: ${value};`;
  });
}

function getDefaultValues() {
  return Object.fromEntries(CONTROLS.map(([name, , , , , , defaultValue]) => [name, defaultValue]));
}

const DEFAULT_VALUES = getDefaultValues();

function readJson(key, fallback) {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function getCssValue(name, value, unit) {
  return `${value}${unit}`;
}

function parseVariableValue(rawValue, unit, fallback) {
  const value = String(rawValue || "").trim();

  if (!value) return fallback;

  if (!unit) {
    const numeric = Number.parseFloat(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  }

  const numeric = Number.parseFloat(value.replace(unit, ""));
  return Number.isFinite(numeric) ? numeric : fallback;
}

function GuessManaLayoutEditor() {
  const panelRef = useRef(null);
  const dragRef = useRef(null);
  const defaultValues = useMemo(() => DEFAULT_VALUES, []);
  const [values, setValues] = useState(() => readCurrentCssValues(DEFAULT_VALUES));
  const [panelPosition, setPanelPosition] = useState(() =>
    readJson(PANEL_STORAGE_KEY, { x: 24, y: 24 })
  );
  const [isHidden, setIsHidden] = useState(false);
  const [message, setMessage] = useState("Editor Guess Mana v3 · lee el CSS actual");

  useLayoutEffect(() => {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    setValues(readCurrentCssValues(DEFAULT_VALUES, { clearInline: true }));
    setMessage("Valores cargados desde el :root actual del CSS");
  }, []);

  useEffect(() => {
    CONTROLS.forEach(([name, , , , , unit]) => {
      document.documentElement.style.setProperty(name, getCssValue(name, values[name], unit));
    });
  }, [values]);

  useEffect(() => {
    window.localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(panelPosition));
  }, [panelPosition]);

  useEffect(() => {
    function handlePointerMove(event) {
      if (!dragRef.current) return;

      const nextX = event.clientX - dragRef.current.offsetX;
      const nextY = event.clientY - dragRef.current.offsetY;

      setPanelPosition({
        x: Math.max(0, Math.min(window.innerWidth - 260, nextX)),
        y: Math.max(0, Math.min(window.innerHeight - 80, nextY)),
      });
    }

    function handlePointerUp() {
      dragRef.current = null;
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  function updateValue(name, nextValue) {
    setValues((current) => ({
      ...current,
      [name]: Number(nextValue),
    }));
  }

  function readCssEditor() {
    setValues(readCurrentCssValues(defaultValues, { clearInline: true }));
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    setMessage("CSS actual leído de nuevo");
  }

  async function copyRoot() {
    const controlledLines = CONTROLS.map(([name, , , , , unit]) => {
      return `  ${name}: ${getCssValue(name, values[name], unit)};`;
    });

    const root = `:root {\n${controlledLines.join("\n")}\n\n${getExtraRootLines().join("\n")}\n}`;

    await navigator.clipboard.writeText(root);
    setMessage("ROOT copiado con variables extra");
  }

  async function pasteRoot() {
    const text = await navigator.clipboard.readText();
    const nextValues = { ...values };

    CONTROLS.forEach(([name, , , , , unit, fallback]) => {
      const match = text.match(new RegExp(`${name.replace(/[-]/g, "\\$&")}\\s*:\\s*([^;]+);`));
      if (!match) return;

      nextValues[name] = parseVariableValue(match[1], unit, fallback);
    });

    setValues(nextValues);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    setMessage("Variables pegadas");
  }

  function beginDrag(event) {
    if (event.target.closest("button, input, summary")) return;

    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragRef.current = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
  }

  if (isHidden) {
    return (
      <>
        <style>{EDITOR_STYLES}</style>
        <button type="button" className="gm-layout-editor-show" onClick={() => setIsHidden(false)}>
          Mostrar editor
        </button>
      </>
    );
  }

  return (
    <>
      <style>{EDITOR_STYLES}</style>
      <aside
        ref={panelRef}
        className="gm-layout-editor"
        style={{ left: panelPosition.x, top: panelPosition.y }}
      >
        <header className="gm-layout-editor-header" onPointerDown={beginDrag}>
          <div>
            <h2>LAYOUT EDITOR</h2>
            <p>{message}</p>
          </div>
          <div className="gm-layout-editor-header-actions">
            <button type="button" onClick={pasteRoot}>Pegar</button>
            <button type="button" onClick={() => setIsHidden(true)}>Ocultar</button>
          </div>
        </header>

        <div className="gm-layout-editor-actions">
          <button type="button" className="is-primary" onClick={copyRoot}>Copiar ROOT</button>
          <button type="button" onClick={readCssEditor}>Leer CSS</button>
        </div>

        <div className="gm-layout-editor-body">
          {SECTIONS.map(([sectionName, controls], index) => (
            <details key={sectionName} open={index < 2}>
              <summary>{sectionName}</summary>
              <div className="gm-layout-editor-section">
                {controls.map(([name, label, min, max, step, unit]) => (
                  <label className="gm-layout-control" key={name}>
                    <span>
                      {label}
                      <code>{name}</code>
                    </span>
                    <div>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={values[name]}
                        onChange={(event) => updateValue(name, event.target.value)}
                      />
                      <input
                        type="number"
                        min={min}
                        max={max}
                        step={step}
                        value={values[name]}
                        onChange={(event) => updateValue(name, event.target.value)}
                      />
                      <small>{unit}</small>
                    </div>
                  </label>
                ))}
              </div>
            </details>
          ))}
        </div>
      </aside>
    </>
  );
}

const EDITOR_STYLES = `
.gm-layout-editor,
.gm-layout-editor * {
  box-sizing: border-box;
}

.gm-layout-editor {
  position: fixed;
  z-index: 999999;
  width: min(440px, calc(100vw - 24px));
  max-height: min(86svh, 840px);
  display: flex;
  flex-direction: column;
  color: #f8e6bf;
  font-family: Inter, system-ui, sans-serif;
  background: rgba(31, 14, 7, 0.96);
  border: 1px solid rgba(255, 204, 122, 0.28);
  border-radius: 16px;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.45);
  overflow: hidden;
  backdrop-filter: blur(8px);
}

.gm-layout-editor-header {
  flex: 0 0 auto;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  cursor: grab;
  user-select: none;
  border-bottom: 1px solid rgba(255, 204, 122, 0.16);
}

.gm-layout-editor-header:active {
  cursor: grabbing;
}

.gm-layout-editor h2 {
  margin: 0;
  font-family: Georgia, serif;
  font-size: 1rem;
  letter-spacing: 0.03em;
}

.gm-layout-editor p {
  margin: 6px 0 0;
  color: rgba(248, 230, 191, 0.76);
  font-size: 0.78rem;
  line-height: 1.25;
}

.gm-layout-editor-header-actions,
.gm-layout-editor-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.gm-layout-editor button {
  border: 0;
  border-radius: 9px;
  padding: 0.65em 0.8em;
  color: #ffe9bd;
  font-weight: 850;
  background: rgba(112, 69, 29, 0.92);
  cursor: pointer;
}

.gm-layout-editor button:hover {
  filter: brightness(1.1);
}

.gm-layout-editor button.is-primary {
  flex: 1;
  background: linear-gradient(180deg, #b63cff, #6e17bc);
}

.gm-layout-editor-actions {
  flex: 0 0 auto;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255, 204, 122, 0.16);
}

.gm-layout-editor-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  padding: 0 14px 14px;
}

.gm-layout-editor details {
  border-bottom: 1px solid rgba(255, 204, 122, 0.16);
}

.gm-layout-editor summary {
  padding: 12px 0;
  color: #ffd990;
  font-weight: 900;
  cursor: pointer;
  user-select: none;
}

.gm-layout-editor-section {
  display: grid;
  gap: 12px;
  padding-bottom: 14px;
}

.gm-layout-control {
  display: grid;
  gap: 6px;
}

.gm-layout-control > span {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: #f8e6bf;
  font-size: 0.78rem;
  font-weight: 760;
}

.gm-layout-control code {
  padding: 3px 7px;
  border-radius: 6px;
  color: #c9b690;
  background: rgba(255, 255, 255, 0.08);
  font-size: 0.7rem;
}

.gm-layout-control > div {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 74px 30px;
  gap: 8px;
  align-items: center;
}

.gm-layout-control input[type="range"] {
  width: 100%;
}

.gm-layout-control input[type="number"] {
  width: 74px;
  padding: 7px 8px;
  border: 1px solid rgba(255, 204, 122, 0.22);
  border-radius: 8px;
  color: #ffe9bd;
  background: rgba(0, 0, 0, 0.24);
}

.gm-layout-control small {
  color: rgba(248, 230, 191, 0.65);
  font-size: 0.72rem;
}

.gm-layout-editor-show {
  position: fixed;
  z-index: 999999;
  left: 24px;
  top: 24px;
  border: 1px solid rgba(255, 204, 122, 0.3);
  border-radius: 14px;
  padding: 10px 14px;
  color: #ffe9bd;
  font-weight: 900;
  font-family: Georgia, serif;
  background: rgba(31, 14, 7, 0.96);
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.36);
}
`;

export default GuessManaLayoutEditor;
