/**
 * Staff "Add member" (POST /api/admin/create-member-with-payment), against a real
 * database. It used to email a plaintext password, record payments at old prices
 * and leave accounts that could never verify. Now it records an existing member
 * in the claim state the invitations page works from, and sends nothing.
 */
let mockSession: any = null
jest.mock('@/lib/auth', () => ({
  auth: async () => mockSession,
}))

const mockEmails = new Proxy({}, {
  get: (_t, name) => {
    if (name === '__esModule') return true
    return () => { throw new Error(`Add member must not send email (${String(name)})`) }
  },
})
jest.mock('@/lib/basa-emails', () => mockEmails)

import { TestUtils, withEmptyTestDatabase } from './helpers/test-utils'
import { POST as addMember } from '@/app/api/admin/create-member-with-payment/route'
import { isUnclaimedLegacyAccount } from '@/lib/account-claim'

const DAY = 24 * 60 * 60 * 1000

function post(body: unknown): any {
  return new Request('http://localhost/api/admin/create-member-with-payment', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const base = {
  firstName: 'Pat',
  lastName: 'Example',
  email: 'Pat.Example@Test.test',
  businessName: 'Example Co',
  phone: '210-555-0100',
  membershipTier: 'MARKET_MEMBER',
}

async function asAdmin(prisma: any) {
  const admin = await TestUtils.createTestUser(prisma, `admin-${Math.random()}@test.test`, 'ADMIN')
  mockSession = { user: { id: admin.id, role: 'ADMIN', email: admin.email } }
  return admin
}

describe('Admin add member', () => {
  it(
    'creates an ACTIVE member in claim state, with no password, no payment and no email',
    withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
      const admin = await asAdmin(prisma)

      const res = await addMember(post(base))
      expect(res.status).toBe(201)
      const body = await res.json()

      const user = await prisma.user.findUnique({ where: { id: body.member.userId }, include: { member: true } })
      expect(user.email).toBe('pat.example@test.test')
      expect(user.hashedPassword).toBeNull()
      expect(user.isActive).toBe(false)
      expect(user.accountStatus).toBe('INACTIVE')
      expect(user.role).toBe('MEMBER')
      expect(user.verificationToken).toBeNull()
      expect(isUnclaimedLegacyAccount(user)).toBe(true)

      expect(user.member.membershipTier).toBe('MARKET_MEMBER')
      expect(user.member.membershipStatus).toBe('ACTIVE')
      expect(user.member.businessPhone).toBe('210-555-0100')
      const days = (user.member.renewalDate.getTime() - Date.now()) / DAY
      expect(days).toBeGreaterThan(363)
      expect(days).toBeLessThan(367)

      expect(await prisma.payment.count()).toBe(0)

      const audit = await prisma.auditLog.findFirst({ where: { action: 'MEMBER_CREATED_BY_ADMIN' } })
      expect(audit.userId).toBe(admin.id)
      expect(audit.entityId).toBe(user.member.id)
    })
  )

  it(
    'records a COMPLETED payment only when one was received, at the amount given',
    withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
      await asAdmin(prisma)

      const res = await addMember(post({
        ...base,
        renewalDate: '2027-03-15',
        payment: { amountCents: 65000, method: 'CHECK', reference: '1042' },
      }))
      expect(res.status).toBe(201)
      const { member } = await res.json()

      const payments = await prisma.payment.findMany({ where: { userId: member.userId } })
      expect(payments).toHaveLength(1)
      expect(payments[0]).toMatchObject({ amount: 65000, status: 'COMPLETED', paymentMethod: 'CHECK' })
      expect(payments[0].stripePaymentIntentId).toBeNull()

      const m = await prisma.member.findUnique({ where: { id: member.id } })
      expect(m.renewalDate.toISOString().slice(0, 10)).toBe('2027-03-15')
      expect(m.membershipPaymentConfirmed).toBe(true)
    })
  )

  it(
    'makes a non-active member a GUEST',
    withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
      await asAdmin(prisma)
      const res = await addMember(post({ ...base, membershipStatus: 'PENDING' }))
      const { member } = await res.json()
      expect(member.role).toBe('GUEST')
    })
  )

  it(
    'rejects a duplicate email whatever its case, and writes nothing',
    withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
      await asAdmin(prisma)
      await prisma.user.create({ data: { email: 'pat.example@test.test', role: 'GUEST' } })

      const res = await addMember(post(base))
      expect(res.status).toBe(409)
      expect((await res.json()).error).toMatch(/already exists/)
      expect(await prisma.member.count()).toBe(0)
    })
  )

  it(
    'requires a tier from the 2026 levels',
    withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
      await asAdmin(prisma)
      const res = await addMember(post({ ...base, membershipTier: 'meeting-member' }))
      expect(res.status).toBe(400)
      expect(await prisma.user.count({ where: { email: 'pat.example@test.test' } })).toBe(0)
    })
  )

  it(
    'is admin-only',
    withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
      const user = await TestUtils.createTestUser(prisma, 'member@test.test', 'MEMBER')
      mockSession = { user: { id: user.id, role: 'MEMBER' } }
      expect((await addMember(post(base))).status).toBe(403)
    })
  )
})
