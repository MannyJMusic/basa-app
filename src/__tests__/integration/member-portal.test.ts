/**
 * The signed-in member portal's API, against a real database:
 *
 *  - /api/account never creates or grants an ACTIVE membership.
 *  - /api/members: admins see every member (including imported, unclaimed
 *    logins); the directory shows only active, listed, non-guest members, and a
 *    GUEST session gets 403.
 *  - Bulk upload tolerates blank cells and never resets an existing account.
 *  - Activating a member through the admin route sets a renewal date.
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

let mockSession: any = null
jest.mock('@/lib/auth', () => ({
  auth: async () => mockSession,
}))

import { withEmptyTestDatabase } from './helpers/test-utils'
import { GET as getAccount, PUT as putAccount } from '@/app/api/account/route'
import { GET as listMembers } from '@/app/api/members/route'
import { GET as getMember, PUT as putMember } from '@/app/api/members/[id]/route'
import { POST as bulkUpload } from '@/app/api/members/bulk-upload/route'
import { POST as changePassword } from '@/app/api/auth/change-password/route'
import { hashPassword } from '@/lib/password'

let seq = 0
async function makeUser(overrides: Record<string, unknown> = {}) {
  seq += 1
  return testPrisma.user.create({
    data: {
      email: `portal-${seq}-${Date.now()}@example.com`,
      firstName: `First${seq}`,
      lastName: `Last${seq}`,
      role: 'MEMBER',
      isActive: true,
      accountStatus: 'ACTIVE',
      hashedPassword: 'x',
      ...overrides,
    },
  })
}

async function makeMember(userOverrides: Record<string, unknown>, memberOverrides: Record<string, unknown> = {}) {
  const user = await makeUser(userOverrides)
  const member = await testPrisma.member.create({
    data: {
      userId: user.id,
      businessName: `Business ${seq}`,
      membershipStatus: 'ACTIVE',
      showInDirectory: true,
      allowContact: true,
      ...memberOverrides,
    },
  })
  return { user, member }
}

const signInAs = (user: { id: string; email: string; role: string }) => {
  mockSession = { user: { id: user.id, email: user.email, role: user.role } }
}

const req = (url: string, init?: RequestInit) => new Request(`http://localhost${url}`, init) as any
const idParams = (id: string) => ({ params: Promise.resolve({ id }) })

describe('/api/account cannot grant a membership', () => {
  it(
    'GET creates nothing, and PUT creates only a private PENDING row',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      const user = await makeUser({ role: 'GUEST' })
      signInAs(user)

      const got = await getAccount()
      expect(got.status).toBe(200)
      const body = await got.json()
      expect(body.member).toBeNull()
      expect(await testPrisma.member.count({ where: { userId: user.id } })).toBe(0)

      const put = await putAccount(req('/api/account', {
        method: 'PUT',
        body: JSON.stringify({ newsletterSubscribed: true }),
      }))
      expect(put.status).toBe(200)
      const member = await testPrisma.member.findUnique({ where: { userId: user.id } })
      expect(member.membershipStatus).toBe('PENDING')
      expect(member.newsletterSubscribed).toBe(true)
      expect(member.showInDirectory).toBe(false)
      expect(member.allowContact).toBe(false)
    })
  )

  it(
    'rejects fields it does not own, so status cannot be set',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      const user = await makeUser({ role: 'GUEST' })
      signInAs(user)

      const put = await putAccount(req('/api/account', {
        method: 'PUT',
        body: JSON.stringify({ showInDirectory: true, membershipStatus: 'ACTIVE' }),
      }))
      expect(put.status).toBe(400)
      expect(await testPrisma.member.count({ where: { userId: user.id } })).toBe(0)

      // A valid preference update still leaves the row PENDING.
      await putAccount(req('/api/account', { method: 'PUT', body: JSON.stringify({ showInDirectory: true }) }))
      const member = await testPrisma.member.findUnique({ where: { userId: user.id } })
      expect(member.membershipStatus).toBe('PENDING')
      expect(await testPrisma.member.count({ where: { membershipStatus: 'ACTIVE' } })).toBe(0)
    })
  )

  it(
    'keeps an existing membership status when preferences change',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      const { user } = await makeMember({}, { membershipStatus: 'EXPIRED', showInDirectory: true })
      signInAs(user)

      await putAccount(req('/api/account', { method: 'PUT', body: JSON.stringify({ showInDirectory: false, showAddress: true }) }))
      const member = await testPrisma.member.findUnique({ where: { userId: user.id } })
      expect(member.membershipStatus).toBe('EXPIRED')
      expect(member.showInDirectory).toBe(false)
      expect(member.showAddress).toBe(true)
    })
  )
})

describe('/api/members visibility', () => {
  async function seedDirectory() {
    const listed = await makeMember({ role: 'MEMBER' })
    const unlisted = await makeMember({ role: 'MEMBER' }, { showInDirectory: false })
    const pending = await makeMember({ role: 'MEMBER' }, { membershipStatus: 'PENDING' })
    const guest = await makeMember({ role: 'GUEST' })
    const imported = await makeMember(
      { role: 'MEMBER', isActive: false, accountStatus: 'INACTIVE', hashedPassword: null },
      {}
    )
    return { listed, unlisted, pending, guest, imported }
  }

  it(
    'shows admins every member, including unclaimed imported accounts',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      const seeded = await seedDirectory()
      const admin = await makeUser({ role: 'ADMIN' })
      signInAs(admin)

      const all = await (await listMembers(req('/api/members?limit=100'))).json()
      expect(all.pagination.total).toBe(5)
      expect(all.members.map((m: any) => m.id)).toContain(seeded.imported.member.id)

      const unclaimed = await (await listMembers(req('/api/members?account=unclaimed'))).json()
      expect(unclaimed.members.map((m: any) => m.id)).toEqual([seeded.imported.member.id])

      const active = await (await listMembers(req('/api/members?account=active'))).json()
      expect(active.members.map((m: any) => m.id)).not.toContain(seeded.imported.member.id)
    })
  )

  it(
    'lists only active, listed, non-guest members for a member',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      const seeded = await seedDirectory()
      const viewer = await makeUser({ role: 'MEMBER' })
      signInAs(viewer)

      const res = await listMembers(req('/api/members?limit=100&status=PENDING'))
      expect(res.status).toBe(200)
      const ids = (await res.json()).members.map((m: any) => m.id).sort()
      // `status` is ignored for non-admins; the imported member has an ACTIVE
      // membership and is listed even though they have not claimed a login.
      expect(ids).toEqual([seeded.listed.member.id, seeded.imported.member.id].sort())

      expect((await getMember(req('/api/members/x'), idParams(seeded.listed.member.id))).status).toBe(200)
      for (const hidden of [seeded.unlisted, seeded.pending, seeded.guest]) {
        expect((await getMember(req('/api/members/x'), idParams(hidden.member.id))).status).toBe(404)
      }
    })
  )

  it(
    'lets a member read their own row even when unlisted',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      const { user, member } = await makeMember({ role: 'MEMBER' }, { showInDirectory: false })
      signInAs(user)
      expect((await getMember(req('/api/members/x'), idParams(member.id))).status).toBe(200)
    })
  )

  it(
    'refuses GUEST sessions',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      const { listed } = await seedDirectory()
      const guest = await makeUser({ role: 'GUEST' })
      signInAs(guest)

      expect((await listMembers(req('/api/members'))).status).toBe(403)
      expect((await getMember(req('/api/members/x'), idParams(listed.member.id))).status).toBe(403)
    })
  )

  it(
    'shows other members only confirmed registrations of public events, at most five',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      const { member } = await makeMember({ role: 'MEMBER' })
      const viewer = await makeUser({ role: 'MEMBER' })

      const event = async (status: string, n: number) =>
        testPrisma.event.create({
          data: {
            title: `Event ${status} ${n}`,
            slug: `event-${status.toLowerCase()}-${n}-${Date.now()}`,
            description: 'x',
            startDate: new Date(Date.now() - n * 86400000),
            endDate: new Date(Date.now() - n * 86400000 + 3600000),
            location: 'San Antonio',
            category: 'networking',
            status,
          },
        })
      const register = (eventId: string, status: string) =>
        testPrisma.eventRegistration.create({
          data: { eventId, memberId: member.id, status, name: 'A', email: 'a@example.com', totalAmount: 0 },
        })

      for (let i = 1; i <= 6; i++) await register((await event('PUBLISHED', i)).id, 'CONFIRMED')
      await register((await event('DRAFT', 7)).id, 'CONFIRMED')
      await register((await event('PUBLISHED', 8)).id, 'CANCELLED')

      signInAs(viewer)
      const body = await (await getMember(req('/api/members/x'), idParams(member.id))).json()
      expect(body.eventRegistrations).toHaveLength(5)
      for (const r of body.eventRegistrations) {
        expect(Object.keys(r).sort()).toEqual(['event', 'id'])
        expect(Object.keys(r.event).sort()).toEqual(['id', 'startDate', 'title'])
        expect(r.event.title).toMatch(/^Event PUBLISHED/)
      }
    })
  )
})

describe('bulk upload', () => {
  const upload = (csv: string) => {
    const form = new FormData()
    form.append('file', new File([csv], 'members.csv', { type: 'text/csv' }))
    return bulkUpload(req('/api/members/bulk-upload', { method: 'POST', body: form }))
  }

  it(
    'accepts blank cells, and creates new people with no password and no login',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      signInAs(await makeUser({ role: 'ADMIN' }))

      const csv = [
        'firstName,lastName,email,businessName,businessEmail,website,membershipTier,membershipStatus,renewalDate',
        'Ana,Example,Ana.New@Example.com,,,,,,',
        'Bo,Example,bo.new@example.com,Bo LLC,info@example.com,example.com,Mixer,PENDING,',
      ].join('\n')
      const body = await (await upload(csv)).json()
      expect(body.results.failed).toBe(0)
      expect(body.results.created).toBe(2)

      const ana = await testPrisma.user.findUnique({ where: { email: 'ana.new@example.com' }, include: { member: true } })
      expect(ana.hashedPassword).toBeNull()
      expect(ana.isActive).toBe(false)
      expect(ana.accountStatus).toBe('INACTIVE')
      expect(ana.role).toBe('MEMBER')
      expect(ana.member.membershipTier).toBeNull()
      expect(ana.member.membershipStatus).toBe('ACTIVE')
      expect(ana.member.renewalDate.getTime()).toBeGreaterThan(Date.now() + 360 * 86400000)
      expect(ana.member.businessEmail).toBeNull()

      const bo = await testPrisma.user.findUnique({ where: { email: 'bo.new@example.com' }, include: { member: true } })
      expect(bo.role).toBe('GUEST')
      expect(bo.member.membershipTier).toBe('MIXER_MEMBER')
      expect(bo.member.membershipStatus).toBe('PENDING')
      expect(bo.member.website).toBe('https://example.com')
    })
  )

  it(
    'never changes an existing account\'s password, role or status',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      signInAs(await makeUser({ role: 'ADMIN' }))
      const { user, member } = await makeMember(
        { role: 'MODERATOR', hashedPassword: 'existing-hash', email: 'kept@example.com' },
        { membershipStatus: 'EXPIRED', businessName: 'Old Name', businessPhone: '210-555-0100' }
      )

      const csv = [
        'firstName,lastName,email,password,role,businessName,businessPhone,membershipTier,membershipStatus',
        'New,Name,KEPT@example.com,NewPassword123,ADMIN,New Name,,Market,ACTIVE',
      ].join('\n')
      const body = await (await upload(csv)).json()
      expect(body.results.updated).toBe(1)
      expect(body.results.warnings.join(' ')).toMatch(/password, role/)

      const after = await testPrisma.user.findUnique({ where: { id: user.id }, include: { member: true } })
      expect(after.hashedPassword).toBe('existing-hash')
      expect(after.role).toBe('MODERATOR')
      expect(after.firstName).toBe(user.firstName)
      expect(after.member.membershipStatus).toBe('EXPIRED')
      expect(after.member.businessName).toBe('New Name')
      expect(after.member.businessPhone).toBe('210-555-0100') // blank cell keeps data
      expect(after.member.membershipTier).toBe('MARKET_MEMBER')
      expect(after.member.id).toBe(member.id)
    })
  )
})

describe('admin member update', () => {
  it(
    'sets a renewal date a year out when a membership becomes ACTIVE',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      signInAs(await makeUser({ role: 'ADMIN' }))
      const { member } = await makeMember({ role: 'GUEST' }, { membershipStatus: 'PENDING', renewalDate: null })

      const res = await putMember(
        req('/api/members/x', { method: 'PUT', body: JSON.stringify({ membershipStatus: 'ACTIVE', businessEmail: '', website: '' }) }),
        idParams(member.id)
      )
      expect(res.status).toBe(200)
      const after = await testPrisma.member.findUnique({ where: { id: member.id } })
      expect(after.membershipStatus).toBe('ACTIVE')
      const days = (after.renewalDate.getTime() - Date.now()) / 86400000
      expect(days).toBeGreaterThan(360)
      expect(days).toBeLessThan(370)
      expect(after.businessEmail).toBeNull()
    })
  )

  it(
    'keeps a future renewal date given with the activation',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      signInAs(await makeUser({ role: 'ADMIN' }))
      const { member } = await makeMember({}, { membershipStatus: 'EXPIRED' })
      const renewal = '2027-03-01T00:00:00.000Z'

      await putMember(
        req('/api/members/x', { method: 'PUT', body: JSON.stringify({ membershipStatus: 'ACTIVE', renewalDate: renewal, membershipTier: null }) }),
        idParams(member.id)
      )
      const after = await testPrisma.member.findUnique({ where: { id: member.id } })
      expect(after.renewalDate.toISOString()).toBe(renewal)
      expect(after.membershipTier).toBeNull()
    })
  )

  it(
    'stops an admin demoting or deactivating themselves',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      const { user, member } = await makeMember({ role: 'ADMIN' })
      signInAs(user)

      for (const change of [{ role: 'MEMBER' }, { isActive: false }]) {
        const res = await putMember(req('/api/members/x', { method: 'PUT', body: JSON.stringify(change) }), idParams(member.id))
        expect(res.status).toBe(400)
      }
      const after = await testPrisma.user.findUnique({ where: { id: user.id } })
      expect(after.role).toBe('ADMIN')
      expect(after.isActive).toBe(true)
    })
  )
})

describe('change password', () => {
  it(
    'ends sessions issued before the change',
    withEmptyTestDatabase(async ({ database }: any) => {
      testPrisma = database.prisma
      const user = await makeUser({ hashedPassword: await hashPassword('old-password-1') })
      signInAs(user)
      const before = Date.now()

      const res = await changePassword(req('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: 'old-password-1', newPassword: 'new-password-2' }),
      }))
      expect(res.status).toBe(200)
      const after = await testPrisma.user.findUnique({ where: { id: user.id } })
      expect(after.sessionsInvalidBefore.getTime()).toBeGreaterThanOrEqual(before - 1000)
    })
  )
})
