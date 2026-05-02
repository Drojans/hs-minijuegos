#!/usr/bin/env node
/**
 * Diagnóstico de la base de cartas.
 *
 * Qué hace:
 * - Lee public/data/cards.json
 * - Cuenta cartas y campos
 * - Resume clases, tipos, rarezas, razas, sets, escuelas y mecánicas
 * - Comprueba rutas de imágenes dentro de public/
 * - Genera reports/cards-data-diagnostic.json
 * - Genera reports/cards-data-diagnostic.txt
 *
 * No modifica la app.
 * No descarga nada.
 * No cambia cartas.
 */

import fs from "node:fs";
import path from "node:path";

const PROJECT_ROOT = process.cwd();

const DEFAULT_CARDS_PATH = path.join(PROJECT_ROOT, "public", "data", "cards.json");
const FALLBACK_CARDS_PATHS = [
  path.join(PROJECT_ROOT, "public", "cards.json"),
  path.join(PROJECT_ROOT, "src", "data", "cards.json"),
];

const REPORTS_DIR = path.join(PROJECT_ROOT, "reports");
const JSON_REPORT_PATH = path.join(REPORTS_DIR, "cards-data-diagnostic.json");
const TXT_REPORT_PATH = path.join(REPORTS_DIR, "cards-data-diagnostic.txt");

const IMAGE_FIELDS = [
  "image",
  "imageThumb",
  "imageGame",
  "imageDetail",
  "imageArt",
  "imageRenderNormalized",
];

const CORE_FIELDS = [
  "id",
  "dbfId",
  "name",
  "nameEn",
  "set",
  "type",
  "cardClass",
  "rarity",
  "cost",
  "attack",
  "health",
  "durability",
  "race",
  "spellSchool",
  "mechanics",
  "text",
  "textEn",
  "flavor",
  ...IMAGE_FIELDS,
];

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
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function findCardsPath() {
  if (fileExists(DEFAULT_CARDS_PATH)) return DEFAULT_CARDS_PATH;

  for (const candidate of FALLBACK_CARDS_PATHS) {
    if (fileExists(candidate)) return candidate;
  }

  throw new Error(
    [
      "No encuentro el archivo de cartas.",
      "Rutas probadas:",
      `- ${DEFAULT_CARDS_PATH}`,
      ...FALLBACK_CARDS_PATHS.map((p) => `- ${p}`),
      "",
      "Ejecuta este script desde la raíz del proyecto o ajusta la ruta en el script.",
    ].join("\n")
  );
}

