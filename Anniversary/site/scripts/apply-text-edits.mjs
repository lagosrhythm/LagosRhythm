import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const file = resolve(ROOT, "index.html");

let c = readFileSync(file, "utf8");

// 1. Bold: recognition gap
c = c.replace(
  "Call this the recognition gap: the distance",
  "Call this the <strong>recognition gap</strong>: the distance"
);

// 2. Bold: source test
c = c.replace(
  "Call it the source test: consent, credit, return.</p>",
  "Call it the <strong>source test</strong>: consent, credit, return.</p>"
);

// 3. Street Rhythm — hyperlink + bold
c = c.replace(
  "Street Rhythm, a video-guided",
  '<a href="https://www.lagosrhythm.com/street-rhythm" target="_blank" rel="noopener noreferrer"><strong>Street Rhythm</strong></a>, a video-guided'
);

// 4. Storywell — hyperlink + bold
c = c.replace(
  "we created Storywell, an initiative",
  'we created <a href="https://lnkd.in/p/eUD8ZtgU" target="_blank" rel="noopener noreferrer"><strong>Storywell</strong></a>, an initiative'
);

// 5. Bold: digital experience player
c = c.replace(
  "Lagos Rhythm\u2019s digital experience player",
  "Lagos Rhythm\u2019s <strong>digital experience player</strong>"
);

writeFileSync(file, c, "utf8");

// Verify
const checks = [
  ["<strong>recognition gap</strong>", "recognition gap bold"],
  ["<strong>source test</strong>", "source test bold"],
  ["lagosrhythm.com/street-rhythm", "Street Rhythm link"],
  ["lnkd.in/p/eUD8ZtgU", "Storywell link"],
  ["<strong>digital experience player</strong>", "digital experience player bold"],
];
let ok = true;
for (const [str, label] of checks) {
  const found = c.includes(str);
  console.log((found ? "  \u2713" : "  \u2717") + "  " + label);
  if (!found) ok = false;
}
if (ok) console.log("\n\u2713  All edits applied successfully.\n");
else { console.error("\n\u2717  Some edits failed.\n"); process.exit(1); }
