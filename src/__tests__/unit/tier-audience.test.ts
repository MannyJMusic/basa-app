import { audienceFromName, autoPairing } from '@/lib/tier-audience'

describe('audienceFromName', () => {
  // Real names from the imported MEC tickets, including their typos.
  it.each([
    ['Member Rate', 'MEMBER'],
    ['Members', 'MEMBER'],
    ['BASA Breakfast - Member Entry Fee', 'MEMBER'],
    ['Member Admision', 'MEMBER'],
    ['<b>Leveraging Leadership Member Enrollment</b>', 'MEMBER'],
    ['Future Member', 'NON_MEMBER'],
    ['Future Memver', 'NON_MEMBER'],
    ['Future Admission', 'NON_MEMBER'],
    ['BASA Future-Member Rate', 'NON_MEMBER'],
    ['Non-Member Admission', 'NON_MEMBER'],
    ['BASA Breakfast - Non - Member Entry Fee', 'NON_MEMBER'],
    ['Breakfast Mixer at VFW- NonMember Rate', 'NON_MEMBER'],
    ['Pizza Day Mixer - NON Member Rate', 'NON_MEMBER'],
    ['General Admission', 'ALL'],
    ['3-Month Trial Membership - $20.26', 'ALL'],
    ['Special "Dixie" Membership', 'ALL'],
    ['Table of 8', 'ALL'],
  ])('%s -> %s', (name, want) => {
    expect(audienceFromName(name)).toBe(want)
  })
})

describe('autoPairing', () => {
  it('pairs exactly one member tier with exactly one non-member tier', () => {
    expect(autoPairing([
      { id: 'm', audience: 'MEMBER' }, { id: 'n', audience: 'NON_MEMBER' }, { id: 'a', audience: 'ALL' },
    ] as const as any)).toEqual({ memberTierId: 'm', nonMemberTierId: 'n' })
  })
  it('leaves ambiguous events for an admin', () => {
    expect(autoPairing([
      { id: 'm1', audience: 'MEMBER' }, { id: 'm2', audience: 'MEMBER' }, { id: 'n', audience: 'NON_MEMBER' },
    ] as any)).toBeNull()
    expect(autoPairing([{ id: 'm', audience: 'MEMBER' }] as any)).toBeNull()
  })
})
