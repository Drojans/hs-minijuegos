#!/usr/bin/env node
/**
 * Generador multiidioma mínimo de imágenes de cartas.
 *
 * Qué hace:
 * - Lee public/data/cards.multilang.generated.json.
 * - Descarga renders desde HearthstoneJSON para ES y EN.
 * - NO guarda PNG/raw originales.
 * - Genera solo:
 *   - public/card-images/{es,en}/thumb/ID.webp
 *   - public/card-images/{es,en}/game/ID.webp
 *   - public/card-images/{es,en}/adapted/ID.webp
 * - Crea public/data/cards.multilang.generated.json con imagesByLocale.
 * - Genera informes en reports/.
 *
 * Uso recomendado primero:
 *   node scripts/generate-card-images-multilang.mjs --limit=20
 *
 * Otros usos:
 *   node scripts/generate-card-images-multilang.mjs --ids=AV_244,EX1_001 --overwrite
 *   node scripts/generate-card-images-multilang.mjs --start=20 --limit=20
 *   node scripts/generate-card-images-multilang.mjs --types=MINION,SPELL,WEAPON --limit=30
 *   node scripts/generate-card-images-multilang.mjs --locales=es
 *   node scripts/generate-card-images-multilang.mjs --all
 */

import fs from "node:fs";
import path from "node:path";
import https from "node:https";

let sharp;
try {
  const sharpModule = await import("sharp");
  sharp = sharpModule.default;
} catch {
  console.error("");
  console.error("Falta la dependencia sharp.");
  console.error("Instálala desde la raíz del proyecto con:");
  console.error("");
  console.error("  npm install -D sharp");
  console.error("");
  process.exit(1);
}

const PROJECT_ROOT = process.cwd();

const OUTPUT_CARDS_PATH = path.join(PROJECT_ROOT, "public", "data", "cards.multilang.generated.json");
const INPUT_CARDS_PATH = OUTPUT_CARDS_PATH;

const REPORTS_DIR = path.join(PROJECT_ROOT, "reports");
const REPORT_JSON_PATH = path.join(REPORTS_DIR, "card-images-multilang-report.json");
const REPORT_TXT_PATH = path.join(REPORTS_DIR, "card-images-multilang-report.txt");
const REPORT_HTML_PATH = path.join(REPORTS_DIR, "card-images-multilang-preview.html");

const ART_RENDER_BASE = "https://art.hearthstonejson.com/v1/render/latest";

const LOCALES = {
  es: "esES",
  en: "enUS",
};

const DEFAULT_TYPES = ["MINION", "SPELL", "WEAPON", "LOCATION", "HERO"];
const DEFAULT_LIMIT = 20;
const DEFAULT_CONCURRENCY = 4;

const SIZES = {
  thumbWidth: 180,
  gameWidth: 420,
  adaptedHeight: 682,
};

const QUALITY = {
  thumb: 76,
  game: 84,
  adapted: 90,
};

// Ajustes heredados del normalizador robusto: recorte por densidad alfa.
const ALPHA_THRESHOLD = 72;
const STRONG_ALPHA_THRESHOLD = 164;
const MIN_PIXELS_PER_ROW = 8;
const MIN_PIXELS_PER_COL = 8;
const CROP_PADDING = 1;

const ENABLE_RIGHT_EDGE_REFINEMENT = true;
const RIGHT_EDGE_MIN_STRONG_PIXELS = 26;
const RIGHT_EDGE_STRONG_RATIO = 0.055;
const RIGHT_EDGE_SCAN_WINDOW = 5;
const RIGHT_EDGE_SAFE_PADDING = 2;
const RIGHT_EDGE_MIN_TRIM_PX = 6;
const RIGHT_EDGE_MAX_TRIM_RATIO = 0.18;

