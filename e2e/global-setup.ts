import { execSync } from 'child_process'
import { assertStripeTestMode, e2eDatabaseUrl, loadDotEnv } from './helpers/env'
import { db, FIXTURE_EVENT } from './helpers/db'

/**
 * Before every e2e run: refuse live Stripe keys, reset the e2e database to the
 * current migrations, and create the one fixture the specs need - a published,
 * upcoming, paid event with a member and a non-member ticket tier.
 *
 * The project seed is not used here: it wants the admin bootstrap variables and
 * writes demo content the specs do not need. Membership tiers are not rows at all
 * (the join page and the payments API carry them in code), so nothing to seed there.
 */
export default async function globalSetup(): Promise<void> {
  loadDotEnv()
  assertStripeTestMode()

  const url = e2eDatabaseUrl()
  const name = new URL(url).pathname.replace(/^\//, '')
  if (!/e2e|test/i.test(name)) {
    throw new Error(`e2e database is named "${name}"; it gets reset on every run, so its name must contain "e2e" or "test"`)
  }

  console.log(`e2e: resetting ${name}`)
  execSync('pnpm exec prisma migrate reset --force --skip-seed --skip-generate', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: url },
  })

  const prisma = db()
  const start = new Date()
  start.setDate(start.getDate() + 21)
  start.setHours(17, 30, 0, 0)
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)

  await prisma.event.create({
    data: {
      title: FIXTURE_EVENT.title,
      slug: FIXTURE_EVENT.slug,
      description: '<h1><strong>E2E fixture</strong></h1><p>Created by e2e/global-setup.ts.</p>',
      shortDescription: 'E2E fixture event',
      startDate: start,
      endDate: end,
      location: 'E2E Test Venue',
      address: '100 Test St',
      city: 'San Antonio',
      state: 'TX',
      zipCode: '78201',
      category: 'Mixer',
      type: 'NETWORKING',
      status: 'PUBLISHED',
      price: FIXTURE_EVENT.guestPrice,
      memberPrice: FIXTURE_EVENT.memberPrice,
      ticketTiers: {
        create: [
          { name: FIXTURE_EVENT.memberTier, price: FIXTURE_EVENT.memberPrice, sortOrder: 0, isActive: true },
          { name: FIXTURE_EVENT.guestTier, price: FIXTURE_EVENT.guestPrice, sortOrder: 1, isActive: true },
        ],
      },
    },
  })
  await prisma.$disconnect()
  console.log(`e2e: fixture event /events/${FIXTURE_EVENT.slug} created`)

  // Locally the dev server compiles each page on first request, and the join page
  // takes over a minute cold. Warm the pages the specs open so navigation time is
  // not spent on compilation. `next start` in CI answers these instantly.
  const base = `http://localhost:${process.env.E2E_PORT ?? 3100}`
  for (const path of ['/membership/join', `/events/${FIXTURE_EVENT.slug}/register`, '/payment/success?type=event&paymentId=warm']) {
    const started = Date.now()
    const res = await fetch(base + path, { signal: AbortSignal.timeout(180_000) }).catch((e: Error) => e)
    console.log(`e2e: warmed ${path} -> ${res instanceof Error ? res.message : res.status} in ${((Date.now() - started) / 1000).toFixed(0)}s`)
  }
}
