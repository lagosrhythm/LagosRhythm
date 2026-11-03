#!/usr/bin/env node
/**
 * Publishes the standalone Anniversary edition into the main Next.js app so it
 * is also reachable at a sub-path:  https://www.lagosrhythm.com/anniversary
 *
 * Only the browser-facing files are copied. Deployment config (vercel.json,
 * package.json), tooling (scripts/) and documentation stay out of public/.
 *
 * Run from anywhere:   npm run anniversary:sync     (repo root)
 *                  or  npm run sync                 (inside Anniversary/site)
 */
import { cp, rm, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REPO_ROOT = resolve(SITE_ROOT, "..", "..");
const DEST = join(REPO_ROOT, "public", "anniversary");

const PUBLISH = ["index.html", "assets"];

async function size(dir) {
  let bytes = 0;
  let files = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = await size(full);
      bytes += sub.bytes;
      files += sub.files;
    } else {
      const { stat } = await import("node:fs/promises");
      bytes += (await stat(full)).size;
      files += 1;
    }
  }
  return { bytes, files };
}

if (!existsSync(join(SITE_ROOT, "index.html"))) {
  console.error("✗ Anniversary/site/index.html not found — nothing to publish.");
  process.exit(1);
}

if (!existsSync(join(REPO_ROOT, "package.json"))) {
  console.error(`✗ Main application not found at ${REPO_ROOT} — cannot sync to public/anniversary.`);
  process.exit(1);
}

// Start clean so removed/renamed assets never linger on the main site.
if (existsSync(DEST)) await rm(DEST, { recursive: true, force: true });
await mkdir(DEST, { recursive: true });

for (const item of PUBLISH) {
  const from = join(SITE_ROOT, item);
  if (!existsSync(from)) continue;
  await cp(from, join(DEST, item), { recursive: true, force: true });
}

const { bytes, files } = await size(DEST);
console.log(
  `✓  Published Anniversary edition -> ${DEST}\n` +
    `   ${files} files, ${(bytes / 1024).toFixed(1)} KB — served at /anniversary\n`
);