function parseArgs(argv) {
  const args = {
    limit: DEFAULT_LIMIT,
    start: 0,
    ids: null,
    all: false,
    overwrite: false,
    dryRun: false,
    locales: ["es", "en"],
    types: DEFAULT_TYPES,
    concurrency: DEFAULT_CONCURRENCY,
  };

  for (const arg of argv.slice(2)) {
    if (arg.startsWith("--limit=")) {
      args.limit = Number(arg.split("=")[1]);
    } else if (arg.startsWith("--start=")) {
      args.start = Number(arg.split("=")[1]);
    } else if (arg.startsWith("--ids=")) {
      args.ids = arg
        .split("=")[1]
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
    } else if (arg === "--all") {
      args.all = true;
    } else if (arg === "--overwrite") {
      args.overwrite = true;
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg.startsWith("--locales=")) {
      args.locales = arg
        .split("=")[1]
        .split(",")
        .map((locale) => locale.trim().toLowerCase())
        .filter((locale) => LOCALES[locale]);
    } else if (arg.startsWith("--types=")) {
      args.types = arg
        .split("=")[1]
        .split(",")
        .map((type) => type.trim().toUpperCase())
        .filter(Boolean);
    } else if (arg.startsWith("--concurrency=")) {
      args.concurrency = Number(arg.split("=")[1]);
    }
  }

  if (!Number.isFinite(args.limit) || args.limit < 1) args.limit = DEFAULT_LIMIT;
  if (!Number.isFinite(args.start) || args.start < 0) args.start = 0;
  if (!args.locales.length) args.locales = ["es", "en"];
  if (!args.types.length) args.types = DEFAULT_TYPES;
  if (!Number.isFinite(args.concurrency) || args.concurrency < 1) args.concurrency = DEFAULT_CONCURRENCY;
  args.concurrency = Math.min(Math.max(1, Math.floor(args.concurrency)), 8);

  return args;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function publicPathToFilePath(publicPath) {
  const clean = publicPath.startsWith("/") ? publicPath.slice(1) : publicPath;
  return path.join(PROJECT_ROOT, "public", clean);
}

function getPublicPaths(id, locale) {
  const thumb = `/card-images/${locale}/thumb/${id}.webp`;
  const game = `/card-images/${locale}/game/${id}.webp`;
  const adapted = `/card-images/${locale}/adapted/${id}.webp`;

  return {
    thumb,
    game,
    adapted,
  };
}

function getOutputPaths(id, locale) {
  const publicPaths = getPublicPaths(id, locale);

  return {
    thumb: publicPathToFilePath(publicPaths.thumb),
    game: publicPathToFilePath(publicPaths.game),
    adapted: publicPathToFilePath(publicPaths.adapted),
  };
}

function ensureImageDirs(locales) {
  for (const locale of locales) {
    ensureDir(path.join(PROJECT_ROOT, "public", "card-images", locale, "thumb"));
    ensureDir(path.join(PROJECT_ROOT, "public", "card-images", locale, "game"));
    ensureDir(path.join(PROJECT_ROOT, "public", "card-images", locale, "adapted"));
  }

  ensureDir(path.join(PROJECT_ROOT, "public", "data"));
  ensureDir(REPORTS_DIR);
}

function selectCards(cards, args) {
  let candidates = cards
    .filter((card) => card?.id)
    .filter((card) => args.types.includes(String(card.type || "").toUpperCase()));

  if (args.ids?.length) {
    const wanted = new Set(args.ids);
    return candidates.filter((card) => wanted.has(card.id));
  }

  if (args.all) return candidates;

  return candidates.slice(args.start, args.start + args.limit);
}

function buildRenderUrls(id, locale) {
  const hsLocale = LOCALES[locale];
  const encodedId = encodeURIComponent(id);

  return [
    `${ART_RENDER_BASE}/${hsLocale}/512x/${encodedId}.png`,
    `${ART_RENDER_BASE}/${hsLocale}/256x/${encodedId}.png`,
  ];
}

function downloadBuffer(url, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    const requestUrl = new URL(url);

    const req = https.get(
      requestUrl,
      {
        headers: {
          Accept: "image/avif,image/webp,image/png,image/jpeg,*/*",
          "Accept-Encoding": "identity",
          "User-Agent": "hs-minijuegos-generate-card-images-multilang/1.0",
        },
      },
      (res) => {
        const status = res.statusCode ?? 0;
        const location = res.headers.location;

        if ([301, 302, 303, 307, 308].includes(status) && location) {
          res.resume();

          if (redirectsLeft <= 0) {
            reject(new Error(`Demasiadas redirecciones al descargar ${url}`));
            return;
          }

          const nextUrl = new URL(location, requestUrl).toString();
          downloadBuffer(nextUrl, redirectsLeft - 1).then(resolve, reject);
          return;
        }

        if (status < 200 || status >= 300) {
          res.resume();
          reject(new Error(`HTTP ${status} al descargar ${url}`));
          return;
        }

        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      }
    );

    req.on("error", reject);
    req.setTimeout(60000, () => {
      req.destroy(new Error(`Timeout descargando ${url}`));
    });
  });
}

