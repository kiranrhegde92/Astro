import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/web/e2e',
  timeout: 30_000,
  use: {
    baseURL: process.env.WEB_BASE_URL ?? 'http://localhost:8081',
    headless: true,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
