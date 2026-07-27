#!/usr/bin/env node
/**
 * Kaynak görselleri yerinde küçültür ve yeniden kodlar.
 *
 * Neden: bu render'lar 2400-2752px genişlikte ve kabaca kodlanmış halde
 * geliyor (4 MB'lık PNG'ler). next/image zaten kullanıcıya WebP üretiyor, yani
 * bu iş ziyaretçinin indirdiği baytları değiştirmiyor — repoyu, deploy süresini
 * ve Vercel'in ilk dönüştürme maliyetini düşürüyor.
 *
 * Kurallar:
 *  - Uzun kenar en fazla 1920px. next.config.ts'teki deviceSizes tavanı 1920,
 *    yani bundan büyük kaynaktan asla daha büyük varyant üretilmiyor.
 *  - Format ve dosya adı korunur -> hiçbir kod referansı değişmez.
 *  - PNG kayıpsız yeniden kodlanır (palette/quantize yok): alfalı ev
 *    kesitlerinde bantlanma riski istemiyoruz.
 *  - JPEG q88 mozjpeg. Daha agresifi (q82) %3 daha kazandırıyor ama next/image
 *    bunun üstüne bir kez daha kodluyor; pay bırakıyoruz.
 *  - Küçük dosyalara (<150 KB) ve SVG'ye dokunulmaz.
 *
 * Kullanım:  node scripts/optimize-images.mjs [--dry] [--dir public]
 */
import { readdir, stat, readFile, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";
import sharp from "sharp";

const DRY = process.argv.includes("--dry");
const dirArg = process.argv.indexOf("--dir");
const ROOT = dirArg > -1 ? process.argv[dirArg + 1] : "public";

const MAX_EDGE = 1920;
const SKIP_UNDER = 150 * 1024;
const EXT = new Set([".png", ".jpg", ".jpeg"]);

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p)));
    else if (EXT.has(extname(entry.name).toLowerCase())) out.push(p);
  }
  return out;
}

const mb = (n) => (n / 1048576).toFixed(2).padStart(6) + " MB";

const files = (await walk(ROOT)).sort();
let before = 0;
let after = 0;
let touched = 0;
let skipped = 0;

for (const file of files) {
  const size = (await stat(file)).size;
  before += size;

  if (size < SKIP_UNDER) {
    after += size;
    skipped++;
    continue;
  }

  const input = await readFile(file);
  const meta = await sharp(input).metadata();
  const png = extname(file).toLowerCase() === ".png";

  let pipe = sharp(input).resize({
    width: MAX_EDGE,
    height: MAX_EDGE,
    fit: "inside",
    withoutEnlargement: true,
  });
  pipe = png
    ? pipe.png({ compressionLevel: 9, effort: 10 })
    : pipe.jpeg({ quality: 88, mozjpeg: true });

  const out = await pipe.toBuffer();

  // Bir dosya küçülmüyorsa dokunma — yeniden kodlamanın bedava olduğu yerde
  // kazanç yoksa kaliteyi boşuna riske atmayalım.
  if (out.length >= size) {
    after += size;
    skipped++;
    continue;
  }

  const outMeta = await sharp(out).metadata();
  console.log(
    `${mb(size)} -> ${mb(out.length)}  -${String(Math.round((1 - out.length / size) * 100)).padStart(2)}%  ` +
      `${meta.width}x${meta.height} -> ${outMeta.width}x${outMeta.height}  ${file}`,
  );

  if (!DRY) await writeFile(file, out);
  after += out.length;
  touched++;
}

console.log(
  `\n${touched} dosya yeniden kodlandı, ${skipped} atlandı.\n` +
    `${mb(before)} -> ${mb(after)}   (-${Math.round((1 - after / before) * 100)}%)` +
    (DRY ? "\n(--dry: hiçbir dosya yazılmadı)" : ""),
);
