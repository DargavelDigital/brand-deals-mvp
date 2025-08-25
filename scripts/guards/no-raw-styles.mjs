// Fails build if raw, non-token styles leak into src/ outside src/styles.
// Blocks raw hex, rgb/rgba, arbitrary Tailwind color brackets, non-token box-shadows,
// and pixel border-radius values. Allows anything inside /src/styles and test/snapshot dirs.

import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const ALLOW_DIRS = [
  path.join(SRC, "styles"),
  path.join(ROOT, "tests"), // allow test files
];
const FILE_RE = /\.(tsx?|css|mdx?)$/i;

const RE_HEX = /#[0-9a-fA-F]{3,8}\b/g;                          // #fff #ffffff #ffffffff
const RE_RGB = /\brgba?\s*\(/g;                                  // rgb( … ) rgba( … )
const RE_TW_ARBITRARY_COLOR = /\[(#|rgb|rgba|hsl|hsla)\s*[^ \]]*\]/g; // bg-[#fff] text-[rgb(…)]
const RE_BOX_SHADOW = /box-shadow\s*:\s*[^;]*\d+(px|rem)/gi;     // custom box-shadow
const RE_BORDER_RADIUS = /border-radius\s*:\s*(?!var\()\d+(px|rem)/gi; // non-token radius

const offenders = [];

function isAllowed(filePath) {
  return ALLOW_DIRS.some(dir => filePath.startsWith(dir + path.sep));
}

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      walk(p);
      continue;
    }
    if (!FILE_RE.test(p)) continue;
    if (isAllowed(p)) continue;

    const text = fs.readFileSync(p, "utf8");
    if (
      RE_HEX.test(text) ||
      RE_RGB.test(text) ||
      RE_TW_ARBITRARY_COLOR.test(text) ||
      RE_BOX_SHADOW.test(text) ||
      RE_BORDER_RADIUS.test(text)
    ) {
      offenders.push(p);
    }
  }
}

if (fs.existsSync(SRC)) walk(SRC);

if (offenders.length) {
  console.error("\n✖ UI Guard: disallowed raw styles found outside src/styles/:\n");
  const uniq = [...new Set(offenders)];
  for (const f of uniq) console.error(" - " + path.relative(ROOT, f));
  console.error(
    "\nUse design tokens (CSS vars via Tailwind utilities) or the approved primitives.\n" +
    "Allowed: src/styles/** and tests/**.\n"
  );
  process.exit(1);
} else {
  console.log("✔ UI Guard: no raw styles found.");
}
