import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import globals from "globals";

const tsRecommended = tsPlugin.configs.recommended ?? { rules: {} };
const reactRecommended = reactPlugin.configs.recommended ?? { rules: {} };
const reactJsxRuntime = reactPlugin.configs["jsx-runtime"] ?? { rules: {} };

export default [
  {
    ignores: ["dist", "node_modules"],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsRecommended.rules,
      ...reactRecommended.rules,
      ...reactJsxRuntime.rules,
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "no-undef": "off",
    },
  },
];
