import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "plugin:jsx-a11y/recommended"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    rules: {
      // Custom rules for design system enforcement
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='className'] > Literal[value=/border-dashed|outline-dashed|w-screen|max-w-full|min-w-full|flex-1|grow|basis-full/]",
          message: "Banned CSS class violates design system. Use design system tokens instead."
        }
      ],
      // Accessibility rules
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/no-noninteractive-tabindex": "error",
    }
  },
  // Prevent importing @/lib/env from client components
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/lib/env",
              message: "Cannot import @/lib/env from client components. This module is server-side only.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
