/**
 * Script: upload-images-to-r2.mjs
 * Sube todas las imágenes de cartas de public/card-images/ a Cloudflare R2
 */

import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { readdir, readFile, stat } from "fs/promises";
import { join, relative } from "path";
// ─── CONFIGURACIÓN R2 ────────────────────────────────────────────────────────
const R2_ACCOUNT_ID   = "c9e0f0454d65b5875ec617758d82b0c9";
const R2_ACCESS_KEY   = "62f17f7568e88b3cb578ae6b5afea6fc";
const R2_SECRET_KEY   = "f4298fcd5a1fb8e7f1d4be6a2dd20a7407adf7f575ac01949bc9bcb376e0bb8e";
const R2_BUCKET       = "hs-minijuegos-images";
const R2_ENDPOINT     = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

// Carpeta local de imágenes (relativa al proyecto)
const IMAGES_DIR = new URL("../public/card-images", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");

// ─── CLIENTE S3 ──────────────────────────────────────────────────────────────
const s3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
  },
});

// ─── UTILIDADES ──────────────────────────────────────────────────────────────
function getMime(filename) {
  if (filename.endsWith(".webp")) return "image/webp";
  if (filename.endsWith(".png"))  return "image/png";
  if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

async function getAllFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function fileExistsInR2(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

// ─── UPLOAD ──────────────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Escaneando imágenes en:", IMAGES_DIR);
  const allFiles = await getAllFiles(IMAGES_DIR);
  console.log(`📦 Total de archivos encontrados: ${allFiles.length}`);

  let uploaded = 0;
  let skipped  = 0;
  let errors   = 0;
  const CONCURRENCY = 10;

  async function uploadFile(localPath) {
    // La key en R2 es la ruta relativa (ej: es/thumb/NEW1_014.webp)
    const key = relative(IMAGES_DIR, localPath).replace(/\\/g, "/");

    try {
      const exists = await fileExistsInR2(key);
      if (exists) {
        skipped++;
        return;
      }

      const body = await readFile(localPath);
      await s3.send(new PutObjectCommand({
        Bucket:       R2_BUCKET,
        Key:          key,
        Body:         body,
        ContentType:  getMime(localPath),
        CacheControl: "public, max-age=31536000, immutable",
      }));
      uploaded++;

      if ((uploaded + skipped) % 100 === 0) {
        console.log(`  ✅ ${uploaded} subidas | ⏭️  ${skipped} ya existían | ❌ ${errors} errores  [${uploaded + skipped}/${allFiles.length}]`);
      }
    } catch (err) {
      errors++;
      console.error(`  ❌ Error en ${key}:`, err.message);
    }
  }

  // Subir en lotes de CONCURRENCY archivos simultáneos
  for (let i = 0; i < allFiles.length; i += CONCURRENCY) {
    const batch = allFiles.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(uploadFile));
  }

  console.log("\n──────────────────────────────────────────");
  console.log(`🎉 Completado!`);
  console.log(`   ✅ Subidas:      ${uploaded}`);
  console.log(`   ⏭️  Ya existían:  ${skipped}`);
  console.log(`   ❌ Errores:      ${errors}`);
  console.log(`\n🌐 URL pública base: https://<tu-dominio-r2-publico>/`);
  console.log("   (Activa el acceso público en el dashboard de R2 para obtener la URL)");
}

main().catch(err => {
  console.error("Error fatal:", err);
  process.exit(1);
});
