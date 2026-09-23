/**
 * Stage 3 of the 2026-09-22 security audit, against a real database:
 *
 *  - H-A3: a session token is re-checked against the account on every request, so
 *    demotion, deactivation and a password reset take effect immediately instead
 *    of when the 30-day JWT expires.
 *  - M-A1: the Stripe webhook claims each event id before handling it, so a
 *    redelivery is acknowledged without running the handler twice, and a failed
 *    run releases the claim so Stripe's retry is processed.
 *  - H-A2: starting a membership checkout grants nothing; only the webhook does.
 */
let testPrisma: any = null

jest.mock('@/lib/db', () => ({
  get prisma() {
    return testPrisma
  },
  get db() {
    return testPrisma
  },
}))

const mockHandle = jest.fn()
jest.mock('@/lib/stripe-webhook-handlers', () => ({
  handleWebhookEvent: (...a: unknown[]) => mockHandle(...a),
}))

const mockCreateIntent = jest.fn()
jest.mock('@/lib/stripe', () => ({
  stripe: {
    // The signature check is Stripe's code; what is under test is what happens after it.
    webhooks: {
      constructEvent: (body: string) => JSON.parse(body),
    },
    customers: {
      list: async () => ({ data: [{ id: 'cus_test' }] }),
    },
    paymentIntents: {
      create: (...a: unknown[]) => mockCreateIntent(...a),
    },
  },
  MEMBERSHIP_PRICES: { 'meeting-member': 14900, 'trio-member': 29500 },
}))

let mockSession: any = null
jest.mock('@/lib/auth', () => ({
  auth: async () => mockSession,
}))

import { withEmptyTestDatabase } from './helpers/test-utils'
import { revalidateToken } from '@/lib/session-revalidation'
import { POST as stripeWebhook } from '@/app/api/webhooks/stripe/route'

async function makeUser(prisma: any, overrides: Record<string, unknown> = {}) {
  return prisma.user.create({
    data: {
      email: `u-${Date.now()}-${Math.random()}@test.test`,
      role: 'ADMIN',
      isActive: true,
      accountStatus: 'ACTIVE',
      ...overrides,
    },
  })
}

const nowSeconds = () => Math.floor(Date.now() / 1000)

describe('session re-validation (H-A3)', () => {
  it(
    'refreshes role and status from the database',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      const user = await makeUser(testPrisma)
      await testPrisma.user.update({ where: { id: user.id }, data: { role: 'MEMBER' } })

      const token = await revalidateToken({ id: user.id, role: 'ADMIN', iat: nowSeconds() } as any)
      expect(token?.role).toBe('MEMBER')
    })
  )

  it(
    'ends the session of a deactivated, suspended or deleted account',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      const inactive = await makeUser(testPrisma, { isActive: false })
      const suspended = await makeUser(testPrisma, { accountStatus: 'SUSPENDED' })

      expect(await revalidateToken({ id: inactive.id, iat: nowSeconds() } as any)).toBeNull()
      expect(await revalidateToken({ id: suspended.id, iat: nowSeconds() } as any)).toBeNull()
      expect(await revalidateToken({ id: 'no-such-user', iat: nowSeconds() } as any)).toBeNull()
      expect(await revalidateToken({ iat: nowSeconds() } as any)).toBeNull()
    })
  )

  it(
    'refuses tokens issued before sessionsInvalidBefore, and accepts later ones',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      const cutoff = new Date()
      const user = await makeUser(testPrisma, { sessionsInvalidBefore: cutoff })
      const cutoffSeconds = Math.floor(cutoff.getTime() / 1000)

      expect(await revalidateToken({ id: user.id, iat: cutoffSeconds - 60 } as any)).toBeNull()
      expect(await revalidateToken({ id: user.id, iat: cutoffSeconds } as any)).not.toBeNull()
    })
  )
})

