#!/usr/bin/env node
/**
 * Switch seguro de base de cartas v1.
 *
 * Sirve para probar la app con:
 * - public/data/cards.json original
 * - public/data/cards.generated.es.with-images.json
 *
 * Qué hace:
 * - Crea backup estable de cards.json si no existe.
 * - Permite activar la base generated.
 * - Permite volver a la base original.
 * - Permite ver estado.
 *
 * No descarga nada.
 * No toca imágenes.
 *
 * Uso:
 *   node scripts/switch-cards-data.mjs --status
 *   node scripts/switch-cards-data.mjs --use-generated
 *   node scripts/switch-cards-data.mjs --use-original
 */

import fs from "node:fs";
import path from "node:path";

const PROJECT_ROOT = process.cwd();

const DATA_DIR = path.join(PROJECT_ROOT, "public", "data");
const ACTIVE_CARDS_PATH = path.join(DATA_DIR, "cards.json");
const GENERATED_CARDS_PATH = path.join(DATA_DIR, "cards.generated.es.with-images.json");
const ORIGINAL_BACKUP_PATH = path.join(DATA_DIR, "cards.original.before-generated-es.json");
const SWITCH_REPORT_PATH = path.join(PROJECT_ROOT, "reports", "cards-data-switch-report.txt");

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

function copyFile(from, to) {
  fs.copyFileSync(from, to);
}

function parseArgs(argv) {
  return {
    status: argv.includes("--status"),
    useGenerated: argv.includes("--use-generated"),
    useOriginal: argv.includes("--use-original"),
  };
}

function getCardsSummary(filePath) {
  if (!fileExists(filePath)) {
    return {
      exists: false,
      path: filePath,
      cards: null,
      generatedCards: null,
      needsImages: null,
      readyGenerated: null,
      pendingGenerated: null,
      firstIds: [],
    };
  }

  const cards = readJson(filePath);

  if (!Array.isArray(cards)) {
    return {
      exists: true,
      path: filePath,
      error: "No es un array JSON",
    };
  }

  const generated = cards.filter((card) => card.source === "hearthstonejson" || card.imageStatus);
  const needsImages = cards.filter((card) => card.needsImages === true);
  const readyGenerated = generated.filter((card) => card.needsImages === false);
  const pendingGenerated = generated.filter((card) => card.needsImages === true);

  return {
    exists: true,
    path: filePath,
    cards: cards.length,
    generatedCards: generated.length,
    needsImages: needsImages.length,
    readyGenerated: readyGenerated.length,
    pendingGenerated: pendingGenerated.length,
    firstIds: cards.slice(0, 5).map((card) => card.id),
    lastIds: cards.slice(-5).map((card) => card.id),
  };
}

function inferActiveMode(activeSummary) {
  if (!activeSummary.exists || activeSummary.error) return "desconocido";

  if (activeSummary.cards === 7899 && activeSummary.generatedCards === 309) {
    return "generated-es-with-images";
  }

  if (activeSummary.cards === 7590 && activeSummary.generatedCards === 0) {
    return "original";
  }

  if (activeSummary.generatedCards > 0) {
    return "generated/mixto";
  }

  return "desconocido";
}

function makeReport(action, summaries, notes = []) {
  const lines = [];

  lines.push("SWITCH BASE DE CARTAS");
  lines.push("=====================");
  lines.push("");
  lines.push(`Generado: ${new Date().toISOString()}`);
  lines.push(`Proyecto: ${PROJECT_ROOT}`);
  lines.push(`Acción: ${action}`);
  lines.push("");

  for (const [name, summary] of Object.entries(summaries)) {
    lines.push(name);
    lines.push("-".repeat(name.length));
    lines.push(`Ruta: ${summary.path}`);
    lines.push(`Existe: ${summary.exists ? "sí" : "no"}`);

    if (summary.error) {
      lines.push(`Error: ${summary.error}`);
    } else if (summary.exists) {
      lines.push(`Cartas: ${summary.cards}`);
      lines.push(`Cartas generated: ${summary.generatedCards}`);
      lines.push(`needsImages: ${summary.needsImages}`);
      lines.push(`generated listas: ${summary.readyGenerated}`);
      lines.push(`generated pendientes: ${summary.pendingGenerated}`);
      lines.push(`Primeros IDs: ${summary.firstIds?.join(", ") || ""}`);
      lines.push(`Últimos IDs: ${summary.lastIds?.join(", ") || ""}`);

      if (name === "ACTIVA cards.json") {
        lines.push(`Modo detectado: ${inferActiveMode(summary)}`);
      }
    }

    lines.push("");
  }

  if (notes.length) {
    lines.push("Notas");
    lines.push("-----");
    for (const note of notes) {
      lines.push(`- ${note}`);
    }
    lines.push("");
  }

  lines.push("Comandos útiles");
  lines.push("---------------");
  lines.push("Ver estado:");
  lines.push("  node scripts/switch-cards-data.mjs --status");
  lines.push("");
  lines.push("Probar generated:");
  lines.push("  node scripts/switch-cards-data.mjs --use-generated");
  lines.push("");
  lines.push("Volver a original:");
  lines.push("  node scripts/switch-cards-data.mjs --use-original");
  lines.push("");

  return lines.join("\n");
}

