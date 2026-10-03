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
const mockFindFirst = jest.fn()
const mockUpdate = jest.fn()
const mockAuditCreate = jest.fn()
const mockSendReset = jest.fn()
const mockSendClaim = jest.fn()

jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
    auditLog: { create: (...args: unknown[]) => mockAuditCreate(...args) },
  },
}))

jest.mock('@/lib/basa-emails', () => ({
  sendPasswordResetEmail: (...args: unknown[]) => mockSendReset(...args),
  sendAccountClaimEmail: (...args: unknown[]) => mockSendClaim(...args),
}))

const mockHitRateLimit = jest.fn()
jest.mock('@/lib/rate-limit', () => ({
  hitRateLimit: (...args: unknown[]) => mockHitRateLimit(...args),
}))

const mockCaptureMessage = jest.fn()
const mockCaptureException = jest.fn()
jest.mock('@sentry/nextjs', () => ({
  captureMessage: (...args: unknown[]) => mockCaptureMessage(...args),
  captureException: (...args: unknown[]) => mockCaptureException(...args),
}))

import { POST } from '@/app/api/auth/forgot-password/route'

/** Let the un-awaited email delivery settle. */
const flush = () => new Promise(resolve => setTimeout(resolve, 0))

const EMAIL = 'lapsed@example.com'

function post(email: string): Request {
  return new Request('http://localhost/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email }),
  })
}

const legacy = { id: 'u1', email: EMAIL, resetToken: null, resetTokenExpiry: null, firstName: 'Dana', hashedPassword: null, accountStatus: 'INACTIVE' }
const normal = { id: 'u2', email: EMAIL, resetToken: null, resetTokenExpiry: null, firstName: 'Sam', hashedPassword: '$2a$10$h', accountStatus: 'ACTIVE' }

beforeEach(() => {
  jest.clearAllMocks()
  mockUpdate.mockResolvedValue({})
  mockAuditCreate.mockResolvedValue({})
  mockSendReset.mockResolvedValue({ success: true })
  mockSendClaim.mockResolvedValue({ success: true })
  mockHitRateLimit.mockReturnValue(false)
  process.env.NEXTAUTH_URL = 'https://app.example.com'
})

describe('POST /api/auth/forgot-password', () => {
  it('sends a claim email, not a reset email, to an imported member', async () => {
    mockFindFirst.mockResolvedValue(legacy)
    await POST(post(EMAIL) as never)

    expect(mockSendClaim).toHaveBeenCalledTimes(1)
    expect(mockSendReset).not.toHaveBeenCalled()
  })

  it('marks the claim link so the page says "set up", not "reset"', async () => {
    mockFindFirst.mockResolvedValue(legacy)
    await POST(post(EMAIL) as never)

    expect(mockSendClaim.mock.calls[0][2]).toContain('claim=1')
  })

  it('sends an ordinary reset email to an ordinary account', async () => {
    mockFindFirst.mockResolvedValue(normal)
    await POST(post(EMAIL) as never)

    expect(mockSendReset).toHaveBeenCalledTimes(1)
    expect(mockSendClaim).not.toHaveBeenCalled()
    expect(mockSendReset.mock.calls[0][2]).not.toContain('claim=1')
  })

  it('still issues a token for a claim, with the same mechanics as a reset', async () => {
    mockFindFirst.mockResolvedValue(legacy)
    await POST(post(EMAIL) as never)

    const data = mockUpdate.mock.calls[0][0].data
    expect(typeof data.resetToken).toBe('string')
    expect(data.resetToken.length).toBeGreaterThan(32)
    expect(data.resetTokenExpiry.getTime()).toBeGreaterThan(Date.now())
  })

  it('records a claim request distinctly from a reset request', async () => {
    mockFindFirst.mockResolvedValue(legacy)
    await POST(post(EMAIL) as never)

    expect(mockAuditCreate.mock.calls[0][0].data.action).toBe('ACCOUNT_CLAIM_REQUESTED')
  })

  it('gives the same answer for an unknown address, and emails nobody', async () => {
    // Whether an address has an account stays unknowable from the outside.
    mockFindFirst.mockResolvedValue(null)
    const res = await POST(post('nobody@example.com') as never)

    expect(res.status).toBe(200)
    expect(mockSendClaim).not.toHaveBeenCalled()
    expect(mockSendReset).not.toHaveBeenCalled()
  })

  it('does not reveal which of the two emails was sent', async () => {
    mockFindFirst.mockResolvedValue(legacy)
    const claimRes = await POST(post(EMAIL) as never)
    mockFindFirst.mockResolvedValue(normal)
    const resetRes = await POST(post(EMAIL) as never)
    mockFindFirst.mockResolvedValue(null)
    const unknownRes = await POST(post(EMAIL) as never)

    const bodies = await Promise.all([claimRes.json(), resetRes.json(), unknownRes.json()])
    expect(bodies[0]).toEqual(bodies[1])
    expect(bodies[1]).toEqual(bodies[2])
  })
})

