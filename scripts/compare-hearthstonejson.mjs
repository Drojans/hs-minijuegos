#!/usr/bin/env node
/**
 * Comparador contra HearthstoneJSON v1.
 *
 * Qué hace:
 * - Lee public/data/cards.json
 * - Descarga HearthstoneJSON latest esES/enUS
 * - Compara tu base actual contra:
 *   - cards.collectible.json
 *   - cards.json
 * - Genera:
 *   - reports/hearthstonejson-compare.json
 *   - reports/hearthstonejson-compare.txt
 *
 * No modifica la app.
 * No descarga imágenes.
 * No cambia tu cards.json.
 */

import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const PROJECT_ROOT = process.cwd();

const DEFAULT_CARDS_PATH = path.join(PROJECT_ROOT, "public", "data", "cards.json");
const FALLBACK_CARDS_PATHS = [
  path.join(PROJECT_ROOT, "public", "cards.json"),
  path.join(PROJECT_ROOT, "src", "data", "cards.json"),
];

const REPORTS_DIR = path.join(PROJECT_ROOT, "reports");
const JSON_REPORT_PATH = path.join(REPORTS_DIR, "hearthstonejson-compare.json");
const TXT_REPORT_PATH = path.join(REPORTS_DIR, "hearthstonejson-compare.txt");

const LOCALES = {
  es: "esES",
  en: "enUS",
};

const REMOTE_FILES = {
  collectible: "cards.collectible.json",
  all: "cards.json",
};

const HSJSON_BASE = "https://api.hearthstonejson.com/v1/latest";
const ART_BASE = "https://art.hearthstonejson.com/v1";

const RENDERABLE_TYPES = new Set(["MINION", "SPELL", "WEAPON", "HERO", "LOCATION"]);
const COMPARABLE_FIELDS = [
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

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
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

function fetchText(url, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    const requestUrl = new URL(url);

    const req = https.get(
      requestUrl,
      {
        headers: {
          "Accept": "application/json,text/plain,*/*",
          "Accept-Encoding": "identity",
          "User-Agent": "hs-minijuegos-hearthstonejson-compare/1.0",
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
          fetchText(nextUrl, redirectsLeft - 1).then(resolve, reject);
          return;
        }

        if (status < 200 || status >= 300) {
          res.resume();
          reject(new Error(`Error HTTP ${status} al descargar ${url}`));
          return;
        }

        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          resolve(Buffer.concat(chunks).toString("utf8"));
        });
      }
    );

    req.on("error", reject);
    req.setTimeout(60000, () => {
      req.destroy(new Error(`Timeout descargando ${url}`));
    });
  });
}

async function fetchJson(url) {
  const raw = await fetchText(url);
  return JSON.parse(raw);
}

function endpoint(locale, fileName) {
  return `${HSJSON_BASE}/${locale}/${fileName}`;
}

async function downloadRemoteDataset(fileName) {
  const esUrl = endpoint(LOCALES.es, fileName);
  const enUrl = endpoint(LOCALES.en, fileName);

  console.log(`Descargando ${esUrl}`);
  const esCards = await fetchJson(esUrl);

  console.log(`Descargando ${enUrl}`);
  const enCards = await fetchJson(enUrl);

  if (!Array.isArray(esCards) || !Array.isArray(enCards)) {
    throw new Error(`HearthstoneJSON no ha devuelto arrays para ${fileName}`);
  }

  return {
    esUrl,
    enUrl,
    esCards,
    enCards,
    mergedCards: mergeLocaleCards(esCards, enCards),
  };
}

function mergeLocaleCards(esCards, enCards) {
  const enById = new Map();
  const enByDbfId = new Map();

  for (const card of enCards) {
    if (card.id) enById.set(card.id, card);
    if (card.dbfId !== null && card.dbfId !== undefined) enByDbfId.set(String(card.dbfId), card);
  }

  return esCards.map((esCard) => {
    const enCard =
      (esCard.id && enById.get(esCard.id)) ||
      (esCard.dbfId !== null && esCard.dbfId !== undefined
        ? enByDbfId.get(String(esCard.dbfId))
        : null) ||
      {};

    return normalizeRemoteCard(esCard, enCard);
  });
}

