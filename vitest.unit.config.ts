import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

/**
 * Unit tests for the music-theory core.
 *
 * Kept separate from `vitest.config.ts` because that file wires the
 * Storybook browser project, whose addon is optional in a plain install.
 * These tests are pure functions — no DOM, no browser, no network.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': path.join(dirname, 'src'),
    },
  },
  test: {
    name: 'unit',
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/*.stories.*'],
  },
});
