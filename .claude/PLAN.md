# BASA Platform Plan: bring basa-app live, retire WordPress and the AI crew

Status: draft for review. Written 2026-09-05 from a measured audit of the workspace, not from the repo's own docs (which overstate readiness). Next step after sign-off: turn Phase 0 and Phase 1 into scoped issues.

## 1. Where things stand

### The three systems

| System | Role | Verified state (2026-09-05) |
|---|---|---|
| WordPress at `businessassociationsa.com` (`BASA-WP/`) | Live production site. MEC events, PMPro memberships, PeepSo community, WooCommerce, WPAdverts perks, 2.4k news posts. | Live, nginx on `31.97.214.26`, REST API open. |
| `basa-app/` (Next.js 15) | Intended replacement for the WP site. | **Not live.** `app.businessassociationsa.com` resolves to the same IP as WP, but TLS handshake fails with "unrecognized name": no CloudPanel vhost or certificate serves it. Last GitHub Actions deploy succeeded 2025-12-19 on `main`; whatever it deployed is not reachable. |
| `BASA-AI-CREW/` (Python, Claude Agent SDK) | Email-to-MEC-event automation. Read Jen's emails, pull the flyer, create WP event + tickets. | Never worked reliably. Still running as a systemd service on a VPS (docs say `31.220.18.48`, owner to confirm). **To be retired, not fixed.** |

`basa-app-backup/` is a stale copy of `basa-app` on an older `dev`. Reference only; delete once the plan is underway.

### basa-app health check

What passes:

- `pnpm type-check`, `pnpm lint`, `pnpm test:unit` all green.
- No secrets tracked in git (only `.env*.example` files). Working tree clean, 521 tracked files.
- Solid skeleton: Next 15 App Router, Prisma schema with 19 models, NextAuth v5 (Google + credentials), Stripe checkout and webhook, Mailgun with Nunjucks templates, shadcn/ui, Sentry wired.

What does not:

| Area | Finding | Why it matters |
|---|---|---|
| **Security** | 17 routes under `src/app/api/dev/**` and 7 pages under `src/app/dev/**` have no `auth()` call and no `NODE_ENV` gate. They include database table listing, record read/write, and full **database export**. Middleware skips every `/api/*` path, so nothing else protects them. `api/payments/receipt` is also unauthenticated. | Anyone who finds the URL can dump the member database on a production deploy. Must be fixed before the app goes live. |
| **Dev code in prod paths** | `DevControlPanel` is imported into `membership/join/page.tsx` and `payment/success/page.tsx`. `/tech-demo` is in the middleware public-route list. | Debug UI ships to members. |
| **Duplication** | Five email modules in `src/lib` totalling 3,556 lines: `basa-emails.ts` (2,205, used by 7 files), `email.ts` (used by 3), `email-fallback.ts` (1), `basa-email.ts` and `basa-email-simple.ts` (unused). | Three parallel implementations of the same thing; bugs get fixed in one. |
| **Noise** | 234 `console.log` calls in `src/`, 207 `any` types, 2 `TODO`s. | Logs leak session and env details (see `middleware.ts`, `auth.ts`, webhook route). |
| **Test coverage** | 3 test files total (2 unit, 2 integration). Cypress has support files but zero specs. | The green checks prove almost nothing about behaviour. |
| **Tooling drift** | Both `package-lock.json` and `pnpm-lock.yaml` committed. Dockerfile and CI pin Node 18 (EOL April 2025). `pnpm build` runs `build:no-check` in Docker, skipping type-check and lint. | Non-reproducible installs; unsupported runtime. |
| **Dependency age** | Next 15.3 → 16.3, React 18 → 19, Tailwind 3 → 4, Prisma 5.9 → 7.10, Sentry 9 → 10, Stripe SDK 14 → 22, Mailgun 12 → 14, `@hookform/resolvers` 3 → 5. `next-auth` is still `5.0.0-beta.29`. | Roughly 15 months of drift; several majors, and next-auth on a beta. |
| **Scaffolding sprawl** | ~40 files in `scripts/` (most are one-off deploy "fix" scripts), 24 docs in `docs/`, a `wiki/` synced by script, `docs/techstack.ts` describing a Vercel/Resend stack the app doesn't use, `aws-commands.md`, `test-deployment.md`, `create-admin-user.js`, `check-admin-users.js`, `components/examples/tech-stack-demo.tsx`. | This is the "harness" residue the owner wants gone. Nothing named after Cole Medin's PRP / context-engineering templates exists any more, so the cleanup is about this scaffolding, not about a specific framework. |
| **Branches** | `main` and `dev` diverged by one commit each; CI deploys only `main`. Remote also has `local` and `ui-ux`. | Unclear which branch is the truth. |

