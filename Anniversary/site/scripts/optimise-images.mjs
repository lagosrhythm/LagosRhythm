#!/usr/bin/env node
/**
 * Converts all chapter images + hero to WebP at a capped display width.
 * Output lands alongside the originals as <name>.webp
 * Hero: 1500px wide max, quality 85
 * Chapter images: 1280px wide max, quality 82
 */
import sharp from "sharp";
import { existsSync } from "node:fs";
import { join, dirname, resolve, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";

const IMG = resolve(dirname(fileURLToPath(import.meta.url)), "..", "assets", "img");

const jobs = [
  { file: "hero.png",      width: 1500, quality: 85 },
  { file: "ch1-image.jpg", width: 1280, quality: 82 },
  { file: "ch2-image.jpg", width: 1280, quality: 82 },
  { file: "ch3-image.jpg", width: 1280, quality: 82 },
  { file: "ch4-image.jpg", width: 1280, quality: 82 },
  { file: "ch5-image.jpg", width: 1280, quality: 82 },
  { file: "ch6-image.jpg", width: 1280, quality: 82 },
  { file: "ch7-image.jpg", width: 1280, quality: 82 },
  { file: "ch8-image.jpg", width: 1280, quality: 82 },
];

let totalSaved = 0;

for (const { file, width, quality } of jobs) {
  const src = join(IMG, file);
  const name = basename(file, extname(file));
  const dest = join(IMG, name + ".webp");

  if (!existsSync(src)) { console.warn(`  skip (missing): ${file}`); continue; }

  const { size: before } = await (await import("node:fs/promises")).stat(src);
  await sharp(src).resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(dest);
  const { size: after } = await (await import("node:fs/promises")).stat(dest);
  const saved = before - after;
  totalSaved += saved;
  console.log(`  ${file} → ${name}.webp  ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB  (saved ${(saved/1024).toFixed(0)}KB)`);
}

console.log(`\n✓  Done. Total saved: ${(totalSaved/1024/1024).toFixed(2)} MB\n`);
