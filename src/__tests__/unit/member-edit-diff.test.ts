/**
 * @jest-environment node
 *
 * The admin member edit dialog sends only what changed (it used to send the whole
 * form, turning "no tier" into Meeting and GUEST into MEMBER).
 */
import { diffMemberForm, formStateFromMember, fromDateInput, NO_TIER } from '@/components/members/member-edit'

const member: any = {
  id: 'm1',
  userId: 'u1',
  businessName: 'Acme',
  businessType: 'Plumbing',
  industry: ['Trades'],
  website: null,
  membershipTier: null,
  membershipStatus: 'ACTIVE',
  renewalDate: '2027-01-15T12:00:00.000Z',
  user: { id: 'u1', firstName: 'Ann', lastName: 'Lee', email: 'Ann@Example.com', role: 'GUEST', isActive: false },
}

describe('diffMemberForm', () => {
  const initial = formStateFromMember(member)

  it('sends nothing when nothing changed, keeping GUEST and no tier', () => {
    expect(initial.role).toBe('GUEST')
    expect(initial.membershipTier).toBe(NO_TIER)
    expect(initial.businessType).toBe('Plumbing')
    expect(diffMemberForm(initial, { ...initial })).toEqual({})
  })

  it('sends only the changed fields', () => {
    expect(diffMemberForm(initial, { ...initial, city: 'San Antonio', membershipTier: 'MIXER_MEMBER' }))
      .toEqual({ city: 'San Antonio', membershipTier: 'MIXER_MEMBER' })
  })

  it('turns a cleared field into null', () => {
    expect(diffMemberForm(initial, { ...initial, businessName: '  ' })).toEqual({ businessName: null })
  })

  it('can set "No tier"', () => {
    const withTier = { ...initial, membershipTier: 'MEETING_MEMBER' }
    expect(diffMemberForm(withTier, { ...withTier, membershipTier: NO_TIER })).toEqual({ membershipTier: null })
  })

  it('sends a role only when it was changed', () => {
    expect(diffMemberForm(initial, { ...initial, role: 'MEMBER' })).toEqual({ role: 'MEMBER' })
  })

  it('sends the renewal date as ISO, or null when cleared', () => {
    expect(initial.renewalDate).toBe('2027-01-15')
    expect(diffMemberForm(initial, { ...initial, renewalDate: '2027-06-01' }))
      .toEqual({ renewalDate: fromDateInput('2027-06-01') })
    expect(diffMemberForm(initial, { ...initial, renewalDate: '' })).toEqual({ renewalDate: null })
  })

  it('compares industry as a list', () => {
    expect(diffMemberForm(initial, { ...initial, industry: ' Trades ' })).toEqual({})
    expect(diffMemberForm(initial, { ...initial, industry: 'Trades, HVAC' })).toEqual({ industry: ['Trades', 'HVAC'] })
  })
})
