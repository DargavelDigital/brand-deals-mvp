import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

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
  // Custom rules for idempotency and multi-write detection
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "custom/no-multiwrite-without-tx": "error",
    },
    plugins: {
      "custom": {
        rules: {
          "no-multiwrite-without-tx": require("./eslint-rules/no-multiwrite-without-tx.js"),
          "no-console-critical": require("./eslint-rules/no-console-critical.js"),
        },
      },
    },
  },
  // Console rules for critical paths
  {
    files: [
      "src/app/api/**/*.{ts,tsx}",
      "src/services/**/*.{ts,tsx}",
      "src/lib/jobs/**/*.{ts,tsx}",
      "src/services/brandRun/**/*.{ts,tsx}"
    ],
    rules: {
      "no-console": "error",
      "no-restricted-properties": [
        "error",
        {
          object: "console",
          property: "log",
          message: "Use log.info/warn/error instead of console.log in critical paths"
        },
        {
          object: "console",
          property: "warn",
          message: "Use log.info/warn/error instead of console.warn in critical paths"
        },
        {
          object: "console",
          property: "error",
          message: "Use log.info/warn/error instead of console.error in critical paths (except in catch blocks followed by throw/error return)"
        }
      ],
      "custom/no-console-critical": "error",
    },
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
        },
        {
          selector: "MemberExpression[object.name='process'][property.name='env']",
          message: "Use env.ts (server) or clientEnv.ts (client). Avoid direct process.env."
        }
      ],
      // Accessibility rules
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/no-noninteractive-tabindex": "error",
    }
  },
  // Prevent importing @/lib/env from client components
  {
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
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
  // Allow process.env usage in env files and config files
  {
    files: ["src/lib/env.ts", "src/lib/clientEnv.ts", "next.config.*", "netlify.toml"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
];

export default eslintConfig;
