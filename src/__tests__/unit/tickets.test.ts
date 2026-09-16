import { newTicketToken, TOKEN_RE, ticketAttendees, formatEventWhen, formatEventWhere, checkInUrl, ticketUrl } from '@/lib/tickets'

describe('tickets', () => {
  it('mints 64-hex tokens that pass the route check and differ every time', () => {
    const a = newTicketToken(), b = newTicketToken()
    expect(a).toMatch(TOKEN_RE); expect(a).toHaveLength(64); expect(a).not.toBe(b)
  })
  it('rejects anything that is not hex', () => {
    for (const bad of ['', 'abc', 'x'.repeat(64), '../etc', 'ABCDEF'.repeat(11)]) expect(TOKEN_RE.test(bad)).toBe(false)
  })
  it('reads attendees defensively', () => {
    const t = (attendees: unknown) => ({ attendees }) as never
    expect(ticketAttendees(t(null))).toEqual([])
    expect(ticketAttendees(t('nope'))).toEqual([])
    expect(ticketAttendees(t([{ name: 'A' }, { name: 'B', email: 'b@x.com' }, { nope: 1 }, null]))).toEqual([{ name: 'A', email: undefined }, { name: 'B', email: 'b@x.com' }])
  })
  it('formats when and where in Central time', () => {
    const w = formatEventWhen(new Date('2026-10-13T22:30:00Z'), new Date('2026-10-14T00:00:00Z'))
    expect(w.date).toBe('Tuesday, October 13, 2026')
    expect(w.time).toBe('5:30 PM – 7:00 PM')
    expect(formatEventWhere({ location: 'Elsewhere Too', address: '4513 N Loop 1604 W', city: 'San Antonio', state: 'TX', zipCode: '78249' }))
      .toBe('Elsewhere Too, 4513 N Loop 1604 W San Antonio, TX 78249')
    expect(formatEventWhere({ location: 'TBA', address: null, city: null, state: null, zipCode: null })).toBe('TBA')
  })
  it('points the QR at the admin check-in page, not the public ticket', () => {
    const tok = 'a'.repeat(64)
    expect(checkInUrl(tok)).toMatch(/\/admin\/check-in\/a{64}$/)
    expect(ticketUrl(tok)).toMatch(/\/tickets\/a{64}$/)
  })
})
