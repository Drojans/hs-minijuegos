import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const PROJECT_ROOT = process.cwd();

const CARDS_JSON_PATH = path.join(PROJECT_ROOT, "public", "data", "cards.json");
const BACKUP_JSON_PATH = path.join(PROJECT_ROOT, "public", "data", "cards.before-normalized-renders.json");

const OUTPUT_DIR = path.join(PROJECT_ROOT, "public", "cards-normalized");
const PUBLIC_OUTPUT_PREFIX = "/cards-normalized";

const REPORT_PATH = path.join(PROJECT_ROOT, "public", "data", "normalized-renders-report.json");

/**
 * V6: recorte robusto por densidad + corrección del aire derecho.
 *
 * La V5 ya evitaba halos y píxeles sueltos usando un mínimo de píxeles
 * visibles por fila/columna. Esta versión mantiene ese comportamiento,
 * pero añade una segunda lectura más estricta en el borde derecho para
 * evitar que sombras, brillos o adornos muy aislados ensanchen el canvas.
 *
 * El objetivo es arreglar cartas como Sunfury Protector/Frostburn Matriarch
 * sin tocar a mano ids concretos y sin perder el recorte bueno que ya había.
 */
const TARGET_HEIGHT = 682;

const ALPHA_THRESHOLD = 72;
const STRONG_ALPHA_THRESHOLD = 164;

const MIN_PIXELS_PER_ROW = 8;
const MIN_PIXELS_PER_COL = 8;
const CROP_PADDING = 1;

const CLEAN_OUTPUT_DIR = true;

// Ajuste anti-margen derecho. Es conservador: solo actúa cuando detecta
// una cola derecha claramente más débil que el cuerpo real de la carta.
const ENABLE_RIGHT_EDGE_REFINEMENT = true;
const RIGHT_EDGE_MIN_STRONG_PIXELS = 26;
const RIGHT_EDGE_STRONG_RATIO = 0.055;
const RIGHT_EDGE_SCAN_WINDOW = 5;
const RIGHT_EDGE_SAFE_PADDING = 2;
const RIGHT_EDGE_MIN_TRIM_PX = 6;
const RIGHT_EDGE_MAX_TRIM_RATIO = 0.18;

function normalizePublicPath(value) {
  if (!value || typeof value !== "string") return "";

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return "";
  }

  return value.startsWith("/") ? value : `/${value}`;
}

function publicPathToFile(publicPath) {
  const cleanPath = normalizePublicPath(publicPath);
  if (!cleanPath) return "";

  return path.join(PROJECT_ROOT, "public", cleanPath.replace(/^\/+/, ""));
}

async function fileExists(filePath) {
  if (!filePath) return false;

  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function getSourceImagePath(card) {
  return (
    normalizePublicPath(card.imageGame) ||
    normalizePublicPath(card.imageDetail) ||
    normalizePublicPath(card.image) ||
    normalizePublicPath(card.imageThumb) ||
    ""
  );
}

async function ensureDirectory(directoryPath) {
  await fs.mkdir(directoryPath, { recursive: true });
}

function findFirstValidIndex(values, minimum) {
  for (let index = 0; index < values.length; index += 1) {
    if (values[index] >= minimum) return index;
  }

  return -1;
}

function findLastValidIndex(values, minimum) {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    if (values[index] >= minimum) return index;
  }

  return -1;
}

function getWindowAverage(values, endIndex, windowSize) {
  const startIndex = Math.max(0, endIndex - windowSize + 1);
  let sum = 0;

  for (let index = startIndex; index <= endIndex; index += 1) {
    sum += values[index] ?? 0;
  }

  return sum / (endIndex - startIndex + 1);
}

function findLastStableValidIndex(values, minimum, windowSize) {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    if (getWindowAverage(values, index, windowSize) >= minimum) return index;
  }

  return -1;
}

