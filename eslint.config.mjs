import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const coreWebVitals = require('eslint-config-next/core-web-vitals');
const prettier = require('eslint-config-prettier/flat');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');

const eslintConfig = [
  ...coreWebVitals,
  prettier,
  {
    plugins: {
      '@typescript-eslint': tseslint,
    },
    languageOptions: {
      parser: tsparser,
    },
    rules: {
      quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          caughtErrors: 'all',
          ignoreRestSiblings: false,
        },
      ],
    },
  },
];

export default eslintConfig;
