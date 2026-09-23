import { applyMemberPrivacy } from '@/lib/member-privacy'

/** H-A5: the directory shows only what a member agreed to share. */
describe('applyMemberPrivacy', () => {
  const base = {
    id: 'm1',
    userId: 'u1',
    allowContact: false,
    showAddress: false,
    businessEmail: 'biz@example.com',
    businessPhone: '210-555-0100',
    businessAddress: '100 Main St',
    zipCode: '78205',
    city: 'San Antonio',
    state: 'TX',
    user: { id: 'u1', firstName: 'Ana', lastName: 'Diaz', email: 'ana@example.com', role: 'MEMBER' },
  } as any

  it('hides contact details and address from other members without consent', () => {
    const shown = applyMemberPrivacy(base, 'someone-else')
    expect(shown.businessEmail).toBeNull()
    expect(shown.businessPhone).toBeNull()
    expect(shown.user.email).toBeNull()
    expect(shown.businessAddress).toBeNull()
    expect(shown.zipCode).toBeNull()
    // City and state are directory information, not an address.
    expect(shown.city).toBe('San Antonio')
  })

  it('shows what the member opted to share', () => {
    const shown = applyMemberPrivacy({ ...base, allowContact: true, showAddress: true }, 'someone-else')
    expect(shown.businessEmail).toBe('biz@example.com')
    expect(shown.user.email).toBe('ana@example.com')
    expect(shown.businessAddress).toBe('100 Main St')
  })

  it('always shows a member their own row', () => {
    expect(applyMemberPrivacy(base, 'u1')).toBe(base)
  })
})
