# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BASA (Business Association of San Antonio) is a full-stack web application for membership management, events, and business networking. Built with Next.js 15 App Router, TypeScript, PostgreSQL/Prisma, and Stripe integration.

## Development Commands

```bash
# Development
pnpm dev                    # Start dev server (binds to 0.0.0.0)
pnpm build                  # Production build (runs type-check & lint first)
pnpm check                  # Type-check + lint only

# Database (Prisma)
pnpm db:generate            # Generate Prisma client
pnpm db:migrate             # Run migrations (dev)
pnpm db:seed                # Seed database
pnpm db:studio              # Open Prisma Studio

# Testing
pnpm test                   # Integration tests (Testcontainers)
pnpm test:unit              # Unit tests only
pnpm test:integration       # Integration tests with Testcontainers
pnpm cypress:open           # Open Cypress for E2E

# Stripe webhooks (needs Stripe CLI, logged in, STRIPE_WEBHOOK_SECRET in .env.local)
./scripts/dev-with-webhooks.sh  # Dev server + `stripe listen` forwarding to /api/webhooks/stripe

# Docker
docker compose -f docker-compose.local.yml up  # Local development (PostgreSQL + App + Prisma Studio)
docker compose -f docker-compose.dev.yml up    # Dev environment (for remote dev server)
docker compose -f docker-compose.prod.yml up   # Production environment
```

## Deployment

### Local Development

```bash
# Start local environment with Docker
docker compose -f docker-compose.local.yml up -d

# Services available:
# - App: http://localhost:3000
# - Prisma Studio: http://localhost:5555
# - PostgreSQL: localhost:5432
```

### Production (Hostinger CloudPanel)

The app is deployed to `https://app.businessassociationsa.com` on a Hostinger VPS running CloudPanel.

**Architecture:** CloudPanel (nginx reverse proxy + SSL) → Docker containers (Next.js + PostgreSQL)

The app's vhost is hand-written, not CloudPanel-managed: `nginx/basa-app.conf` in this repo is a copy of `/etc/nginx/sites-enabled/app.businessassociationsa.com.conf` on the host, and the two should be kept identical (re-synced 2026-09-22: access logs, the `Next-Action` 403, and the `/_next/image` source guard live there; the host also has hardening outside this repo, see the audit report in the BASA workspace root). Note `.env.production` is inside the Docker build context on purpose: `next build` reads `NEXT_PUBLIC_*` and `SENTRY_AUTH_TOKEN` from it. `images.remotePatterns` in `next.config.js` is a closed list; add hosts deliberately. It proxies `/` to the container and serves `/uploads/` (imported event and venue images, `/opt/basa-app/uploads`) straight from disk, because Next only lists `public/` at startup.

```bash
# SSH to production server
ssh root@31.97.214.26

# Production commands on server
docker compose -f /opt/basa-app/docker-compose.prod.yml ps      # Check status
docker compose -f /opt/basa-app/docker-compose.prod.yml logs -f # View logs
docker compose -f /opt/basa-app/docker-compose.prod.yml restart # Restart services

# Manual backup
/usr/local/sbin/basa-backup.sh
```

### Backups

Three layers, in order of what you would actually restore from:

1. **Hostinger VPS snapshots** — the off-box copy of record. Taken and retained by Hostinger, outside this repo and outside the box.
2. **Nightly dumps on the host** — `/usr/local/sbin/basa-backup.sh` at 02:30 via `/etc/cron.d/basa`, writing WordPress MySQL and basa-app Postgres to `/var/backups/basa/{mysql,postgres}` with 14-day retention. The script exits non-zero if a dump fails or is truncated, and logs to `/var/backups/basa/backup.log`.
3. **Local pulls** — `./scripts/pull-backups.sh` copies the newest dumps (or `--all`) into `./backups/` and gzip-verifies each one.

```bash
./scripts/pull-backups.sh          # newest of each database
./scripts/pull-backups.sh --all    # everything the host still retains
```

`./backups/` is gitignored, as are `*.sql.gz`, `*.sql.bz2` and `*.dump` anywhere in the tree. These dumps contain member PII, WordPress password hashes and payment records — never commit them, attach them to an issue, or paste their contents.

### CI/CD (GitHub Actions)
Automated deployment via `.github/workflows/deploy.yml`:

