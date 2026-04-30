import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, "public");
const cardsJsonPath = path.join(publicDir, "data", "cards.json");
const backupJsonPath = path.join(publicDir, "data", "cards.backup.json");

const outputRoot = path.join(publicDir, "cards-optimized");
const thumbDir = path.join(outputRoot, "thumb");
const gameDir = path.join(outputRoot, "game");
const detailDir = path.join(outputRoot, "detail");

const SIZES = {
  thumb: { dir: thumbDir, width: 220, quality: 74 },
  game: { dir: gameDir, width: 420, quality: 82 },
  detail: { dir: detailDir, width: 560, quality: 86 },
};

const CONCURRENCY = 8;

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function publicPathToDiskPath(publicPath) {
  return path.join(publicDir, publicPath.replace(/^\//, ""));
}

async function ensureDirectories() {
  await fs.mkdir(thumbDir, { recursive: true });
  await fs.mkdir(gameDir, { recursive: true });
  await fs.mkdir(detailDir, { recursive: true });
}

async function optimizeOneImage(inputPath, outputPath, width, quality) {
  if (await fileExists(outputPath)) return;

  await sharp(inputPath, { animated: false })
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toFile(outputPath);
}

async function processCard(card, index, total) {
  if (!card?.id || !card?.image) return { card, ok: false };

  const inputPath = publicPathToDiskPath(card.image);

  if (!(await fileExists(inputPath))) {
    if (index % 250 === 0) {
      console.log(`Saltando ${index}/${total}: no existe ${card.image}`);
    }
    return { card, ok: false };
  }

  const fileName = `${card.id}.webp`;
  const thumbPath = path.join(SIZES.thumb.dir, fileName);
  const gamePath = path.join(SIZES.game.dir, fileName);
  const detailPath = path.join(SIZES.detail.dir, fileName);

  await optimizeOneImage(inputPath, thumbPath, SIZES.thumb.width, SIZES.thumb.quality);
  await optimizeOneImage(inputPath, gamePath, SIZES.game.width, SIZES.game.quality);
  await optimizeOneImage(inputPath, detailPath, SIZES.detail.width, SIZES.detail.quality);

  if (index % 100 === 0 || index === total) {
    console.log(`Procesadas ${index}/${total}`);
  }

  return {
    card: {
      ...card,
      imageThumb: `/cards-optimized/thumb/${fileName}`,
      imageGame: `/cards-optimized/game/${fileName}`,
      imageDetail: `/cards-optimized/detail/${fileName}`,
    },
    ok: true,
  };
}

async function runWithConcurrency(items, worker, concurrency) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runner() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await worker(items[currentIndex], currentIndex + 1, items.length);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, runner));
  return results;
}

async function main() {
  console.log("Leyendo public/data/cards.json...");
  const raw = await fs.readFile(cardsJsonPath, "utf8");
  const cards = JSON.parse(raw);

  if (!(await fileExists(backupJsonPath))) {
    await fs.writeFile(backupJsonPath, raw);
    console.log("Backup creado: public/data/cards.backup.json");
  }

  await ensureDirectories();

  console.log(`Optimizando ${cards.length} cartas. Esto puede tardar unos minutos la primera vez...`);
  const results = await runWithConcurrency(cards, processCard, CONCURRENCY);

  const updatedCards = results.map((result, index) => result?.card ?? cards[index]);
  const optimizedCount = results.filter((result) => result?.ok).length;

  await fs.writeFile(cardsJsonPath, JSON.stringify(updatedCards, null, 2));

  console.log("Listo.");
  console.log(`Cartas con imágenes optimizadas: ${optimizedCount}/${cards.length}`);
  console.log("Rutas añadidas al JSON: imageThumb, imageGame, imageDetail");
}

main().catch((error) => {
  console.error("Error generando imágenes optimizadas:");
  console.error(error);
  process.exit(1);
});
