#!/usr/bin/env node

/**
 * Runs on every production container start, before `next start`: applies
 * pending migrations and refuses to start if they fail.
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
 * Seeding no longer runs here. It used to run on every start, which meant the
 * admin passwords had to sit in the app container's environment forever, and a
 * missing Settings row was silently recreated with placeholder values. The seed
 * is idempotent and only needed for a fresh database; run it deliberately:
 *   docker compose --env-file .env.production -f docker-compose.prod.yml \
 *     --profile tools run --rm seed
 */

console.log('Production environment ready.')
