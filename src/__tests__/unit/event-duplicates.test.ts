import { findDuplicates, eventDay, type ExistingEvent } from '@/lib/event-duplicates'

const ev = (id: string, title: string, iso: string, location = 'Somewhere'): ExistingEvent =>
  ({ id, title, slug: id, startDate: iso, location, status: 'PUBLISHED' })

describe('findDuplicates', () => {
  const existing = [
    ev('a', 'Brewing With BASA', '2025-03-14T19:00:00Z', 'Weathered Souls'),
    ev('b', 'Brewing With BASA', '2025-03-28T19:00:00Z', 'Weathered Souls'),
    ev('c', 'Get Out of the Office Happy Hour Networking Mixer', '2026-10-13T21:30:00Z', 'Elsewhere Too'),
  ]

  it('allows the same flyer on a different date and reports the other dates', () => {
    const r = findDuplicates({ title: 'Brewing with BASA', startDate: new Date('2025-04-11T19:00:00Z') }, existing)
    expect(r.matches).toEqual([])
    expect(r.otherDates.map(o => o.id)).toEqual(['a', 'b'])
  })

  it('flags the same title on the same day as exact', () => {
    const r = findDuplicates({ title: 'Brewing With BASA!', startDate: new Date('2025-03-28T19:30:00Z') }, existing)
    expect(r.matches.map(m => [m.id, m.level])).toEqual([['b', 'exact']])
  })

  it('flags a shortened re-issued title on the same day as likely', () => {
    const r = findDuplicates({ title: 'Get Out of the Office', startDate: new Date('2026-10-13T21:30:00Z'), location: 'Elsewhere Too' }, existing)
    expect(r.matches[0]).toMatchObject({ id: 'c', level: 'likely' })
  })

  it('compares days in Central time, not UTC', () => {
    // 9 pm Central on the 13th is already the 14th in UTC.
    expect(eventDay(new Date('2026-10-14T02:00:00Z'))).toBe('2026-10-13')
    const r = findDuplicates({ title: 'Get Out of the Office Happy Hour Networking Mixer', startDate: new Date('2026-10-14T02:00:00Z') }, existing)
    expect(r.matches.map(m => m.id)).toEqual(['c'])
  })

  it('ignores unrelated events and the event being edited', () => {
    expect(findDuplicates({ title: 'Ribbon Cutting', startDate: new Date('2026-10-13T21:30:00Z') }, existing).matches).toEqual([])
    expect(findDuplicates({ title: 'Brewing With BASA', startDate: new Date('2025-03-28T19:00:00Z') }, existing, { excludeId: 'b' }).matches).toEqual([])
  })
})
