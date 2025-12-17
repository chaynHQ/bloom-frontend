import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const coreWebVitals = require('eslint-config-next/core-web-vitals');
const prettier = require('eslint-config-prettier/flat');

const eslintConfig = [
  ...coreWebVitals,
  prettier,
  {
    rules: {
      quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      'no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          caughtErrors: 'all',
          ignoreRestSiblings: false,
          ignoreUsingDeclarations: false,
          reportUsedIgnorePattern: false,
        },
      ],
    },
  },
];

export default eslintConfig;
