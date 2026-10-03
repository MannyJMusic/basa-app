/**
 * Online membership billing (2026 relaunch): what the Stripe webhook does with a
 * completed Checkout, a renewal invoice and subscription changes. Stripe and email
 * are mocked; the database is real.
 */
let testPrisma: any = null
jest.mock('@/lib/db', () => ({
  get prisma() { return testPrisma },
  get db() { return testPrisma },
}))

const PERIOD_END = Math.floor(new Date('2027-10-02T12:00:00Z').getTime() / 1000)
const mockRetrieveSubscription = jest.fn()
jest.mock('@/lib/stripe', () => ({
  getStripe: () => ({ subscriptions: { retrieve: (...a: unknown[]) => mockRetrieveSubscription(...a) } }),
}))

const mockWelcome = jest.fn()
jest.mock('@/lib/basa-emails', () => ({
  INVITATION_LINK_DAYS: 7,
  sendMembershipWelcomeEmail: (...a: unknown[]) => mockWelcome(...a),
}))

import { withEmptyTestDatabase } from './helpers/test-utils'
import { activateMembershipFromCheckout, handleMembershipInvoicePaid, syncMembershipSubscription } from '@/lib/membership-billing'

function checkoutSession(overrides: Record<string, unknown> = {}, metadata: Record<string, string> = {}): any {
  return {
    id: `cs_test_${Math.random().toString(36).slice(2)}`,
    mode: 'subscription',
    status: 'complete',
    payment_status: 'paid',
    subscription: 'sub_test_1',
    customer: 'cus_test_1',
    amount_total: 95000,
    currency: 'usd',
    payment_intent: null,
    customer_details: { email: 'buyer@test.test' },
    metadata: {
      type: 'membership',
      tier: 'ACTION_MEMBER',
      email: 'buyer@test.test',
      firstName: 'Ana',
      lastName: 'Diaz',
      businessName: 'Diaz Co',
      phone: '2105550100',
      website: 'https://diaz.example',
      showInDirectory: 'true',
      showAddress: 'false',
      ...metadata,
    },
    ...overrides,
  }
}

beforeEach(() => {
  mockWelcome.mockReset()
  mockWelcome.mockResolvedValue(undefined)
  mockRetrieveSubscription.mockReset()
  mockRetrieveSubscription.mockResolvedValue({ id: 'sub_test_1', status: 'active', cancel_at_period_end: false, current_period_end: PERIOD_END })
})

describe('activateMembershipFromCheckout', () => {
  it('creates a member account in claim state and sends a set-password link', withEmptyTestDatabase(async ({ database }: any) => {
    testPrisma = database.prisma
    await activateMembershipFromCheckout(checkoutSession())

    const user = await testPrisma.user.findUnique({ where: { email: 'buyer@test.test' }, include: { member: true } })
    expect(user.role).toBe('MEMBER')
    expect(user.hashedPassword).toBeNull()
    expect(user.accountStatus).toBe('INACTIVE')
    expect(user.resetToken).toBeTruthy()
    expect(user.member).toMatchObject({
      membershipStatus: 'ACTIVE',
      membershipTier: 'ACTION_MEMBER',
      subscriptionId: 'sub_test_1',
      stripeCustomerId: 'cus_test_1',
      businessName: 'Diaz Co',
      showInDirectory: true,
      showAddress: false,
    })
    expect(user.member.renewalDate.toISOString()).toBe('2027-10-02T12:00:00.000Z')
    expect(await testPrisma.payment.count({ where: { userId: user.id, status: 'COMPLETED', amount: 95000 } })).toBe(1)

    const [, , details] = mockWelcome.mock.calls[0]
    expect(details.tierLabel).toBe('Action Member')
    expect(details.setupUrl).toContain('/auth/reset-password?token=')
  }))

  it('is idempotent: a replayed event records one payment', withEmptyTestDatabase(async ({ database }: any) => {
    testPrisma = database.prisma
    const session = checkoutSession()
    await activateMembershipFromCheckout(session)
    await activateMembershipFromCheckout(session)
    expect(await testPrisma.user.count()).toBe(1)
    expect(await testPrisma.payment.count()).toBe(1)
  }))

  it("never overwrites a returning member's profile, never demotes an admin, and sends no setup link to a set-up account", withEmptyTestDatabase(async ({ database }: any) => {
    testPrisma = database.prisma
    const admin = await testPrisma.user.create({
      data: { email: 'Buyer@Test.test', role: 'ADMIN', hashedPassword: 'x', accountStatus: 'ACTIVE', isActive: true,
        member: { create: { membershipStatus: 'EXPIRED', businessName: 'Edited Name', website: 'https://kept.example' } } },
    })
    await activateMembershipFromCheckout(checkoutSession())
    const after = await testPrisma.user.findUnique({ where: { id: admin.id }, include: { member: true } })
    expect(after.role).toBe('ADMIN')
    expect(after.member.businessName).toBe('Edited Name')
    expect(after.member.website).toBe('https://kept.example')
    expect(after.member.businessPhone).toBe('2105550100')
    expect(after.member.membershipStatus).toBe('ACTIVE')
    expect(mockWelcome.mock.calls[0][2].setupUrl).toBeNull()
  }))

  it('ignores unpaid sessions and non-membership checkouts', withEmptyTestDatabase(async ({ database }: any) => {
    testPrisma = database.prisma
    await activateMembershipFromCheckout(checkoutSession({ payment_status: 'unpaid' }))
    await activateMembershipFromCheckout(checkoutSession({}, { type: 'something-else' }))
    expect(await testPrisma.user.count()).toBe(0)
    expect(mockWelcome).not.toHaveBeenCalled()
  }))
})

