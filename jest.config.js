// jest.config.js

module.exports = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  collectCoverageFrom: ['**/*.{js,jsx,ts,tsx}', '!**/*.d.ts', '!**/node_modules/**'],
  modulePaths: ['<rootDir>'],
  moduleNameMapper: {
    /* Asset and style mocks must precede the `@/` alias — Jest applies the first matching
       mapper, and `@/(.*)` would otherwise resolve `@/public/x.svg` to the real file, which
       babel-jest can't parse. */

    /* Handle CSS imports (with CSS modules)
    https://jestjs.io/docs/webpack#mocking-css-modules */
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',

    // Handle CSS imports (without CSS modules)
    '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',

    /* Handle image imports
    https://jestjs.io/docs/webpack#handling-static-assets */
    '^.+\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',

    '@/(.*)': '<rootDir>/$1',
  },
  modulePathIgnorePatterns: ['tests/cypress'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    browsers: ['chrome', 'firefox', 'safari'],
  },
  transform: {
    /* Use babel-jest to transpile tests with the next/babel preset
    https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object */
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: ['/node_modules/', '^.+\\.module\\.(css|sass|scss)$'],
};
