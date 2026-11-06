#!/usr/bin/env node
/**
 * Build-time / CI verification for the Anniversary special edition.
 *
 * Guarantees before anything ships to Vercel:
 *   1. every local asset referenced by index.html / 404.html actually exists
 *   2. no third-party hot-linked imagery (the Stitch CDN links expire)
 *   3. no CDN-hosted runtime (Tailwind Play CDN, framework CDNs, etc.)
 *   4. no placeholder copy left in the publication
 *   5. responsive images carry width/height (no layout shift)
 *   6. the page stays inside a sane weight budget
 */
import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const warnings = [];

const HTML_FILES = ["index.html", "404.html"];
const EXTERNAL_HOST_ALLOWLIST = [
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "x.com",
  "instagram.com",
  "youtube.com",
  "facebook.com",
  "linkedin.com",
  "lagosrhythm.com",
  "twitter.com",
];

const PLACEHOLDER_PATTERNS = [
  /\blorem ipsum\b/i,
  /\bTODO:\b/,
  /\bFIXME\b/,
  /\bplaceholder (copy|text|image)\b/i,
  /\bcoming soon\b/i,
  /\byour (text|headline|content) here\b/i,
  /href="#"/,
  /aida-public/, // raw Stitch CDN image ids
  /cdn\.tailwindcss\.com/,
];

const MAX_TOTAL_WEIGHT = 2.5 * 1024 * 1024; // 2.5 MB for the whole published folder
const MAX_SINGLE_IMAGE = 450 * 1024; // 450 KB per image (hero only)

/* "Born From This Ground" — the edition's editorial copy. These are the
   strings that must survive every edit; if one goes missing the publication
   is no longer the publication. */
const REQUIRED_COPY = [
  "Born From This Ground",
  "An anniversary publication by Lagos Rhythm, October 2026",
  "Damola Olaleye",
  "Deborah Ogunlolu",
  "Nothing New Comes From Nowhere",
  "Before We Called It New",
  "When Home Has No Coordinates",
  "The City Knows the Way",
  "A Place Is Made of People",
  "What If the Place Could Travel?",
  "The Future Was Here First",
  "the recognition gap",
  "the source test: consent, credit, return",
  "Street Rhythm",
  "Storywell",
  "oríkì",
];

/* Superseded drafts of this page. */
const FORBIDDEN_COPY = [
  "Year One by the Numbers",
  "Moments That Defined Our First Year",
  "The Echo Chamber",
  "Curatorial Memorandum",
  "A Note from the Foundation",
];

/* ---------------------------------------------------------------- utils --- */

function collectRefs(html) {
  const refs = new Set();

  // src="..." and href="..." (skips the icon sprite + external links later)
  for (const m of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) refs.add(m[1]);

  // srcset="a.png 512w, b.png 1024w"
  for (const m of html.matchAll(/\bsrcset="([^"]+)"/g)) {
    for (const entry of m[1].split(",")) {
      const url = entry.trim().split(/\s+/)[0];
      if (url) refs.add(url);
    }
  }

  // imagesrcset="..."
  for (const m of html.matchAll(/\bimagesrcset="([^"]+)"/g)) {
    for (const entry of m[1].split(",")) {
      const url = entry.trim().split(/\s+/)[0];
      if (url) refs.add(url);
    }
  }

  return [...refs];
}

function isExternal(ref) {
  return /^(https?:)?\/\//i.test(ref) || /^(mailto|tel|data|javascript):/i.test(ref);
}

function isFragment(ref) {
  return ref.startsWith("#");
}

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, out);
    else out.push(full);
  }
  return out;
}

async function sizeOf(file) {
  try {
    return (await stat(file)).size;
  } catch {
    return 0;
  }
}

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/* ---------------------------------------------------------------- checks --- */