function normalizeRemoteCard(esCard, enCard = {}) {
  return {
    id: esCard.id,
    dbfId: esCard.dbfId,
    name: esCard.name,
    nameEn: enCard.name ?? null,
    text: esCard.text ?? null,
    textEn: enCard.text ?? null,
    flavor: esCard.flavor ?? null,
    flavorEn: enCard.flavor ?? null,
    set: esCard.set,
    type: esCard.type,
    cardClass: esCard.cardClass,
    classes: esCard.classes ?? null,
    multiClassGroup: esCard.multiClassGroup ?? null,
    rarity: esCard.rarity,
    collectible: esCard.collectible ?? null,
    cost: esCard.cost ?? null,
    attack: esCard.attack ?? null,
    health: esCard.health ?? null,
    durability: esCard.durability ?? null,
    armor: esCard.armor ?? null,
    race: esCard.race ?? null,
    races: esCard.races ?? null,
    spellSchool: esCard.spellSchool ?? null,
    mechanics: esCard.mechanics ?? [],
    referencedTags: esCard.referencedTags ?? [],
    artist: esCard.artist ?? null,
    rawEs: esCard,
    rawEn: enCard && Object.keys(enCard).length ? enCard : null,
  };
}

function indexLocalCards(cards) {
  const byId = new Map();
  const byDbfId = new Map();

  for (const card of cards) {
    if (card.id) byId.set(card.id, card);
    if (card.dbfId !== null && card.dbfId !== undefined) byDbfId.set(String(card.dbfId), card);
  }

  return { byId, byDbfId };
}

function compareDataset(localCards, remoteCards, datasetName) {
  const localIndex = indexLocalCards(localCards);
  const remoteIndex = indexLocalCards(remoteCards);

  const missingInLocal = [];
  const matchingById = [];
  const matchingOnlyByDbfId = [];
  const idConflicts = [];
  const dbfConflicts = [];
  const changedCards = [];

  for (const remoteCard of remoteCards) {
    const localById = remoteCard.id ? localIndex.byId.get(remoteCard.id) : null;
    const localByDbf =
      remoteCard.dbfId !== null && remoteCard.dbfId !== undefined
        ? localIndex.byDbfId.get(String(remoteCard.dbfId))
        : null;

    if (localById) {
      matchingById.push({ local: localById, remote: remoteCard });

      if (
        localById.dbfId !== null &&
        localById.dbfId !== undefined &&
        remoteCard.dbfId !== null &&
        remoteCard.dbfId !== undefined &&
        String(localById.dbfId) !== String(remoteCard.dbfId)
      ) {
        dbfConflicts.push({
          id: remoteCard.id,
          localDbfId: localById.dbfId,
          remoteDbfId: remoteCard.dbfId,
          localName: localById.name,
          remoteName: remoteCard.name,
        });
      }

      const diffs = diffCards(localById, remoteCard);
      if (diffs.length) {
        changedCards.push({
          id: remoteCard.id,
          dbfId: remoteCard.dbfId,
          localName: localById.name,
          remoteName: remoteCard.name,
          localNameEn: localById.nameEn,
          remoteNameEn: remoteCard.nameEn,
          set: remoteCard.set,
          type: remoteCard.type,
          diffs,
        });
      }
    } else if (localByDbf) {
      matchingOnlyByDbfId.push({ local: localByDbf, remote: remoteCard });
      idConflicts.push({
        dbfId: remoteCard.dbfId,
        localId: localByDbf.id,
        remoteId: remoteCard.id,
        localName: localByDbf.name,
        remoteName: remoteCard.name,
        localSet: localByDbf.set,
        remoteSet: remoteCard.set,
      });
    } else {
      missingInLocal.push(remoteCard);
    }
  }

  const localOnly = [];
  for (const localCard of localCards) {
    const remoteById = localCard.id ? remoteIndex.byId.get(localCard.id) : null;
    const remoteByDbf =
      localCard.dbfId !== null && localCard.dbfId !== undefined
        ? remoteIndex.byDbfId.get(String(localCard.dbfId))
        : null;

    if (!remoteById && !remoteByDbf) {
      localOnly.push(localCard);
    }
  }

  const renderableMissing = missingInLocal.filter((card) => RENDERABLE_TYPES.has(card.type));
  const nonRenderableMissing = missingInLocal.filter((card) => !RENDERABLE_TYPES.has(card.type));

  return {
    datasetName,
    totals: {
      localCards: localCards.length,
      remoteCards: remoteCards.length,
      matchingById: matchingById.length,
      matchingOnlyByDbfId: matchingOnlyByDbfId.length,
      missingInLocal: missingInLocal.length,
      localOnly: localOnly.length,
      dbfConflicts: dbfConflicts.length,
      idConflicts: idConflicts.length,
      changedCards: changedCards.length,
      renderableMissing: renderableMissing.length,
      nonRenderableMissing: nonRenderableMissing.length,
    },
    distributions: {
      missingBySet: countBy(missingInLocal, (card) => card.set),
      missingByType: countBy(missingInLocal, (card) => card.type),
      missingByClass: countBy(missingInLocal, (card) => card.cardClass),
      missingByRarity: countBy(missingInLocal, (card) => card.rarity),
      localOnlyBySet: countBy(localOnly, (card) => card.set),
      remoteBySet: countBy(remoteCards, (card) => card.set),
      remoteByType: countBy(remoteCards, (card) => card.type),
      remoteByClass: countBy(remoteCards, (card) => card.cardClass),
    },
    examples: {
      missingInLocal: missingInLocal.slice(0, 200).map(remoteCardExample),
      renderableMissing: renderableMissing.slice(0, 200).map(remoteCardWithImagePlan),
      nonRenderableMissing: nonRenderableMissing.slice(0, 100).map(remoteCardExample),
      localOnly: localOnly.slice(0, 200).map(localCardExample),
      idConflicts: idConflicts.slice(0, 100),
      dbfConflicts: dbfConflicts.slice(0, 100),
      changedCards: changedCards.slice(0, 200),
    },
    fullLists: {
      missingInLocalIds: missingInLocal.map((card) => card.id),
      renderableMissingIds: renderableMissing.map((card) => card.id),
      localOnlyIds: localOnly.map((card) => card.id),
    },
  };
}

