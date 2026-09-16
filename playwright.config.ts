import { defineConfig, devices } from '@playwright/test'
import { e2eDatabaseUrl, loadDotEnv } from './e2e/helpers/env'

/**
 * End-to-end tests for the money path (#65): a guest buys an event ticket, a
 * visitor joins as a member. Real browser, real Next server, real Stripe test
 * mode, and a real Postgres of its own (basa_e2e locally, a service container in
 * CI) that global-setup resets and seeds before every run.
 *
 *   pnpm test:e2e            # headless
 *   pnpm test:e2e:ui         # Playwright UI
 *
 * Needs the Stripe *test* keys from .env / .env.local (sk_test_, pk_test_, and
 * the whsec_ the app is configured with - the specs sign their own webhook
 * deliveries with it). Live keys would make real charges; the setup refuses them.
 */
loadDotEnv()

/** process.env minus the keys that would make Next behave differently from a plain run. */
function serverEnv(): Record<string, string> {
  const env: Record<string, string> = {}
  for (const [k, v] of Object.entries(process.env)) {
    if (v === undefined || k === 'NODE_ENV' || k === 'CI') continue
    env[k] = v
  }
  return env
}

const PORT = Number(process.env.E2E_PORT ?? 3100)
// localhost, not 127.0.0.1: Next dev treats the IP form as a cross-origin request to /_next.
const BASE_URL = `http://localhost:${PORT}`
// GitHub sets this; the project's own .env has a CI= line that dotenv would otherwise pick up.
const CI = process.env.GITHUB_ACTIONS === 'true'

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: CI ? 1 : 0,
  reporter: CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    navigationTimeout: 60_000,
    actionTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // CI builds first (see the workflow) and runs the real production server; locally
    // the dev server keeps the loop fast. Either way it is the app, not a mock.
    command: CI ? `pnpm exec next start -p ${PORT}` : `pnpm exec next dev -p ${PORT}`,
    url: `${BASE_URL}/api/health`,
    timeout: 240_000,
    reuseExistingServer: !CI,
    stdout: 'ignore',
    stderr: 'pipe',
    env: {
      ...serverEnv(),
      DATABASE_URL: e2eDatabaseUrl(),
      NEXTAUTH_URL: BASE_URL,
      NEXT_PUBLIC_APP_URL: BASE_URL,
      // The membership spec exercises the join wizard, which is gated in production.
      MEMBERSHIP_SALES_ENABLED: 'true',
      // Email must never leave a test run.
      MAILGUN_API_KEY: '',
      SMTP_HOST: '',
      // Node 22+ can expose an experimental `localStorage` global on the server whose
      // methods are undefined; browser-only checks (`typeof localStorage`) then run
      // during SSR and the page 500s. Production runs Node 22 in Docker without it.
      NODE_OPTIONS: [process.env.NODE_OPTIONS, '--no-experimental-webstorage'].filter(Boolean).join(' '),
    },
  },
})
