import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      // The codebase uses `any` in a number of places; treat as warnings so CI/dev
      // isn't blocked, while still surfacing the cleanup work.
      "@typescript-eslint/no-explicit-any": "warn",

      // These rules are useful, but they flag a few harmless patterns in the UI
      // component wrappers; keep as warnings rather than hard errors.
      "@typescript-eslint/no-empty-object-type": "warn",
    },
  },
);
