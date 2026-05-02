#!/usr/bin/env node
/**
 * Preview multiidioma ES/EN v1.
 *
 * Qué hace:
 * - Lee public/data/cards.json
 * - Elige una muestra pequeña:
 *   - 10 cartas antiguas: copia sus imágenes actuales como EN y descarga/genera ES
 *   - 10 cartas nuevas: copia sus imágenes actuales como ES y descarga/genera EN
 * - Crea estructura nueva localizada:
 *   - public/cards-localized/{es,en}/
 *   - public/cards-optimized-localized/{es,en}/{thumb,game,detail}/
 *   - public/cards-normalized-localized/{es,en}/
 * - Genera:
 *   - public/data/cards.multilang.preview.json
 *   - reports/multilang-preview.json
 *   - reports/multilang-preview.txt
 *   - reports/multilang-preview.html
 *
 * Qué NO hace:
 * - No modifica public/data/cards.json
 * - No toca la app
 * - No borra nada
 *
 * Requisito:
 * - npm install -D sharp
 *
 * Uso:
 *   node scripts/create-multilang-preview.mjs
 *   node scripts/create-multilang-preview.mjs --old=10 --new=10
 *   node scripts/create-multilang-preview.mjs --overwrite
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

const CARDS_PATH = path.join(PROJECT_ROOT, "public", "data", "cards.json");
const PREVIEW_CARDS_PATH = path.join(PROJECT_ROOT, "public", "data", "cards.multilang.preview.json");

const REPORTS_DIR = path.join(PROJECT_ROOT, "reports");
const REPORT_JSON_PATH = path.join(REPORTS_DIR, "multilang-preview.json");
const REPORT_TXT_PATH = path.join(REPORTS_DIR, "multilang-preview.txt");
const REPORT_HTML_PATH = path.join(REPORTS_DIR, "multilang-preview.html");

const ART_RENDER_BASE = "https://art.hearthstonejson.com/v1/render/latest";

const GAME_TYPES = new Set(["MINION", "SPELL", "WEAPON", "LOCATION"]);
const WEBP_QUALITY = 86;

const SIZES = {
  thumbWidth: 180,
  gameWidth: 420,
  detailWidth: 512,
  normalizedHeight: 682,
};

const IMAGE_FIELDS = [
  "image",
  "imageThumb",
  "imageGame",
  "imageDetail",
  "imageRenderNormalized",
];

function parseArgs(argv) {
  const args = {
    oldCount: 10,
    newCount: 10,
    overwrite: false,
  };

  for (const arg of argv.slice(2)) {
    if (arg.startsWith("--old=")) {
      args.oldCount = Number(arg.split("=")[1]);
    } else if (arg.startsWith("--new=")) {
      args.newCount = Number(arg.split("=")[1]);
    } else if (arg === "--overwrite") {
      args.overwrite = true;
    }
  }

  if (!Number.isFinite(args.oldCount) || args.oldCount < 0) args.oldCount = 10;
  if (!Number.isFinite(args.newCount) || args.newCount < 0) args.newCount = 10;

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
  if (!publicPath || typeof publicPath !== "string") return null;
  const clean = publicPath.startsWith("/") ? publicPath.slice(1) : publicPath;
  return path.join(PROJECT_ROOT, "public", clean);
}

function filePathForPublic(publicPath) {
  const filePath = publicPathToFilePath(publicPath);
  if (!filePath) throw new Error(`Ruta pública inválida: ${publicPath}`);
  return filePath;
}

function localizedPublicPaths(id, locale) {
  return {
    image: `/cards-localized/${locale}/${id}.png`,
    imageThumb: `/cards-optimized-localized/${locale}/thumb/${id}.webp`,
    imageGame: `/cards-optimized-localized/${locale}/game/${id}.webp`,
    imageDetail: `/cards-optimized-localized/${locale}/detail/${id}.webp`,
    imageRenderNormalized: `/cards-normalized-localized/${locale}/${id}.webp`,
  };
}

function ensureLocalizedDirs() {
  for (const locale of ["es", "en"]) {
    ensureDir(path.join(PROJECT_ROOT, "public", "cards-localized", locale));
    ensureDir(path.join(PROJECT_ROOT, "public", "cards-optimized-localized", locale, "thumb"));
    ensureDir(path.join(PROJECT_ROOT, "public", "cards-optimized-localized", locale, "game"));
    ensureDir(path.join(PROJECT_ROOT, "public", "cards-optimized-localized", locale, "detail"));
    ensureDir(path.join(PROJECT_ROOT, "public", "cards-normalized-localized", locale));
  }
  ensureDir(REPORTS_DIR);
  ensureDir(path.dirname(PREVIEW_CARDS_PATH));
}

function hasExistingImageFiles(card) {
  return IMAGE_FIELDS.every((field) => {
    const publicPath = card[field];
    const filePath = publicPathToFilePath(publicPath);
    return Boolean(filePath && fileExists(filePath));
  });
}

function isGeneratedNewCard(card) {
  return card.source === "hearthstonejson" || card.imageStatus === "ready" || card.imageStatus === "ready_without_art";
}

function selectOldCards(cards, count) {
  return cards
    .filter((card) => !isGeneratedNewCard(card))
    .filter((card) => GAME_TYPES.has(card.type))
    .filter((card) => hasExistingImageFiles(card))
    .slice(0, count);
}

function selectNewCards(cards, count) {
  return cards
    .filter((card) => isGeneratedNewCard(card))
    .filter((card) => GAME_TYPES.has(card.type))
    .filter((card) => hasExistingImageFiles(card))
    .slice(0, count);
}

function copyFileIfNeeded(sourcePath, targetPath, overwrite) {
  ensureDir(path.dirname(targetPath));

  if (!overwrite && fileExists(targetPath)) {
    return "exists";
  }

  fs.copyFileSync(sourcePath, targetPath);
  return "copied";
}

async function copyCurrentImagesToLocale(card, locale, args) {
  const localized = localizedPublicPaths(card.id, locale);
  const steps = [];

  const pairs = [
    ["image", card.image, localized.image],
    ["imageThumb", card.imageThumb, localized.imageThumb],
    ["imageGame", card.imageGame, localized.imageGame],
    ["imageDetail", card.imageDetail, localized.imageDetail],
    ["imageRenderNormalized", card.imageRenderNormalized, localized.imageRenderNormalized],
  ];

  for (const [field, sourcePublicPath, targetPublicPath] of pairs) {
    const sourcePath = publicPathToFilePath(sourcePublicPath);
    const targetPath = filePathForPublic(targetPublicPath);

    if (!sourcePath || !fileExists(sourcePath)) {
      throw new Error(`No existe imagen origen para ${card.id} ${field}: ${sourcePublicPath}`);
    }

    const status = copyFileIfNeeded(sourcePath, targetPath, args.overwrite);
    steps.push(`${status === "copied" ? "Copiado" : "Ya existía"} ${field}: ${targetPublicPath}`);
  }

  return {
    locale,
    paths: localized,
    steps,
  };
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
          "User-Agent": "hs-minijuegos-create-multilang-preview/1.0",
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

async function downloadAndGenerateLocale(card, locale, args) {
  const localized = localizedPublicPaths(card.id, locale);
  const renderUrl = `${ART_RENDER_BASE}/${locale === "es" ? "esES" : "enUS"}/512x/${encodeURIComponent(card.id)}.png`;

  const outputPaths = Object.fromEntries(
    Object.entries(localized).map(([field, publicPath]) => [field, filePathForPublic(publicPath)])
  );

  const allExist = Object.values(outputPaths).every((filePath) => fileExists(filePath));
  if (!args.overwrite && allExist) {
    return {
      locale,
      paths: localized,
      sourceUrl: renderUrl,
      steps: [`Archivos ${locale.toUpperCase()} ya existían; usa --overwrite para regenerarlos.`],
    };
  }

  const renderBuffer = await downloadBuffer(renderUrl);

  ensureDir(path.dirname(outputPaths.image));
  fs.writeFileSync(outputPaths.image, renderBuffer);

  await sharp(renderBuffer)
    .resize({ width: SIZES.thumbWidth, withoutEnlargement: false })
    .webp({ quality: WEBP_QUALITY })
    .toFile(outputPaths.imageThumb);

  await sharp(renderBuffer)
    .resize({ width: SIZES.gameWidth, withoutEnlargement: false })
    .webp({ quality: WEBP_QUALITY })
    .toFile(outputPaths.imageGame);

  await sharp(renderBuffer)
    .resize({ width: SIZES.detailWidth, withoutEnlargement: false })
    .webp({ quality: WEBP_QUALITY })
    .toFile(outputPaths.imageDetail);

  await generateNormalized(outputPaths.imageGame, outputPaths.imageRenderNormalized, card);

  return {
    locale,
    paths: localized,
    sourceUrl: renderUrl,
    steps: [
      `Render ${locale.toUpperCase()} descargado: ${localized.image}`,
      `Thumb ${locale.toUpperCase()} generado: ${localized.imageThumb}`,
      `Game ${locale.toUpperCase()} generado: ${localized.imageGame}`,
      `Detail ${locale.toUpperCase()} generado: ${localized.imageDetail}`,
      `Normalized ${locale.toUpperCase()} generado: ${localized.imageRenderNormalized}`,
    ],
  };
}

async function generateNormalized(gameWebpPath, normalizedWebpPath, card) {
  const image = sharp(gameWebpPath);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(`No se pudo leer metadata de ${gameWebpPath}`);
  }

  const crop = getNormalizedCropBox(card, metadata.width, metadata.height);

  ensureDir(path.dirname(normalizedWebpPath));

  await image
    .extract(crop)
    .resize({ height: SIZES.normalizedHeight })
    .webp({ quality: WEBP_QUALITY })
    .toFile(normalizedWebpPath);
}

function getNormalizedCropBox(card, width, height) {
  const type = card.type;
  const rarity = card.rarity;

  let ratios;

  if (type === "SPELL") {
    ratios = rarity === "LEGENDARY"
      ? { x: 20 / 420, y: 31 / 637, w: 360 / 420, h: 539 / 637 }
      : { x: 25 / 420, y: 62 / 637, w: 352 / 420, h: 499 / 637 };
  } else if (type === "WEAPON") {
    ratios = { x: 29 / 420, y: 60 / 637, w: 365 / 420, h: 505 / 637 };
  } else if (type === "LOCATION") {
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

  left = clamp(left, 0, width - 1);
  top = clamp(top, 0, height - 1);
  cropWidth = clamp(cropWidth, 1, width - left);
  cropHeight = clamp(cropHeight, 1, height - top);

  return { left, top, width: cropWidth, height: cropHeight };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

async function processCard(card, kind, args) {
  const result = {
    id: card.id,
    name: card.name,
    nameEn: card.nameEn,
    set: card.set,
    type: card.type,
    cardClass: card.cardClass,
    kind,
    ok: false,
    imagesByLocale: {},
    steps: [],
    error: null,
  };

  try {
    if (kind === "old") {
      const en = await copyCurrentImagesToLocale(card, "en", args);
      const es = await downloadAndGenerateLocale(card, "es", args);

      result.imagesByLocale.en = en.paths;
      result.imagesByLocale.es = es.paths;
      result.steps.push(...en.steps, ...es.steps);
    } else {
      const es = await copyCurrentImagesToLocale(card, "es", args);
      const en = await downloadAndGenerateLocale(card, "en", args);

      result.imagesByLocale.es = es.paths;
      result.imagesByLocale.en = en.paths;
      result.steps.push(...es.steps, ...en.steps);
    }

    result.ok = true;
  } catch (error) {
    result.error = error?.stack || error?.message || String(error);
  }

  return result;
}

function applyPreviewImagesToCards(cards, results) {
  const byId = new Map(results.filter((r) => r.ok).map((r) => [r.id, r]));

  return cards.map((card) => {
    const result = byId.get(card.id);
    if (!result) return card;

    return {
      ...card,
      imagesByLocale: result.imagesByLocale,
      multilangPreview: true,
    };
  });
}

function makeTextReport(report) {
  const lines = [];

  lines.push("PREVIEW MULTIIDIOMA ES/EN");
  lines.push("=========================");
  lines.push("");
  lines.push(`Generado: ${report.generatedAt}`);
  lines.push(`Proyecto: ${report.projectRoot}`);
  lines.push(`Base leída: ${report.files.cards}`);
  lines.push(`Preview JSON: ${report.files.previewCards}`);
  lines.push("");

  lines.push("Parámetros:");
  lines.push(`  old: ${report.args.oldCount}`);
  lines.push(`  new: ${report.args.newCount}`);
  lines.push(`  overwrite: ${report.args.overwrite ? "sí" : "no"}`);
  lines.push("");

  lines.push("Resumen:");
  lines.push(`  cartas antiguas seleccionadas: ${report.totals.oldSelected}`);
  lines.push(`  cartas nuevas seleccionadas: ${report.totals.newSelected}`);
  lines.push(`  procesadas OK: ${report.totals.ok}`);
  lines.push(`  fallidas: ${report.totals.failed}`);
  lines.push(`  cartas con imagesByLocale en preview: ${report.totals.previewCardsWithImagesByLocale}`);
  lines.push("");

  for (const result of report.results) {
    lines.push(`${result.ok ? "OK" : "ERROR"} ${result.id} / ${result.name} (${result.kind}, ${result.type}, ${result.set})`);

    if (result.error) {
      lines.push("  ERROR:");
      lines.push(indent(result.error, "    "));
    } else {
      lines.push("  ES:");
      lines.push(`    imageGame: ${result.imagesByLocale.es?.imageGame ?? "(no)"}`);
      lines.push(`    normalized: ${result.imagesByLocale.es?.imageRenderNormalized ?? "(no)"}`);
      lines.push("  EN:");
      lines.push(`    imageGame: ${result.imagesByLocale.en?.imageGame ?? "(no)"}`);
      lines.push(`    normalized: ${result.imagesByLocale.en?.imageRenderNormalized ?? "(no)"}`);
    }

    lines.push("");
  }

  lines.push("Siguiente paso sugerido:");
  lines.push("  1. Abrir reports/multilang-preview.html.");
  lines.push("  2. Revisar ES/EN lado a lado.");
  lines.push("  3. Si se ve bien, hacemos helper getCardImage.");
  lines.push("  4. Después probamos cambio de idioma en Base de datos.");
  lines.push("");

  return lines.join("\n");
}

function makeHtmlReport(report) {
  const cardsHtml = report.results.map((result) => {
    const es = result.imagesByLocale.es ?? {};
    const en = result.imagesByLocale.en ?? {};

    return `
<section class="card ${result.ok ? "ok" : "bad"}">
  <h2>${escapeHtml(result.id)} — ${escapeHtml(result.name)} / ${escapeHtml(result.nameEn)}</h2>
  <p>${escapeHtml(result.kind)} · ${escapeHtml(result.set)} · ${escapeHtml(result.type)} · ${escapeHtml(result.cardClass ?? "")}</p>
  ${result.error ? `<pre>${escapeHtml(result.error)}</pre>` : ""}
  <div class="langs">
    <div>
      <h3>ES</h3>
      <figure><img src="${es.imageGame ?? ""}" alt=""><figcaption>game ES</figcaption></figure>
      <figure><img src="${es.imageRenderNormalized ?? ""}" alt=""><figcaption>normalized ES</figcaption></figure>
    </div>
    <div>
      <h3>EN</h3>
      <figure><img src="${en.imageGame ?? ""}" alt=""><figcaption>game EN</figcaption></figure>
      <figure><img src="${en.imageRenderNormalized ?? ""}" alt=""><figcaption>normalized EN</figcaption></figure>
    </div>
  </div>
</section>`;
  }).join("\n");

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Preview multiidioma ES/EN</title>
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
    border-color: rgba(255,80,80,.7);
  }

  .card h2 {
    margin: 0 0 6px;
    font-size: 20px;
  }

  .card p {
    margin: 0 0 14px;
    color: #cbd5e1;
  }

  .langs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .langs > div {
    padding: 14px;
    border-radius: 14px;
    background: rgba(0,0,0,.24);
  }

  h3 {
    margin: 0 0 10px;
  }

  figure {
    display: inline-block;
    vertical-align: bottom;
    margin: 0 12px 12px 0;
    padding: 10px;
    border-radius: 12px;
    background: rgba(255,255,255,.07);
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
  <h1>Preview multiidioma ES/EN</h1>
  ${cardsHtml}
</body>
</html>`;
}

function indent(text, prefix) {
  return String(text)
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
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

  if (!fileExists(CARDS_PATH)) {
    throw new Error(`No encuentro ${CARDS_PATH}`);
  }

  ensureLocalizedDirs();

  const cards = readJson(CARDS_PATH);
  if (!Array.isArray(cards)) {
    throw new Error(`El archivo no contiene un array: ${CARDS_PATH}`);
  }

  const oldCards = selectOldCards(cards, args.oldCount);
  const newCards = selectNewCards(cards, args.newCount);

  console.log(`Cartas antiguas seleccionadas: ${oldCards.length}`);
  console.log(`Cartas nuevas seleccionadas: ${newCards.length}`);
  console.log("");

  const results = [];

  for (const [index, card] of [...oldCards.map((c) => [c, "old"]), ...newCards.map((c) => [c, "new"])].entries()) {
    const [selectedCard, kind] = card;
    console.log(`[${index + 1}/${oldCards.length + newCards.length}] ${selectedCard.id} ${selectedCard.name} (${kind})`);

    const result = await processCard(selectedCard, kind, args);
    results.push(result);

    console.log(result.ok ? "  OK" : `  ERROR: ${result.error?.split("\n")[0] ?? "error"}`);
  }

  const previewCards = applyPreviewImagesToCards(cards, results);
  writeJson(PREVIEW_CARDS_PATH, previewCards);

  const report = {
    generatedAt: new Date().toISOString(),
    projectRoot: PROJECT_ROOT,
    args,
    files: {
      cards: CARDS_PATH,
      previewCards: PREVIEW_CARDS_PATH,
      reportJson: REPORT_JSON_PATH,
      reportTxt: REPORT_TXT_PATH,
      reportHtml: REPORT_HTML_PATH,
    },
    totals: {
      inputCards: cards.length,
      oldSelected: oldCards.length,
      newSelected: newCards.length,
      ok: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      previewCardsWithImagesByLocale: previewCards.filter((card) => card.imagesByLocale).length,
    },
    selected: {
      old: oldCards.map((card) => ({ id: card.id, name: card.name, nameEn: card.nameEn, set: card.set, type: card.type })),
      new: newCards.map((card) => ({ id: card.id, name: card.name, nameEn: card.nameEn, set: card.set, type: card.type })),
    },
    results,
  };

  writeJson(REPORT_JSON_PATH, report);
  fs.writeFileSync(REPORT_TXT_PATH, makeTextReport(report), "utf8");
  fs.writeFileSync(REPORT_HTML_PATH, makeHtmlReport(report), "utf8");

  console.log("");
  console.log("Preview multiidioma generada.");
  console.log(`Preview JSON: ${PREVIEW_CARDS_PATH}`);
  console.log(`Report TXT:   ${REPORT_TXT_PATH}`);
  console.log(`Report HTML:  ${REPORT_HTML_PATH}`);
}

try {
  await main();
} catch (error) {
  console.error("");
  console.error("ERROR EN PREVIEW MULTIIDIOMA");
  console.error("----------------------------");
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
}