function countBy(items, getter) {
  const counts = new Map();

  for (const item of items) {
    const value = getter(item);
    if (Array.isArray(value)) {
      for (const entry of value) {
        const key = normalizeBucket(entry);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    } else {
      const key = normalizeBucket(value);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return sortCountMap(counts);
}

function normalizeBucket(value) {
  if (value === null) return "(null)";
  if (value === undefined) return "(undefined)";
  if (value === "") return "(empty)";
  return String(value);
}

function sortCountMap(map) {
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

function uniqueSorted(values) {
  return [...new Set(values.filter((value) => value !== undefined && value !== null))]
    .map(String)
    .sort((a, b) => a.localeCompare(b));
}

function publicPathToFilePath(publicPath) {
  if (!publicPath || typeof publicPath !== "string") return null;

  const cleanPath = publicPath.startsWith("/")
    ? publicPath.slice(1)
    : publicPath;

  return path.join(PROJECT_ROOT, "public", cleanPath);
}

function extensionOf(publicPath) {
  if (!publicPath || typeof publicPath !== "string") return "(missing)";
  const ext = path.extname(publicPath).toLowerCase();
  return ext || "(no extension)";
}

function analyzeFields(cards) {
  const fieldNames = new Set();

  for (const card of cards) {
    for (const field of Object.keys(card)) {
      fieldNames.add(field);
    }
  }

  const allFields = [...fieldNames].sort((a, b) => a.localeCompare(b));

  const fieldStats = allFields.map((field) => {
    let present = 0;
    let nonEmpty = 0;
    let nullish = 0;
    let emptyString = 0;
    let arrays = 0;
    let objects = 0;

    for (const card of cards) {
      if (Object.prototype.hasOwnProperty.call(card, field)) {
        present += 1;
        const value = card[field];

        if (value === null || value === undefined) {
          nullish += 1;
        } else if (value === "") {
          emptyString += 1;
        } else {
          nonEmpty += 1;
        }

        if (Array.isArray(value)) arrays += 1;
        else if (value && typeof value === "object") objects += 1;
      }
    }

    return {
      field,
      present,
      missing: cards.length - present,
      nonEmpty,
      nullish,
      emptyString,
      arrays,
      objects,
    };
  });

  const missingCoreFields = CORE_FIELDS.filter((field) => !fieldNames.has(field));

  return {
    allFields,
    missingCoreFields,
    fieldStats,
  };
}

function analyzeImages(cards) {
  const result = {};

  for (const field of IMAGE_FIELDS) {
    const entries = cards.map((card) => ({
      id: card.id,
      name: card.name,
      path: card[field],
    }));

    const withValue = entries.filter((entry) => Boolean(entry.path));
    const withoutValue = entries.filter((entry) => !entry.path);

    let existingFiles = 0;
    let missingFiles = 0;
    const missingExamples = [];
    const extensionCounts = new Map();
    const directoryCounts = new Map();

    for (const entry of withValue) {
      const publicPath = entry.path;
      const filePath = publicPathToFilePath(publicPath);

      const ext = extensionOf(publicPath);
      extensionCounts.set(ext, (extensionCounts.get(ext) ?? 0) + 1);

      const directory = publicPath.includes("/")
        ? publicPath.split("/").slice(0, -1).join("/") || "/"
        : "(root)";
      directoryCounts.set(directory, (directoryCounts.get(directory) ?? 0) + 1);

      if (filePath && fileExists(filePath)) {
        existingFiles += 1;
      } else {
        missingFiles += 1;
        if (missingExamples.length < 20) {
          missingExamples.push({
            id: entry.id,
            name: entry.name,
            publicPath,
            expectedFilePath: filePath,
          });
        }
      }
    }

    result[field] = {
      withValue: withValue.length,
      withoutValue: withoutValue.length,
      existingFiles,
      missingFiles,
      extensionCounts: sortCountMap(extensionCounts),
      directoryCounts: sortCountMap(directoryCounts),
      missingExamples,
    };
  }

  return result;
}

function analyzeDuplicates(cards) {
  const byId = new Map();
  const byDbfId = new Map();
  const byName = new Map();
  const byNameEn = new Map();

  for (const card of cards) {
    if (card.id) addToMapList(byId, card.id, card);
    if (card.dbfId !== null && card.dbfId !== undefined) addToMapList(byDbfId, String(card.dbfId), card);
    if (card.name) addToMapList(byName, normalizeForName(card.name), card);
    if (card.nameEn) addToMapList(byNameEn, normalizeForName(card.nameEn), card);
  }

  return {
    duplicateIds: duplicateMapToReport(byId, 20),
    duplicateDbfIds: duplicateMapToReport(byDbfId, 20),
    duplicateNames: duplicateMapToReport(byName, 30),
    duplicateNamesEn: duplicateMapToReport(byNameEn, 30),
  };
}

function addToMapList(map, key, value) {
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(value);
}

function normalizeForName(name) {
  return String(name)
    .trim()
    .toLocaleLowerCase("es-ES")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function duplicateMapToReport(map, limit = 20) {
  return [...map.entries()]
    .filter(([, list]) => list.length > 1)
    .map(([key, list]) => ({
      key,
      count: list.length,
      cards: list.slice(0, 10).map((card) => ({
        id: card.id,
        dbfId: card.dbfId,
        name: card.name,
        nameEn: card.nameEn,
        set: card.set,
      })),
    }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
    .slice(0, limit);
}

function analyzeCards(cards, cardsPath) {
  const fields = analyzeFields(cards);
  const images = analyzeImages(cards);
  const duplicates = analyzeDuplicates(cards);

  const report = {
    generatedAt: new Date().toISOString(),
    projectRoot: PROJECT_ROOT,
    cardsPath,
    totals: {
      cards: cards.length,
      uniqueIds: uniqueSorted(cards.map((card) => card.id)).length,
      uniqueDbfIds: uniqueSorted(cards.map((card) => card.dbfId)).length,
      uniqueNames: uniqueSorted(cards.map((card) => card.name)).length,
      uniqueNamesEn: uniqueSorted(cards.map((card) => card.nameEn)).length,
    },
    fields,
    distributions: {
      sets: countBy(cards, (card) => card.set),
      types: countBy(cards, (card) => card.type),
      classes: countBy(cards, (card) => card.cardClass),
      rarities: countBy(cards, (card) => card.rarity),
      races: countBy(cards, (card) => card.race),
      spellSchools: countBy(cards, (card) => card.spellSchool),
      mechanics: countBy(cards, (card) => card.mechanics ?? []),
      costs: countBy(cards, (card) => card.cost),
    },
    images,
    duplicates,
    examples: {
      firstCard: cards[0] ?? null,
      cardsWithoutSpanishName: cards
        .filter((card) => !card.name)
        .slice(0, 20)
        .map(minCard),
      cardsWithoutEnglishName: cards
        .filter((card) => !card.nameEn)
        .slice(0, 20)
        .map(minCard),
      cardsWithoutTextFields: cards
        .filter((card) => card.text === undefined && card.textEn === undefined)
        .slice(0, 20)
        .map(minCard),
    },
  };

  return report;
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

  lines.push("DIAGNÓSTICO DE BASE DE CARTAS");
  lines.push("================================");
  lines.push("");
  lines.push(`Generado: ${report.generatedAt}`);
  lines.push(`Proyecto: ${report.projectRoot}`);
  lines.push(`Archivo: ${report.cardsPath}`);
  lines.push("");

  lines.push("RESUMEN");
  lines.push("-------");
  lines.push(`Cartas: ${report.totals.cards}`);
  lines.push(`IDs únicos: ${report.totals.uniqueIds}`);
  lines.push(`dbfIds únicos: ${report.totals.uniqueDbfIds}`);
  lines.push(`Nombres ES únicos: ${report.totals.uniqueNames}`);
  lines.push(`Nombres EN únicos: ${report.totals.uniqueNamesEn}`);
  lines.push("");

  lines.push("CAMPOS");
  lines.push("------");
  lines.push(`Campos detectados: ${report.fields.allFields.join(", ")}`);
  lines.push(
    `Campos core ausentes: ${
      report.fields.missingCoreFields.length
        ? report.fields.missingCoreFields.join(", ")
        : "ninguno"
    }`
  );
  lines.push("");

  lines.push("IMÁGENES");
  lines.push("--------");
  for (const [field, stats] of Object.entries(report.images)) {
    lines.push(`${field}:`);
    lines.push(`  con valor: ${stats.withValue}`);
    lines.push(`  sin valor: ${stats.withoutValue}`);
    lines.push(`  archivos encontrados: ${stats.existingFiles}`);
    lines.push(`  archivos no encontrados: ${stats.missingFiles}`);

    if (stats.extensionCounts.length) {
      lines.push(
        `  extensiones: ${stats.extensionCounts
          .map((entry) => `${entry.key} (${entry.count})`)
          .join(", ")}`
      );
    }

    if (stats.missingExamples.length) {
      lines.push("  ejemplos no encontrados:");
      for (const example of stats.missingExamples.slice(0, 5)) {
        lines.push(`    - ${example.id} / ${example.name}: ${example.publicPath}`);
      }
    }

    lines.push("");
  }

  lines.push(...topLines("SETS", report.distributions.sets, 30));
  lines.push("");
  lines.push(...topLines("TIPOS", report.distributions.types));
  lines.push("");
  lines.push(...topLines("CLASES", report.distributions.classes));
  lines.push("");
  lines.push(...topLines("RAREZAS", report.distributions.rarities));
  lines.push("");
  lines.push(...topLines("RAZAS", report.distributions.races, 30));
  lines.push("");
  lines.push(...topLines("ESCUELAS DE HECHIZO", report.distributions.spellSchools, 30));
  lines.push("");
  lines.push(...topLines("MECÁNICAS", report.distributions.mechanics, 50));
  lines.push("");

  lines.push("DUPLICADOS");
  lines.push("----------");
  lines.push(`IDs duplicados encontrados: ${report.duplicates.duplicateIds.length}`);
  lines.push(`dbfIds duplicados encontrados: ${report.duplicates.duplicateDbfIds.length}`);
  lines.push(`Nombres ES duplicados encontrados: ${report.duplicates.duplicateNames.length}`);
  lines.push(`Nombres EN duplicados encontrados: ${report.duplicates.duplicateNamesEn.length}`);
  lines.push("");

  if (report.duplicates.duplicateNames.length) {
    lines.push("Primeros nombres ES duplicados:");
    for (const duplicate of report.duplicates.duplicateNames.slice(0, 10)) {
      const sets = duplicate.cards.map((card) => `${card.name} [${card.set}]`).join(" | ");
      lines.push(`  - ${duplicate.key} (${duplicate.count}): ${sets}`);
    }
    lines.push("");
  }

  lines.push("SIGUIENTE PASO SUGERIDO");
  lines.push("-----------------------");
  lines.push("1. Revisar este informe.");
  lines.push("2. Confirmar qué archivo de cartas usa realmente la app.");
  lines.push("3. Después crear el comparador contra HearthstoneJSON latest esES/enUS.");
  lines.push("4. No borrar carpetas de imágenes hasta verificar que no tienen referencias activas.");
  lines.push("");

  return lines.join("\n");
}

function main() {
  const cardsPath = findCardsPath();
  const cards = readJson(cardsPath);

  if (!Array.isArray(cards)) {
    throw new Error(`El archivo no contiene un array de cartas: ${cardsPath}`);
  }

  const report = analyzeCards(cards, cardsPath);

  ensureDir(REPORTS_DIR);

  fs.writeFileSync(JSON_REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  fs.writeFileSync(TXT_REPORT_PATH, makeTextReport(report), "utf8");

  console.log("Diagnóstico completado.");
  console.log(`Cartas analizadas: ${report.totals.cards}`);
  console.log(`JSON: ${JSON_REPORT_PATH}`);
  console.log(`TXT:  ${TXT_REPORT_PATH}`);

  const imageSummary = Object.entries(report.images)
    .map(([field, stats]) => `${field}: ${stats.existingFiles}/${stats.withValue} encontrados`)
    .join("\n");

  console.log("");
  console.log(imageSummary);
}

try {
  main();
} catch (error) {
  console.error("");
  console.error("ERROR EN DIAGNÓSTICO");
  console.error("--------------------");
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
}