for (const name of HTML_FILES) {
  const file = join(ROOT, name);
  if (!existsSync(file)) {
    errors.push(`Missing required file: ${name}`);
    continue;
  }

  const html = await readFile(file, "utf8");

  /* 1 — local references resolve --------------------------------------- */
  for (const ref of collectRefs(html)) {
    if (isExternal(ref) || isFragment(ref) || ref === "") continue;
    const clean = ref.split(/[?#]/)[0];
    if (!clean) continue;
    const target = join(ROOT, clean.replace(/^\//, ""));
    if (!existsSync(target)) {
      errors.push(`${name}: broken local reference -> ${ref}`);
    }
  }

  /* 2/3 — external hosts + forbidden CDNs ------------------------------ */
  for (const m of html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)) {
    const host = new URL(m[1]).host.replace(/^www\./, "");
    if (!EXTERNAL_HOST_ALLOWLIST.includes(host)) {
      errors.push(`${name}: unexpected external host "${host}" (${m[1]})`);
    }
  }
  for (const m of html.matchAll(/\b(?:imagesrcset|srcset)="([^"]+)"/g)) {
    for (const entry of m[1].split(",")) {
      const url = entry.trim().split(/\s+/)[0];
      if (/^https?:\/\//i.test(url)) {
        errors.push(`${name}: external image in srcset -> ${url}`);
      }
    }
  }

  /* 4 — placeholder copy ---------------------------------------------- */
  for (const pattern of PLACEHOLDER_PATTERNS) {
    const match = html.match(pattern);
    if (match) errors.push(`${name}: placeholder / forbidden pattern -> "${match[0]}"`);
  }

  /* 4b — the edition's actual editorial copy must be intact ----------- */
  if (name === "index.html") {
    for (const required of REQUIRED_COPY) {
      if (!html.includes(required)) errors.push(`${name}: missing editorial copy -> "${required}"`);
    }
    for (const removed of FORBIDDEN_COPY) {
      if (html.includes(removed)) errors.push(`${name}: superseded copy still present -> "${removed}"`);
    }
    if ((html.match(/data-copy/g) || []).length < 3) {
      errors.push(`${name}: expected the essay's pull quotes to remain copyable`);
    }
  }

  /* 5 — CLS: every <img> declares width + height ----------------------- */
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = m[0];
    if (!/\bwidth="/.test(tag) || !/\bheight="/.test(tag)) {
      errors.push(`${name}: <img> missing width/height -> ${tag.slice(0, 90)}...`);
    }
    if (!/\balt="/.test(tag)) {
      errors.push(`${name}: <img> missing alt -> ${tag.slice(0, 90)}...`);
    }
  }
}

/* 6 — weight budget --------------------------------------------------- */
const SCRIPTS_DIR = join(ROOT, "scripts");
const published = (await walk(ROOT)).filter(
  (f) => !f.startsWith(SCRIPTS_DIR) && !f.endsWith(".md")
);
let total = 0;
for (const file of published) {
  const size = await sizeOf(file);
  total += size;
  if (/\.(jpe?g|png|webp|avif|gif|ico)$/i.test(file) && size > MAX_SINGLE_IMAGE) {
    warnings.push(`Large image ${file.slice(ROOT.length + 1)} = ${fmt(size)} (budget ${fmt(MAX_SINGLE_IMAGE)})`);
  }
}
if (total > MAX_TOTAL_WEIGHT) {
  errors.push(`Published weight ${fmt(total)} exceeds the ${fmt(MAX_TOTAL_WEIGHT)} budget`);
}

/* 7 — required deployment files ---------------------------------------- */
for (const required of ["vercel.json", "robots.txt", "404.html", "package.json"]) {
  if (!existsSync(join(ROOT, required))) errors.push(`Missing deployment file: ${required}`);
}

/* --------------------------------------------------------------- report --- */

if (warnings.length) {
  console.log("\n⚠  Warnings");
  for (const w of warnings) console.log(`   • ${w}`);
}

if (errors.length) {
  console.error(`\n✗  ${errors.length} problem(s) found:\n`);
  for (const e of errors) console.error(`   • ${e}`);
  process.exit(1);
}

const files = published.length;
console.log(`\n✓  Anniversary edition verified — ${files} files, ${fmt(total)} total, no hot-linked assets, no placeholders.\n`);
