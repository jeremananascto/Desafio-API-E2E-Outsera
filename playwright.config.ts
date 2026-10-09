import { defineConfig } from '@playwright/test';
import { env } from './src/config/env';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests/api',
  outputDir: 'reports/api/test-results',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : 4,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/api/html', open: 'never' }],
    ['junit', { outputFile: 'reports/api/junit.xml' }],
    ['json', { outputFile: 'reports/api/results.json' }],
  ],
  use: {
    baseURL: env.api.baseURL,
    extraHTTPHeaders: { Accept: 'application/json' },
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'api' }],
});
