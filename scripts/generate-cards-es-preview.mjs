#!/usr/bin/env node
/**
 * Generador de base española PREVIEW v1.
 *
 * Qué hace:
 * - Lee public/data/cards.json
 * - Descarga HearthstoneJSON latest esES/enUS cards.collectible.json
 * - Fusiona ES + EN por id/dbfId
 * - Conserva todas tus cartas locales tal cual
 * - Añade al final las cartas coleccionables que faltan
 * - Marca las cartas nuevas con needsImages: true
 * - Genera informes de qué habría que descargar después
 *
 * Qué NO hace:
 * - No modifica public/data/cards.json
 * - No toca la app
 * - No descarga imágenes
 * - No optimiza renders
 *
 * Salidas:
 * - public/data/cards.generated.es.json
 * - reports/cards-generated-preview.json
 * - reports/cards-generated-preview.txt
 * - reports/new-cards-to-download.json
 * - reports/new-cards-to-download.txt
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

const DATA_DIR = path.join(PROJECT_ROOT, "public", "data");
const REPORTS_DIR = path.join(PROJECT_ROOT, "reports");

const GENERATED_CARDS_PATH = path.join(DATA_DIR, "cards.generated.es.json");
const PREVIEW_JSON_PATH = path.join(REPORTS_DIR, "cards-generated-preview.json");
const PREVIEW_TXT_PATH = path.join(REPORTS_DIR, "cards-generated-preview.txt");
const DOWNLOAD_JSON_PATH = path.join(REPORTS_DIR, "new-cards-to-download.json");
const DOWNLOAD_TXT_PATH = path.join(REPORTS_DIR, "new-cards-to-download.txt");

const LOCALES = {
  es: "esES",
  en: "enUS",
};

const HSJSON_BASE = "https://api.hearthstonejson.com/v1/latest";
const ART_RENDER_BASE = "https://art.hearthstonejson.com/v1/render/latest";

const REMOTE_COLLECTIBLE_ES = `${HSJSON_BASE}/${LOCALES.es}/cards.collectible.json`;
const REMOTE_COLLECTIBLE_EN = `${HSJSON_BASE}/${LOCALES.en}/cards.collectible.json`;

const RENDERABLE_TYPES = new Set(["MINION", "SPELL", "WEAPON", "HERO", "LOCATION"]);
const GAME_TYPES = new Set(["MINION", "SPELL", "WEAPON", "LOCATION"]);

const IMAGE_FIELDS = [
  "image",
  "imageThumb",
  "imageGame",
  "imageDetail",
  "imageArt",
  "imageRenderNormalized",
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
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
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
          Accept: "application/json,text/plain,*/*",
          "Accept-Encoding": "identity",
          "User-Agent": "hs-minijuegos-generate-cards-es-preview/1.0",
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

async function downloadCollectibleCards() {
  console.log(`Descargando ${REMOTE_COLLECTIBLE_ES}`);
  const esCards = await fetchJson(REMOTE_COLLECTIBLE_ES);

  console.log(`Descargando ${REMOTE_COLLECTIBLE_EN}`);
  const enCards = await fetchJson(REMOTE_COLLECTIBLE_EN);

  if (!Array.isArray(esCards) || !Array.isArray(enCards)) {
    throw new Error("HearthstoneJSON no ha devuelto arrays válidos.");
  }

  return {
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
    if (card.dbfId !== null && card.dbfId !== undefined) {
      enByDbfId.set(String(card.dbfId), card);
    }
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
    name: esCard.name ?? "",
    nameEn: enCard.name ?? "",
    set: esCard.set ?? null,
    type: esCard.type ?? null,
    cardClass: esCard.cardClass ?? null,
    rarity: esCard.rarity ?? null,
    cost: normalizeNullableNumber(esCard.cost),
    attack: normalizeNullableNumber(esCard.attack),
    health: normalizeNullableNumber(esCard.health),
    durability: normalizeNullableNumber(esCard.durability),
    race: esCard.race ?? null,
    races: Array.isArray(esCard.races) ? esCard.races : undefined,
    spellSchool: esCard.spellSchool ?? null,
    mechanics: Array.isArray(esCard.mechanics) ? esCard.mechanics : [],
    text: esCard.text ?? "",
    textEn: enCard.text ?? "",
    flavor: esCard.flavor ?? "",
    flavorEn: enCard.flavor ?? "",
    collectible: esCard.collectible ?? true,
    artist: esCard.artist ?? null,
    armor: normalizeNullableNumber(esCard.armor),
    classes: Array.isArray(esCard.classes) ? esCard.classes : undefined,
    multiClassGroup: esCard.multiClassGroup ?? undefined,
  };
}