function writeReport(action, notes = []) {
  ensureDir(path.dirname(SWITCH_REPORT_PATH));

  const summaries = {
    "ACTIVA cards.json": getCardsSummary(ACTIVE_CARDS_PATH),
    "GENERATED with images": getCardsSummary(GENERATED_CARDS_PATH),
    "BACKUP original": getCardsSummary(ORIGINAL_BACKUP_PATH),
  };

  const text = makeReport(action, summaries, notes);
  fs.writeFileSync(SWITCH_REPORT_PATH, text, "utf8");

  console.log(text);
  console.log(`Informe escrito en: ${SWITCH_REPORT_PATH}`);
}

function ensureOriginalBackup() {
  if (!fileExists(ACTIVE_CARDS_PATH)) {
    throw new Error(`No encuentro cards.json activo: ${ACTIVE_CARDS_PATH}`);
  }

  if (!fileExists(ORIGINAL_BACKUP_PATH)) {
    copyFile(ACTIVE_CARDS_PATH, ORIGINAL_BACKUP_PATH);
    return "Backup original creado.";
  }

  return "Backup original ya existía; no se ha sobrescrito.";
}

function useGenerated() {
  if (!fileExists(GENERATED_CARDS_PATH)) {
    throw new Error(`No encuentro generated con imágenes: ${GENERATED_CARDS_PATH}`);
  }

  const backupNote = ensureOriginalBackup();
  copyFile(GENERATED_CARDS_PATH, ACTIVE_CARDS_PATH);

  writeReport("use-generated", [
    backupNote,
    "cards.generated.es.with-images.json copiado sobre public/data/cards.json.",
    "Ahora puedes arrancar la app y probar los minijuegos.",
    "Si algo va mal, ejecuta --use-original.",
  ]);
}

function useOriginal() {
  if (!fileExists(ORIGINAL_BACKUP_PATH)) {
    throw new Error(
      [
        `No encuentro backup original: ${ORIGINAL_BACKUP_PATH}`,
        "No puedo restaurar automáticamente.",
        "Si tienes un backup manual, restaura public/data/cards.json desde ahí.",
      ].join("\n")
    );
  }

  copyFile(ORIGINAL_BACKUP_PATH, ACTIVE_CARDS_PATH);

  writeReport("use-original", [
    "Backup original restaurado sobre public/data/cards.json.",
  ]);
}

function status() {
  writeReport("status");
}

function main() {
  const args = parseArgs(process.argv);

  const selectedActions = [args.status, args.useGenerated, args.useOriginal].filter(Boolean).length;

  if (selectedActions !== 1) {
    console.log(
      [
        "Elige una acción:",
        "",
        "  node scripts/switch-cards-data.mjs --status",
        "  node scripts/switch-cards-data.mjs --use-generated",
        "  node scripts/switch-cards-data.mjs --use-original",
        "",
      ].join("\n")
    );
    process.exitCode = 1;
    return;
  }

  if (args.status) status();
  if (args.useGenerated) useGenerated();
  if (args.useOriginal) useOriginal();
}

try {
  main();
} catch (error) {
  console.error("");
  console.error("ERROR EN SWITCH");
  console.error("---------------");
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
}
