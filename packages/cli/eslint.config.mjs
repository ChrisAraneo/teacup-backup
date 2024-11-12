import eslint from '@eslint/js';
import eslintPluginJsonc from 'eslint-plugin-jsonc';
import eslintPluginReact from 'eslint-plugin-react';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  eslint.configs.recommended,
  (eslintPluginReact.configs.flat || {}).recommended,
  (eslintPluginReact.configs.flat || {})['jsx-runtime'],
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  ...eslintPluginJsonc.configs['flat/recommended-with-jsonc'],
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'jsonc/no-comments': 'error',
      'jsonc/sort-keys': 'error',
    },
    ignores: ['package.json', 'package-lock.json'],
  },
  {
    files: ['src/**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    plugins: {
      react: eslintPluginReact,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
    },
  },
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