function diffCards(localCard, remoteCard) {
  const diffs = [];

  for (const field of COMPARABLE_FIELDS) {
    const localValue = normalizeComparable(localCard[field]);
    const remoteValue = normalizeComparable(remoteCard[field]);

    if (localValue !== remoteValue) {
      diffs.push({
        field,
        local: localCard[field] ?? null,
        remote: remoteCard[field] ?? null,
      });
    }
  }

  if (normalizeComparable(localCard.name) !== normalizeComparable(remoteCard.name)) {
    diffs.push({
      field: "name",
      local: localCard.name ?? null,
      remote: remoteCard.name ?? null,
    });
  }

  if (normalizeComparable(localCard.nameEn) !== normalizeComparable(remoteCard.nameEn)) {
    diffs.push({
      field: "nameEn",
      local: localCard.nameEn ?? null,
      remote: remoteCard.nameEn ?? null,
    });
  }

  const localMechanics = normalizeArray(localCard.mechanics);
  const remoteMechanics = normalizeArray(remoteCard.mechanics);

  if (localMechanics.join("|") !== remoteMechanics.join("|")) {
    diffs.push({
      field: "mechanics",
      local: localCard.mechanics ?? [],
      remote: remoteCard.mechanics ?? [],
    });
  }

  return diffs;
}

function normalizeComparable(value) {
  if (value === undefined || value === null || value === "") return "";
  if (Array.isArray(value)) return normalizeArray(value).join("|");
  return String(value);
}

function normalizeArray(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(String))].sort((a, b) => a.localeCompare(b));
}

function remoteCardExample(card) {
  return {
    id: card.id,
    dbfId: card.dbfId,
    name: card.name,
    nameEn: card.nameEn,
    set: card.set,
    type: card.type,
    cardClass: card.cardClass,
    rarity: card.rarity,
    cost: card.cost,
    attack: card.attack,
    health: card.health,
    race: card.race,
    spellSchool: card.spellSchool,
    mechanics: card.mechanics,
  };
}

function localCardExample(card) {
  return {
    id: card.id,
    dbfId: card.dbfId,
    name: card.name,
    nameEn: card.nameEn,
    set: card.set,
    type: card.type,
    cardClass: card.cardClass,
    rarity: card.rarity,
  };
}

