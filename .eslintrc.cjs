/** ESLint config — forbid raw form elements outside UI primitives */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react"],
  extends: ["next", "next/core-web-vitals"],
  overrides: [
    // Allow raw elements inside our primitives folder only
    {
      files: ["src/components/ui/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-syntax": "off",
      },
    },
    // Forbid raw elements elsewhere
    {
      files: ["src/**/*.{ts,tsx}"],
      excludedFiles: ["src/components/ui/**/*.{ts,tsx}"],
      rules: {
        // Disallow raw HTML controls; use Button/Input/Select from primitives
        "no-restricted-syntax": [
          "error",
          {
            selector:
              "JSXOpeningElement[name.name=/^(button|input|select|textarea)$/]",
            message:
              "Use primitives (Button/Input/Select) from src/components/ui instead of raw HTML elements.",
          },
        ],
      },
    },
  ],
};
