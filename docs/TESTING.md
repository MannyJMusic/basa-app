# Testing

## Overview

Two layers:

- **Unit tests** — fast, no external dependencies, Node.js environment.
- **Integration tests** — real PostgreSQL via [Testcontainers](https://node.testcontainers.org/), so they need Docker running locally.

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

pnpm test:all      # == pnpm test:integration
pnpm test          # == pnpm test:integration
```

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