function refineRightEdge({ right, width, height, strongColCounts }) {
  if (!ENABLE_RIGHT_EDGE_REFINEMENT) {
    return {
      right,
      refinedRight: right,
      rightTrimPixels: 0,
      rightEdgeMinStrongPixels: 0,
      rightEdgeStableIndex: -1,
    };
  }

  const rightEdgeMinStrongPixels = Math.min(
    Math.max(RIGHT_EDGE_MIN_STRONG_PIXELS, Math.round(height * RIGHT_EDGE_STRONG_RATIO)),
    Math.max(1, Math.round(height * 0.18))
  );

  const stableRight = findLastStableValidIndex(
    strongColCounts,
    rightEdgeMinStrongPixels,
    RIGHT_EDGE_SCAN_WINDOW
  );

  if (stableRight < 0) {
    return {
      right,
      refinedRight: right,
      rightTrimPixels: 0,
      rightEdgeMinStrongPixels,
      rightEdgeStableIndex: stableRight,
    };
  }

  const proposedRight = Math.min(width - 1, stableRight + RIGHT_EDGE_SAFE_PADDING);
  const trimPixels = right - proposedRight;
  const maxTrimPixels = Math.round(width * RIGHT_EDGE_MAX_TRIM_RATIO);

  if (trimPixels < RIGHT_EDGE_MIN_TRIM_PX || trimPixels > maxTrimPixels) {
    return {
      right,
      refinedRight: right,
      rightTrimPixels: 0,
      rightEdgeMinStrongPixels,
      rightEdgeStableIndex: stableRight,
    };
  }

  return {
    right: proposedRight,
    refinedRight: proposedRight,
    rightTrimPixels: trimPixels,
    rightEdgeMinStrongPixels,
    rightEdgeStableIndex: stableRight,
  };
}

async function getDensityBoundingBox(sourceFilePath) {
  const { data, info } = await sharp(sourceFilePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  const rowCounts = new Array(height).fill(0);
  const colCounts = new Array(width).fill(0);
  const strongColCounts = new Array(width).fill(0);

  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * width * channels;

    for (let x = 0; x < width; x += 1) {
      const alpha = data[rowOffset + x * channels + 3];

      if (alpha >= ALPHA_THRESHOLD) {
        rowCounts[y] += 1;
        colCounts[x] += 1;
      }

      if (alpha >= STRONG_ALPHA_THRESHOLD) {
        strongColCounts[x] += 1;
      }
    }
  }

  const minRowPixels = Math.min(
    Math.max(MIN_PIXELS_PER_ROW, Math.round(width * 0.012)),
    Math.max(1, Math.round(width * 0.08))
  );

  const minColPixels = Math.min(
    Math.max(MIN_PIXELS_PER_COL, Math.round(height * 0.012)),
    Math.max(1, Math.round(height * 0.08))
  );

  let top = findFirstValidIndex(rowCounts, minRowPixels);
  let bottom = findLastValidIndex(rowCounts, minRowPixels);
  let left = findFirstValidIndex(colCounts, minColPixels);
  let right = findLastValidIndex(colCounts, minColPixels);

  if (top < 0 || bottom < 0 || left < 0 || right < 0 || right <= left || bottom <= top) {
    return null;
  }

  top = Math.max(0, top - CROP_PADDING);
  bottom = Math.min(height - 1, bottom + CROP_PADDING);
  left = Math.max(0, left - CROP_PADDING);
  right = Math.min(width - 1, right + CROP_PADDING);

  const originalRight = right;
  const rightRefinement = refineRightEdge({
    right,
    width,
    height,
    strongColCounts,
  });
  right = rightRefinement.right;

  if (right <= left) {
    right = originalRight;
    rightRefinement.right = originalRight;
    rightRefinement.refinedRight = originalRight;
    rightRefinement.rightTrimPixels = 0;
  }

  return {
    left,
    top,
    width: right - left + 1,
    height: bottom - top + 1,
    imageWidth: width,
    imageHeight: height,
    minRowPixels,
    minColPixels,
    rowCountTop: rowCounts[top] ?? 0,
    rowCountBottom: rowCounts[bottom] ?? 0,
    colCountLeft: colCounts[left] ?? 0,
    colCountRight: colCounts[right] ?? 0,
    originalCropRight: originalRight,
    refinedCropRight: right,
    rightTrimPixels: rightRefinement.rightTrimPixels,
    rightEdgeMinStrongPixels: rightRefinement.rightEdgeMinStrongPixels,
    rightEdgeStableIndex: rightRefinement.rightEdgeStableIndex,
  };
}

