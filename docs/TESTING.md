# Testing

## Overview

Two layers:

- **Unit tests** — fast, no external dependencies, Node.js environment.
- **Integration tests** — a real PostgreSQL. By default via [Testcontainers](https://node.testcontainers.org/), which needs Docker; set `TEST_DATABASE_URL` to use a PostgreSQL you already have instead (see below).

There is no end-to-end test suite. Cypress was removed (support files only, zero specs — see #30); Playwright end-to-end coverage is planned for Phase 4 of `.claude/PLAN.md`.

## Quick start

```bash
pnpm test:unit                                                          # all unit tests
pnpm test:unit -- src/__tests__/unit/utils.test.ts                      # one file
pnpm test:unit -- -t "generateRandomData"                               # filter by test name
pnpm test:watch                                                         # unit tests, watch mode
pnpm test:coverage                                                      # unit tests, with coverage

pnpm test:integration                                                   # all integration tests (needs Docker)
pnpm test:integration -- src/__tests__/integration/api-events.test.ts   # one file
DEBUG=testcontainers:* pnpm test:integration                            # container debug logs

# Without Docker — against a PostgreSQL you already have:
createdb basa_test
TEST_DATABASE_URL=postgresql://$USER@localhost:5432/basa_test pnpm test:integration

pnpm test:all      # == pnpm test:integration
pnpm test          # == pnpm test:integration
```

## Running without Docker

Testcontainers needs Docker, and there is no Docker on every machine this project
gets worked on — which made the whole integration tier unrunnable rather than merely
slow. Set `TEST_DATABASE_URL` and the tests use that server directly, starting no
container:

```bash
createdb basa_test
TEST_DATABASE_URL=postgresql://$USER@localhost:5432/basa_test pnpm test:integration
```

Migrations are applied to it on startup, exactly as they are to a container.

**The database name must contain `test`, and the run aborts if it does not.** These
tests `TRUNCATE` every table they find. The local `basa_dev` on a developer machine
here holds member data imported from production, so pointing this at the wrong
database would be unrecoverable. The check is crude, and it is the difference between
wiping a scratch database and wiping a real one.

Leave `TEST_DATABASE_URL` unset and nothing changes: a container is started as before,
which is what CI does.

## Test structure

```
src/__tests__/
├── unit/                    # jest.config.js
├── integration/             # jest.config.testcontainers.js
│   ├── helpers/
│   │   ├── testcontainers-setup.ts
│   │   ├── test-utils.ts
│   │   ├── global-setup.ts
│   │   └── global-teardown.ts
│   ├── database.test.ts
│   └── api-events.test.ts
```

Integration tests run serially (`maxWorkers: 1`, to avoid Prisma client conflicts) with a 2-minute timeout; a hang usually means the container never started.

## Writing tests

```typescript
// unit
describe('Utility Functions', () => {
  it('should generate unique data', () => {
    const data1 = TestUtils.generateRandomData()
    const data2 = TestUtils.generateRandomData()
    expect(data1.email).not.toBe(data2.email)
  })
})

// integration
import { withEmptyTestDatabase, TestUtils } from '../helpers/test-utils'

describe('Database Integration Tests', () => {
  it('should create and retrieve users',
    withEmptyTestDatabase(async ({ database }) => {
      const { prisma } = database
      const user = await TestUtils.createTestUser(prisma, 'test@example.com', 'MEMBER')
      expect(user.email).toBe('test@example.com')
    })
  )
})
```

`TestUtils` (in `helpers/test-utils.ts`) has `createTestUser`, `createTestMember`, `createTestEvent`, `createTestResource`, and `generateRandomData`. `withTestDatabase` seeds data first; `withEmptyTestDatabase` starts from a clean database.

## CI

`.github/workflows/deploy.yml`'s **Build and Test** job runs `type-check`, `lint`, and `next build` on every push to `main`/`master` and every PR into `dev` or `main`. **It does not run `test:unit` or `test:integration`** — neither is currently wired into CI. Run both locally before opening a PR.

## Troubleshooting

- **Container won't start**: confirm Docker Desktop (or your Docker daemon) is running; check disk space.
- **Database connection errors in integration tests**: run `pnpm db:generate` to refresh the Prisma client, and confirm no other process is holding port 5432.
- **Flaky failures**: look for state shared between tests — integration tests should use `withEmptyTestDatabase` when order-independence matters.

## End-to-end: the money path (Playwright)

`e2e/` holds browser tests for the two flows that take money (#65): a guest buying an event ticket and a visitor joining as a member, plus a declined card that must confirm nothing. They run a real Next server against a real Postgres of their own, pay through Stripe **test mode** in the real PaymentElement, and then deliver the webhook Stripe would send, signed with the app's webhook secret, so the seat or membership is confirmed the way it is in production.

```bash
createdb basa_e2e                 # once; the run resets it every time
pnpm test:e2e                     # headless, dev server on :3100
pnpm test:e2e:ui                  # Playwright UI
pnpm exec playwright test e2e/event-registration.spec.ts   # one spec
```

What it needs from `.env` / `.env.local`: `DATABASE_URL` (its database name is swapped for `basa_e2e`, or set `E2E_DATABASE_URL`), and Stripe **test** keys: `sk_test_`/`rk_test_`, `pk_test_`, and the `whsec_` the app is configured with. `e2e/global-setup.ts` refuses live keys and refuses a database whose name lacks `e2e` or `test`.

In CI the `End-to-end (money path)` job builds the app, starts `next start`, and runs the same specs against a Postgres service container; the deploy waits for it. The Stripe test keys come from the `STRIPE_TEST_*` repository secrets. On failure the Playwright report and traces are uploaded as an artifact.

Two things learned building it:

- Node 22+ can expose an experimental `localStorage` global on the server whose methods are undefined, so `typeof localStorage !== 'undefined'` checks run during SSR and the page 500s. The test server runs with `--no-experimental-webstorage`; production runs in Docker without it.
- The ticket form passed dollars to `StripeForm`, which takes cents, so the button read "Pay $0.45" for a $45 ticket while Stripe charged $45. The first run of the spec found it.
