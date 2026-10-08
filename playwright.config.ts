import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

const ENV = process.env.ENV || 'qa';

console.log(`Running tests on Environment: ${ENV}`);

dotenv.config({
  path: `src/config/.env.${ENV}`
});

export default defineConfig({

  testDir: './tests',

  // Allow Playwright to distribute tests across available workers
  fullyParallel: true,

  // Prevent test.only from being committed to CI
  forbidOnly: !!process.env.CI,

  // Local = no retry, CI = retry once
  retries: process.env.CI ? 2 : 1,

  // Local = 50% of available CPU cores, CI = 1 worker
  workers: process.env.CI ? 1 : '50%',

  // HTML report locally and in CI
  reporter: process.env.CI
  ? [
      ['html', {
        outputFolder: 'playwright-report',
        open: 'never'
      }]
    ]
  : [
      ['html', {
        outputFolder: 'playwright-report',
        open: 'always'
      }],
      ['blob', {
        outputDir: 'blob-report'
      }]
    ],

  // Store test artifacts here
  outputDir: 'test-results',

  use: {

    // Application URL from environment file
    baseURL: process.env.APP_BASE_URL,

    // Local = headed, CI = headless
    headless: !!process.env.CI,

    // Capture trace only when test is retried
    trace: 'on-first-retry',

    // Capture screenshot when test fails
    screenshot: 'only-on-failure',

    // Retain video for failed tests
    video: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',

      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});