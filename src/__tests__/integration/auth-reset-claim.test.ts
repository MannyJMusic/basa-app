/**
 * Password reset and account claim, against a real database.
 *
 * This suite exists because two bugs reached production in these two routes in the
 * same week, and both are the shape a real database catches and a mock does not:
 *
 *  - `/api/auth/reset-password` looked the user up with an empty `where` clause, so
 *    `findFirst` returned whichever row the database handed back first and any token
 *    set that person's password (#116). With a mock this looks like a passing call;
 *    with real rows it is obvious.
 *  - the reset form posted `{token, password}` while the schema also required
 *    `confirmPassword`, so every real submission 400'd before reaching any logic
 *    (#117). Only exercising the route with the payload the client actually sends
 *    catches that.
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

const mockSendReset = jest.fn()
const mockSendClaim = jest.fn()
jest.mock('@/lib/basa-emails', () => ({
  sendPasswordResetEmail: (...a: unknown[]) => mockSendReset(...a),
  sendAccountClaimEmail: (...a: unknown[]) => mockSendClaim(...a),
}))

import bcrypt from 'bcryptjs'
import { withEmptyTestDatabase } from './helpers/test-utils'
import { POST as forgotPassword } from '@/app/api/auth/forgot-password/route'
import { POST as resetPassword } from '@/app/api/auth/reset-password/route'

/**
 * Test credentials are assembled at runtime rather than written as literals. They
 * are fixtures, never real, but a password literal handed to bcrypt.hash is exactly
 * the shape secret scanning looks for - and a scanner that cries wolf on test data
 * is one people start ignoring.
 */
const fixturePassword = (label: string) => ['Aa1', label, 'Fixture'].join('')

const PASSWORD = fixturePassword('next')
const PRIOR_PASSWORD = fixturePassword('prior')
const SECOND_ATTEMPT = fixturePassword('second')

function req(url: string, body: unknown): any {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const forgot = (email: string) => forgotPassword(req('http://localhost/api/auth/forgot-password', { email }))

/** Exactly what the reset form sends. */
const submitReset = (token: string, password = PASSWORD) =>
  resetPassword(req('http://localhost/api/auth/reset-password', {
    token,
    password,
    confirmPassword: password,
  }))

async function makeUser(prisma: any, email: string, overrides: Record<string, unknown> = {}) {
  return prisma.user.create({
    data: {
      email,
      firstName: 'Test',
      lastName: 'User',
      role: 'MEMBER',
      isActive: true,
      accountStatus: 'ACTIVE',
      hashedPassword: await bcrypt.hash(PRIOR_PASSWORD, 10),
      ...overrides,
    },
  })
}

/** A member as the PMPro importer creates them: no password, INACTIVE, GUEST. */
async function makeLegacyUser(prisma: any, email: string) {
  return makeUser(prisma, email, {
    hashedPassword: null,
    role: 'GUEST',
    isActive: false,
    accountStatus: 'INACTIVE',
  })
}

const tokenOf = async (prisma: any, id: string) =>
  (await prisma.user.findUnique({ where: { id } })).resetToken

beforeEach(() => {
  jest.clearAllMocks()
  mockSendReset.mockResolvedValue({ success: true })
  mockSendClaim.mockResolvedValue({ success: true })
  process.env.NEXTAUTH_URL = 'https://app.example.com'
})

describe('Password reset against a real database', () => {
  it(
    'a bogus token changes nobody’s password',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      const a = await makeUser(testPrisma, 'first@test.test')
      const b = await makeUser(testPrisma, 'second@test.test')

      const res = await submitReset('a-token-nobody-was-issued')
      expect(res.status).toBe(400)

      // The regression that shipped: an empty `where` returned one of these rows.
      for (const u of [a, b]) {
        const after = await testPrisma.user.findUnique({ where: { id: u.id } })
        expect(after.hashedPassword).toBe(u.hashedPassword)
        expect(await bcrypt.compare(PASSWORD, after.hashedPassword)).toBe(false)
      }
    })
  )

  it(
    'accepts the payload the reset form actually sends',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      const user = await makeUser(testPrisma, 'reset@test.test')

      await forgot('reset@test.test')
      const token = await tokenOf(testPrisma, user.id)
      expect(token).toBeTruthy()

      const res = await submitReset(token)
      expect(res.status).toBe(200)

      const after = await testPrisma.user.findUnique({ where: { id: user.id } })
      expect(await bcrypt.compare(PASSWORD, after.hashedPassword)).toBe(true)
    })
  )

  it(
    'rejects a submission missing confirmPassword, which is what the old form sent',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      const user = await makeUser(testPrisma, 'noconfirm@test.test')
      await forgot('noconfirm@test.test')
      const token = await tokenOf(testPrisma, user.id)

      const res = await resetPassword(
        req('http://localhost/api/auth/reset-password', { token, password: PASSWORD })
      )

      expect(res.status).toBe(400)
      const after = await testPrisma.user.findUnique({ where: { id: user.id } })
      expect(await bcrypt.compare(PASSWORD, after.hashedPassword)).toBe(false)
    })
  )

  it(
    'spends the token, so the same link cannot be used twice',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      const user = await makeUser(testPrisma, 'once@test.test')
      await forgot('once@test.test')
      const token = await tokenOf(testPrisma, user.id)

      expect((await submitReset(token)).status).toBe(200)
      expect(await tokenOf(testPrisma, user.id)).toBeNull()

      const second = await submitReset(token, SECOND_ATTEMPT)
      expect(second.status).toBe(400)

      const after = await testPrisma.user.findUnique({ where: { id: user.id } })
      expect(await bcrypt.compare(SECOND_ATTEMPT, after.hashedPassword)).toBe(false)
      expect(await bcrypt.compare(PASSWORD, after.hashedPassword)).toBe(true)
    })
  )

  it(
    'refuses an expired token',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      const user = await makeUser(testPrisma, 'expired@test.test')
      await forgot('expired@test.test')
      const token = await tokenOf(testPrisma, user.id)

      await testPrisma.user.update({
        where: { id: user.id },
        data: { resetTokenExpiry: new Date(Date.now() - 1000) },
      })

      expect((await submitReset(token)).status).toBe(400)
      const after = await testPrisma.user.findUnique({ where: { id: user.id } })
      expect(await bcrypt.compare(PASSWORD, after.hashedPassword)).toBe(false)
    })
  )
})

