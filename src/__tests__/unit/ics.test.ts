/**
 * @jest-environment node
 *
 * MEC exposes iCal and members subscribe to it, so this has to be right at
 * cutover (#56). The parts worth testing are the ones a subscriber notices only
 * after the fact: a UID that moves and duplicates every entry, an unescaped
 * semicolon that truncates a description, a fold that splits an emoji.
 */
import { buildCalendar, eventUid, icsFilename, IcsEvent } from '@/lib/ics'

const ORIGIN = 'https://app.businessassociationsa.com'

function makeEvent(overrides: Partial<IcsEvent> = {}): IcsEvent {
  return {
    id: 'cmtu000000000000000000',
    slug: 'happy-hour-mixer',
    title: 'Happy Hour Mixer',
    description: '<p>Join <strong>BASA</strong> for drinks.</p>',
    // 4:30 PM Central Daylight Time.
    startDate: new Date('2026-10-13T21:30:00Z'),
    endDate: new Date('2026-10-14T00:00:00Z'),
    location: 'Elsewhere Too',
    address: '4513 N Loop 1604 W',
    city: 'San Antonio',
    state: 'TX',
    zipCode: '78249',
    category: 'Happy Hour Mixer',
    status: 'PUBLISHED',
    updatedAt: new Date('2026-09-01T12:00:00Z'),
    ...overrides,
  }
}

const NOW = new Date('2026-09-10T00:00:00Z')
const unfold = (ics: string): string => ics.replace(/\r\n /g, '')

describe('buildCalendar', () => {
  it('produces a well-formed document with CRLF endings', () => {
    const ics = buildCalendar([makeEvent()], { origin: ORIGIN }, NOW)

    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
    expect(ics).toContain('VERSION:2.0')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('END:VEVENT')
    // No bare newline anywhere: some clients reject the whole file for one.
    expect(/[^\r]\n/.test(ics)).toBe(false)
  })

  it('writes times as UTC instants that match the local wall clock', () => {
    const ics = buildCalendar([makeEvent()], { origin: ORIGIN }, NOW)
    // 21:30Z is 4:30 PM in San Antonio in October. A client renders it locally.
    expect(ics).toContain('DTSTART:20261013T213000Z')
    expect(ics).toContain('DTEND:20261014T000000Z')
  })

  it('keeps the UID stable when the slug changes', () => {
    const before = eventUid(makeEvent(), ORIGIN)
    const after = eventUid(makeEvent({ slug: 'renamed-by-an-editor' }), ORIGIN)

    expect(after).toBe(before)
    expect(before).toBe('cmtu000000000000000000@app.businessassociationsa.com')
  })

  it('advances SEQUENCE when the event is edited, so clients accept the update', () => {
    const first = buildCalendar([makeEvent()], { origin: ORIGIN }, NOW)
    const edited = buildCalendar(
      [makeEvent({ updatedAt: new Date('2026-09-02T12:00:00Z') })], { origin: ORIGIN }, NOW
    )
    const seq = (ics: string) => parseInt(/SEQUENCE:(\d+)/.exec(ics)![1], 10)

    expect(seq(edited)).toBeGreaterThan(seq(first))
  })

  it('escapes the characters that would otherwise truncate a value', () => {
    const ics = unfold(buildCalendar(
      [makeEvent({ title: 'Doors 4:30; drinks, food and a raffle \\ prizes' })],
      { origin: ORIGIN }, NOW
    ))
    // As the file will contain it: backslash-semicolon, backslash-comma, and the
    // author's single backslash doubled.
    expect(ics).toContain('SUMMARY:Doors 4:30\\; drinks\\, food and a raffle \\\\ prizes')
  })

  it('renders the description as plain text, not markup', () => {
    const ics = unfold(buildCalendar([makeEvent()], { origin: ORIGIN }, NOW))
    expect(ics).toContain('DESCRIPTION:Join BASA for drinks.')
    expect(ics).not.toContain('<strong>')
  })

  it('marks a cancelled event cancelled rather than dropping it', () => {
    const ics = buildCalendar([makeEvent({ status: 'CANCELLED' })], { origin: ORIGIN }, NOW)
    expect(ics).toContain('STATUS:CANCELLED')
  })

  it('builds one location line without repeating the venue name', () => {
    const ics = unfold(buildCalendar(
      [makeEvent({ location: 'Elsewhere Too', address: 'Elsewhere Too' })], { origin: ORIGIN }, NOW
    ))
    expect(ics).toContain('LOCATION:Elsewhere Too\\, San Antonio\\, TX\\, 78249')
  })

  it('folds long lines at 75 octets without splitting a character', () => {
    const ics = buildCalendar(
      [makeEvent({ title: `🎳 ${'Bowling tournament and networking evening '.repeat(4)}` })],
      { origin: ORIGIN }, NOW
    )
    for (const physicalLine of ics.split('\r\n')) {
      expect(Buffer.from(physicalLine, 'utf8').length).toBeLessThanOrEqual(75)
    }
    // Unfolding puts the emoji back together intact.
    expect(unfold(ics)).toContain('SUMMARY:🎳 Bowling tournament')
  })

  it('names the calendar for clients that show it', () => {
    const ics = buildCalendar([], { origin: ORIGIN, calendarName: 'BASA Events' }, NOW)
    expect(ics).toContain('X-WR-CALNAME:BASA Events')
    expect(ics).toContain('X-WR-TIMEZONE:America/Chicago')
    expect(ics).not.toContain('BEGIN:VEVENT')
  })
})

describe('icsFilename', () => {
  it('produces something a browser will save', () => {
    expect(icsFilename('happy-hour-mixer')).toBe('happy-hour-mixer.ics')
    expect(icsFilename('get out/of the office')).toBe('get-out-of-the-office.ics')
  })
})
