#!/usr/bin/env node
/**
 * Descargador/optimizador de imágenes nuevas TEST v1.
 *
 * Qué hace:
 * - Lee reports/new-cards-to-download.json
 * - Descarga solo una muestra pequeña por defecto: 10 cartas
 * - Guarda el render español PNG en public/cards/
 * - Genera:
 *   - public/cards-optimized/thumb/*.webp
 *   - public/cards-optimized/game/*.webp
 *   - public/cards-optimized/detail/*.webp
 *   - public/cards-normalized/*.webp
 *   - public/card-art-optimized/512/*.webp, si el art está disponible
 * - Genera informes en reports/
 *
 * Qué NO hace:
 * - No modifica public/data/cards.json
 * - No modifica public/data/cards.generated.es.json
 * - No toca la app
 *
 * Requisito:
 * - npm install -D sharp
 *
 * Uso:
 *   node scripts/download-new-card-images-test.mjs
 *   node scripts/download-new-card-images-test.mjs --limit=10
 *   node scripts/download-new-card-images-test.mjs --start=10 --limit=10
 *   node scripts/download-new-card-images-test.mjs --ids=CATA_111,CATA_130
 *   node scripts/download-new-card-images-test.mjs --dry-run
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

const DOWNLOAD_PLAN_PATH = path.join(PROJECT_ROOT, "reports", "new-cards-to-download.json");

const OUTPUT_DIRS = {
  cards: path.join(PROJECT_ROOT, "public", "cards"),
  thumb: path.join(PROJECT_ROOT, "public", "cards-optimized", "thumb"),
  game: path.join(PROJECT_ROOT, "public", "cards-optimized", "game"),
  detail: path.join(PROJECT_ROOT, "public", "cards-optimized", "detail"),
  normalized: path.join(PROJECT_ROOT, "public", "cards-normalized"),
  art512: path.join(PROJECT_ROOT, "public", "card-art-optimized", "512"),
  reports: path.join(PROJECT_ROOT, "reports"),
};

const REPORT_JSON_PATH = path.join(OUTPUT_DIRS.reports, "new-card-image-test-results.json");
const REPORT_TXT_PATH = path.join(OUTPUT_DIRS.reports, "new-card-image-test-results.txt");
const PREVIEW_HTML_PATH = path.join(OUTPUT_DIRS.reports, "new-card-image-test-preview.html");

const DEFAULT_LIMIT = 10;
const WEBP_QUALITY = 86;

// Tamaños aproximados de tu pipeline actual.
const SIZES = {
  thumbWidth: 180,
  gameWidth: 420,
  detailWidth: 512,
  normalizedHeight: 682,
};

function parseArgs(argv) {
  const args = {
    limit: DEFAULT_LIMIT,
    start: 0,
    ids: null,
    dryRun: false,
    includeHeroes: false,
    overwrite: false,
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
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--include-heroes") {
      args.includeHeroes = true;
    } else if (arg === "--overwrite") {
      args.overwrite = true;
    }
  }

  if (!Number.isFinite(args.limit) || args.limit < 1) args.limit = DEFAULT_LIMIT;
  if (!Number.isFinite(args.start) || args.start < 0) args.start = 0;

  return args;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function ensureOutputDirs() {
  for (const dirPath of Object.values(OUTPUT_DIRS)) {
    ensureDir(dirPath);
  }
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

function selectItems(plan, args) {
  let candidates = plan;

  if (!args.includeHeroes) {
    candidates = candidates.filter((item) => item.type !== "HERO" && item.set !== "HERO_SKINS");
  }

  if (args.ids?.length) {
    const wanted = new Set(args.ids);
    return candidates.filter((item) => wanted.has(item.id));
  }

  return candidates.slice(args.start, args.start + args.limit);
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
          "User-Agent": "hs-minijuegos-download-new-card-images-test/1.0",
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

function outputPathsFor(item) {
  return {
    sourcePng: path.join(OUTPUT_DIRS.cards, `${item.id}.png`),
    thumbWebp: path.join(OUTPUT_DIRS.thumb, `${item.id}.webp`),
    gameWebp: path.join(OUTPUT_DIRS.game, `${item.id}.webp`),
    detailWebp: path.join(OUTPUT_DIRS.detail, `${item.id}.webp`),
    normalizedWebp: path.join(OUTPUT_DIRS.normalized, `${item.id}.webp`),
    art512Webp: path.join(OUTPUT_DIRS.art512, `${item.id}.webp`),
  };
}

function publicPathsFor(item) {
  return {
    image: `/cards/${item.id}.png`,
    imageThumb: `/cards-optimized/thumb/${item.id}.webp`,
    imageGame: `/cards-optimized/game/${item.id}.webp`,
    imageDetail: `/cards-optimized/detail/${item.id}.webp`,
    imageArt: `/card-art-optimized/512/${item.id}.webp`,
    imageRenderNormalized: `/cards-normalized/${item.id}.webp`,
  };
}

async function processItem(item, args) {
  const paths = outputPathsFor(item);
  const publicPaths = publicPathsFor(item);

  const result = {
    id: item.id,
    name: item.name,
    nameEn: item.nameEn,
    set: item.set,
    type: item.type,
    cardClass: item.cardClass,
    sourceUrl: item.sourceUrls?.renderEs512Png,
    ok: false,
    skipped: false,
    publicPaths,
    outputFiles: paths,
    steps: [],
    warnings: [],
    error: null,
  };

  if (!item.sourceUrls?.renderEs512Png) {
    result.error = "No hay sourceUrls.renderEs512Png en el plan de descarga.";
    return result;
  }

  const allMainFilesExist =
    fileExists(paths.sourcePng) &&
    fileExists(paths.thumbWebp) &&
    fileExists(paths.gameWebp) &&
    fileExists(paths.detailWebp) &&
    fileExists(paths.normalizedWebp);

  if (!args.overwrite && allMainFilesExist) {
    result.ok = true;
    result.skipped = true;
    result.steps.push("Archivos principales ya existían. Usa --overwrite para regenerarlos.");
    return result;
  }

  if (args.dryRun) {
    result.ok = true;
    result.skipped = true;
    result.steps.push("Dry run: no se descarga ni escribe nada.");
    return result;
  }

  try {
    const renderBuffer = await downloadBuffer(item.sourceUrls.renderEs512Png);
    fs.writeFileSync(paths.sourcePng, renderBuffer);
    result.steps.push(`Render ES guardado: ${publicPaths.image}`);

    await sharp(renderBuffer)
      .resize({ width: SIZES.thumbWidth, withoutEnlargement: false })
      .webp({ quality: WEBP_QUALITY })
      .toFile(paths.thumbWebp);
    result.steps.push(`Thumb generado: ${publicPaths.imageThumb}`);

    await sharp(renderBuffer)
      .resize({ width: SIZES.gameWidth, withoutEnlargement: false })
      .webp({ quality: WEBP_QUALITY })
      .toFile(paths.gameWebp);
    result.steps.push(`Game generado: ${publicPaths.imageGame}`);

    await sharp(renderBuffer)
      .resize({ width: SIZES.detailWidth, withoutEnlargement: false })
      .webp({ quality: WEBP_QUALITY })
      .toFile(paths.detailWebp);
    result.steps.push(`Detail generado: ${publicPaths.imageDetail}`);

    await generateNormalized(paths.gameWebp, paths.normalizedWebp, item);
    result.steps.push(`Normalized generado: ${publicPaths.imageRenderNormalized}`);

    // El art no es imprescindible para que la carta se vea en minijuegos.
    // Si falla, queda como warning y seguimos.
    try {
      await downloadAndSaveArt(item, paths.art512Webp);
      result.steps.push(`Art 512 generado: ${publicPaths.imageArt}`);
    } catch (artError) {
      result.warnings.push(`No se pudo descargar art 512: ${artError?.message || String(artError)}`);
    }

    result.ok = true;
    return result;
  } catch (error) {
    result.error = error?.stack || error?.message || String(error);
    return result;
  }
}

async function generateNormalized(gameWebpPath, normalizedWebpPath, item) {
  const image = sharp(gameWebpPath);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(`No se pudo leer metadata de ${gameWebpPath}`);
  }

  const crop = getNormalizedCropBox(item, metadata.width, metadata.height);

  await image
    .extract(crop)
    .resize({ height: SIZES.normalizedHeight })
    .webp({ quality: WEBP_QUALITY })
    .toFile(normalizedWebpPath);
}

function getNormalizedCropBox(item, width, height) {
  // Estas proporciones salen del informe de normalized-renders:
  // - game source típico: 420x637
  // - minion normal: 16,53,369,516
  // - spell normal: 25,62,352,499
  // - weapon normal: 29,60,365,505
  // - legendary minion: 16,31,375,539
  //
  // Se aplican proporcionalmente para que no dependan de una dimensión exacta.
  const type = item.type;
  const rarity = item.rarity;

  let ratios;

  if (type === "SPELL") {
    ratios = rarity === "LEGENDARY"
      ? { x: 20 / 420, y: 31 / 637, w: 360 / 420, h: 539 / 637 }
      : { x: 25 / 420, y: 62 / 637, w: 352 / 420, h: 499 / 637 };
  } else if (type === "WEAPON") {
    ratios = { x: 29 / 420, y: 60 / 637, w: 365 / 420, h: 505 / 637 };
  } else if (type === "HERO") {
    ratios = { x: 16 / 420, y: 31 / 637, w: 375 / 420, h: 539 / 637 };
  } else if (type === "LOCATION") {
    // Aproximación conservadora. En esta prueba no deberían salir muchas locations.
    ratios = { x: 25 / 420, y: 55 / 637, w: 360 / 420, h: 510 / 637 };
  } else {
    ratios = rarity === "LEGENDARY"
      ? { x: 16 / 420, y: 31 / 637, w: 375 / 420, h: 539 / 637 }
      : { x: 16 / 420, y: 53 / 637, w: 369 / 420, h: 516 / 637 };
  }

  let left = Math.round(width * ratios.x);
  let top = Math.round(height * ratios.y);
  let cropWidth = Math.round(width * ratios.w);
  let cropHeight = Math.round(height * ratios.h);

  // Asegura que el crop no se salga.
  left = clamp(left, 0, width - 1);
  top = clamp(top, 0, height - 1);
  cropWidth = clamp(cropWidth, 1, width - left);
  cropHeight = clamp(cropHeight, 1, height - top);

  return {
    left,
    top,
    width: cropWidth,
    height: cropHeight,
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

async function downloadAndSaveArt(item, artOutputPath) {
  const artUrls = [
    `https://art.hearthstonejson.com/v1/512x/${encodeURIComponent(item.id)}.webp`,
    `https://art.hearthstonejson.com/v1/512x/${encodeURIComponent(item.id)}.jpg`,
    `https://art.hearthstonejson.com/v1/512x/${encodeURIComponent(item.id)}.png`,
  ];

  let lastError = null;

  for (const url of artUrls) {
    try {
      const artBuffer = await downloadBuffer(url);

      await sharp(artBuffer)
        .resize({ width: 512, height: 512, fit: "cover" })
        .webp({ quality: WEBP_QUALITY })
        .toFile(artOutputPath);

      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("No se pudo descargar art.");
}

function makeTextReport(results, args) {
  const ok = results.filter((r) => r.ok && !r.skipped);
  const skipped = results.filter((r) => r.skipped);
  const failed = results.filter((r) => !r.ok);

  const lines = [];

  lines.push("RESULTADO TEST DESCARGA DE IMÁGENES NUEVAS");
  lines.push("==========================================");
  lines.push("");
  lines.push(`Generado: ${new Date().toISOString()}`);
  lines.push(`Proyecto: ${PROJECT_ROOT}`);
  lines.push(`Plan leído: ${DOWNLOAD_PLAN_PATH}`);
  lines.push("");
  lines.push("Parámetros:");
  lines.push(`  limit: ${args.limit}`);
  lines.push(`  start: ${args.start}`);
  lines.push(`  ids: ${args.ids ? args.ids.join(", ") : "(no)"}`);
  lines.push(`  dryRun: ${args.dryRun ? "sí" : "no"}`);
  lines.push(`  includeHeroes: ${args.includeHeroes ? "sí" : "no"}`);
  lines.push(`  overwrite: ${args.overwrite ? "sí" : "no"}`);
  lines.push("");

  lines.push("Resumen:");
  lines.push(`  procesadas OK: ${ok.length}`);
  lines.push(`  saltadas: ${skipped.length}`);
  lines.push(`  fallidas: ${failed.length}`);
  lines.push(`  total seleccionadas: ${results.length}`);
  lines.push("");

  for (const result of results) {
    lines.push(`${result.ok ? "OK" : "ERROR"} ${result.id} / ${result.name} (${result.type}, ${result.set})`);

    if (result.skipped) {
      lines.push("  saltada: sí");
    }

    for (const step of result.steps) {
      lines.push(`  - ${step}`);
    }

    for (const warning of result.warnings) {
      lines.push(`  WARNING: ${warning}`);
    }

    if (result.error) {
      lines.push("  ERROR:");
      lines.push(indent(result.error, "    "));
    }

    lines.push("");
  }

  lines.push("Archivos principales esperados por carta:");
  lines.push("  public/cards/ID.png");
  lines.push("  public/cards-optimized/thumb/ID.webp");
  lines.push("  public/cards-optimized/game/ID.webp");
  lines.push("  public/cards-optimized/detail/ID.webp");
  lines.push("  public/cards-normalized/ID.webp");
  lines.push("  public/card-art-optimized/512/ID.webp");
  lines.push("");
  lines.push("Siguiente paso:");
  lines.push("  1. Abrir la preview HTML.");
  lines.push("  2. Revisar visualmente renders game/normalized.");
  lines.push("  3. Si está bien, hacer versión para las 309 cartas.");
  lines.push("");

  return lines.join("\n");
}

function makePreviewHtml(results) {
  const rows = results
    .map((result) => {
      const paths = result.publicPaths;

      return `
        <section class="card ${result.ok ? "ok" : "bad"}">
          <h2>${escapeHtml(result.id)} — ${escapeHtml(result.name || "")}</h2>
          <p>${escapeHtml(result.set || "")} · ${escapeHtml(result.type || "")} · ${escapeHtml(result.cardClass || "")}</p>
          ${result.error ? `<pre>${escapeHtml(result.error)}</pre>` : ""}
          <div class="images">
            <figure>
              <img src="${paths.image}" alt="">
              <figcaption>PNG original</figcaption>
            </figure>
            <figure>
              <img src="${paths.imageGame}" alt="">
              <figcaption>game</figcaption>
            </figure>
            <figure>
              <img src="${paths.imageRenderNormalized}" alt="">
              <figcaption>normalized</figcaption>
            </figure>
            <figure>
              <img src="${paths.imageThumb}" alt="">
              <figcaption>thumb</figcaption>
            </figure>
            <figure>
              <img src="${paths.imageArt}" alt="">
              <figcaption>art</figcaption>
            </figure>
          </div>
        </section>
      `;
    })
    .join("\n");

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Preview test imágenes nuevas</title>
<style>
  body {
    margin: 0;
    padding: 24px;
    font-family: system-ui, sans-serif;
    background: #111827;
    color: #f8fafc;
  }

  h1 {
    margin: 0 0 18px;
  }

  .card {
    margin: 0 0 24px;
    padding: 18px;
    border: 1px solid rgba(255,255,255,.15);
    border-radius: 16px;
    background: rgba(255,255,255,.06);
  }

  .card.bad {
    border-color: rgba(255,80,80,.6);
  }

  .card h2 {
    margin: 0 0 4px;
    font-size: 20px;
  }

  .card p {
    margin: 0 0 14px;
    color: #cbd5e1;
  }

  .images {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: end;
  }

  figure {
    margin: 0;
    padding: 10px;
    border-radius: 12px;
    background: rgba(0,0,0,.24);
    text-align: center;
  }

  img {
    max-width: 160px;
    max-height: 230px;
    object-fit: contain;
  }

  figcaption {
    margin-top: 8px;
    color: #cbd5e1;
    font-size: 12px;
  }

  pre {
    max-width: 100%;
    overflow: auto;
    padding: 12px;
    border-radius: 10px;
    background: rgba(0,0,0,.3);
    color: #fecaca;
  }
</style>
</head>
<body>
  <h1>Preview test imágenes nuevas</h1>
  ${rows}
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

function indent(text, prefix) {
  return String(text)
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
}

async function main() {
  const args = parseArgs(process.argv);

  if (!fileExists(DOWNLOAD_PLAN_PATH)) {
    throw new Error(
      [
        `No encuentro ${DOWNLOAD_PLAN_PATH}`,
        "Antes ejecuta:",
        "  node scripts/generate-cards-es-preview.mjs",
      ].join("\n")
    );
  }

  ensureOutputDirs();

  const plan = readJson(DOWNLOAD_PLAN_PATH);
  if (!Array.isArray(plan)) {
    throw new Error(`El plan no es un array: ${DOWNLOAD_PLAN_PATH}`);
  }

  const selectedItems = selectItems(plan, args);

  console.log(`Plan total: ${plan.length}`);
  console.log(`Seleccionadas: ${selectedItems.length}`);
  console.log("");

  const results = [];

  for (const [index, item] of selectedItems.entries()) {
    console.log(`[${index + 1}/${selectedItems.length}] ${item.id} ${item.name}`);

    const result = await processItem(item, args);
    results.push(result);

    if (result.ok) {
      console.log(`  OK${result.skipped ? " (saltada)" : ""}`);
    } else {
      console.log(`  ERROR: ${result.error?.split("\n")[0] || "error desconocido"}`);
    }
  }

  writeJson(REPORT_JSON_PATH, {
    generatedAt: new Date().toISOString(),
    projectRoot: PROJECT_ROOT,
    args,
    results,
  });

  fs.writeFileSync(REPORT_TXT_PATH, makeTextReport(results, args), "utf8");
  fs.writeFileSync(PREVIEW_HTML_PATH, makePreviewHtml(results), "utf8");

  console.log("");
  console.log("Test terminado.");
  console.log(`TXT:     ${REPORT_TXT_PATH}`);
  console.log(`JSON:    ${REPORT_JSON_PATH}`);
  console.log(`Preview: ${PREVIEW_HTML_PATH}`);
}

try {
  await main();
} catch (error) {
  console.error("");
  console.error("ERROR EN DESCARGA TEST");
  console.error("----------------------");
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
}
