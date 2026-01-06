/**
 * Jest Configuration Template
 * Usage: Copy to jest.config.ts in project root
 */

import type { Config } from 'jest';

const config: Config = {
  // Test environment
  testEnvironment: 'node', // or 'jsdom' for browser

  // File patterns
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  // TypeScript support
  preset: 'ts-jest',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },

  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Coverage
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Setup
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Performance
  maxWorkers: '50%',
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
};

export default config;