async function downloadFirstAvailable(urls) {
  let lastError = null;

  for (const url of urls) {
    try {
      const buffer = await downloadBuffer(url);
      return { buffer, url };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("No se pudo descargar ninguna URL.");
}

async function generateThumb(renderBuffer, outputPath) {
  ensureDir(path.dirname(outputPath));

  await sharp(renderBuffer, { animated: false })
    .resize({ width: SIZES.thumbWidth, withoutEnlargement: false })
    .webp({ quality: QUALITY.thumb, effort: 4 })
    .toFile(outputPath);
}

async function generateGame(renderBuffer, outputPath) {
  ensureDir(path.dirname(outputPath));

  await sharp(renderBuffer, { animated: false })
    .resize({ width: SIZES.gameWidth, withoutEnlargement: false })
    .webp({ quality: QUALITY.game, effort: 4 })
    .toFile(outputPath);
}

async function generateAdapted(renderBuffer, outputPath) {
  ensureDir(path.dirname(outputPath));

  const box = await getDensityBoundingBox(renderBuffer);

  if (!box || !box.width || !box.height) {
    throw new Error("No se pudo calcular el recorte adapted.");
  }

  await sharp(renderBuffer, { animated: false })
    .ensureAlpha()
    .extract({
      left: box.left,
      top: box.top,
      width: box.width,
      height: box.height,
    })
    .resize({
      height: SIZES.adaptedHeight,
      fit: "inside",
      withoutEnlargement: false,
    })
    .webp({ quality: QUALITY.adapted, effort: 4, alphaQuality: 94 })
    .toFile(outputPath);

  return box;
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
    return { right, rightTrimPixels: 0 };
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

  if (stableRight < 0) return { right, rightTrimPixels: 0 };

  const proposedRight = Math.min(width - 1, stableRight + RIGHT_EDGE_SAFE_PADDING);
  const trimPixels = right - proposedRight;
  const maxTrimPixels = Math.round(width * RIGHT_EDGE_MAX_TRIM_RATIO);

  if (trimPixels < RIGHT_EDGE_MIN_TRIM_PX || trimPixels > maxTrimPixels) {
    return { right, rightTrimPixels: 0 };
  }

  return { right: proposedRight, rightTrimPixels: trimPixels };
}

async function getDensityBoundingBox(renderBuffer) {
  const { data, info } = await sharp(renderBuffer, { animated: false })
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
  const rightRefinement = refineRightEdge({ right, width, height, strongColCounts });
  right = rightRefinement.right;

  if (right <= left) right = originalRight;

  return {
    left,
    top,
    width: right - left + 1,
    height: bottom - top + 1,
    imageWidth: width,
    imageHeight: height,
    cropAspect: Number(((right - left + 1) / (bottom - top + 1)).toFixed(4)),
    rightTrimPixels: rightRefinement.rightTrimPixels,
  };
}

function allOutputFilesExist(outputPaths) {
  return fileExists(outputPaths.thumb) && fileExists(outputPaths.game) && fileExists(outputPaths.adapted);
}

async function processCardLocale(card, locale, args) {
  const publicPaths = getPublicPaths(card.id, locale);
  const outputPaths = getOutputPaths(card.id, locale);

  const result = {
    id: card.id,
    name: card.name,
    nameEn: card.nameEn,
    set: card.set,
    type: card.type,
    cardClass: card.cardClass,
    rarity: card.rarity,
    locale,
    ok: false,
    skipped: false,
    sourceUrl: null,
    publicPaths,
    outputPaths,
    adaptedCrop: null,
    error: null,
  };

  if (!args.overwrite && allOutputFilesExist(outputPaths)) {
    result.ok = true;
    result.skipped = true;
    return result;
  }

  if (args.dryRun) {
    result.ok = true;
    result.skipped = true;
    return result;
  }

  try {
    const { buffer, url } = await downloadFirstAvailable(buildRenderUrls(card.id, locale));
    result.sourceUrl = url;

    await generateThumb(buffer, outputPaths.thumb);
    await generateGame(buffer, outputPaths.game);
    result.adaptedCrop = await generateAdapted(buffer, outputPaths.adapted);

    result.ok = true;
    return result;
  } catch (error) {
    result.error = error?.stack || error?.message || String(error);
    return result;
  }
}

async function runWithConcurrency(items, worker, concurrency) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runner() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, runner));
  return results;
}

