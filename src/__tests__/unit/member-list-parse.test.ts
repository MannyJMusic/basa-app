import { parseExpires, parseMemberList, splitName, type ListRow } from '../../../scripts/member-list/parse'

const row = (n: number, business: string, membership: string, email: string, expires = '', contact = ''): ListRow =>
  ({ row: n, business, membership, email, expires, contact })

describe('parseExpires', () => {
  it.each([
    ['2027 - July', '2027-08-01T04:59:00.000Z'],
    ['2026 - Dec.', '2027-01-01T04:59:00.000Z'],
    ['2027 -Sept', '2027-10-01T04:59:00.000Z'],
    ['2027-April', '2027-05-01T04:59:00.000Z'],
    ['2027 July', '2027-08-01T04:59:00.000Z'],
    ['2027 - Feb.', '2027-03-01T04:59:00.000Z'],
  ])('%s ends at the last minute of that month in San Antonio', (raw, iso) => {
    const b = parseExpires(raw)
    expect(b.kind).toBe('yearly')
    expect(b.kind === 'yearly' && b.renewalDate.toISOString()).toBe(iso)
  })
  it('recognises monthly and leaves the rest unknown', () => {
    expect(parseExpires('Monthly')).toEqual({ kind: 'monthly' })
    expect(parseExpires('monthly')).toEqual({ kind: 'monthly' })
    expect(parseExpires('')).toEqual({ kind: 'unknown' })
    expect(parseExpires('soon')).toEqual({ kind: 'unknown' })
  })
})

describe('parseMemberList', () => {
  it('carries a ditto level and expiry to extra contacts, and marks the first contact primary', () => {
    const { members, skipped } = parseMemberList([
      row(3, 'Axe Co', 'MIXER', 'A@axe.example', '2027 - June', 'Peter Carillo'),
      row(4, 'Axe Co', '"', 'b@axe.example', '', 'Ari Carillo'),
    ])
    expect(skipped).toEqual([])
    expect(members.map(m => [m.email, m.tier, m.primary])).toEqual([
      ['a@axe.example', 'MIXER_MEMBER', true],
      ['b@axe.example', 'MIXER_MEMBER', false],
    ])
    expect(members[1].billing).toEqual(members[0].billing)
  })

  it('skips rows that need a person: unknown levels, no email, duplicates', () => {
    const { members, skipped } = parseMemberList([
      row(5, 'One', 'Spouse', 'one@x.example'),
      row(6, 'Two', '', 'two@x.example'),
      row(7, 'Three', 'Meeting', ''),
      row(8, 'Four', 'meeting', 'four@x.example'),
      row(9, 'Four again', 'Market', 'FOUR@x.example'),
    ])
    expect(members.map(m => m.row)).toEqual([8])
    expect(skipped.map(s => s.row)).toEqual([5, 6, 7, 9])
  })

  it('splits contact names', () => {
    expect(splitName('Mary Ann Smith')).toEqual({ firstName: 'Mary', lastName: 'Ann Smith' })
    expect(splitName('')).toEqual({ firstName: null, lastName: null })
  })
})
