# BASA Platform Plan: bring basa-app live, retire WordPress and the AI crew

Status: written 2026-09-05 from a measured audit of the workspace, not from the repo's own docs (which overstate readiness). Phases 0 to 3 are largely done; see the progress note below before reading the phases as a to-do list.

## 0. Where this stands (2026-09-10)

| Phase | State |
|---|---|
| 0. Safe and reproducible | **Done.** Dev routes gated, API auth audited, logging cleaned, single lockfile, Node 22, branch policy. |
| 1. Strip scaffolding | **Done** except #73, a final sweep for what the deletion list missed. |
| 2. Deployable build live | **Done, then redone.** `app.businessassociationsa.com` went live 2026-09-06, the host was compromised and rebuilt (#76), and both sites have been served from the rebuilt box since 2026-09-08. Deploys pass end to end. |
| 3. Membership and events parity | **Substantially done.** Chapters and launch tiers, expiry lifecycle, venues and organizers, per-event ticket tiers, guest checkout, both importers, event series, iCal feed, renewal reminders. Open: the owner decisions listed below. |
| 4. Modernize the stack | **Not started**, except the VPS work that #76 forced early. |
| 5. Retire BASA-AI-CREW | **Not started**, and now a security item: port 8080 on that host is open to the internet (#36). |
| 6. Cut over and retire WordPress | **Not started.** |

Three things gate further progress and none of them are code:

1. **Where imported event images live.** All 163 can be downloaded, but `Event.image` still points at WordPress. It stops resolving the moment Phase 6 turns that site off.
2. **The five nominally-active members.** Four are BASA staff accounts. They import as `EXPIRED` with no tier; placing anyone on a launch tier is a per-member decision (#51).
3. **The AI-CREW VPS.** Still blocked on explicit IP confirmation and an inventory of what else runs on that host (#36).

Two things are worth knowing before touching this work:

- **The importers have not been run against production.** They are verified against a local database loaded from the nightly dump. #101 and #102 must land first — they are the two bugs real content exposes.
- **Imported members cannot sign in.** No password, `INACTIVE`, no claim flow (#104).

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
| Community (groups, activity feed, messages, notifications) | PeepSo groups (e.g. South2West, South2East), activity, messaging | `/networking` page only | **Decided: dropped entirely** (section 4). No replacement, in-app or external. |
| News / blog | 2,418 posts, almost all auto-aggregated "San Antonio News" (Feedzy RSS); 3 podcasts, 1 BASA News | `BlogPost` model, `/blog` pages | **Decided: no carryover** (section 4). Whole news feature gets rescoped later; no importer. |
| Perks / member listings | WPAdverts `/perks`, `/adverts` | `Resource` model, `/dashboard/resources` | **Decided: not migrated** (section 4). |
| Shop | WooCommerce `/shop`, `/cart` | none | **Decided: dropped** (section 4). Memberships and tickets are the only things sold. |
| Badges | BadgeOS | none | **Decided: dropped** (section 4). |
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
- Write `scripts/migrate/` importers against the WP REST API (`wp/v2/mec-events`, `mec_location`, `mec_organizer`, `pmpro/v1/membership_levels`, PMPro members via DB export). Each importer: dry-run, idempotent upsert by WP ID, reconciliation report. **Events and members only** — per section 4 there is no news, perks, shop, or badge import.
- Drop the community surface (`/networking` placeholder) per section 4.

### Phase 4. Modernize the stack

- Dependency upgrade in order: Prisma 5 → 7 (schema/migration changes), Next 15 → 16 + React 19, Tailwind 3 → 4 (config becomes CSS-first), Sentry 9 → 10, Stripe SDK 14 → 22 (API version bump, check webhook event types), `@hookform/resolvers` 3 → 5, Mailgun 12 → 14. next-auth: move to a stable Auth.js release or evaluate alternatives; re-enable LinkedIn if wanted.
- Tests that mean something: Playwright end-to-end for sign-up → join → pay → event register; integration tests for webhook handling and membership expiry; delete the empty Cypress setup.
- Apply the Sentry conventions in `CLAUDE.md` (spans on payment and registration flows, `captureException` in catch blocks).
- Replace remaining `any` in `lib/` and API routes with Zod-derived types.
- Hosting, per section 4: back up the Hostinger VPS in full and verify a restore, then reprovision it and replace the inline-SSH deploy with build-in-CI, push to a registry, pull a tagged image on the host, health check, rollback on failure. Sequence the reprovision against Phase 6 deliberately — doing it after WordPress retires avoids restoring WordPress onto a fresh box just to delete it.

### Phase 5. Retire BASA-AI-CREW

- Owner provides the VPS IP. Note per section 4: **other services run on that host**, so the shutdown is service-scoped, not box-scoped, and the host itself gets reprovisioned later. Snapshot `/opt/basa-ai-crew` (`.env`, `*.db`, logs) to a private archive, then `systemctl disable --now basa-orchestrator basa-dashboard`, close port 8080, and remove the Azure AD app / WordPress application password it used.
- Deactivate and delete the `basa-mec-api` plugin on WordPress if installed.
- Archive the `BASA-AI-CREW` repo (or delete the local copy; upstream is `coleam00/your-claude-engineer`).
- Build the replacement (decided, section 4): an admin "create event from flyer" upload in basa-app that uses Claude to extract fields into a pre-filled form for human confirmation. No email polling, no Azure AD app, no MEC REST plugin.

### Phase 6. Cut over and retire WordPress

- Freeze WP content edits; run final importers.
- Redirect map: every URL in the 43 public pages plus `/events/*` and `/news/*` patterns → basa-app equivalents (301s in CloudPanel nginx).
- Point `businessassociationsa.com` at basa-app; keep WP reachable on an internal hostname for 60 days, then take a final All-in-One WP Migration export and shut it down.
- Cancel PMPro / PeepSo / Elementor / MEC licences.

## 4. Owner decisions (answered 2026-09-08, issue #35)

1. **Community features: drop entirely.** No PeepSo-style groups, activity feed, or messaging in basa-app, and no external community tool either. basa-app is membership + events only. This is the largest scope reduction in the plan.
2. **Chapters: confirmed.** SS, CC, SO, SS W are chapters. First pass assumes **one primary chapter per member**; multi-chapter membership is deferred. Real display names for the four prefixes are still needed.
3. **News: no carryover.** The 2,418-post RSS aggregate does not come over, and neither does BASA-authored news for now — the whole news/blog feature gets rescoped later. No news importer in Phase 3.
4. **Shop / badges / perks: memberships and event tickets only.** No WooCommerce shop, no BadgeOS badges, no WPAdverts perks to migrate.
5. **Flyer-to-event tool: build it.** An admin uploads a flyer, Claude pre-fills the event form, a human confirms. Replaces the AI crew's mailbox polling.
6. **Hosting: stay on Hostinger.** Not moving to Vercel. Back up the current VPS, reprovision it, and replace the fragile inline-SSH deploy with a build-and-pull pipeline.
7. **Harness scope: remove all of it,** not just the Phase 1 deletion list. Needs a sweep for what Phase 1 missed.
8. **AI-CREW VPS: other services run on that host** besides the orchestrator, and the box will eventually be reprovisioned too. Shutdown must not disrupt the rest. Still blocked on explicit IP confirmation and an inventory of what else is on it.

## 5. Tracking

Work is tracked as GitHub Issues on `MannyJMusic/basa-app`, one milestone per phase. Filed 2026-09-05:

| # | Milestone | Issue |
|---|---|---|
| 25 | Phase 0 | Gate or delete dev/debug routes; remove DevControlPanel from production pages |
| 26 | Phase 0 | Add `auth()` to `api/payments/receipt`; audit all API routes for session and role checks |
| 27 | Phase 0 | Remove `console.log` from auth, middleware, webhook paths; adopt Sentry logger |
| 28 | Phase 0 | Single lockfile, Node 22 everywhere, full type-checked build in Docker |
| 29 | Phase 0 | Branch policy and PR-only `main` |
| 30 | Phase 1 | Delete template scaffolding |
| 31 | Phase 1 | Collapse `scripts/` |
| 32 | Phase 1 | Prune `docs/` |
| 33 | Phase 1 | Consolidate the five email modules |
| 34 | Phase 2 | Serve the app subdomain over HTTPS from CloudPanel |
| 35 | — | Owner decisions that gate Phases 3 to 6 — **answered and closed 2026-09-08**, see section 4 |
| 36 | Phase 5 | Shut down the AI crew VPS (blocked on IP confirmation + host inventory) |

Filed 2026-09-08, once the decisions in section 4 were answered:

| # | Milestone | Issue |
|---|---|---|
| 51 | Phase 3 | Model chapters and the five real membership tiers |
| 52 | Phase 3 | Membership renewal and annual expiry lifecycle |
| 53 | Phase 3 | Add Venue and Organizer entities for events |
| 54 | Phase 3 | Per-event ticket tiers with Stripe prices |
| 55 | Phase 3 | Recurring events |
| 56 | Phase 3 | iCal export and public calendar feed |
| 57 | Phase 3 | Importer: MEC events, venues, organizers |
| 58 | Phase 3 | Importer: PMPro members, tiers, chapters, expiry dates |
| 59 | Phase 3 | Drop community features; remove the `/networking` placeholder |
| 60 | Phase 4 | Upgrade Prisma 5 → 7 |
| 61 | Phase 4 | Upgrade Next 15 → 16 and React 18 → 19 |
| 62 | Phase 4 | Upgrade Tailwind 3 → 4 |
| 63 | Phase 4 | Bump Sentry, Stripe, Mailgun, hookform/resolvers |
| 64 | Phase 4 | Move next-auth off the 5.0.0 beta to stable Auth.js |
| 65 | Phase 4 | Playwright end-to-end tests, plus webhook and expiry integration tests |
| 66 | Phase 4 | Sentry conventions and Zod-derived types in place of `any` |
| 67 | Phase 4 | Full backup of the Hostinger VPS before any reprovision |
| 68 | Phase 4 | Reprovision the VPS and rebuild the deploy pipeline |
| 69 | Phase 5 | Admin tool: create an event from an uploaded flyer |
| 70 | Phase 6 | Build the 301 redirect map from WordPress URLs |
| 71 | Phase 6 | Cut over `businessassociationsa.com` and retire WordPress |
| 72 | Phase 6 | Cancel PMPro, PeepSo, Elementor, MEC licences |
| 73 | Phase 1 | Audit and remove what is left of the old harness |

Filed 2026-09-09 and 2026-09-10, as the work turned them up:

| # | Milestone | Issue |
|---|---|---|
| 76 | — | Security incident: production VPS compromised (cryptominer) |
| 82 | Phase 3 | Renewal reminder emails before a membership lapses |
| 94 | — | Deploys drop ~10s of 502s while the app container is recreated |
| 101 | Phase 3 | The "Upcoming Events" page has no date filter, and leaks debug text |
| 102 | Phase 3 | Event descriptions render as escaped HTML |
| 104 | Phase 3 | Imported members have no way to claim their account |

What the importers found, which changed the plan rather than just implementing it:

- **MEC keeps venues and organizers as taxonomy terms**, not as the post types the `basa-mec-api` plugin exposes. Importing over REST as #57 originally proposed would have produced 12 nameless venues instead of 112 with addresses. The importers read a database dump instead, which also survives the plugin and the WordPress site going away.
- **There is no paying membership base to migrate.** 140 people, 296 expired memberships, and 14 active rows belonging to 5 users — four of them BASA staff accounts. What is being moved is a contact list with history.
- **MEC's recurrence rules are vestigial.** Eight of the fifteen "recurring" events carry an `until` date that predates their own start. Two more are internal reminders expanded into 600 dates each running to 2033. #55 keeps the rule engine and admin UI; the model half is done.
- **The WordPress site's timezone is `America/Mexico_City`**, which is wrong for San Antonio and drifts an hour from Central for half the year. Every date the importers write is converted from Central wall clock, not taken from MEC's own timestamps.

Suggested order within Phase 3: #51 → #52, then #53 → #54 → #55 → #56, then the importers (#57, #58) last since they depend on the models. #59 and #73 are small and can go any time. In Phase 4, #67 must close before #68 starts.
