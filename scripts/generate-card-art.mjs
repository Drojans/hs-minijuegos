import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const PROJECT_ROOT = process.cwd();

const CARDS_JSON_PATH = path.join(PROJECT_ROOT, "public", "data", "cards.json");
const BACKUP_JSON_PATH = path.join(PROJECT_ROOT, "public", "data", "cards.before-art.json");

const SOURCE_ART_DIR = path.join(PROJECT_ROOT, "public", "card-art", "512");
const OUTPUT_ART_DIR = path.join(PROJECT_ROOT, "public", "card-art-optimized", "512");

const PUBLIC_OUTPUT_PREFIX = "/card-art-optimized/512";
const SUPPORTED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findSourceArt(cardId) {
  for (const extension of SUPPORTED_EXTENSIONS) {
    const filePath = path.join(SOURCE_ART_DIR, `${cardId}${extension}`);
    if (await fileExists(filePath)) return filePath;
  }

  return null;
}

async function ensureDirectory(directoryPath) {
  await fs.mkdir(directoryPath, { recursive: true });
}

async function main() {
  console.log("Leyendo cards.json...");
  const cardsRaw = await fs.readFile(CARDS_JSON_PATH, "utf8");
  const cards = JSON.parse(cardsRaw);

  console.log("Creando backup:", BACKUP_JSON_PATH);
  await fs.writeFile(BACKUP_JSON_PATH, cardsRaw, "utf8");

  await ensureDirectory(OUTPUT_ART_DIR);

  let found = 0;
  let optimized = 0;
  let missing = 0;

  for (const card of cards) {
    if (!card.id) {
      missing += 1;
      continue;
    }

    const sourceArt = await findSourceArt(card.id);

    if (!sourceArt) {
      delete card.imageArt;
      missing += 1;
      continue;
    }

    found += 1;

    const outputFileName = `${card.id}.webp`;
    const outputPath = path.join(OUTPUT_ART_DIR, outputFileName);
    const publicPath = `${PUBLIC_OUTPUT_PREFIX}/${outputFileName}`;

    if (!(await fileExists(outputPath))) {
      await sharp(sourceArt)
        .resize({
          width: 512,
          height: 512,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({
          quality: 84,
          effort: 4,
        })
        .toFile(outputPath);

      optimized += 1;
    }

    card.imageArt = publicPath;
  }

  await fs.writeFile(CARDS_JSON_PATH, JSON.stringify(cards, null, 2), "utf8");

  console.log("Listo.");
  console.log(`Artes encontrados: ${found}/${cards.length}`);
  console.log(`Artes optimizados nuevos: ${optimized}`);
  console.log(`Cartas sin arte: ${missing}`);
  console.log("Campo añadido al JSON: imageArt");
}

main().catch((error) => {
  console.error("Error generando artes optimizados:", error);
  process.exit(1);
});