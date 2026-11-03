import fs from "node:fs";

const ROOT = "Anniversary/site/";
const css = fs.readFileSync(ROOT + "assets/css/styles.css", "utf8");
const html = fs.readFileSync(ROOT + "index.html", "utf8");
const js = fs.readFileSync(ROOT + "assets/js/main.js", "utf8");

/* CSS brace balance */
let depth = 0, line = 1, min = 0, minLine = 1;
for (const ch of css) {
  if (ch === "\n") line++;
  if (ch === "{") depth++;
  if (ch === "}") { depth--; if (depth < min) { min = depth; minLine = line; } }
}
console.log(`CSS braces -> end depth ${depth}, most-negative ${min} (line ${minLine})`);

/* duplicate CSS selector sanity (informational) */
const sel = [...css.matchAll(/(^|\n)([^{}@/][^{}]*)\{/g)].map((m) => m[2].trim()).filter(Boolean);
const seen = new Map();
for (const s of sel) seen.set(s, (seen.get(s) || 0) + 1);
const dupes = [...seen.entries()].filter(([, n]) => n > 1);
console.log(`Duplicate selectors: ${dupes.length ? dupes.map(([s, n]) => `${s} x${n}`).join(" | ") : "(none)"}`);

/* HTML tag balance for block elements */
const BLOCK = "section|div|article|figure|header|footer|main|nav|p|h1|h2|h3|span|a|button|blockquote|figcaption|em|blockquote";
const opens = [...html.matchAll(new RegExp(`<(${BLOCK})\\b[^>]*>`, "g"))].filter((m) => !m[0].endsWith("/>")).length;
const closes = [...html.matchAll(new RegExp(`</(${BLOCK})>`, "g"))].length;
console.log(`HTML block tags -> open ${opens}, close ${closes}, delta ${opens - closes}`);

/* classes used in HTML but never styled */
const cls = new Set();
for (const m of html.matchAll(/class="([^"]+)"/g)) m[1].split(/\s+/).forEach((c) => c && cls.add(c));
const missing = [...cls].filter((c) => !css.includes("." + c));
console.log(`Unstyled classes: ${missing.length ? missing.join(", ") : "(none)"}`);

/* ids referenced by JS must exist */
for (const id of [...js.matchAll(/getElementById\("([^"]+)"\)/g)].map((m) => m[1])) {
  if (!html.includes(`id="${id}"`)) console.log(`!! JS references missing id: ${id}`);
}
/* anchors must resolve */
for (const m of html.matchAll(/href="#([^"]+)"/g)) {
  if (!html.includes(`id="${m[1]}"`)) console.log(`!! dead anchor: #${m[1]}`);
}
/* data-nav targets */
for (const m of html.matchAll(/data-nav="([^"]+)"/g)) {
  if (!html.includes(`id="${m[1]}"`)) console.log(`!! dead data-nav: ${m[1]}`);
}
console.log("Done.");