### Feature parity: WordPress vs basa-app

| Capability | WordPress today | basa-app today | Gap |
|---|---|---|---|
| Events calendar + registration + tickets | MEC, 100+ published events, actively used (latest event 2026-08-31) | `Event`, `EventRegistration`, `EventSpeaker`, `EventSponsor` models; public list/calendar/detail/register pages; admin CRUD | Import of existing events, venues, organizers; recurring events; ticket tiers per event; iCal feed. **Core migration blocker.** |
| Memberships + payments | PMPro: 20 annual levels = 5 tiers (Meeting $95, Associate $245, Market $495, Mission $745, Action $995) × 4 chapter prefixes (SS, CC, SO, SS W). Stripe via WooCommerce. | `MembershipTier` enum (BASIC/PREMIUM/VIP + MEETING_MEMBER, ASSOCIATE_MEMBER, TRIO_MEMBER, CLASS_RESOURCE_MEMBER, NAG_RESOURCE_MEMBER), three Stripe price IDs (Essential/Professional/Corporate) in env | Tier model does not match reality. Need chapter concept, the 5 real tiers, renewal handling, and a member import from PMPro with expiry dates. |
| Member directory / profiles | PeepSo profiles + `/members` | Dashboard directory + profile pages | Close. Import needed. |
| Community (groups, activity feed, messages, notifications) | PeepSo groups (e.g. South2West, South2East), activity, messaging | `/networking` page only | **Decision needed:** replicate, replace with an external tool (Slack/Discord/Circle), or drop. |
| News / blog | 2,418 posts, almost all auto-aggregated "San Antonio News" (Feedzy RSS); 3 podcasts, 1 BASA News | `BlogPost` model, `/blog` pages | Decide whether the RSS aggregate is worth keeping; import only real BASA content otherwise. |
| Perks / member listings | WPAdverts `/perks`, `/adverts` | `Resource` model, `/dashboard/resources` | Probably map perks → resources; confirm. |
| Shop | WooCommerce `/shop`, `/cart` | none | Confirm whether anything sells besides memberships. Likely drop. |
| Badges | BadgeOS | none | Likely drop. |
| Leads / contact / newsletter | WPForms, Jetpack | `Lead` model, `/api/contact`, `/api/newsletter` | Close. |
| SEO / redirects | AIOSEO, 43 public pages, established URLs | none | Need a redirect map from old URLs to new ones at cutover. |

## 2. Guiding decisions

1. **basa-app is the product.** Everything else is a source to migrate from or a system to switch off.
2. **Security before features.** The app does not go live with open debug routes.
3. **Delete before upgrading.** Removing scaffolding, duplicate modules, and dead scripts first makes every later change smaller and the dependency upgrade safer.
4. **Match real membership data.** Model memberships on the PMPro levels that exist, not on the placeholder enum.
5. **Migrate, don't recreate.** Events, members, and genuine content come over by script from the WP REST API / DB export, with a dry-run and a reconciliation report.
6. **One branch of truth, one deploy path.** `main` deploys; `dev` is integration; delete the rest.

## 3. Phases

Phases 0 and 1 are sequential and should be done first. Phases 2 to 4 can overlap. Phases 5 and 6 depend on 3 and 4.