describe('forgot-password: lookups, invitations, throttling, failures', () => {
  it('matches the address case-insensitively, after trimming', async () => {
    mockFindFirst.mockResolvedValue(null)
    await POST(post('  Lapsed@Example.COM ') as never)

    expect(mockFindFirst.mock.calls[0][0].where).toEqual({
      email: { equals: 'lapsed@example.com', mode: 'insensitive' },
    })
  })

  it('sends the link to the address stored on the account', async () => {
    mockFindFirst.mockResolvedValue({ ...normal, email: 'Sam.Mixed@Example.com' })
    await POST(post('sam.mixed@example.com') as never)

    expect(mockSendReset.mock.calls[0][0]).toBe('Sam.Mixed@Example.com')
  })

  it('keeps an unexpired invitation link instead of replacing it with a 1-hour one', async () => {
    const inviteToken = 'i'.repeat(64)
    const inviteExpiry = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
    mockFindFirst.mockResolvedValue({ ...legacy, resetToken: inviteToken, resetTokenExpiry: inviteExpiry })
    await POST(post(EMAIL) as never)

    expect(mockUpdate).not.toHaveBeenCalled()
    expect(mockSendClaim).toHaveBeenCalledTimes(1)
    expect(mockSendClaim.mock.calls[0][2]).toContain(`token=${inviteToken}`)
  })

  it('replaces a token that would expire sooner than a new one', async () => {
    const oldToken = 'o'.repeat(64)
    mockFindFirst.mockResolvedValue({ ...normal, resetToken: oldToken, resetTokenExpiry: new Date(Date.now() + 10 * 60 * 1000) })
    await POST(post(EMAIL) as never)

    const data = mockUpdate.mock.calls[0][0].data
    expect(data.resetToken).not.toBe(oldToken)
    expect(mockSendReset.mock.calls[0][2]).toContain(`token=${data.resetToken}`)
  })

  it('counts requests per address and, over the limit, sends nothing but answers the same', async () => {
    mockFindFirst.mockResolvedValue(normal)
    const ok = await POST(post(EMAIL) as never)
    expect(mockHitRateLimit).toHaveBeenCalledWith(`forgot-password:${EMAIL}`, 3, 60 * 60 * 1000)

    jest.clearAllMocks()
    mockHitRateLimit.mockReturnValue(true)
    const throttled = await POST(post(EMAIL) as never)

    expect(throttled.status).toBe(200)
    expect(await throttled.json()).toEqual(await ok.json())
    expect(mockFindFirst).not.toHaveBeenCalled()
    expect(mockSendReset).not.toHaveBeenCalled()
  })

  it('does not wait for the email before answering', async () => {
    let release: (v: unknown) => void = () => {}
    mockSendReset.mockReturnValue(new Promise(resolve => { release = resolve }))
    mockFindFirst.mockResolvedValue(normal)

    const res = await POST(post(EMAIL) as never)
    expect(res.status).toBe(200)
    release({ success: true })
  })

  it('reports a failed send to Sentry and still gives the generic answer', async () => {
    mockFindFirst.mockResolvedValue(normal)
    mockSendReset.mockResolvedValue({ success: false, error: 'mailgun down' })

    const res = await POST(post(EMAIL) as never)
    await flush()

    expect(res.status).toBe(200)
    expect(mockCaptureMessage).toHaveBeenCalledTimes(1)
  })

  it('reports a thrown send to Sentry too', async () => {
    mockFindFirst.mockResolvedValue(legacy)
    mockSendClaim.mockRejectedValue(new Error('boom'))

    const res = await POST(post(EMAIL) as never)
    await flush()

    expect(res.status).toBe(200)
    expect(mockCaptureException).toHaveBeenCalledTimes(1)
  })
})
