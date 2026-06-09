import js from "@eslint/js";
import reactHooksPlugin from "eslint-plugin-react-hooks";

export default [
  // Ignorlanacak klasörler
  {
    ignores: ["node_modules/", "dist/", "web-build/", ".expo/"],
  },
  // Ana kurallar
  {
    files: ["**/*.{js,jsx}"],
    ...js.configs.recommended,
    plugins: {
      "react-hooks": reactHooksPlugin,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        // React Native globals
        __DEV__: "readonly",
        fetch: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        alert: "readonly",
        FormData: "readonly",
        require: "readonly",
        module: "readonly",
        process: "readonly",
      },
    },
    rules: {
      // React Hooks kuralları
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // Kullanılmayan değişkenler (import edilen component'ler için esnek)
      "no-unused-vars": ["warn", { varsIgnorePattern: "^[A-Z_]", argsIgnorePattern: "^_" }],
      // Console.log'a izin ver (mobil geliştirmede debug için)
      "no-console": "off",
    },
  },
];