### Phase 0. Make it safe and reproducible (small, do first)

- Gate or delete every `src/app/dev/**` page and `src/app/api/dev/**` route. Recommended: delete the database inspector and export routes outright; keep only email preview behind `NODE_ENV !== 'production'` **and** admin `auth()`.
- Remove `DevControlPanel` imports from production pages; delete `api/debug-auth`, `api/auth/test-oauth`, `api/test-mailgun`, `/tech-demo` public route.
- Add `auth()` to `api/payments/receipt`; audit all 59 routes for role checks (admin routes must check `role === 'ADMIN'`, not just a session).
- Strip `console.log` from `middleware.ts`, `auth.ts`, and webhook routes; route the rest through Sentry `logger` or delete.
- Remove `package-lock.json`; pnpm only. Add `"engines": { "node": ">=22" }`, bump Dockerfile and CI to Node 22.
- Make Docker build run `pnpm build` (with type-check + lint), not `build:no-check`.
- Reconcile `main` and `dev`; delete `local` and `ui-ux` if abandoned.

### Phase 1. Strip the old scaffolding

- Delete `wiki/`, `scripts/sync-wiki.sh`, `docs/techstack.ts`, `components/examples/`, `aws-commands.md`, `test-deployment.md`, root `create-admin-user.js` / `check-admin-users.js` (fold admin creation into `prisma/seed.ts` or a single `scripts/admin.ts`).
- Collapse `scripts/` to what is still used: `dev-with-webhooks.sh`, one deploy script, one server-setup script, `setup-dev.js`. Delete the 20+ "fix-*" and "quick-*" scripts.
- Prune `docs/` to what is true and current (deployment architecture, Stripe setup, email system, testing). Delete the rest or fold into `CLAUDE.md`.
- Consolidate email: keep `basa-emails.ts` as the API surface, merge what `email.ts` and `email-fallback.ts` still provide, delete `basa-email.ts` and `basa-email-simple.ts`. Target one module under ~800 lines plus templates.
- Confirm with the owner whether anything else counts as "the harness" (e.g. `docs/DEVELOPER_CONTROL_PANEL.md`, `BASA_DESIGN_SYSTEM.md`) before deleting.

### Phase 2. Get a deployable build live on a staging URL

- On CloudPanel, create the `app.businessassociationsa.com` (or `staging.`) site with a Let's Encrypt cert reverse-proxied to the container. This is the missing piece behind the TLS failure.
- Fix the CI deploy: pnpm frozen install, migrations via `prisma migrate deploy` (not `db push`), health check on `/api/health` after `up -d`, rollback on failure.
- Move Postgres backups to a cron on the host; verify a restore once.
- Confirm Sentry receives an event from the deployed build.

### Phase 3. Membership and events parity

- Remodel memberships: `Chapter` (SS, CC, SO, SS W: get real names from the owner), `MembershipTier` = Meeting / Associate / Market / Mission / Action with prices, annual expiry, renewal. Replace the three Stripe price IDs with one product per tier (chapter as metadata) or per tier×chapter if pricing differs.
- Event model gaps: recurring events, per-event ticket tiers with Stripe prices, venue and organizer entities, iCal export, public calendar feed.
- Write `scripts/migrate/` importers against the WP REST API (`wp/v2/mec-events`, `mec_location`, `mec_organizer`, `pmpro/v1/membership_levels`, PMPro members via DB export, `wp/v2/posts` filtered to BASA-authored content, `wpadverts` → resources). Each importer: dry-run, idempotent upsert by WP ID, reconciliation report.
- Decide and implement the community answer (see Decisions).

### Phase 4. Modernize the stack

