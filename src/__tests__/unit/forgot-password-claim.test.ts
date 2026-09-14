/**
 * @jest-environment node
 *
 * Which email a member gets when they cannot get in (#104).
 *
 * A member imported from WordPress has no password, so "reset your password" is the
 * wrong thing to send them - that was the dishonest answer this issue was filed
 * about. The owner's decision was claim-on-renewal: nobody is mailed because of the
 * migration, so this route, where someone asks of their own accord, is the entry
 * point.
 */
const mockFindUnique = jest.fn()
const mockUpdate = jest.fn()
const mockAuditCreate = jest.fn()
const mockSendReset = jest.fn()
const mockSendClaim = jest.fn()

jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
    auditLog: { create: (...args: unknown[]) => mockAuditCreate(...args) },
  },
}))

jest.mock('@/lib/basa-emails', () => ({
  sendPasswordResetEmail: (...args: unknown[]) => mockSendReset(...args),
  sendAccountClaimEmail: (...args: unknown[]) => mockSendClaim(...args),
}))

import { POST } from '@/app/api/auth/forgot-password/route'

const EMAIL = 'lapsed@example.com'

function post(email: string): Request {
  return new Request('http://localhost/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email }),
  })
}

const legacy = { id: 'u1', firstName: 'Dana', hashedPassword: null, accountStatus: 'INACTIVE' }
const normal = { id: 'u2', firstName: 'Sam', hashedPassword: '$2a$10$h', accountStatus: 'ACTIVE' }

beforeEach(() => {
  jest.clearAllMocks()
  mockUpdate.mockResolvedValue({})
  mockAuditCreate.mockResolvedValue({})
  mockSendReset.mockResolvedValue({ success: true })
  mockSendClaim.mockResolvedValue({ success: true })
  process.env.NEXTAUTH_URL = 'https://app.example.com'
})

describe('POST /api/auth/forgot-password', () => {
  it('sends a claim email, not a reset email, to an imported member', async () => {
    mockFindUnique.mockResolvedValue(legacy)
    await POST(post(EMAIL) as never)

    expect(mockSendClaim).toHaveBeenCalledTimes(1)
    expect(mockSendReset).not.toHaveBeenCalled()
  })

  it('marks the claim link so the page says "set up", not "reset"', async () => {
    mockFindUnique.mockResolvedValue(legacy)
    await POST(post(EMAIL) as never)

    expect(mockSendClaim.mock.calls[0][2]).toContain('claim=1')
  })

  it('sends an ordinary reset email to an ordinary account', async () => {
    mockFindUnique.mockResolvedValue(normal)
    await POST(post(EMAIL) as never)

    expect(mockSendReset).toHaveBeenCalledTimes(1)
    expect(mockSendClaim).not.toHaveBeenCalled()
    expect(mockSendReset.mock.calls[0][2]).not.toContain('claim=1')
  })

  it('still issues a token for a claim, with the same mechanics as a reset', async () => {
    mockFindUnique.mockResolvedValue(legacy)
    await POST(post(EMAIL) as never)

    const data = mockUpdate.mock.calls[0][0].data
    expect(typeof data.resetToken).toBe('string')
    expect(data.resetToken.length).toBeGreaterThan(32)
    expect(data.resetTokenExpiry.getTime()).toBeGreaterThan(Date.now())
  })

  it('records a claim request distinctly from a reset request', async () => {
    mockFindUnique.mockResolvedValue(legacy)
    await POST(post(EMAIL) as never)

    expect(mockAuditCreate.mock.calls[0][0].data.action).toBe('ACCOUNT_CLAIM_REQUESTED')
  })

  it('gives the same answer for an unknown address, and emails nobody', async () => {
    // Whether an address has an account stays unknowable from the outside.
    mockFindUnique.mockResolvedValue(null)
    const res = await POST(post('nobody@example.com') as never)

    expect(res.status).toBe(200)
    expect(mockSendClaim).not.toHaveBeenCalled()
    expect(mockSendReset).not.toHaveBeenCalled()
  })

  it('does not reveal which of the two emails was sent', async () => {
    mockFindUnique.mockResolvedValue(legacy)
    const claimRes = await POST(post(EMAIL) as never)
    mockFindUnique.mockResolvedValue(normal)
    const resetRes = await POST(post(EMAIL) as never)
    mockFindUnique.mockResolvedValue(null)
    const unknownRes = await POST(post(EMAIL) as never)

    const bodies = await Promise.all([claimRes.json(), resetRes.json(), unknownRes.json()])
    expect(bodies[0]).toEqual(bodies[1])
    expect(bodies[1]).toEqual(bodies[2])
  })
})
