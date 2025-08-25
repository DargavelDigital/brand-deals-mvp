// Fails if raw hex/rgb colors are used outside /src/styles/.
// Allows test snapshots and CSS files in /src/styles/.
const { readFileSync, readdirSync, statSync } = require("fs");
const { join, sep } = require("path");

const ROOT = join(process.cwd(), "src");
const ALLOW_DIR = join(ROOT, "styles") + sep; // allow tokens and base css here

const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const RGB = /\brgba?\s*\(/g;

const offenders = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) { walk(p); continue; }
    if (!/\.(tsx?|css|mdx?)$/.test(p)) continue;
    if (p.startsWith(ALLOW_DIR)) continue; // ignore styles directory
    const text = readFileSync(p, "utf8");
    if (HEX.test(text) || RGB.test(text)) {
      offenders.push(p);
    }
  }
}
walk(ROOT);

if (offenders.length) {
  console.error("\n✖ UI Guard: raw colors found outside src/styles/:\n");
  offenders.forEach(f => console.error(" - " + f));
  console.error("\nUse design tokens (Tailwind + CSS vars) or primitives.\n");
  process.exit(1);
} else {
  console.log("✔ UI Guard: no raw colors found.");
}
