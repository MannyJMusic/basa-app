/**
 * @jest-environment node
 *
 * Sign-in and account-recovery rules ahead of the member invitations:
 * - the password rule allows any characters (only the lowercase/uppercase/digit/8
 *   requirements remain);
 * - a successful claim makes an invited GUEST with an ACTIVE membership a MEMBER;
 * - the credentials provider matches stored emails case-insensitively, and a
 *   password sign-in never writes an Account row;
 * - /api/auth/verify activates only accounts waiting for verification.
 */
const mockUserFindFirst = jest.fn()
const mockUserFindUnique = jest.fn()
const mockUserUpdate = jest.fn()
const mockUserUpdateMany = jest.fn()
const mockAccountCreate = jest.fn()
const mockAccountFindUnique = jest.fn()
const mockAuditCreate = jest.fn()

jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findFirst: (...a: unknown[]) => mockUserFindFirst(...a),
      findUnique: (...a: unknown[]) => mockUserFindUnique(...a),
      update: (...a: unknown[]) => mockUserUpdate(...a),
      updateMany: (...a: unknown[]) => mockUserUpdateMany(...a),
    },
    account: {
      create: (...a: unknown[]) => mockAccountCreate(...a),
      findUnique: (...a: unknown[]) => mockAccountFindUnique(...a),
    },
    auditLog: { create: (...a: unknown[]) => mockAuditCreate(...a) },
  },
}))

// NextAuth itself is not under test: keep the config object and its callbacks.
jest.mock('next-auth', () => ({
  __esModule: true,
  default: () => ({ handlers: {}, auth: jest.fn(), signIn: jest.fn(), signOut: jest.fn() }),
}))
jest.mock('next-auth/providers/google', () => ({ __esModule: true, default: (o: unknown) => ({ id: 'google', options: o }) }))
jest.mock('next-auth/providers/credentials', () => ({ __esModule: true, default: (o: any) => ({ id: 'credentials', ...o }) }))
jest.mock('@auth/prisma-adapter', () => ({ PrismaAdapter: () => ({}) }))
jest.mock('@/lib/session-revalidation', () => ({ revalidateToken: jest.fn() }))

import bcrypt from 'bcryptjs'
import { PASSWORD_PATTERN, passwordResetSchema } from '@/lib/validations'
import { claimActivation, CLAIM_ACTIVATION } from '@/lib/account-claim'
import { authConfig } from '@/lib/auth'
import { getRedirectUrl } from '@/lib/utils'
import { POST as verify } from '@/app/api/auth/verify/route'

const pw = (...parts: string[]) => parts.join('')

beforeEach(() => {
  jest.clearAllMocks()
  mockUserUpdate.mockResolvedValue({})
  mockUserUpdateMany.mockResolvedValue({ count: 1 })
  mockAuditCreate.mockResolvedValue({})
})

