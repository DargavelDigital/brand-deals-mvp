// ESM-safe dependency checker for Netlify/Node 20.
// Fails the build early if required packages are missing or cannot be resolved.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "../../..", "package.json"), "utf8"));

const required = [
  // runtime / framework
  ["next", "dependency"],
  ["react", "dependency"],
  ["react-dom", "dependency"],
  // styling
  ["@tailwindcss/postcss", "devDependency"],
  // prisma
  ["@prisma/client", "dependency"],
  ["prisma", "devDependency"],
];

const missing = [];
for (const [name, group] of required) {
  const has =
    (pkg.dependencies && pkg.dependencies[name]) ||
    (pkg.devDependencies && pkg.devDependencies[name]);
  if (!has) missing.push([name, group]);
}

if (missing.length) {
  console.error("\n✖ Missing required packages (add to package.json and commit):\n");
  for (const [name, group] of missing) {
    console.error(` - ${name} (${group})`);
  }
  console.error(
    '\nFix: add the packages above to package.json, commit, then redeploy. ' +
    'If Netlify still fails, clear build cache & redeploy.'
  );
  process.exit(1);
}

// Resolution sanity check without executing package code.
// Use Node's resolver (works for CJS/ESM) via createRequire().
const toResolve = ["next", "react", "react-dom", "@tailwindcss/postcss"];
for (const name of toResolve) {
  try {
    require.resolve(name);
  } catch {
    console.error(`\n✖ Unable to resolve "${name}" from node_modules. Clear Netlify cache and redeploy.`);
    process.exit(1);
  }
}

console.log("✔ verify-deps: all required packages present and resolvable.");
