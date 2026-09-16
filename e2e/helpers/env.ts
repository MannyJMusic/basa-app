import { existsSync } from 'fs'
import { config as dotenv } from 'dotenv'

/** Load .env then .env.local without overriding anything already in the environment. */
export function loadDotEnv(): void {
  for (const file of ['.env', '.env.local']) {
    if (existsSync(file)) dotenv({ path: file, override: false })
  }
}

/**
 * The database the e2e run owns. E2E_DATABASE_URL wins; otherwise the project's
 * DATABASE_URL with its database name swapped for basa_e2e, so the local user and
 * host carry over. Global setup resets this database, so it must never be a real one.
 */
export function e2eDatabaseUrl(): string {
  const explicit = process.env.E2E_DATABASE_URL?.trim()
  if (explicit) return explicit
  const base = process.env.DATABASE_URL
  if (!base) throw new Error('Set E2E_DATABASE_URL or DATABASE_URL so the e2e run has a database')
  const url = new URL(base)
  url.pathname = '/basa_e2e'
  return url.toString()
}

/** Refuse to run the money path against anything but Stripe test mode. */
export function assertStripeTestMode(): { secretKey: string; webhookSecret: string } {
  const secretKey = process.env.STRIPE_RESTRICTED_KEY || process.env.STRIPE_SECRET_KEY || ''
  const publishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''
  if (!/^(sk|rk)_test_/.test(secretKey)) throw new Error('e2e needs a Stripe TEST secret/restricted key (sk_test_ / rk_test_); refusing to run')
  if (!/^pk_test_/.test(publishable)) throw new Error('e2e needs a Stripe TEST publishable key (pk_test_); refusing to run')
  if (!webhookSecret.startsWith('whsec_')) throw new Error('e2e needs STRIPE_WEBHOOK_SECRET so it can sign simulated webhook deliveries')
  return { secretKey, webhookSecret }
}