describe('Stripe webhook idempotency (M-A1)', () => {
  const deliver = (id: string) =>
    stripeWebhook(
      new Request('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'stripe-signature': 't=1,v1=test' },
        body: JSON.stringify({ id, type: 'payment_intent.succeeded', data: { object: {} } }),
      }) as any
    )

  beforeEach(() => mockHandle.mockReset())

  it(
    'handles an event once and acknowledges the redelivery',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma

      const first = await deliver('evt_once')
      const second = await deliver('evt_once')

      expect(first.status).toBe(200)
      expect(second.status).toBe(200)
      expect(await second.json()).toEqual({ received: true, duplicate: true })
      expect(mockHandle).toHaveBeenCalledTimes(1)
      expect(await testPrisma.stripeEvent.count({ where: { id: 'evt_once' } })).toBe(1)
    })
  )

  it(
    'releases the claim when handling fails, so the retry runs',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      mockHandle.mockRejectedValueOnce(new Error('boom'))

      const failed = await deliver('evt_retry')
      expect(failed.status).toBe(500)
      expect(await testPrisma.stripeEvent.count({ where: { id: 'evt_retry' } })).toBe(0)

      const retried = await deliver('evt_retry')
      expect(retried.status).toBe(200)
      expect(mockHandle).toHaveBeenCalledTimes(2)
    })
  )
})

describe('membership checkout grants nothing (H-A2)', () => {
  const checkout = (body: unknown) => {
    // The sales flag is read when the module loads.
    process.env.MEMBERSHIP_SALES_ENABLED = 'true'
    let POST: any
    jest.isolateModules(() => {
      POST = require('@/app/api/payments/membership/route').POST
    })
    return POST(
      new Request('http://localhost/api/payments/membership', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
    )
  }

  const order = (email: string) => ({
    cart: [{ tierId: 'trio-member', quantity: 1 }],
    customerInfo: { name: 'Ana Diaz', email },
  })

  beforeEach(() => {
    mockCreateIntent.mockReset()
    mockCreateIntent.mockResolvedValue({ id: 'pi_test', client_secret: 'pi_test_secret' })
    mockSession = null
  })

  afterAll(() => {
    delete process.env.MEMBERSHIP_SALES_ENABLED
  })

  it(
    'leaves a signed-in buyer exactly as they were until the webhook fires',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      const user = await makeUser(testPrisma, { role: 'GUEST' })
      mockSession = { user: { id: user.id, role: 'GUEST' } }

      const res = await checkout(order(user.email))
      expect(res.status).toBe(200)

      const after = await testPrisma.user.findUnique({ where: { id: user.id }, include: { member: true } })
      expect(after.role).toBe('GUEST')
      expect(after.member).toBeNull()
      expect(await testPrisma.membershipInvitation.count()).toBe(0)
      // The price is the server's, whatever the cart said.
      expect(mockCreateIntent.mock.calls[0][0].amount).toBe(29500)
    })
  )

  it(
    'creates a guest buyer as PENDING, and never renames an existing account',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma

      await checkout(order('new-buyer@test.test'))
      const created = await testPrisma.user.findUnique({ where: { email: 'new-buyer@test.test' }, include: { member: true } })
      expect(created.role).toBe('GUEST')
      expect(created.member.membershipStatus).toBe('PENDING')
      expect(mockCreateIntent.mock.calls[0][0].metadata.isNewUser).toBe('true')

      const admin = await makeUser(testPrisma, { firstName: 'Real', lastName: 'Admin' })
      await checkout(order(admin.email))
      expect(mockCreateIntent.mock.calls[1][0].metadata.isNewUser).toBe('false')
    })
  )

  it(
    'rejects unknown tiers and unexpected fields',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      const unknownTier = await checkout({ ...order('x@test.test'), cart: [{ tierId: 'toString', quantity: 1 }] })
      expect(unknownTier.status).toBe(400)
      const extra = await checkout({ ...order('x@test.test'), role: 'ADMIN' })
      expect(extra.status).toBe(400)
      expect(mockCreateIntent).not.toHaveBeenCalled()
    })
  )
})