function normalizeNullableNumber(value) {
  return typeof value === "number" ? value : null;
}

function indexCards(cards) {
  const byId = new Map();
  const byDbfId = new Map();

  for (const card of cards) {
    if (card.id) byId.set(card.id, card);
    if (card.dbfId !== null && card.dbfId !== undefined) {
      byDbfId.set(String(card.dbfId), card);
    }
  }

  return { byId, byDbfId };
}

function findMissingRemoteCards(localCards, remoteCards) {
  const localIndex = indexCards(localCards);

  return remoteCards.filter((remoteCard) => {
    const localById = remoteCard.id ? localIndex.byId.get(remoteCard.id) : null;
    const localByDbf =
      remoteCard.dbfId !== null && remoteCard.dbfId !== undefined
        ? localIndex.byDbfId.get(String(remoteCard.dbfId))
        : null;

    return !localById && !localByDbf;
  });
}

function findLocalOnlyCards(localCards, remoteCards) {
  const remoteIndex = indexCards(remoteCards);

  return localCards.filter((localCard) => {
    const remoteById = localCard.id ? remoteIndex.byId.get(localCard.id) : null;
    const remoteByDbf =
      localCard.dbfId !== null && localCard.dbfId !== undefined
        ? remoteIndex.byDbfId.get(String(localCard.dbfId))
        : null;

    return !remoteById && !remoteByDbf;
  });
}

function makeGeneratedCard(remoteCard) {
  const localPaths = makeSuggestedLocalPaths(remoteCard.id);

  const generatedCard = {
    id: remoteCard.id,
    dbfId: remoteCard.dbfId,
    name: remoteCard.name,
    nameEn: remoteCard.nameEn,
    set: remoteCard.set,
    type: remoteCard.type,
    cardClass: remoteCard.cardClass,
    rarity: remoteCard.rarity,
    cost: remoteCard.cost,
    attack: remoteCard.attack,
    health: remoteCard.health,
    durability: remoteCard.durability,
    race: remoteCard.race,
    spellSchool: remoteCard.spellSchool,
    mechanics: remoteCard.mechanics ?? [],
    text: remoteCard.text,
    textEn: remoteCard.textEn,
    flavor: remoteCard.flavor,

    // Rutas previstas. image apunta al futuro PNG original.
    // Las variantes optimizadas se quedan en null hasta descargarlas/generarlas.
    image: localPaths.image,
    imageThumb: null,
    imageGame: null,
    imageDetail: null,
    imageArt: null,
    imageRenderNormalized: null,

    // Campos de control para que sepamos que esta carta necesita pipeline de imágenes.
    needsImages: true,
    source: "hearthstonejson",
    sourceLocale: "esES",
  };

  // Campos futuros opcionales. Los dejamos solo si existen para no ensuciar demasiado.
  if (remoteCard.races) generatedCard.races = remoteCard.races;
  if (remoteCard.collectible !== null && remoteCard.collectible !== undefined) {
    generatedCard.collectible = remoteCard.collectible;
  }
  if (remoteCard.armor !== null && remoteCard.armor !== undefined) {
    generatedCard.armor = remoteCard.armor;
  }
  if (remoteCard.classes) generatedCard.classes = remoteCard.classes;
  if (remoteCard.multiClassGroup) generatedCard.multiClassGroup = remoteCard.multiClassGroup;
  if (remoteCard.artist) generatedCard.artist = remoteCard.artist;
  if (remoteCard.flavorEn) generatedCard.flavorEn = remoteCard.flavorEn;

  return generatedCard;
}

