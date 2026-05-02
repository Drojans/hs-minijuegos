#!/usr/bin/env node
/**
 * Aplicador de rutas de imágenes a cards.generated.es.json v1.
 *
 * Qué hace:
 * - Lee public/data/cards.generated.es.json
 * - Lee reports/new-cards-to-download.json
 * - Comprueba si existen las imágenes generadas:
 *   - public/cards/ID.png
 *   - public/cards-optimized/thumb/ID.webp
 *   - public/cards-optimized/game/ID.webp
 *   - public/cards-optimized/detail/ID.webp
 *   - public/cards-normalized/ID.webp
 *   - public/card-art-optimized/512/ID.webp
 * - Crea una nueva base lista con rutas reales:
 *   - public/data/cards.generated.es.with-images.json
 * - Genera informes:
 *   - reports/cards-generated-image-paths.json
 *   - reports/cards-generated-image-paths.txt
 *
 * Qué NO hace:
 * - No modifica public/data/cards.json
 * - No cambia la app
 * - No descarga imágenes
 *
 * Opcional:
 * - Con --in-place también actualiza public/data/cards.generated.es.json
 *
 * Uso:
 *   node scripts/apply-generated-image-paths.mjs
 *   node scripts/apply-generated-image-paths.mjs --in-place
 */

import fs from "node:fs";
import path from "node:path";

const PROJECT_ROOT = process.cwd();

const GENERATED_INPUT_PATH = path.join(PROJECT_ROOT, "public", "data", "cards.generated.es.json");
const GENERATED_OUTPUT_PATH = path.join(PROJECT_ROOT, "public", "data", "cards.generated.es.with-images.json");
const DOWNLOAD_PLAN_PATH = path.join(PROJECT_ROOT, "reports", "new-cards-to-download.json");

const REPORTS_DIR = path.join(PROJECT_ROOT, "reports");
const REPORT_JSON_PATH = path.join(REPORTS_DIR, "cards-generated-image-paths.json");
const REPORT_TXT_PATH = path.join(REPORTS_DIR, "cards-generated-image-paths.txt");

const IMAGE_FIELDS = [
  "image",
  "imageThumb",
  "imageGame",
  "imageDetail",
  "imageArt",
  "imageRenderNormalized",
];

function parseArgs(argv) {
  return {
    inPlace: argv.includes("--in-place"),
  };
}

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
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

function expectedPublicPaths(id) {
  return {
    image: `/cards/${id}.png`,
    imageThumb: `/cards-optimized/thumb/${id}.webp`,
    imageGame: `/cards-optimized/game/${id}.webp`,
    imageDetail: `/cards-optimized/detail/${id}.webp`,
    imageArt: `/card-art-optimized/512/${id}.webp`,
    imageRenderNormalized: `/cards-normalized/${id}.webp`,
  };
}

function checkPaths(paths) {
  const checks = {};

  for (const [field, publicPath] of Object.entries(paths)) {
    const filePath = publicPathToFilePath(publicPath);

    checks[field] = {
      publicPath,
      filePath,
      exists: Boolean(filePath && fileExists(filePath)),
    };
  }

  return checks;
}

function allCoreImagesExist(checks) {
  return (
    checks.image?.exists &&
    checks.imageThumb?.exists &&
    checks.imageGame?.exists &&
    checks.imageDetail?.exists &&
    checks.imageRenderNormalized?.exists
  );
}

function allImagesExist(checks) {
  return IMAGE_FIELDS.every((field) => checks[field]?.exists);
}

function minCard(card) {
  return {
    id: card.id,
    dbfId: card.dbfId,
    name: card.name,
    nameEn: card.nameEn,
    set: card.set,
    type: card.type,
    cardClass: card.cardClass,
    needsImages: card.needsImages ?? null,
    source: card.source ?? null,
  };
}

function applyPaths(cards, plan) {
  const planById = new Map(plan.map((item) => [item.id, item]));
  const updatedCards = [];

  const applied = [];
  const stillMissing = [];
  const skippedNonGenerated = [];
  const generatedNotInPlan = [];

  for (const card of cards) {
    const nextCard = { ...card };

    const isGeneratedCard = card.source === "hearthstonejson" || card.needsImages === true;
    const planItem = card.id ? planById.get(card.id) : null;

    if (!isGeneratedCard) {
      updatedCards.push(nextCard);
      skippedNonGenerated.push(minCard(card));
      continue;
    }

    if (!planItem) {
      generatedNotInPlan.push(minCard(card));
      updatedCards.push(nextCard);
      continue;
    }

    const paths = expectedPublicPaths(card.id);
    const checks = checkPaths(paths);

    if (allCoreImagesExist(checks)) {
      nextCard.image = paths.image;
      nextCard.imageThumb = paths.imageThumb;
      nextCard.imageGame = paths.imageGame;
      nextCard.imageDetail = paths.imageDetail;
      nextCard.imageRenderNormalized = paths.imageRenderNormalized;

      // Art no debería bloquear la carta. Si existe, se pone; si no, queda null.
      nextCard.imageArt = checks.imageArt.exists ? paths.imageArt : null;

      nextCard.needsImages = false;
      nextCard.imageStatus = checks.imageArt.exists ? "ready" : "ready_without_art";

      applied.push({
        ...minCard(nextCard),
        imageStatus: nextCard.imageStatus,
        paths,
      });
    } else {
      nextCard.needsImages = true;
      nextCard.imageStatus = "missing_images";

      const missingFields = IMAGE_FIELDS.filter((field) => !checks[field]?.exists);

      stillMissing.push({
        ...minCard(nextCard),
        imageStatus: nextCard.imageStatus,
        missingFields,
        checks,
      });
    }

    updatedCards.push(nextCard);
  }

  return {
    updatedCards,
    applied,
    stillMissing,
    skippedNonGenerated,
    generatedNotInPlan,
  };
}