describe('password rule', () => {
  it.each([
    pw('Abcdefg', '1'),
    pw('Abc def', ' 1'),
    pw('Ab1', '#^~()[]{}'),
    pw('Ñandú', 'Pass9'),
  ])('accepts %p', p => {
    expect(PASSWORD_PATTERN.test(p)).toBe(true)
  })

  it.each([
    ['no uppercase', pw('abcdefg', '1')],
    ['no lowercase', pw('ABCDEFG', '1')],
    ['no digit', pw('Abcdefgh')],
    ['too short', pw('Ab1', 'x')],
  ])('rejects one with %s', (_label, p) => {
    expect(PASSWORD_PATTERN.test(p)).toBe(false)
  })

  it('reports the length rule before the character rule for a short password', () => {
    const r = passwordResetSchema.safeParse({ token: 't', password: 'Ab1', confirmPassword: 'Ab1' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.errors[0].message).toMatch(/8 characters/)
  })
})

describe('claimActivation', () => {
  it('promotes a GUEST whose membership is ACTIVE', () => {
    expect(claimActivation({ role: 'GUEST', member: { membershipStatus: 'ACTIVE' } }))
      .toEqual({ ...CLAIM_ACTIVATION, role: 'MEMBER' })
  })

  it.each(['PENDING', 'EXPIRED', 'INACTIVE'] as const)('leaves a GUEST with a %s membership a GUEST', status => {
    expect(claimActivation({ role: 'GUEST', member: { membershipStatus: status } })).not.toHaveProperty('role')
  })

  it('leaves a GUEST with no member row a GUEST', () => {
    expect(claimActivation({ role: 'GUEST', member: null })).not.toHaveProperty('role')
  })

  it.each(['ADMIN', 'MODERATOR', 'MEMBER'])('never changes a %s', role => {
    expect(claimActivation({ role, member: { membershipStatus: 'ACTIVE' } })).not.toHaveProperty('role')
  })
})

describe('credentials sign-in', () => {
  const credentials = authConfig.providers.find((p: any) => p.id === 'credentials') as any

  it('looks the email up case-insensitively, trimmed', async () => {
    mockUserFindFirst.mockResolvedValue(null)
    await credentials.authorize({ email: '  Mixed.Case@Example.COM ', password: 'x' })

    expect(mockUserFindFirst.mock.calls[0][0].where).toEqual({
      email: { equals: 'mixed.case@example.com', mode: 'insensitive' },
    })
  })

  it('signs in a mixed-case stored address typed in lower case', async () => {
    const password = pw('Fixture', 'Pass', '1')
    mockUserFindFirst.mockResolvedValue({
      id: 'u1',
      email: 'Mixed.Case@Example.com',
      hashedPassword: await bcrypt.hash(password, 4),
      isActive: true,
      accountStatus: 'ACTIVE',
      role: 'MEMBER',
    })
    const user = await credentials.authorize({ email: 'mixed.case@example.com', password })
    expect(user).toMatchObject({ id: 'u1' })
  })

  it('does not write an Account row for a password sign-in', async () => {
    const ok = await authConfig.callbacks!.signIn!({
      user: { id: 'u1', email: 'a@example.com' },
      account: { provider: 'credentials', type: 'credentials', providerAccountId: 'u1' },
    } as any)

    expect(ok).toBe(true)
    expect(mockAccountCreate).not.toHaveBeenCalled()
    expect(mockAccountFindUnique).not.toHaveBeenCalled()
    expect(mockUserUpdate.mock.calls[0][0].data).toHaveProperty('lastLogin')
  })

  it('matches a Google sign-in to a mixed-case stored address', async () => {
    mockUserFindFirst.mockResolvedValue(null)
    await authConfig.callbacks!.signIn!({
      user: { email: 'Someone@Example.com' },
      account: { provider: 'google', type: 'oidc', providerAccountId: 'g1' },
    } as any)

    expect(mockUserFindFirst.mock.calls[0][0].where).toEqual({
      email: { equals: 'someone@example.com', mode: 'insensitive' },
    })
  })
})

describe('role landing pages', () => {
  it('sends a MODERATOR to the dashboard, not the ADMIN-only /admin', () => {
    expect(getRedirectUrl('MODERATOR' as any)).toBe('/dashboard')
    expect(getRedirectUrl('ADMIN' as any)).toBe('/admin')
  })
})

describe('POST /api/auth/verify', () => {
  const TOKEN = 'v'.repeat(48)
  const req = () => new Request('http://localhost/api/auth/verify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token: TOKEN }),
  })
  const future = () => new Date(Date.now() + 60_000)

  it('activates an account waiting for verification', async () => {
    mockUserFindUnique.mockResolvedValue({ id: 'u1', accountStatus: 'PENDING_VERIFICATION', verificationTokenExpiry: future() })
    const res = await verify(req() as never)

    expect(res.status).toBe(200)
    const call = mockUserUpdateMany.mock.calls[0][0]
    expect(call.where).toEqual({ id: 'u1', verificationToken: TOKEN })
    expect(call.data.isActive).toBe(true)
    expect(call.data.accountStatus).toBe('ACTIVE')
    expect(call.data.verificationToken).toBeNull()
  })

  it.each(['INACTIVE', 'SUSPENDED', 'ACTIVE'])('does not activate a %s account with a valid token', async status => {
    mockUserFindUnique.mockResolvedValue({ id: 'u1', accountStatus: status, isActive: false, verificationTokenExpiry: future() })
    const res = await verify(req() as never)

    expect(res.status).toBe(200)
    const data = mockUserUpdateMany.mock.calls[0][0].data
    expect(data).not.toHaveProperty('isActive')
    expect(data).not.toHaveProperty('accountStatus')
    expect(data.emailVerified).toBeInstanceOf(Date)
    expect((await res.json()).activated).toBe(false)
  })

  it('refuses an expired token', async () => {
    mockUserFindUnique.mockResolvedValue({ id: 'u1', accountStatus: 'PENDING_VERIFICATION', verificationTokenExpiry: new Date(Date.now() - 1000) })
    const res = await verify(req() as never)

    expect(res.status).toBe(400)
    expect(mockUserUpdateMany).not.toHaveBeenCalled()
  })

  it('fails when a racing request already spent the token', async () => {
    mockUserFindUnique.mockResolvedValue({ id: 'u1', accountStatus: 'PENDING_VERIFICATION', verificationTokenExpiry: future() })
    mockUserUpdateMany.mockResolvedValue({ count: 0 })

    expect((await verify(req() as never)).status).toBe(400)
  })
})
