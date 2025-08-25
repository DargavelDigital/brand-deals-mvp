/** Stylelint config – tokenized UI only */
module.exports = {
  extends: ["stylelint-config-standard"],
  overrides: [
    { files: ["**/*.{ts,tsx,html}"], customSyntax: "postcss-html" }
  ],
  rules: {
    "color-named": "never",
    "color-no-hex": true,                 // enforce tokens, not raw hex
    "no-duplicate-selectors": true,
    "declaration-no-important": null
  }
};