function makeSuggestedLocalPaths(cardId) {
  return {
    image: `/cards/${cardId}.png`,
    imageThumb: `/cards-optimized/thumb/${cardId}.webp`,
    imageGame: `/cards-optimized/game/${cardId}.webp`,
    imageDetail: `/cards-optimized/detail/${cardId}.webp`,
    imageArt: `/card-art-optimized/512/${cardId}.webp`,
    imageRenderNormalized: `/cards-normalized/${cardId}.webp`,
  };
}

function makeSourceUrls(cardId) {
  const encodedId = encodeURIComponent(cardId);

  return {
    renderEs512Png: `${ART_RENDER_BASE}/${LOCALES.es}/512x/${encodedId}.png`,
    renderEs256Png: `${ART_RENDER_BASE}/${LOCALES.es}/256x/${encodedId}.png`,
    renderEn512Png: `${ART_RENDER_BASE}/${LOCALES.en}/512x/${encodedId}.png`,
  };
}

function makeDownloadItem(remoteCard) {
  const localPaths = makeSuggestedLocalPaths(remoteCard.id);

  return {
    id: remoteCard.id,
    dbfId: remoteCard.dbfId,
    name: remoteCard.name,
    nameEn: remoteCard.nameEn,
    set: remoteCard.set,
    type: remoteCard.type,
    cardClass: remoteCard.cardClass,
    rarity: remoteCard.rarity,
    shouldUseInGames: GAME_TYPES.has(remoteCard.type),
    isHeroOrSkin: remoteCard.type === "HERO" || remoteCard.set === "HERO_SKINS",
    localPaths,
    sourceUrls: makeSourceUrls(remoteCard.id),
  };
}