function applyImagesToCards(cards, localeResults) {
  const successfulById = new Map();

  for (const result of localeResults) {
    if (!result.ok) continue;
    if (!successfulById.has(result.id)) successfulById.set(result.id, {});
    successfulById.get(result.id)[result.locale] = result.publicPaths;
  }

  return cards.map((card) => {
    const newImages = successfulById.get(card.id);
    if (!newImages) return card;

    return {
      ...card,
      imagesByLocale: {
        ...(card.imagesByLocale ?? {}),
        ...newImages,
      },
    };
  });
}

function makeTextReport(report) {
  const lines = [];

  lines.push("GENERACIÓN DE CARD IMAGES MULTIIDIOMA");
  lines.push("====================================");
  lines.push("");
  lines.push(`Generado: ${report.generatedAt}`);
  lines.push(`Proyecto: ${report.projectRoot}`);
  lines.push(`Input: ${report.files.inputCards}`);
  lines.push(`Output JSON: ${report.files.outputCards}`);
  lines.push("");
  lines.push("Parámetros:");
  lines.push(`  all: ${report.args.all ? "sí" : "no"}`);
  lines.push(`  limit: ${report.args.limit}`);
  lines.push(`  start: ${report.args.start}`);
  lines.push(`  ids: ${report.args.ids ? report.args.ids.join(", ") : "(no)"}`);
  lines.push(`  locales: ${report.args.locales.join(", ")}`);
  lines.push(`  types: ${report.args.types.join(", ")}`);
  lines.push(`  overwrite: ${report.args.overwrite ? "sí" : "no"}`);
  lines.push(`  dryRun: ${report.args.dryRun ? "sí" : "no"}`);
  lines.push(`  concurrency: ${report.args.concurrency}`);
  lines.push("");
  lines.push("Resumen:");
  lines.push(`  cartas input: ${report.totals.inputCards}`);
  lines.push(`  cartas seleccionadas: ${report.totals.selectedCards}`);
  lines.push(`  trabajos locale: ${report.totals.localeJobs}`);
  lines.push(`  OK: ${report.totals.ok}`);
  lines.push(`  saltadas porque ya existían/dry-run: ${report.totals.skipped}`);
  lines.push(`  errores: ${report.totals.errors}`);
  lines.push(`  cartas con imagesByLocale en output: ${report.totals.cardsWithImagesByLocale}`);
  lines.push("");

  if (report.errors.length) {
    lines.push("Errores:");
    for (const error of report.errors.slice(0, 50)) {
      lines.push(`  - ${error.id} ${error.locale}: ${String(error.error).split("\n")[0]}`);
    }
    if (report.errors.length > 50) lines.push(`  ... +${report.errors.length - 50} más`);
    lines.push("");
  }

  lines.push("Archivos generados por idioma:");
  lines.push("  public/card-images/{es,en}/thumb/ID.webp");
  lines.push("  public/card-images/{es,en}/game/ID.webp");
  lines.push("  public/card-images/{es,en}/adapted/ID.webp");
  lines.push("");
  lines.push("Nota:");
  lines.push("  No se guardan PNG/raw, detail ni art.");
  lines.push("  adapted sustituye a la antigua idea de normalized.");
  lines.push("");

  return lines.join("\n");
}