async function normalizeOneCard(sourceFilePath, outputFilePath) {
  const box = await getDensityBoundingBox(sourceFilePath);

  if (!box || !box.width || !box.height) {
    return {
      ok: false,
      reason: "empty-density-box",
    };
  }

  const estimatedOutputWidth = Math.round((box.width / box.height) * TARGET_HEIGHT);

  await sharp(sourceFilePath)
    .ensureAlpha()
    .extract({
      left: box.left,
      top: box.top,
      width: box.width,
      height: box.height,
    })
    .resize({
      height: TARGET_HEIGHT,
      fit: "inside",
      withoutEnlargement: false,
    })
    .webp({
      quality: 90,
      effort: 4,
      alphaQuality: 94,
    })
    .toFile(outputFilePath);

  return {
    ok: true,
    sourceWidth: box.imageWidth,
    sourceHeight: box.imageHeight,
    cropLeft: box.left,
    cropTop: box.top,
    cropWidth: box.width,
    cropHeight: box.height,
    cropAspect: Number((box.width / box.height).toFixed(4)),
    outputHeight: TARGET_HEIGHT,
    estimatedOutputWidth,
    minRowPixels: box.minRowPixels,
    minColPixels: box.minColPixels,
    rowCountTop: box.rowCountTop,
    rowCountBottom: box.rowCountBottom,
    colCountLeft: box.colCountLeft,
    colCountRight: box.colCountRight,
    originalCropRight: box.originalCropRight,
    refinedCropRight: box.refinedCropRight,
    rightTrimPixels: box.rightTrimPixels,
    rightEdgeMinStrongPixels: box.rightEdgeMinStrongPixels,
    rightEdgeStableIndex: box.rightEdgeStableIndex,
  };
}

async function main() {
  console.log("Leyendo cards.json...");
  const cardsRaw = await fs.readFile(CARDS_JSON_PATH, "utf8");
  const cards = JSON.parse(cardsRaw);

  try {
    await fs.access(BACKUP_JSON_PATH);
    console.log("Backup ya existe, no lo sobrescribo:", BACKUP_JSON_PATH);
  } catch {
    console.log("Creando backup:", BACKUP_JSON_PATH);
    await fs.writeFile(BACKUP_JSON_PATH, cardsRaw, "utf8");
  }

  if (CLEAN_OUTPUT_DIR) {
    console.log("Limpiando carpeta:", OUTPUT_DIR);
    await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
  }

  await ensureDirectory(OUTPUT_DIR);

  let processed = 0;
  let skippedMissingSource = 0;
  let skippedNoId = 0;
  let errors = 0;
  let rightEdgeRefinements = 0;

  const report = [];

  for (const card of cards) {
    if (!card.id) {
      skippedNoId += 1;
      continue;
    }

    const sourcePublicPath = getSourceImagePath(card);
    const sourceFilePath = publicPathToFile(sourcePublicPath);

    if (!(await fileExists(sourceFilePath))) {
      delete card.imageRenderNormalized;
      skippedMissingSource += 1;

      report.push({
        id: card.id,
        name: card.name,
        type: card.type,
        ok: false,
        reason: "missing-source",
        sourcePublicPath,
      });

      continue;
    }

    const outputFileName = `${card.id}.webp`;
    const outputFilePath = path.join(OUTPUT_DIR, outputFileName);
    const outputPublicPath = `${PUBLIC_OUTPUT_PREFIX}/${outputFileName}`;

    try {
      const result = await normalizeOneCard(sourceFilePath, outputFilePath);

      if (result.ok) {
        card.imageRenderNormalized = outputPublicPath;
        processed += 1;
        if ((result.rightTrimPixels ?? 0) > 0) rightEdgeRefinements += 1;
      } else {
        delete card.imageRenderNormalized;
        errors += 1;
      }

      report.push({
        id: card.id,
        name: card.name,
        type: card.type,
        rarity: card.rarity,
        cardClass: card.cardClass,
        sourcePublicPath,
        outputPublicPath: result.ok ? outputPublicPath : "",
        ...result,
      });
    } catch (error) {
      errors += 1;
      delete card.imageRenderNormalized;

      report.push({
        id: card.id,
        name: card.name,
        type: card.type,
        ok: false,
        reason: error.message,
        sourcePublicPath,
      });

      console.warn(`No se pudo normalizar ${card.id}: ${error.message}`);
    }

    if (processed > 0 && processed % 250 === 0) {
      console.log(`Normalizadas ${processed}/${cards.length}`);
    }
  }

  await fs.writeFile(CARDS_JSON_PATH, JSON.stringify(cards, null, 2), "utf8");
  await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");

  console.log("Listo.");
  console.log(`Cartas normalizadas: ${processed}/${cards.length}`);
  console.log(`Cartas ajustadas por borde derecho: ${rightEdgeRefinements}`);
  console.log(`Cartas sin ID: ${skippedNoId}`);
  console.log(`Cartas sin imagen fuente local: ${skippedMissingSource}`);
  console.log(`Errores: ${errors}`);
  console.log("Campo usado en el JSON: imageRenderNormalized");
  console.log("Carpeta generada:", path.relative(PROJECT_ROOT, OUTPUT_DIR));
  console.log("Informe generado:", path.relative(PROJECT_ROOT, REPORT_PATH));
}

main().catch((error) => {
  console.error("Error normalizando renders:", error);
  process.exit(1);
});