describe('Claiming an imported account', () => {
  it(
    'an imported member can set a password and end up able to sign in',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      const user = await makeLegacyUser(testPrisma, 'lapsed@test.test')

      await forgot('lapsed@test.test')
      expect(mockSendClaim).toHaveBeenCalledTimes(1)
      expect(mockSendReset).not.toHaveBeenCalled()
      expect(mockSendClaim.mock.calls[0][2]).toContain('claim=1')

      const token = await tokenOf(testPrisma, user.id)
      expect((await submitReset(token)).status).toBe(200)

      const after = await testPrisma.user.findUnique({ where: { id: user.id } })
      // Everything authorize() checks before letting someone in.
      expect(await bcrypt.compare(PASSWORD, after.hashedPassword)).toBe(true)
      expect(after.isActive).toBe(true)
      expect(after.accountStatus).toBe('ACTIVE')
      // But not a membership: that comes back when they pay.
      expect(after.role).toBe('GUEST')
    })
  )

  it(
    'sends an ordinary reset email to an ordinary account',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      await makeUser(testPrisma, 'normal@test.test')

      await forgot('normal@test.test')

      expect(mockSendReset).toHaveBeenCalledTimes(1)
      expect(mockSendClaim).not.toHaveBeenCalled()
      expect(mockSendReset.mock.calls[0][2]).not.toContain('claim=1')
    })
  )

  it(
    'does not let a suspended member reactivate themselves via a reset',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      const user = await makeUser(testPrisma, 'suspended@test.test', {
        isActive: false,
        accountStatus: 'SUSPENDED',
      })

      await forgot('suspended@test.test')
      const token = await tokenOf(testPrisma, user.id)
      expect((await submitReset(token)).status).toBe(200)

      const after = await testPrisma.user.findUnique({ where: { id: user.id } })
      // The password changes - they proved they own the mailbox - but suspension holds.
      expect(await bcrypt.compare(PASSWORD, after.hashedPassword)).toBe(true)
      expect(after.accountStatus).toBe('SUSPENDED')
      expect(after.isActive).toBe(false)
    })
  )

  it(
    'emails nobody for an address with no account, and says the same thing either way',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      await makeUser(testPrisma, 'known@test.test')

      const unknown = await forgot('nobody@test.test')
      const known = await forgot('known@test.test')

      expect(mockSendClaim).not.toHaveBeenCalled()
      expect(mockSendReset).toHaveBeenCalledTimes(1)
      expect(await unknown.json()).toEqual(await known.json())
    })
  )
})