1. **Trigger:** Push to `main` or `master` branch
2. **Build & Test:** Install deps, type-check, lint, build
3. **Deploy:** SSH to server, pull latest code, rebuild Docker images, run migrations

**Required GitHub Secrets:**
- `SSH_PRIVATE_KEY` - Deploy key for server access
- `SERVER_HOST` - Server IP (31.97.214.26)
- `SERVER_USER` - SSH user (root)

## Accounts and registration

There is **no self-registration** (owner decision 2026-09-22, #166). Accounts are created only by BASA staff (admin UI, bulk upload) or by a membership purchase once `MEMBERSHIP_SALES_ENABLED` is on. Consequences that must stay true:

- `/api/auth/register` does not exist; `/auth/sign-up` is a notice page that points at the office and sign-in.
- Google sign-in only works for an existing, active account; an unknown address is refused (`signIn` callback returns `false`, which lands on `/auth/sign-in?error=AccessDenied`). Deactivated or suspended accounts are refused by both providers.
- Nothing creates a `Member` row with `membershipStatus: "ACTIVE"` except the Stripe webhook and admin routes. Implicit rows (`/api/account`, `/api/profile`, newsletter) are `PENDING`; member pricing keys off `ACTIVE`.
- Newsletter subscribe (`POST /api/newsletter`, public) may create an inactive `GUEST` user to hang the flag on, never a login-capable one, and never edits an existing user's name. Bulk sending is `POST /api/admin/newsletter` (admin only).
- The audit-log principal `system@basa.org` (`src/lib/system-user.ts`) is inactive, non-admin, and denied in auth; `getSystemUser()` self-heals the row if it is ever found active.

## Feature gates

`src/lib/feature-flags.ts`, read from the server environment at request time and passed to client components as props. `MEMBERSHIP_SALES_ENABLED` (off unless exactly `true`) controls whether memberships can be bought or renewed online: off means the join and payment pages show how to reach the office, tier listings show no prices or buy buttons, the dashboard shows no upgrade offers, renewal emails point at the office, and `POST /api/payments/membership` answers 403. Event tickets are unaffected. The e2e suite runs with it on so the join wizard stays tested.

## Architecture

### Directory Structure
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components organized by domain (admin, auth, dashboard, events, forms, layout, marketing, members, membership, payments, ui)
- `src/lib/` - Core utilities and configurations
- `src/hooks/` - Custom React hooks (use-auth, use-events, use-members, use-payments, use-profile, use-settings)
- `prisma/` - Database schema and migrations

### Key Libraries (src/lib/)
- `auth.ts` - NextAuth.js v5 configuration with Google OAuth and credentials providers
- `db.ts` - Prisma client singleton (exports `prisma` and `db`)
- `store.ts` - Zustand store for client-side state (user, UI, events)
- `stripe.ts` - Stripe payment integration
- `basa-emails.ts` - Email templates and Mailgun integration
- `validations.ts` - Zod validation schemas

### API Routes Pattern
API routes are in `src/app/api/`. Key domains:
- `/api/auth/` - Authentication (NextAuth, password reset, verification)
- `/api/members/` - Member CRUD, bulk upload, export
- `/api/events/` - Event management and registration
- `/api/payments/` - Stripe payments and webhooks
- `/api/content/` - Blog posts, testimonials, resources
- `/api/admin/` - Admin-only operations
- `/api/dev/` - Development tools (email preview, database inspection)

### Route Protection
There is **no request middleware**. A `middleware.ts` sat in the repo root until 2026-09-14, but this project uses `src/`, so Next never compiled it and it never ran; it could not have anyway, because `src/lib/auth.ts` pulls in Prisma and bcrypt, which cannot execute at the edge. Protection lives in two places instead:

- **Page routes:** the server layouts. `src/app/dashboard/layout.tsx` redirects anonymous visitors to sign-in; `src/app/admin/layout.tsx` additionally requires `role === "ADMIN"` (the client-side `AdminShell` under it is chrome, not a guard); `src/app/dev/layout.tsx` gates the dev tools. A new protected section needs its own layout check.
- **API routes:** every handler under `src/app/api/` must call `requireSession()` / `requireAdmin()` from `src/lib/api-auth.ts` itself. Nothing upstream protects them.

Static files under `public/` and `/uploads/` (served by nginx) are public by definition.

There are two Stripe webhook handlers: `/api/webhooks/stripe` (the one the dev script and Stripe are pointed at, verifies the signature with `STRIPE_WEBHOOK_SECRET` and sends welcome/receipt emails) and the older `/api/payments/webhook`. Change the former.

### Database Schema
Key models in `prisma/schema.prisma`:
- User/Member - User accounts with membership details
- Event/EventRegistration - Events with ticketing
- Payment - Stripe payment records
- BlogPost, Testimonial, Resource - Content management
- Settings - Application configuration

### Component Organization
UI components use shadcn/ui (in `src/components/ui/`). Domain components are colocated:
- `components/admin/` - Admin dashboard components
- `components/auth/` - Sign-in, sign-up forms
- `components/events/` - Event cards, calendars, registration
- `components/membership/` - Tier selection, payment forms

### State Management
- Server state: Direct Prisma queries in API routes and Server Components
- Client state: Zustand store (`useAppStore`, `useUser`, `useUI`, `useEvents` hooks)
- Forms: React Hook Form with Zod validation

## Testing

Integration tests use Testcontainers for isolated PostgreSQL instances:
- Tests in `src/__tests__/integration/` use `jest.config.testcontainers.js`
- Unit tests in `src/__tests__/unit/` use `jest.config.js`
- Test setup helpers in `src/__tests__/integration/helpers/`

```bash
pnpm test:unit -- src/__tests__/unit/utils.test.ts                       # single unit test file
pnpm test:integration -- src/__tests__/integration/api-events.test.ts    # single integration test file
pnpm test:unit -- -t "generateRandomData"                                # filter by test name
```

Integration tests need a real PostgreSQL. By default they spin one up via Testcontainers, which needs Docker locally or a Testcontainers Cloud token (`pnpm setup:testcontainers`); set `TEST_DATABASE_URL` to a scratch database (`createdb basa_test`) to run them against an existing server with no Docker at all — the name must contain `test`, because the suite truncates every table.  They run serially (`maxWorkers: 1`) with a 2-minute timeout; a hang usually means the container never started. Unit tests use jsdom and ignore the `integration/` folder entirely.

## Sentry

Import as `import * as Sentry from "@sentry/nextjs"`. `Sentry.init` is called only in `src/instrumentation-client.ts` (browser), `sentry.server.config.ts`, and `sentry.edge.config.ts`; never add another init.

Project `basa-v3` in org `basa-0f` (slugs, not display names). No DSN is hard-coded: the browser reads `NEXT_PUBLIC_SENTRY_DSN`, the server and edge read `SENTRY_DSN` and fall back to the public one. Both are inlined or read from `.env.production` when the image is built on the host, so an empty value disables the SDK rather than breaking the build. `SENTRY_AUTH_TOKEN` there enables source-map upload; leave it empty to build without uploading.

- Wrap expected failures with `Sentry.captureException(error)` inside `try/catch`.
- Wrap meaningful actions (button handlers, API calls, expensive functions) in `Sentry.startSpan({ op, name }, span => ...)` with descriptive `op`/`name` (e.g. `ui.click`, `http.client`) and `span.setAttribute` for useful context. Child spans may nest inside a parent.
- For structured logs use `const { logger } = Sentry` and `logger.fmt` template literals; logging requires `_experiments: { enableLogs: true }` in init. `Sentry.consoleLoggingIntegration` can forward `console.*` calls instead of instrumenting each one.

## Branching

- `main` is production. Every push to `main` deploys via GitHub Actions. It is protected: PR only, the **Build and Test** check must pass, no force pushes.
- `dev` is integration. Branch from `dev` (`fix/<issue>-<slug>`, `feat/<issue>-<slug>`, `chore/<issue>-<slug>`), open a PR into `dev`, squash-merge.
- Release by opening a PR from `dev` into `main`. Merging it is the deploy.
- The **Build and Test** job (install, type-check, lint, `next build`) runs on every PR into `dev` or `main`; the deploy job runs only on pushes to `main`.

## Project Tracking

Work is tracked in GitHub Issues on this repo with one milestone per phase of `.claude/PLAN.md`. Reference the issue number in branch names and commit messages (`fix: gate dev routes (#25)`). Labels: `security`, `cleanup`, `infra`, `deps`, `migration`, `feature`, `decision`, `retirement`.

## Path Alias

Use `@/` for imports from `src/`:
```typescript
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
```
