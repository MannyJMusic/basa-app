#!/usr/bin/env node

/**
 * Runs on every production container start, before `next start`.
 *
 * This used to call `prisma db push --accept-data-loss`, which force-syncs the
 * database to match schema.prisma and silently drops any column or table that no
 * longer appears there. It also never records anything in _prisma_migrations, so
 * the database had no migration history and `migrate deploy` could not run at all
 * (P3005: "the database schema is not empty").
 *
 * Migrations are the mechanism now. They are reviewable, ordered, and refuse to
 * destroy data without being told to.
 */

const { execSync } = require('child_process')

console.log('Setting up BASA production environment...')

try {
  console.log('Applying database migrations...')
  execSync('npx prisma migrate deploy', { stdio: 'inherit' })
  console.log('Migrations applied.')
} catch (error) {
  console.error('Migrations failed. Refusing to start against an unmigrated schema.')
  console.error(error.message)
  // Starting anyway would serve traffic against a schema the code does not expect.
  process.exit(1)
}

/**
 * Seeding is idempotent: it creates the admin accounts, chapters and default
 * settings only when absent, and skips demo data entirely under NODE_ENV=production.
 * A failure here is not fatal - the app runs fine without seed data - but it must be
 * visible rather than swallowed.
 */
try {
  console.log('Seeding baseline data...')
  execSync('pnpm run db:seed', { stdio: 'inherit' })
  console.log('Seed complete.')
} catch (error) {
  console.warn('Seeding failed; continuing to start. Investigate before relying on admin accounts.')
  console.warn(error.message)
}

console.log('Production environment ready.')
