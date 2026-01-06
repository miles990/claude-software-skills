/**
 * Vitest Configuration Template
 * Usage: Copy to vitest.config.ts in project root
 */

import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Environment
    environment: 'node', // or 'jsdom', 'happy-dom'

    // File patterns
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],

    // Global setup
    globals: true,
    setupFiles: ['./vitest.setup.ts'],

    // Coverage
    coverage: {
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/**/index.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },

    // Performance
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },

    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,

    // Watch mode
    watch: false,
    watchExclude: ['**/node_modules/**', '**/dist/**'],
  },

  // Path aliases
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