function countBy(items, getter) {
  const counts = new Map();

  for (const item of items) {
    const raw = getter(item);
    const values = Array.isArray(raw) ? raw : [raw];

    for (const value of values) {
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

function minCard(card) {
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

function analyzeGenerated(localCards, remoteCards, missingRemoteCards, generatedCards, generatedNewCards, localOnlyCards) {
  const newDownloadItems = missingRemoteCards.map(makeDownloadItem);
  const gameCandidateNewCards = newDownloadItems.filter((item) => item.shouldUseInGames);
  const heroOrSkinNewCards = newDownloadItems.filter((item) => item.isHeroOrSkin);

  return {
    generatedAt: new Date().toISOString(),
    projectRoot: PROJECT_ROOT,
    sources: {
      localCardsPath: findCardsPath(),
      remoteEs: REMOTE_COLLECTIBLE_ES,
      remoteEn: REMOTE_COLLECTIBLE_EN,
    },
    totals: {
      localCards: localCards.length,
      remoteCollectibleCards: remoteCards.length,
      missingRemoteCards: missingRemoteCards.length,
      localOnlyCards: localOnlyCards.length,
      generatedCards: generatedCards.length,
      generatedNewCards: generatedNewCards.length,
      newCardsForGames: gameCandidateNewCards.length,
      newHeroesOrSkins: heroOrSkinNewCards.length,
    },
    distributions: {
      missingBySet: countBy(missingRemoteCards, (card) => card.set),
      missingByType: countBy(missingRemoteCards, (card) => card.type),
      missingByClass: countBy(missingRemoteCards, (card) => card.cardClass),
      missingByRarity: countBy(missingRemoteCards, (card) => card.rarity),
      generatedBySet: countBy(generatedCards, (card) => card.set),
      generatedByType: countBy(generatedCards, (card) => card.type),
    },
    examples: {
      newCards: generatedNewCards.slice(0, 100).map(minCard),
      newCardsForGames: gameCandidateNewCards.slice(0, 100),
      heroesOrSkins: heroOrSkinNewCards.slice(0, 100),
      localOnlyCards: localOnlyCards.slice(0, 50).map(minCard),
    },
    outputFiles: {
      generatedCards: GENERATED_CARDS_PATH,
      previewJson: PREVIEW_JSON_PATH,
      previewTxt: PREVIEW_TXT_PATH,
      downloadJson: DOWNLOAD_JSON_PATH,
      downloadTxt: DOWNLOAD_TXT_PATH,
    },
  };
}

function makeTextReport(preview) {
  const lines = [];

  lines.push("GENERACIÓN PREVIEW DE CARDS ES");
  lines.push("==============================");
  lines.push("");
  lines.push(`Generado: ${preview.generatedAt}`);
  lines.push(`Proyecto: ${preview.projectRoot}`);
  lines.push(`Base local: ${preview.sources.localCardsPath}`);
  lines.push(`HearthstoneJSON ES: ${preview.sources.remoteEs}`);
  lines.push(`HearthstoneJSON EN: ${preview.sources.remoteEn}`);
  lines.push("");

  lines.push("RESUMEN");
  lines.push("-------");
  lines.push(`Cartas locales actuales: ${preview.totals.localCards}`);
  lines.push(`Cartas collectible remotas: ${preview.totals.remoteCollectibleCards}`);
  lines.push(`Cartas nuevas detectadas: ${preview.totals.missingRemoteCards}`);
  lines.push(`Cartas locales no presentes en remoto: ${preview.totals.localOnlyCards}`);
  lines.push(`Cartas generadas totales: ${preview.totals.generatedCards}`);
  lines.push(`Cartas nuevas añadidas al generated: ${preview.totals.generatedNewCards}`);
  lines.push(`Cartas nuevas candidatas para minijuegos: ${preview.totals.newCardsForGames}`);
  lines.push(`Cartas nuevas tipo HERO / HERO_SKINS: ${preview.totals.newHeroesOrSkins}`);
  lines.push("");

  lines.push(...topLines("Nuevas por set", preview.distributions.missingBySet, 30));
  lines.push("");
  lines.push(...topLines("Nuevas por tipo", preview.distributions.missingByType, 20));
  lines.push("");
  lines.push(...topLines("Nuevas por clase", preview.distributions.missingByClass, 20));
  lines.push("");
  lines.push(...topLines("Nuevas por rareza", preview.distributions.missingByRarity, 20));
  lines.push("");

  if (preview.examples.newCards.length) {
    lines.push("Primeras cartas nuevas añadidas:");
    for (const card of preview.examples.newCards.slice(0, 50)) {
      lines.push(
        `  - ${card.id} / ${card.name} (${card.nameEn || "sin EN"}) [${card.set}, ${card.type}, ${card.cardClass || "sin clase"}]`
      );
    }
    lines.push("");
  }

  if (preview.examples.localOnlyCards.length) {
    lines.push("Cartas locales que no aparecen en collectible remoto:");
    for (const card of preview.examples.localOnlyCards) {
      lines.push(
        `  - ${card.id} / ${card.name} (${card.nameEn || "sin EN"}) [${card.set}, ${card.type}, ${card.cardClass || "sin clase"}]`
      );
    }
    lines.push("");
  }

  lines.push("ARCHIVOS GENERADOS");
  lines.push("------------------");
  lines.push(`Generated cards: ${preview.outputFiles.generatedCards}`);
  lines.push(`Preview JSON:    ${preview.outputFiles.previewJson}`);
  lines.push(`Preview TXT:     ${preview.outputFiles.previewTxt}`);
  lines.push(`Download JSON:   ${preview.outputFiles.downloadJson}`);
  lines.push(`Download TXT:    ${preview.outputFiles.downloadTxt}`);
  lines.push("");

  lines.push("INTERPRETACIÓN");
  lines.push("--------------");
  lines.push("- public/data/cards.generated.es.json NO se usa en la app todavía.");
  lines.push("- Las cartas nuevas llevan needsImages: true.");
  lines.push("- Las cartas nuevas tienen imageThumb/imageGame/imageDetail/imageArt/imageRenderNormalized en null.");
  lines.push("- reports/new-cards-to-download.* es el plan para descargar/generar imágenes después.");
  lines.push("");

  lines.push("SIGUIENTE PASO SUGERIDO");
  lines.push("-----------------------");
  lines.push("1. Revisar este informe.");
  lines.push("2. Abrir public/data/cards.generated.es.json y comprobar que no hay nada raro.");
  lines.push("3. Revisar reports/new-cards-to-download.txt.");
  lines.push("4. Después hacer un descargador de renders españoles para SOLO las cartas nuevas.");
  lines.push("");

  return lines.join("\n");
}

function makeDownloadTextReport(items) {
  const lines = [];

  lines.push("NUEVAS CARTAS A DESCARGAR / OPTIMIZAR");
  lines.push("=====================================");
  lines.push("");
  lines.push(`Total: ${items.length}`);
  lines.push(`Candidatas para minijuegos: ${items.filter((item) => item.shouldUseInGames).length}`);
  lines.push(`Héroes / skins: ${items.filter((item) => item.isHeroOrSkin).length}`);
  lines.push("");

  const bySet = countBy(items, (item) => item.set);
  const byType = countBy(items, (item) => item.type);

  lines.push(...topLines("Por set", bySet, 30));
  lines.push("");
  lines.push(...topLines("Por tipo", byType, 20));
  lines.push("");

  lines.push("Primeras cartas:");
  for (const item of items.slice(0, 100)) {
    lines.push("");
    lines.push(`${item.id} / ${item.name} (${item.nameEn || "sin EN"})`);
    lines.push(`  set/tipo/clase: ${item.set} / ${item.type} / ${item.cardClass || "sin clase"}`);
    lines.push(`  usar en minijuegos: ${item.shouldUseInGames ? "sí" : "no por ahora"}`);
    lines.push(`  render ES 512: ${item.sourceUrls.renderEs512Png}`);
    lines.push(`  futuro imageGame: ${item.localPaths.imageGame}`);
    lines.push(`  futuro normalized: ${item.localPaths.imageRenderNormalized}`);
  }

  if (items.length > 100) {
    lines.push("");
    lines.push(`... +${items.length - 100} cartas más en new-cards-to-download.json`);
  }

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

  const { esCards, enCards, mergedCards: remoteCards } = await downloadCollectibleCards();

  console.log("");
  console.log(`Remote ES: ${esCards.length}`);
  console.log(`Remote EN: ${enCards.length}`);
  console.log(`Remote fusionadas: ${remoteCards.length}`);
  console.log("");

  const missingRemoteCards = findMissingRemoteCards(localCards, remoteCards);
  const localOnlyCards = findLocalOnlyCards(localCards, remoteCards);
  const generatedNewCards = missingRemoteCards.map(makeGeneratedCard);
  const generatedCards = [...localCards, ...generatedNewCards];

  const preview = analyzeGenerated(
    localCards,
    remoteCards,
    missingRemoteCards,
    generatedCards,
    generatedNewCards,
    localOnlyCards
  );

  const downloadItems = missingRemoteCards
    .filter((card) => RENDERABLE_TYPES.has(card.type))
    .map(makeDownloadItem);

  ensureDir(DATA_DIR);
  ensureDir(REPORTS_DIR);

  writeJson(GENERATED_CARDS_PATH, generatedCards);
  writeJson(PREVIEW_JSON_PATH, preview);
  fs.writeFileSync(PREVIEW_TXT_PATH, makeTextReport(preview), "utf8");

  writeJson(DOWNLOAD_JSON_PATH, downloadItems);
  fs.writeFileSync(DOWNLOAD_TXT_PATH, makeDownloadTextReport(downloadItems), "utf8");

  console.log("Preview generada.");
  console.log(`Cartas generadas totales: ${generatedCards.length}`);
  console.log(`Cartas nuevas añadidas: ${generatedNewCards.length}`);
  console.log(`Plan de descarga: ${downloadItems.length}`);
  console.log("");
  console.log(`Generated cards: ${GENERATED_CARDS_PATH}`);
  console.log(`Preview TXT:     ${PREVIEW_TXT_PATH}`);
  console.log(`Download TXT:    ${DOWNLOAD_TXT_PATH}`);
}

try {
  await main();
} catch (error) {
  console.error("");
  console.error("ERROR EN GENERADOR PREVIEW");
  console.error("--------------------------");
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
}
