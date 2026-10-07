import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

for (const file of ['.env.e2e.local', '.env.local']) {
  if (existsSync(file)) loadEnvFile(file);
}
const required = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'E2E_USER_ONE_EMAIL', 'E2E_USER_ONE_PASSWORD', 'E2E_USER_TWO_EMAIL', 'E2E_USER_TWO_PASSWORD'];
if (process.env.ALLOW_TEST_DATA_WRITES !== '1' || required.some(key => !process.env[key])) {
  throw new Error('E2E requires two dedicated confirmed accounts and ALLOW_TEST_DATA_WRITES=1. See docs/verification.md.');
}
const runId = process.env.E2E_RUN_ID ?? new Date().toISOString().replace(/[:.]/g, '-');
process.env.E2E_RUN_ID = runId;
const runFolder = `output/playwright/${runId}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  outputDir: `${runFolder}/results`,
  reporter: [['list'], ['html', { outputFolder: `${runFolder}/report`, open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3207',
    video: 'on',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
  ],
  webServer: process.env.E2E_BASE_URL ? undefined : {
    command: 'npm run start -- --hostname 127.0.0.1 --port 3207',
    url: 'http://127.0.0.1:3207',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
