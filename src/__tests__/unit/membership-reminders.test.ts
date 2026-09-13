/**
 * @jest-environment node
 *
 * Which notice is due, and when. The bucketing is the part that decides whether a
 * member gets one useful email or three wrong ones (#82).
 */
import { dueInterval, daysUntil, REMINDER_INTERVALS, EXPIRED_NOTICE_WINDOW_DAYS } from '@/lib/membership-reminders'

const NOW = new Date('2026-09-10T12:00:00Z')
const inDays = (days: number): Date => new Date(NOW.getTime() + days * 24 * 60 * 60 * 1000)

describe('daysUntil', () => {
  it('counts whole days, and goes negative once the date has passed', () => {
    expect(daysUntil(inDays(30), NOW)).toBe(30)
    expect(daysUntil(inDays(1), NOW)).toBe(1)
    expect(daysUntil(NOW, NOW)).toBe(0)
    expect(daysUntil(inDays(-1), NOW)).toBe(-1)
  })

  it('rounds up, so most of a day left still counts as a day', () => {
    // 23 hours out is not "0 days left" to a member reading the email.
    expect(daysUntil(new Date(NOW.getTime() + 23 * 60 * 60 * 1000), NOW)).toBe(1)
  })
})

describe('dueInterval', () => {
  it('warns on renewal day itself', () => {
    // 0 days remaining is the last chance to say anything, not a gap.
    expect(dueInterval(NOW, NOW)).toBe(1)
  })

  it('picks the interval a member has just crossed', () => {
    expect(dueInterval(inDays(30), NOW)).toBe(30)
    expect(dueInterval(inDays(7), NOW)).toBe(7)
    expect(dueInterval(inDays(1), NOW)).toBe(1)
  })

  it('does not fire for a member outside every window', () => {
    expect(dueInterval(inDays(31), NOW)).toBeNull()
    expect(dueInterval(inDays(90), NOW)).toBeNull()
  })

  it('gives a member only the notice that is still true after a missed run', () => {
    // The sweep has not run for three weeks and this member is 3 days out. They
    // should get the 7-day notice, not the 30-day one they never received.
    expect(dueInterval(inDays(3), NOW)).toBe(7)
    expect(dueInterval(inDays(25), NOW)).toBe(30)
  })

  it('stops once the membership has lapsed', () => {
    // Past renewal is the expired notice's business, not a reminder's.
    expect(dueInterval(inDays(-1), NOW)).toBeNull()
    expect(dueInterval(inDays(-400), NOW)).toBeNull()
  })

  it('covers the whole span between now and the longest interval', () => {
    // No gap where a member is inside the horizon but matches no bucket.
    for (let days = 0; days <= Math.max(...REMINDER_INTERVALS); days++) {
      expect(dueInterval(inDays(days), NOW)).not.toBeNull()
    }
  })
})

describe('the expired-notice window', () => {
  it('is short enough that the imported legacy members are never mailed', () => {
    // #58 imported 135 members who are EXPIRED with renewal dates years old. A
    // sweep with no lower bound would email all of them on its first run.
    expect(EXPIRED_NOTICE_WINDOW_DAYS).toBeLessThanOrEqual(7)

    const legacyRenewal = new Date('2022-04-17T05:00:00Z')
    const windowStart = new Date(NOW.getTime() - EXPIRED_NOTICE_WINDOW_DAYS * 24 * 60 * 60 * 1000)
    expect(legacyRenewal.getTime()).toBeLessThan(windowStart.getTime())
  })

  it('is long enough to survive a couple of missed runs', () => {
    expect(EXPIRED_NOTICE_WINDOW_DAYS).toBeGreaterThanOrEqual(2)
  })
})
