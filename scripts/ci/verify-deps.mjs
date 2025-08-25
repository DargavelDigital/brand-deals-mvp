// Fail the build early if required packages are missing or unresolved.
// Prints a clear, actionable message for Netlify logs.

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

const pkg = JSON.parse(require("fs").readFileSync("package.json", "utf8"));
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
    'If the packages are present locally but still missing on Netlify, Clear build cache & redeploy.'
  );
  process.exit(1);
}

// Sanity import checks (will throw if the module truly isn't resolvable)
const toRequire = ["next", "react", "react-dom", "@tailwindcss/postcss"];
for (const name of toRequire) {
  try { require.resolve(name); } catch (e) {
    console.error(`\n✖ Unable to resolve "${name}" from node_modules. Clear Netlify cache and redeploy.`);
    process.exit(1);
  }
}

console.log("✔ verify-deps: all required packages present.");
