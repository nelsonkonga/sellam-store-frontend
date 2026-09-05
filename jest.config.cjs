/**
 * Configuration Jest pour Sellam
 */

module.exports = {
  testEnvironment: 'jsdom',
  preset: null,
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }]
      ],
      plugins: ['@babel/plugin-transform-modules-commonjs'],
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(axios|dexie|dexie-react-hooks|jwt-decode|uuid|nanoid)/)',
  ],
  globals: {
    'import.meta': {
      env: { VITE_API_URL: 'http://localhost:8080/api' }
    }
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/main.jsx',
    '!src/vite-env.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: [
    '**/__tests__/**/*.{js,jsx}',
    '**/*.{spec,test}.{js,jsx}',
  ],
  verbose: true,
};
