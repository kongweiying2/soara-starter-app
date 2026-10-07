import { defineConfig, devices } from '@playwright/test';

const runId = process.env.E2E_UNCONFIGURED_RUN_ID ?? new Date().toISOString().replace(/[:.]/g, '-');
process.env.E2E_UNCONFIGURED_RUN_ID = runId;
const folder = `output/playwright/unconfigured-${runId}`;
export default defineConfig({
  testDir: './tests/unconfigured',
  workers: 1,
  outputDir: `${folder}/results`,
  reporter: [['list'], ['html', { outputFolder: `${folder}/report`, open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:3208', screenshot: 'only-on-failure', video: 'on' },
  projects: [
    { name: 'desktop', use: devices['Desktop Chrome'] },
    { name: 'mobile', use: devices['Pixel 7'] },
    { name: 'narrow-phone', use: { viewport: { width: 320, height: 720 } } },
  ],
  webServer: {
    command: 'npm run build && npm run start -- --hostname 127.0.0.1 --port 3208',
    url: 'http://127.0.0.1:3208',
    timeout: 120_000,
    reuseExistingServer: false,
    // Environment overrides leave the user's .env.local intact. Isolate build files too.
    env: { NEXT_DIST_DIR: '.next-unconfigured', NEXT_PUBLIC_SUPABASE_URL: '', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: '' },
  },
});