function analyzeImages(cards) {
  const result = {};

  for (const field of IMAGE_FIELDS) {
    let withValue = 0;
    let withoutValue = 0;
    let existing = 0;
    let missing = 0;
    const examplesMissing = [];

    for (const card of cards) {
      const value = card[field];

      if (value) {
        withValue += 1;
        const filePath = publicPathToFilePath(value);
        if (filePath && fileExists(filePath)) {
          existing += 1;
        } else {
          missing += 1;
          if (examplesMissing.length < 20) {
            examplesMissing.push({
              id: card.id,
              name: card.name,
              field,
              publicPath: value,
              filePath,
            });
          }
        }
      } else {
        withoutValue += 1;
      }
    }

    result[field] = {
      withValue,
      withoutValue,
      existing,
      missing,
      examplesMissing,
    };
  }

  return result;
}

function countBy(items, getter) {
  const counts = new Map();

  for (const item of items) {
    const value = getter(item);
    const key =
      value === null ? "(null)" :
      value === undefined ? "(undefined)" :
      value === "" ? "(empty)" :
      String(value);

    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

function makeReport(originalCards, updatedCards, plan, result, args) {
  const generatedCards = updatedCards.filter(
    (card) => card.source === "hearthstonejson" || card.imageStatus
  );

  return {
    generatedAt: new Date().toISOString(),
    projectRoot: PROJECT_ROOT,
    args,
    files: {
      input: GENERATED_INPUT_PATH,
      output: GENERATED_OUTPUT_PATH,
      downloadPlan: DOWNLOAD_PLAN_PATH,
      inPlaceUpdated: args.inPlace ? GENERATED_INPUT_PATH : null,
      reportJson: REPORT_JSON_PATH,
      reportTxt: REPORT_TXT_PATH,
    },
    totals: {
      inputCards: originalCards.length,
      outputCards: updatedCards.length,
      planItems: plan.length,
      generatedCards: generatedCards.length,
      pathsApplied: result.applied.length,
      stillMissingImages: result.stillMissing.length,
      generatedNotInPlan: result.generatedNotInPlan.length,
      nonGeneratedCards: result.skippedNonGenerated.length,
      readyGeneratedCards: generatedCards.filter((card) => card.needsImages === false).length,
      pendingGeneratedCards: generatedCards.filter((card) => card.needsImages === true).length,
    },
    distributions: {
      appliedByType: countBy(result.applied, (card) => card.type),
      appliedBySet: countBy(result.applied, (card) => card.set),
      missingByType: countBy(result.stillMissing, (card) => card.type),
      missingBySet: countBy(result.stillMissing, (card) => card.set),
    },
    imageSummary: analyzeImages(updatedCards),
    examples: {
      applied: result.applied.slice(0, 50),
      stillMissing: result.stillMissing.slice(0, 50),
      generatedNotInPlan: result.generatedNotInPlan.slice(0, 50),
    },
  };
}

function topLines(title, items, limit = 20) {
  const lines = [`${title}:`];

  if (!items || items.length === 0) {
    lines.push("  - Sin datos");
    return lines;
  }

  for (const item of items.slice(0, limit)) {
    lines.push(`  - ${item.key}: ${item.count}`);
  }

  if (items.length > limit) {
    lines.push(`  ... +${items.length - limit} más`);
  }

  return lines;
}

function makeTextReport(report) {
  const lines = [];

  lines.push("APLICACIÓN DE RUTAS A CARDS GENERATED");
  lines.push("=====================================");
  lines.push("");
  lines.push(`Generado: ${report.generatedAt}`);
  lines.push(`Proyecto: ${report.projectRoot}`);
  lines.push(`Input: ${report.files.input}`);
  lines.push(`Output: ${report.files.output}`);
  lines.push(`Plan: ${report.files.downloadPlan}`);
  lines.push(`In-place: ${report.args.inPlace ? "sí" : "no"}`);
  lines.push("");

  lines.push("RESUMEN");
  lines.push("-------");
  lines.push(`Cartas input: ${report.totals.inputCards}`);
  lines.push(`Cartas output: ${report.totals.outputCards}`);
  lines.push(`Items en plan de descarga: ${report.totals.planItems}`);
  lines.push(`Cartas generadas/nuevas detectadas: ${report.totals.generatedCards}`);
  lines.push(`Rutas aplicadas correctamente: ${report.totals.pathsApplied}`);
  lines.push(`Cartas nuevas todavía con imágenes faltantes: ${report.totals.stillMissingImages}`);
  lines.push(`Cartas generadas no encontradas en plan: ${report.totals.generatedNotInPlan}`);
  lines.push(`Cartas generadas listas: ${report.totals.readyGeneratedCards}`);
  lines.push(`Cartas generadas pendientes: ${report.totals.pendingGeneratedCards}`);
  lines.push("");

  lines.push(...topLines("Rutas aplicadas por tipo", report.distributions.appliedByType));
  lines.push("");
  lines.push(...topLines("Rutas aplicadas por set", report.distributions.appliedBySet, 30));
  lines.push("");

  lines.push("RESUMEN DE IMÁGENES EN BASE RESULTANTE");
  lines.push("--------------------------------------");
  for (const [field, stats] of Object.entries(report.imageSummary)) {
    lines.push(`${field}:`);
    lines.push(`  con valor: ${stats.withValue}`);
    lines.push(`  sin valor: ${stats.withoutValue}`);
    lines.push(`  archivos encontrados: ${stats.existing}`);
    lines.push(`  archivos no encontrados: ${stats.missing}`);

    if (stats.examplesMissing.length) {
      lines.push("  ejemplos no encontrados:");
      for (const example of stats.examplesMissing.slice(0, 5)) {
        lines.push(`    - ${example.id} / ${example.name}: ${example.publicPath}`);
      }
    }

    lines.push("");
  }

  if (report.examples.stillMissing.length) {
    lines.push("CARTAS NUEVAS TODAVÍA PENDIENTES");
    lines.push("--------------------------------");
    for (const card of report.examples.stillMissing.slice(0, 30)) {
      lines.push(`- ${card.id} / ${card.name} [${card.set}, ${card.type}]`);
      lines.push(`  faltan: ${card.missingFields.join(", ")}`);
    }
    lines.push("");
  }

  lines.push("ARCHIVOS GENERADOS");
  lines.push("------------------");
  lines.push(`Base con rutas: ${report.files.output}`);
  if (report.files.inPlaceUpdated) {
    lines.push(`También actualizado in-place: ${report.files.inPlaceUpdated}`);
  }
  lines.push(`Report JSON: ${report.files.reportJson}`);
  lines.push(`Report TXT: ${report.files.reportTxt}`);
  lines.push("");

  lines.push("SIGUIENTE PASO SUGERIDO");
  lines.push("-----------------------");
  lines.push("1. Revisar que 'Cartas nuevas todavía con imágenes faltantes' sea 0.");
  lines.push("2. Revisar que 'Rutas aplicadas correctamente' sea 309.");
  lines.push("3. Si todo está bien, podemos probar la app con cards.generated.es.with-images.json.");
  lines.push("4. Todavía NO sustituir public/data/cards.json hasta probar.");
  lines.push("");

  return lines.join("\n");
}

function main() {
  const args = parseArgs(process.argv);

  if (!fileExists(GENERATED_INPUT_PATH)) {
    throw new Error(`No encuentro ${GENERATED_INPUT_PATH}. Ejecuta primero generate-cards-es-preview.`);
  }

  if (!fileExists(DOWNLOAD_PLAN_PATH)) {
    throw new Error(`No encuentro ${DOWNLOAD_PLAN_PATH}. Ejecuta primero generate-cards-es-preview.`);
  }

  ensureDir(REPORTS_DIR);

  const cards = readJson(GENERATED_INPUT_PATH);
  const plan = readJson(DOWNLOAD_PLAN_PATH);

  if (!Array.isArray(cards)) {
    throw new Error(`El archivo no contiene un array: ${GENERATED_INPUT_PATH}`);
  }

  if (!Array.isArray(plan)) {
    throw new Error(`El plan no contiene un array: ${DOWNLOAD_PLAN_PATH}`);
  }

  const result = applyPaths(cards, plan);
  const report = makeReport(cards, result.updatedCards, plan, result, args);

  writeJson(GENERATED_OUTPUT_PATH, result.updatedCards);

  if (args.inPlace) {
    writeJson(GENERATED_INPUT_PATH, result.updatedCards);
  }

  writeJson(REPORT_JSON_PATH, report);
  fs.writeFileSync(REPORT_TXT_PATH, makeTextReport(report), "utf8");

  console.log("Rutas aplicadas.");
  console.log(`Cartas output: ${report.totals.outputCards}`);
  console.log(`Rutas aplicadas: ${report.totals.pathsApplied}`);
  console.log(`Pendientes: ${report.totals.stillMissingImages}`);
  console.log("");
  console.log(`Base con rutas: ${GENERATED_OUTPUT_PATH}`);
  console.log(`Report TXT:    ${REPORT_TXT_PATH}`);
}

try {
  main();
} catch (error) {
  console.error("");
  console.error("ERROR APLICANDO RUTAS");
  console.error("---------------------");
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
}
