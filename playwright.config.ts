import { defineConfig, devices } from '@playwright/test'

// Les tests utilisent la base décrite dans .env.local (jamais la base de production).
try {
  process.loadEnvFile('.env.local')
} catch {
  // Variables fournies par l'environnement (CI).
}

const PORT = 3421

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: false,
  workers: 1,
  // Machine de développement chargée (Docker + Chrome + Next) : délais larges, un nouvel essai.
  retries: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: 'chrome',
    locale: 'fr-FR',
    timezoneId: 'Africa/Kinshasa',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'], channel: 'chrome' } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } }, testMatch: /admin|public/ },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
