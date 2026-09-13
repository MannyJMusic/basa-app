/**
 * @jest-environment node
 *
 * The reset-password route is public - `middleware.ts` returns early for every
 * `/api/*` path and its matcher excludes `api` - so the token in the request body
 * is the only thing protecting an account.
 *
 * It once was not checked at all: the `where` clause was commented out, leaving
 * `findFirst({ where: {} })`, which returns an arbitrary user. Any caller could set
 * a stranger's password by posting any token. These tests exist so that cannot come
 * back quietly.
 */
const mockFindFirst = jest.fn()
const mockUpdateMany = jest.fn()
const mockAuditCreate = jest.fn()

jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      updateMany: (...args: unknown[]) => mockUpdateMany(...args),
    },
    auditLog: { create: (...args: unknown[]) => mockAuditCreate(...args) },
  },
}))

jest.mock('@/lib/utils', () => ({
  ...jest.requireActual('@/lib/utils'),
  hashPassword: jest.fn(async (p: string) => `hashed:${p}`),
}))

import { POST } from '@/app/api/auth/reset-password/route'

const VALID = 'a'.repeat(64)
const PASSWORD = 'Passw0rdGood'

function post(body: unknown): Request {
  return new Request('http://localhost/api/auth/reset-password', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const payload = (token: string) => ({ token, password: PASSWORD, confirmPassword: PASSWORD })

beforeEach(() => {
  jest.clearAllMocks()
  mockUpdateMany.mockResolvedValue({ count: 1 })
  mockAuditCreate.mockResolvedValue({})
})

describe('POST /api/auth/reset-password', () => {
  it('looks the user up BY TOKEN, not by nothing at all', async () => {
    // The regression that mattered: an empty `where` matches the first row in the
    // table, so any token rewrote some real user's password.
    mockFindFirst.mockResolvedValue({ id: 'u1', hashedPassword: 'x', accountStatus: 'ACTIVE' })
    await POST(post(payload(VALID)) as never)

    const where = mockFindFirst.mock.calls[0][0].where
    expect(where.resetToken).toBe(VALID)
    expect(Object.keys(where).length).toBeGreaterThan(0)
  })

  it('requires the token to still be in date', async () => {
    mockFindFirst.mockResolvedValue({ id: 'u1', hashedPassword: 'x', accountStatus: 'ACTIVE' })
    await POST(post(payload(VALID)) as never)

    expect(mockFindFirst.mock.calls[0][0].where.resetTokenExpiry).toEqual({ gt: expect.any(Date) })
  })

  it('changes nobody’s password when the token matches no user', async () => {
    mockFindFirst.mockResolvedValue(null)
    const res = await POST(post(payload('not-a-real-token')) as never)

    expect(res.status).toBe(400)
    expect(mockUpdateMany).not.toHaveBeenCalled()
  })

  it('spends the token on success, so the link cannot be replayed', async () => {
    mockFindFirst.mockResolvedValue({ id: 'u1', hashedPassword: 'x', accountStatus: 'ACTIVE' })
    const res = await POST(post(payload(VALID)) as never)

    expect(res.status).toBe(200)
    const call = mockUpdateMany.mock.calls[0][0]
    expect(call.data.hashedPassword).toBe(`hashed:${PASSWORD}`)
    expect(call.data.resetToken).toBeNull()
    expect(call.data.resetTokenExpiry).toBeNull()
  })

  it('scopes the update by token as well as id, so a raced link wins only once', async () => {
    mockFindFirst.mockResolvedValue({ id: 'u1', hashedPassword: 'x', accountStatus: 'ACTIVE' })
    await POST(post(payload(VALID)) as never)

    expect(mockUpdateMany.mock.calls[0][0].where).toEqual({ id: 'u1', resetToken: VALID })
  })

  it('reports failure when the row was already spent by a racing request', async () => {
    mockFindFirst.mockResolvedValue({ id: 'u1', hashedPassword: 'x', accountStatus: 'ACTIVE' })
    mockUpdateMany.mockResolvedValue({ count: 0 })

    const res = await POST(post(payload(VALID)) as never)
    expect(res.status).toBe(400)
    expect(mockAuditCreate).not.toHaveBeenCalled()
  })

  it('rejects a request with no token before touching the database', async () => {
    const res = await POST(post({ password: PASSWORD, confirmPassword: PASSWORD }) as never)

    expect(res.status).toBe(400)
    expect(mockFindFirst).not.toHaveBeenCalled()
    expect(mockUpdateMany).not.toHaveBeenCalled()
  })
})

describe('claiming an imported account (#104)', () => {
  const legacy = { id: 'u1', hashedPassword: null, accountStatus: 'INACTIVE' }

  it('activates an imported account when its password is first set', async () => {
    // Setting a password is not enough: authorize() also rejects on !isActive, so
    // without this the member sets a password and is still silently refused.
    mockFindFirst.mockResolvedValue(legacy)
    const res = await POST(post(payload(VALID)) as never)

    expect(res.status).toBe(200)
    const data = mockUpdateMany.mock.calls[0][0].data
    expect(data.isActive).toBe(true)
    expect(data.accountStatus).toBe('ACTIVE')
  })

  it('does not hand back a membership: role is untouched', async () => {
    mockFindFirst.mockResolvedValue(legacy)
    await POST(post(payload(VALID)) as never)

    expect(mockUpdateMany.mock.calls[0][0].data).not.toHaveProperty('role')
  })

  it('records it as a claim, not a password reset', async () => {
    mockFindFirst.mockResolvedValue(legacy)
    await POST(post(payload(VALID)) as never)

    expect(mockAuditCreate.mock.calls[0][0].data.action).toBe('ACCOUNT_CLAIMED')
  })

  it('leaves an ordinary reset alone - no activation, normal audit entry', async () => {
    mockFindFirst.mockResolvedValue({ id: 'u1', hashedPassword: '$2a$10$h', accountStatus: 'ACTIVE' })
    await POST(post(payload(VALID)) as never)

    const data = mockUpdateMany.mock.calls[0][0].data
    expect(data).not.toHaveProperty('isActive')
    expect(data).not.toHaveProperty('accountStatus')
    expect(mockAuditCreate.mock.calls[0][0].data.action).toBe('PASSWORD_RESET_COMPLETED')
  })

  it('will not reactivate a suspended account through a password reset', async () => {
    // A suspended member must not be able to undo suspension by asking for a reset.
    mockFindFirst.mockResolvedValue({ id: 'u1', hashedPassword: '$2a$10$h', accountStatus: 'SUSPENDED' })
    await POST(post(payload(VALID)) as never)

    const data = mockUpdateMany.mock.calls[0][0].data
    expect(data).not.toHaveProperty('isActive')
    expect(data).not.toHaveProperty('accountStatus')
  })
})
