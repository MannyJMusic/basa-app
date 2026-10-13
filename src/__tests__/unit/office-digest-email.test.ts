/** @jest-environment node */
// The template is pure; the Mailgun client behind it is ESM-only and cannot load under jest's CJS transform.
jest.mock('mailgun.js', () => jest.fn());
jest.mock('form-data', () => jest.fn());

import { generateOfficeDigestEmailHtml, officeDigestSubject } from '@/lib/basa-emails';
import { digestHasNews, digestRecipients, DEFAULT_DIGEST_RECIPIENTS, type OfficeDigest } from '@/lib/office-digest';

const until = new Date('2026-10-14T13:00:00Z');
const empty = (): OfficeDigest => ({
  since: new Date(until.getTime() - 24 * 3600_000), until,
  newRegistrations: [], newRegistrationCount: 0, newTicketCount: 0, pendingRequests: [],
  payments: { completedCount: 0, completedCents: 0 }, failedPayments: [], lapsedMembers: [],
  upcomingEvents: [], renewingSoon: [],
});

describe('office digest', () => {
  it('has no news on a day with only things coming up', () => {
    const d = empty();
    d.upcomingEvents = [{ eventId: 'e', title: 'Mixer', startDate: until, confirmedTickets: 3, capacity: 50 }];
    d.renewingSoon = [{ name: 'Acme', renewalDate: until }];
    expect(digestHasNews(d)).toBe(false);
  });

  it.each([
    ['a registration', (d: OfficeDigest) => { d.newRegistrationCount = 1; }],
    ['a waiting request', (d: OfficeDigest) => { d.pendingRequests = [{ id: 'r', buyerName: 'G', eventTitle: 'E', tickets: 1, memberCents: 1, heldCents: 2, deadlineAt: null }]; }],
    ['a payment', (d: OfficeDigest) => { d.payments = { completedCount: 1, completedCents: 100 }; }],
    ['a declined payment', (d: OfficeDigest) => { d.failedPayments = [{ customerName: 'C', title: 'T', amountCents: 1, reason: null }]; }],
    ['a lapsed membership', (d: OfficeDigest) => { d.lapsedMembers = [{ name: 'Acme', renewalDate: until }]; }],
  ])('has news with %s', (_label, mutate) => {
    const d = empty(); mutate(d);
    expect(digestHasNews(d)).toBe(true);
  });

  it('defaults the recipient and parses a list', () => {
    expect(digestRecipients('')).toEqual(DEFAULT_DIGEST_RECIPIENTS);
    expect(digestRecipients(undefined)).toEqual(DEFAULT_DIGEST_RECIPIENTS);
    expect(digestRecipients('a@x.com, b@x.com;c@x.com')).toEqual(['a@x.com', 'b@x.com', 'c@x.com']);
  });

  it('puts the counts in the subject', () => {
    const d = empty();
    d.newRegistrationCount = 3;
    d.pendingRequests = [{ id: 'r', buyerName: 'G', eventTitle: 'E', tickets: 1, memberCents: 1, heldCents: 2, deadlineAt: null }];
    expect(officeDigestSubject(d)).toBe('BASA daily digest, Wed, Oct 14: 3 new registrations, 1 to verify');
  });

  it('escapes names and caps long lists', () => {
    const d = empty();
    d.newRegistrationCount = 12; d.newTicketCount = 12;
    d.newRegistrations = [{
      eventId: 'e', title: 'Mixer <b>', startDate: until, tickets: 12,
      registrations: Array.from({ length: 12 }, (_, i) => ({ name: i === 0 ? '<script>x</script>' : `Person ${i}`, company: null, tickets: 1, memberRatePending: false })),
    }];
    const html = generateOfficeDigestEmailHtml(d);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('Mixer &lt;b&gt;');
    expect(html).toContain('and 2 more');
    expect(html).toContain('/admin');
  });

  it('links each waiting request to its page', () => {
    const d = empty();
    d.pendingRequests = [{ id: 'req123', buyerName: 'Guest', eventTitle: 'E', tickets: 2, memberCents: 1, heldCents: 2, deadlineAt: until }];
    expect(generateOfficeDigestEmailHtml(d)).toContain('/admin/member-rate-requests/req123');
  });
});