function makePreviewHtml(report) {
  const examples = report.results.filter((result) => result.ok).slice(0, 80);

  const sections = examples.map((result) => {
    const title = `${result.id} — ${result.locale.toUpperCase()} — ${result.name || result.nameEn || ""}`;
    const paths = result.publicPaths;

    return `
<section class="card">
  <h2>${escapeHtml(title)}</h2>
  <p>${escapeHtml([result.set, result.type, result.cardClass, result.rarity].filter(Boolean).join(" · "))}</p>
  <div class="images">
    <figure><img src="${paths.thumb}" alt=""><figcaption>thumb</figcaption></figure>
    <figure><img src="${paths.game}" alt=""><figcaption>game</figcaption></figure>
    <figure><img src="${paths.adapted}" alt=""><figcaption>adapted</figcaption></figure>
  </div>
</section>`;
  }).join("\n");

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Card images multiidioma preview</title>
<style>
  body { margin: 0; padding: 24px; font-family: system-ui, sans-serif; background: #111827; color: #f8fafc; }
  h1 { margin: 0 0 18px; }
  .summary { margin: 0 0 24px; color: #cbd5e1; }
  .card { margin: 0 0 24px; padding: 18px; border: 1px solid rgba(255,255,255,.14); border-radius: 16px; background: rgba(255,255,255,.06); }
  .card h2 { margin: 0 0 4px; font-size: 20px; }
  .card p { margin: 0 0 14px; color: #cbd5e1; }
  .images { display: flex; flex-wrap: wrap; align-items: end; gap: 16px; }
  figure { margin: 0; padding: 10px; border-radius: 12px; background: rgba(0,0,0,.25); text-align: center; }
  img { max-width: 170px; max-height: 245px; object-fit: contain; }
  figcaption { margin-top: 8px; color: #cbd5e1; font-size: 12px; }
</style>
</head>
<body>
  <h1>Card images multiidioma preview</h1>
  <p class="summary">OK: ${report.totals.ok} · Errores: ${report.totals.errors} · Mostrando primeros ${examples.length} resultados correctos.</p>
  ${sections}
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function main() {
  const args = parseArgs(process.argv);

  if (!fileExists(INPUT_CARDS_PATH)) {
    throw new Error(`No encuentro ${INPUT_CARDS_PATH}. Ejecuta el script desde la raíz del proyecto.`);
  }

  ensureImageDirs(args.locales);

  const cards = readJson(INPUT_CARDS_PATH);
  if (!Array.isArray(cards)) {
    throw new Error(`El archivo no contiene un array: ${INPUT_CARDS_PATH}`);
  }

  const selectedCards = selectCards(cards, args);
  const jobs = [];

  for (const card of selectedCards) {
    for (const locale of args.locales) {
      jobs.push({ card, locale });
    }
  }

  console.log(`Cartas input: ${cards.length}`);
  console.log(`Cartas seleccionadas: ${selectedCards.length}`);
  console.log(`Trabajos locale: ${jobs.length}`);
  console.log(`Locales: ${args.locales.join(", ")}`);
  console.log("");

  const results = await runWithConcurrency(
    jobs,
    async ({ card, locale }, index) => {
      console.log(`[${index + 1}/${jobs.length}] ${card.id} ${locale.toUpperCase()} ${card.name || card.nameEn || ""}`);
      const result = await processCardLocale(card, locale, args);
      console.log(result.ok ? `  OK${result.skipped ? " (saltada)" : ""}` : `  ERROR: ${String(result.error).split("\n")[0]}`);
      return result;
    },
    args.concurrency
  );

  const updatedCards = args.dryRun ? cards : applyImagesToCards(cards, results);

  if (!args.dryRun) {
    writeJson(OUTPUT_CARDS_PATH, updatedCards);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    projectRoot: PROJECT_ROOT,
    args,
    files: {
      inputCards: INPUT_CARDS_PATH,
      outputCards: args.dryRun ? null : OUTPUT_CARDS_PATH,
      reportJson: REPORT_JSON_PATH,
      reportTxt: REPORT_TXT_PATH,
      reportHtml: REPORT_HTML_PATH,
    },
    totals: {
      inputCards: cards.length,
      selectedCards: selectedCards.length,
      localeJobs: jobs.length,
      ok: results.filter((result) => result.ok).length,
      skipped: results.filter((result) => result.skipped).length,
      errors: results.filter((result) => !result.ok).length,
      cardsWithImagesByLocale: updatedCards.filter((card) => card.imagesByLocale).length,
    },
    selectedCards: selectedCards.map((card) => ({
      id: card.id,
      name: card.name,
      nameEn: card.nameEn,
      set: card.set,
      type: card.type,
      cardClass: card.cardClass,
      rarity: card.rarity,
    })),
    results,
    errors: results.filter((result) => !result.ok),
  };

  writeJson(REPORT_JSON_PATH, report);
  fs.writeFileSync(REPORT_TXT_PATH, makeTextReport(report), "utf8");
  fs.writeFileSync(REPORT_HTML_PATH, makePreviewHtml(report), "utf8");

  console.log("");
  console.log("Generación terminada.");
  if (!args.dryRun) console.log(`JSON generado: ${OUTPUT_CARDS_PATH}`);
  console.log(`Report TXT:    ${REPORT_TXT_PATH}`);
  console.log(`Preview HTML:  ${REPORT_HTML_PATH}`);
}

try {
  await main();
} catch (error) {
  console.error("");
  console.error("ERROR GENERANDO CARD IMAGES MULTIIDIOMA");
  console.error("---------------------------------------");
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
}