- Dependency upgrade in order: Prisma 5 → 7 (schema/migration changes), Next 15 → 16 + React 19, Tailwind 3 → 4 (config becomes CSS-first), Sentry 9 → 10, Stripe SDK 14 → 22 (API version bump, check webhook event types), `@hookform/resolvers` 3 → 5, Mailgun 12 → 14. next-auth: move to a stable Auth.js release or evaluate alternatives; re-enable LinkedIn if wanted.
- Tests that mean something: Playwright end-to-end for sign-up → join → pay → event register; integration tests for webhook handling and membership expiry; delete the empty Cypress setup.
- Apply the Sentry conventions in `CLAUDE.md` (spans on payment and registration flows, `captureException` in catch blocks).
- Replace remaining `any` in `lib/` and API routes with Zod-derived types.

### Phase 5. Retire BASA-AI-CREW

- Owner provides the VPS IP. Snapshot `/opt/basa-ai-crew` (`.env`, `*.db`, logs) to a private archive, then `systemctl disable --now basa-orchestrator basa-dashboard`, close port 8080, and remove the Azure AD app / WordPress application password it used.
- Deactivate and delete the `basa-mec-api` plugin on WordPress if installed.
- Archive the `BASA-AI-CREW` repo (or delete the local copy; upstream is `coleam00/your-claude-engineer`).
- Decide whether the original need (Jen emails an event flyer → an event appears) becomes a basa-app feature. Recommended: an admin "create event from flyer" upload in basa-app that uses Claude to extract fields into a pre-filled form for human confirmation. Small, contained, and it removes the need for any email polling.

### Phase 6. Cut over and retire WordPress

- Freeze WP content edits; run final importers.
- Redirect map: every URL in the 43 public pages plus `/events/*` and `/news/*` patterns → basa-app equivalents (301s in CloudPanel nginx).
- Point `businessassociationsa.com` at basa-app; keep WP reachable on an internal hostname for 60 days, then take a final All-in-One WP Migration export and shut it down.
- Cancel PMPro / PeepSo / Elementor / MEC licences.

## 4. Decisions needed from the owner

1. **Community features.** Keep PeepSo-style groups/activity/messaging in basa-app (large build), move members to an external community tool, or drop? This is the biggest scope lever in the plan.
2. **Chapters.** What are SS, CC, SO, SS W? Are prices identical across them (they appear to be)? Do members belong to exactly one chapter?
3. **News aggregate.** Is the 2,418-post RSS news feed worth carrying over, or does the new site only publish BASA-authored news and podcasts?
4. **Shop / badges / perks.** Anything sold besides memberships and event tickets? Are badges used? Are perks (WPAdverts) still active?
5. **Email-to-event replacement.** Is the "flyer → event" admin tool (Phase 5) wanted, or do events get entered by hand?
6. **Hosting.** Stay on the Hostinger CloudPanel VPS with Docker, or move basa-app to Vercel + managed Postgres? The current deploy pipeline is fragile; Vercel would remove most of Phase 2 but changes cost and data residency.
7. **Harness scope.** Confirm the Phase 1 deletion list, and name anything else that counts as "the old harness".
8. **AI-CREW VPS IP** and confirmation that nothing else runs on that host.

## 5. Proposed first issues (Phase 0 and 1)

Each is sized to one PR.

1. Gate/delete dev and debug routes; add `auth()` to `api/payments/receipt`; remove `DevControlPanel` from production pages.
2. Audit all API routes for session + role checks; add a shared `requireAdmin()` helper.
3. Remove `console.log` from auth, middleware, and webhook paths; adopt Sentry logger.
4. Single lockfile, Node 22 in `engines`, Dockerfile, and CI; Docker build runs full `pnpm build`.
5. Reconcile `main`/`dev`; delete stale branches; document branch policy in `CLAUDE.md`.
6. Delete scaffolding: `wiki/`, `components/examples`, `docs/techstack.ts`, root one-off scripts, stale markdown.
7. Collapse `scripts/` to the four kept scripts.
8. Prune `docs/` to current, true documents.
9. Consolidate the five email modules into one.
10. CloudPanel vhost + cert for the app subdomain; confirm `/api/health` responds over HTTPS.

Phase 3 to 6 issues get scoped after the decisions in section 4.