describe('renewals and cancellation', () => {
  async function activeMember(prisma: any) {
    return prisma.user.create({
      data: { email: 'm@test.test', role: 'MEMBER',
        member: { create: { membershipStatus: 'ACTIVE', membershipTier: 'MEETING_MEMBER', subscriptionId: 'sub_test_1', renewalDate: new Date('2027-10-02T12:00:00Z') } } },
      include: { member: true },
    })
  }

  it('a renewal invoice moves the renewal date and records the payment once', withEmptyTestDatabase(async ({ database }: any) => {
    testPrisma = database.prisma
    const user = await activeMember(testPrisma)
    const next = Math.floor(new Date('2028-10-02T12:00:00Z').getTime() / 1000)
    const invoice: any = { id: 'in_1', subscription: 'sub_test_1', billing_reason: 'subscription_cycle', amount_paid: 35000, currency: 'usd', customer: 'cus_1', lines: { data: [{ period: { end: next } }] } }
    await handleMembershipInvoicePaid(invoice)
    await handleMembershipInvoicePaid(invoice)
    const m = await testPrisma.member.findUnique({ where: { userId: user.id } })
    expect(m.renewalDate.toISOString()).toBe('2028-10-02T12:00:00.000Z')
    expect(await testPrisma.payment.count({ where: { userId: user.id } })).toBe(1)
  }))

  it('the first invoice is left to checkout', withEmptyTestDatabase(async ({ database }: any) => {
    testPrisma = database.prisma
    const user = await activeMember(testPrisma)
    await handleMembershipInvoicePaid({ id: 'in_0', subscription: 'sub_test_1', billing_reason: 'subscription_create', amount_paid: 35000, currency: 'usd', lines: { data: [] } } as any)
    expect(await testPrisma.payment.count({ where: { userId: user.id } })).toBe(0)
  }))

  it('cancelling keeps the membership to the end of the paid year; the end expires it', withEmptyTestDatabase(async ({ database }: any) => {
    testPrisma = database.prisma
    const user = await activeMember(testPrisma)
    await syncMembershipSubscription({ id: 'sub_test_1', status: 'active', cancel_at_period_end: true, current_period_end: PERIOD_END } as any)
    let m = await testPrisma.member.findUnique({ where: { userId: user.id } })
    expect(m).toMatchObject({ membershipStatus: 'ACTIVE', cancelAtPeriodEnd: true })

    await syncMembershipSubscription({ id: 'sub_test_1', status: 'canceled', cancel_at_period_end: false, current_period_end: PERIOD_END } as any, true)
    m = await testPrisma.member.findUnique({ where: { userId: user.id } })
    expect(m).toMatchObject({ membershipStatus: 'EXPIRED', cancelAtPeriodEnd: false })
  }))

  it('a card being retried (past_due) does not end the membership', withEmptyTestDatabase(async ({ database }: any) => {
    testPrisma = database.prisma
    const user = await activeMember(testPrisma)
    await syncMembershipSubscription({ id: 'sub_test_1', status: 'past_due', cancel_at_period_end: false, current_period_end: PERIOD_END } as any)
    const m = await testPrisma.member.findUnique({ where: { userId: user.id } })
    expect(m.membershipStatus).toBe('ACTIVE')
  }))
})
