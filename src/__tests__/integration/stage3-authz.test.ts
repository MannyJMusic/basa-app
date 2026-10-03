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
}))

const mockCreateCheckout = jest.fn()
jest.mock('@/lib/membership-billing', () => ({
  createMembershipCheckout: (...a: unknown[]) => mockCreateCheckout(...a),
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

  const order = (email: string, extra: Record<string, unknown> = {}) => ({
    tier: 'action',
    firstName: 'Ana',
    lastName: 'Diaz',
    email,
    businessName: 'Diaz Co',
    acceptTerms: true,
    ...extra,
  })

  beforeEach(() => {
    mockCreateCheckout.mockReset()
    mockCreateCheckout.mockResolvedValue('https://checkout.stripe.com/c/pay/cs_test_x')
    mockSession = null
  })

  afterAll(() => {
    delete process.env.MEMBERSHIP_SALES_ENABLED
  })

  it(
    'leaves a signed-in buyer exactly as they were, and charges the account they are signed in as',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      const user = await makeUser(testPrisma, { role: 'GUEST' })
      mockSession = { user: { id: user.id, role: 'GUEST' } }

      const res = await checkout(order('someone-else@test.test'))
      expect(res.status).toBe(200)
      expect((await res.json()).url).toContain('checkout.stripe.com')

      const after = await testPrisma.user.findUnique({ where: { id: user.id }, include: { member: true } })
      expect(after.role).toBe('GUEST')
      expect(after.member).toBeNull()
      const [applicant, userId] = mockCreateCheckout.mock.calls[0]
      expect(applicant.tier).toBe('ACTION_MEMBER')
      expect(applicant.email).toBe(user.email)
      expect(userId).toBe(user.id)
    })
  )

  it(
    'creates no account for a guest buyer before payment',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      const res = await checkout(order('new-buyer@test.test'))
      expect(res.status).toBe(200)
      expect(await testPrisma.user.count()).toBe(0)
      expect(mockCreateCheckout.mock.calls[0][1]).toBeNull()
    })
  )

  it(
    'refuses a second purchase while a subscription is running',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      const user = await makeUser(testPrisma, { role: 'MEMBER' })
      await testPrisma.member.create({ data: { userId: user.id, membershipStatus: 'ACTIVE', subscriptionId: 'sub_1', renewalDate: new Date(Date.now() + 300 * 86_400_000) } })
      mockSession = { user: { id: user.id, role: 'MEMBER' } }
      const res = await checkout(order(user.email))
      expect(res.status).toBe(409)
      expect(mockCreateCheckout).not.toHaveBeenCalled()
    })
  )

  it(
    'rejects unknown tiers, unexpected fields and unaccepted terms',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      expect((await checkout(order('x@test.test', { tier: 'toString' }))).status).toBe(400)
      expect((await checkout(order('x@test.test', { role: 'ADMIN' }))).status).toBe(400)
      expect((await checkout(order('x@test.test', { acceptTerms: false }))).status).toBe(400)
      expect(mockCreateCheckout).not.toHaveBeenCalled()
    })
  )
})
