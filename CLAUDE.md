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

The app is the public site at `https://businessassociationsa.com` (since the WordPress cutover, #71, 2026-09-25 UTC) on a Hostinger VPS running CloudPanel. `www.`, `member.` and the former `app.` hostname 301 to the apex; `app.` still proxies `/api/webhooks/` so late Stripe deliveries land. WordPress remains reachable only on `srv1152916.hstgr.cloud` (noindex) as a 60-day fallback; `nginx/cutover/rollback.sh` (staged in `/root/cutover/`) reverses the cutover. The host's cron jobs (`/etc/cron.d/basa`) and the Stripe webhook endpoint `we_1UG1R3Kf87fwbbM1r6EG3Xqx` call the apex.

**Architecture:** CloudPanel (nginx reverse proxy + SSL) → Docker containers (Next.js + PostgreSQL)

The site's vhosts are hand-written, not CloudPanel-managed: `nginx/basa-app.conf` in this repo is a copy of `/etc/nginx/sites-enabled/businessassociationsa.com.conf` followed by `/etc/nginx/sites-enabled/app.businessassociationsa.com.conf` on the host, and they should be kept identical (access logs, the `Next-Action` 403, and the `/_next/image` source guard live there; the host also has hardening outside this repo, see the audit report in the BASA workspace root). `.env.production` is not in the Docker build context (`.dockerignore` excludes `.env*`): `docker-compose.prod.yml` passes `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `SENTRY_ORG` and `SENTRY_PROJECT` as build args and `SENTRY_AUTH_TOKEN` as a BuildKit secret, all interpolated from `--env-file .env.production`. A new `NEXT_PUBLIC_*` variable has to be added in three places: `.env.production`, the compose `build.args`, and the `ARG`/`ENV` block in the Dockerfile. The containers are hardened in compose (no-new-privileges, dropped capabilities, memory/CPU/pid caps, 10 MB x 5 log rotation); Postgres receives only `POSTGRES_*`, and the app container gets `SENTRY_AUTH_TOKEN`, `ADMIN*_PASSWORD` and `POSTGRES_PASSWORD` blanked. The seed no longer runs at startup; for a fresh database run `docker compose --env-file .env.production -f docker-compose.prod.yml --profile tools run --rm seed`. `images.remotePatterns` in `next.config.js` is a closed list; add hosts deliberately. Security headers are set in that vhost, not in Next (2026-09-24): Permissions-Policy, and an enforced `Content-Security-Policy` (enforced since 2026-09-24 after a report-only period) that reports violations to Sentry `basa-v3` as security events. When adding a third-party script, frame, font or API origin, add it to that policy before the code using it ships, or the browser blocks it. `/uploads/` serves only image and PDF types; anything else goes out as `application/octet-stream`. It repeats the headers because it defines its own `add_header`, which is also what keeps the CSP off PDFs. Rate limits (2026-09-23) live in `nginx/00-basa-rate-limits.conf`, installed as `/etc/nginx/sites-enabled/00-basa-rate-limits.conf` so `nginx.conf` stays untouched: POSTs to `/api/auth/*` (10/min, burst 20), `/api/contact` and `/api/newsletter` (5/min, burst 5), `/api/payments/*` (10/min, burst 10), all of `/_next/image` (20/s, burst 200), and POST `/wp-login.php` (6/min, burst 5; that line is in the CloudPanel-managed WordPress vhost, outside this repo). Over the limit is a 429. Page loads and `GET /api/auth/session` are not counted. Do not test the WordPress limit from your own IP: the `basa-wp-login` fail2ban jail bans for an hour after 8 POSTs to `wp-login.php` in 10 minutes, whatever they contain. It proxies `/` to the container and serves `/uploads/` (imported event and venue images, `/opt/basa-app/uploads`) straight from disk, because Next only lists `public/` at startup.

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
- The audit-log principal `system@businessassociationsa.invalid` (`src/lib/system-user.ts`; a reserved TLD, so the mailbox can never exist) is inactive, non-admin, and denied in auth; `getSystemUser()` self-heals the row if it is ever found active.

## Feature gates

`src/lib/feature-flags.ts`, read from the server environment at request time and passed to client components as props. `MEMBERSHIP_SALES_ENABLED` (off unless exactly `true`) controls whether memberships can be bought or renewed online: off means the join and payment pages show how to reach the office, tier listings show no prices or buy buttons, the dashboard shows no upgrade offers, renewal emails point at the office, and `POST /api/payments/membership` answers 403. Event tickets are unaffected. The e2e suite runs with it on so the join wizard stays tested.

## Member and non-member ticket tiers

Member and non-member prices are separate `TicketTier` rows (imported from MEC), told apart by `TicketTier.audience` (`ALL`, `MEMBER`, `NON_MEMBER`; backfilled from tier names in `20260925000000_member_rate_requests`). `priceSelection()` in `src/lib/ticket-tiers.ts` enforces it, with member status taken from the session only: a signed-in active member cannot buy a `NON_MEMBER` tier (the register page hides them), and a guest cannot buy a `MEMBER` tier except through a member-rate request.

A member-rate request ("I'm a member without a login, verify me") is allowed only on a `MEMBER` tier whose `nonMemberTierId` points at an active non-member tier of the same event (set automatically for events with one of each; otherwise in the admin tier editor). The PaymentIntent uses `capture_method: 'manual'`: the card is authorized for the order at non-member prices, and `EventRegistrationItem.memberUnitPrice` records what verification would charge. Stripe's `requires_capture` (webhook `payment_intent.amount_capturable_updated`, or the stale-hold sweep) confirms the seat, sends the ticket email with the hold explained, and emails every active admin a link to `/admin/member-rate-requests/:id`. Approve captures the member total; deny captures the full hold and moves the item to the paired non-member tier. With no decision within `DECISION_DAYS` (6; card authorizations lapse at 7) the release-stale-holds cron captures the full hold (`EXPIRED`). Decisions are claimed with a conditional update, so a double click or two admins capture once. Logic: `src/lib/member-rate-requests.ts`. The Stripe webhook endpoint is subscribed to `payment_intent.amount_capturable_updated` (since the cutover), so authorizations are confirmed immediately; the sweep remains the backstop.

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

There is one Stripe webhook handler, `/api/webhooks/stripe` (the legacy `/api/payments/webhook` was deleted 2026-09-22). It verifies the signature with `STRIPE_WEBHOOK_SECRET`, then claims the event id in `StripeEvent` before calling `handleWebhookEvent`: a redelivery is acknowledged without running again, and a failed run deletes the claim so Stripe's retry is processed. It is the only place a membership purchase takes effect; `POST /api/payments/membership` creates the PaymentIntent (and at most a `GUEST` user with a `PENDING` member row) and grants nothing. A purchase promotes `GUEST` to `MEMBER` and never changes any other role.

### Sessions and member data
- The `jwt` callback re-reads `role`, `isActive` and `accountStatus` on every request (`src/lib/session-revalidation.ts`), so demotion and deactivation take effect immediately. Setting `User.sessionsInvalidBefore` ends every session issued before it; password reset and an admin password change set it.
- Member endpoints return explicit selects from `src/lib/member-privacy.ts`. Non-admins get the directory view through `applyMemberPrivacy`, which honours `allowContact`/`showAddress`; registrations appear only as event summaries, never with buyer details, payment intents or ticket tokens.
- Write routes validate with Zod and write only listed fields. `User.role` accepts only `USER_ROLES` from `src/lib/api-auth.ts`. Audit rows record allowlisted fields, never hashes or tokens. Stripe and mail secrets live only in the server env, not in `Settings`.
- `POST /api/payments/events` is limited per client IP (`src/lib/rate-limit.ts`, in memory) and to three unpaid holds per buyer email per event, and uses a Stripe idempotency key so a double submit reuses the first PaymentIntent.

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

Project `basa-v3` in org `basa-0f` (slugs, not display names). No DSN is hard-coded: the browser reads `NEXT_PUBLIC_SENTRY_DSN`, the server and edge read `SENTRY_DSN` and fall back to the public one. The public DSN is inlined at build time from the compose build arg (interpolated from `.env.production`), the server DSN is read at runtime, and an empty value disables the SDK rather than breaking the build. `SENTRY_AUTH_TOKEN` in `.env.production` enables source-map upload (passed to the build as a BuildKit secret, blanked in the running container); leave it empty to build without uploading.

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