function remoteCardWithImagePlan(card) {
  return {
    ...remoteCardExample(card),
    suggestedLocalPaths: {
      image: `/cards/${card.id}.png`,
      imageThumb: `/cards-optimized/thumb/${card.id}.webp`,
      imageGame: `/cards-optimized/game/${card.id}.webp`,
      imageDetail: `/cards-optimized/detail/${card.id}.webp`,
      imageRenderNormalized: `/cards-normalized/${card.id}.webp`,
      imageArt: `/card-art-optimized/512/${card.id}.webp`,
    },
    sourceUrls: {
      renderEs512: `${ART_BASE}/render/latest/${LOCALES.es}/512x/${encodeURIComponent(card.id)}.png`,
      renderEs256: `${ART_BASE}/render/latest/${LOCALES.es}/256x/${encodeURIComponent(card.id)}.png`,
      art512Webp: `${ART_BASE}/512x/${encodeURIComponent(card.id)}.webp`,
      art512Jpg: `${ART_BASE}/512x/${encodeURIComponent(card.id)}.jpg`,
    },
  };
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

  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

function normalizeBucket(value) {
  if (value === null) return "(null)";
  if (value === undefined) return "(undefined)";
  if (value === "") return "(empty)";
  return String(value);
}

function makeTextReport(report) {
  const lines = [];

  lines.push("COMPARACIÓN CONTRA HEARTHSTONEJSON");
  lines.push("===================================");
  lines.push("");
  lines.push(`Generado: ${report.generatedAt}`);
  lines.push(`Proyecto: ${report.projectRoot}`);
  lines.push(`Archivo local: ${report.local.cardsPath}`);
  lines.push("");

  lines.push("FUENTES REMOTAS");
  lines.push("---------------");
  for (const [key, source] of Object.entries(report.remoteSources)) {
    lines.push(`${key}:`);
    lines.push(`  ES: ${source.esUrl}`);
    lines.push(`  EN: ${source.enUrl}`);
    lines.push(`  cartas ES: ${source.esCards}`);
    lines.push(`  cartas EN: ${source.enCards}`);
    lines.push(`  cartas fusionadas: ${source.mergedCards}`);
  }
  lines.push("");

  lines.push("BASE LOCAL");
  lines.push("----------");
  lines.push(`Cartas locales: ${report.local.totalCards}`);
  lines.push("");

  for (const datasetKey of ["collectible", "all"]) {
    const comparison = report.comparisons[datasetKey];
    if (!comparison) continue;

    lines.push(`COMPARACIÓN: ${datasetKey}`);
    lines.push("-".repeat(`COMPARACIÓN: ${datasetKey}`.length));
    lines.push(`Remote cards: ${comparison.totals.remoteCards}`);
    lines.push(`Coinciden por ID: ${comparison.totals.matchingById}`);
    lines.push(`Coinciden solo por dbfId: ${comparison.totals.matchingOnlyByDbfId}`);
    lines.push(`Faltan en local: ${comparison.totals.missingInLocal}`);
    lines.push(`Faltan en local y son renderizables: ${comparison.totals.renderableMissing}`);
    lines.push(`Locales que no aparecen en remoto: ${comparison.totals.localOnly}`);
    lines.push(`Conflictos de ID: ${comparison.totals.idConflicts}`);
    lines.push(`Conflictos de dbfId: ${comparison.totals.dbfConflicts}`);
    lines.push(`Cartas con diferencias de campos: ${comparison.totals.changedCards}`);
    lines.push("");

    lines.push(...topLines("Faltantes por set", comparison.distributions.missingBySet, 30));
    lines.push("");
    lines.push(...topLines("Faltantes por tipo", comparison.distributions.missingByType, 20));
    lines.push("");
    lines.push(...topLines("Faltantes por clase", comparison.distributions.missingByClass, 20));
    lines.push("");

    if (comparison.examples.missingInLocal.length) {
      lines.push("Primeras cartas que faltan en local:");
      for (const card of comparison.examples.missingInLocal.slice(0, 30)) {
        lines.push(
          `  - ${card.id} / ${card.name} (${card.nameEn ?? "sin EN"}) [${card.set}, ${card.type}, ${card.cardClass ?? "sin clase"}]`
        );
      }
      lines.push("");
    }

    if (comparison.examples.idConflicts.length) {
      lines.push("Primeros conflictos de ID:");
      for (const conflict of comparison.examples.idConflicts.slice(0, 10)) {
        lines.push(
          `  - dbfId ${conflict.dbfId}: local ${conflict.localId} / remoto ${conflict.remoteId}`
        );
      }
      lines.push("");
    }

    if (comparison.examples.changedCards.length) {
      lines.push("Primeras cartas con cambios de campos:");
      for (const card of comparison.examples.changedCards.slice(0, 15)) {
        const diffSummary = card.diffs
          .slice(0, 4)
          .map((diff) => diff.field)
          .join(", ");
        lines.push(`  - ${card.id} / ${card.localName} -> ${card.remoteName}: ${diffSummary}`);
      }
      lines.push("");
    }
  }

  lines.push("INTERPRETACIÓN RÁPIDA");
  lines.push("---------------------");
  lines.push("- 'collectible' sirve para saber qué cartas jugables/coleccionables nuevas faltan.");
  lines.push("- 'all' sirve para comparar contra todo HearthstoneJSON, incluyendo héroes, encantamientos, tokens, etc.");
  lines.push("- No descargues imágenes todavía: primero revisa cuántas faltan y de qué sets son.");
  lines.push("");

  lines.push("SIGUIENTE PASO SUGERIDO");
  lines.push("-----------------------");
  lines.push("1. Revisar las cifras de 'collectible'.");
  lines.push("2. Decidir si queremos actualizar solo coleccionables o también otros tipos.");
  lines.push("3. Crear un generador de cards.generated.es.json de prueba, sin usarlo aún en la app.");
  lines.push("4. Después crear el descargador/optimizador de renders españoles para las cartas nuevas.");
  lines.push("");

  return lines.join("\n");
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

async function main() {
  const cardsPath = findCardsPath();
  const localCards = readJson(cardsPath);

  if (!Array.isArray(localCards)) {
    throw new Error(`El archivo local no contiene un array: ${cardsPath}`);
  }

  console.log(`Cartas locales: ${localCards.length}`);
  console.log("");

  const collectible = await downloadRemoteDataset(REMOTE_FILES.collectible);
  console.log("");

  const all = await downloadRemoteDataset(REMOTE_FILES.all);
  console.log("");

  const report = {
    generatedAt: new Date().toISOString(),
    projectRoot: PROJECT_ROOT,
    local: {
      cardsPath,
      totalCards: localCards.length,
    },
    remoteSources: {
      collectible: {
        file: REMOTE_FILES.collectible,
        esUrl: collectible.esUrl,
        enUrl: collectible.enUrl,
        esCards: collectible.esCards.length,
        enCards: collectible.enCards.length,
        mergedCards: collectible.mergedCards.length,
      },
      all: {
        file: REMOTE_FILES.all,
        esUrl: all.esUrl,
        enUrl: all.enUrl,
        esCards: all.esCards.length,
        enCards: all.enCards.length,
        mergedCards: all.mergedCards.length,
      },
    },
    comparisons: {
      collectible: compareDataset(localCards, collectible.mergedCards, "collectible"),
      all: compareDataset(localCards, all.mergedCards, "all"),
    },
  };

  ensureDir(REPORTS_DIR);
  writeJson(JSON_REPORT_PATH, report);
  fs.writeFileSync(TXT_REPORT_PATH, makeTextReport(report), "utf8");

  console.log("Comparación completada.");
  console.log(`JSON: ${JSON_REPORT_PATH}`);
  console.log(`TXT:  ${TXT_REPORT_PATH}`);
  console.log("");

  for (const datasetKey of ["collectible", "all"]) {
    const comparison = report.comparisons[datasetKey];

    console.log(`${datasetKey}:`);
    console.log(`  remote cards: ${comparison.totals.remoteCards}`);
    console.log(`  faltan en local: ${comparison.totals.missingInLocal}`);
    console.log(`  faltan renderizables: ${comparison.totals.renderableMissing}`);
    console.log(`  local only: ${comparison.totals.localOnly}`);
    console.log("");
  }
}

try {
  await main();
} catch (error) {
  console.error("");
  console.error("ERROR EN COMPARADOR");
  console.error("-------------------");
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
}
