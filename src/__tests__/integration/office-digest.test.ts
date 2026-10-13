import { TestUtils, withEmptyTestDatabase } from './helpers/test-utils';

const sendOfficeDigestEmail = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/basa-emails', () => ({
  sendOfficeDigestEmail: (...a: unknown[]) => sendOfficeDigestEmail(...a),
}));

import { loadOfficeDigest, sendOfficeDigest, digestHasNews } from '@/lib/office-digest';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const hex = () => Array.from({ length: 64 }, () => 'abcdef0123456789'[Math.floor(Math.random() * 16)]).join('');

/**
 * The digest is a set of queries with time windows, so the windows are what these
 * check against a real database: only the last 24 hours, only confirmed
 * registrations, only waiting requests, and silence on a quiet day.
 */
describe('Office daily digest', () => {
  beforeEach(() => sendOfficeDigestEmail.mockClear());

  async function setup(prisma: any) {
    const admin = await TestUtils.createTestUser(prisma, `a-${Math.random()}@test.test`, 'ADMIN');
    const member = await TestUtils.createTestMember(prisma, admin.id, 'Org');
    const organizer = await TestUtils.createTestOrganizer(prisma, 'Org', member.id);
    const event = await TestUtils.createTestEvent(prisma, organizer.id, 'Digest Mixer');
    const register = (name: string, o: { status?: string; ageHours?: number; tickets?: number } = {}) =>
      prisma.eventRegistration.create({
        data: {
          eventId: event.id, name, email: `${Math.random()}@test.test`, company: `${name} LLC`,
          ticketCount: o.tickets ?? 1, totalAmount: 25 * (o.tickets ?? 1), status: o.status ?? 'CONFIRMED',
          ticketToken: hex(), createdAt: new Date(Date.now() - (o.ageHours ?? 1) * HOUR),
        },
      });
    return { event, register };
  }

  it('lists only confirmed registrations from the last 24 hours, grouped by event', withEmptyTestDatabase(async ({ database }: any) => {
    const { prisma } = database;
    const { event, register } = await setup(prisma);
    await register('Recent One', { tickets: 2 });
    await register('Recent Two');
    await register('Yesterday', { ageHours: 30 });
    await register('Unpaid', { status: 'PENDING' });
    await register('Cancelled', { status: 'CANCELLED' });

    const d = await loadOfficeDigest();

    expect(d.newRegistrationCount).toBe(2);
    expect(d.newTicketCount).toBe(3);
    expect(d.newRegistrations).toHaveLength(1);
    expect(d.newRegistrations[0].eventId).toBe(event.id);
    expect(d.newRegistrations[0].registrations.map(r => r.name).sort()).toEqual(['Recent One', 'Recent Two']);
    // Seats count confirmed tickets only, including the older confirmed one.
    expect(d.upcomingEvents[0]).toMatchObject({ title: 'Digest Mixer', confirmedTickets: 4, capacity: 50 });
  }));

  it('reports waiting member-rate requests, and flags them on the registration', withEmptyTestDatabase(async ({ database }: any) => {
    const { prisma } = database;
    const { event } = await setup(prisma);
    const tier = await prisma.ticketTier.create({ data: { eventId: event.id, name: 'Member', price: 25, audience: 'MEMBER' } });
    const mk = (name: string, status: string) => prisma.eventRegistration.create({
      data: {
        eventId: event.id, name, email: `${Math.random()}@test.test`, ticketCount: 1, totalAmount: 35, status: 'CONFIRMED', ticketToken: hex(),
        items: { create: [{ ticketTierId: tier.id, quantity: 1, unitPrice: 35, memberUnitPrice: 25 }] },
        memberRateRequest: { create: { heldCents: 3500, memberCents: 2500, status, authorizedAt: new Date(), deadlineAt: new Date(Date.now() + 3 * DAY) } },
      },
    });
    await mk('Waiting Guest', 'PENDING');
    await mk('Decided Guest', 'APPROVED');

    const d = await loadOfficeDigest();

    expect(d.pendingRequests.map(r => r.buyerName)).toEqual(['Waiting Guest']);
    const flagged = d.newRegistrations[0].registrations.find(r => r.name === 'Waiting Guest');
    expect(flagged?.memberRatePending).toBe(true);
    expect(d.newRegistrations[0].registrations.find(r => r.name === 'Decided Guest')?.memberRatePending).toBe(false);
  }));

  it('lists memberships that lapsed in the window and renewals coming up', withEmptyTestDatabase(async ({ database }: any) => {
    const { prisma } = database;
    const mk = async (email: string, biz: string, status: string, renewalDate: Date) => {
      const user = await TestUtils.createTestUser(prisma, email, 'MEMBER');
      const m = await TestUtils.createTestMember(prisma, user.id, biz);
      await prisma.member.update({ where: { id: m.id }, data: { membershipStatus: status, renewalDate } });
    };
    await mk('lapsed-now@test.test', 'Just Lapsed Co', 'EXPIRED', new Date(Date.now() - 6 * HOUR));
    await mk('lapsed-old@test.test', 'Long Gone Co', 'EXPIRED', new Date(Date.now() - 400 * DAY));
    await mk('soon@test.test', 'Renewing Soon Co', 'ACTIVE', new Date(Date.now() + 5 * DAY));
    await mk('later@test.test', 'Renewing Later Co', 'ACTIVE', new Date(Date.now() + 90 * DAY));

    const d = await loadOfficeDigest();

    expect(d.lapsedMembers.map(m => m.name)).toEqual(['Just Lapsed Co']);
    expect(d.renewingSoon.map(m => m.name)).toEqual(['Renewing Soon Co']);
  }));

  it('sends nothing on a quiet day, but still on request', withEmptyTestDatabase(async ({ database }: any) => {
    const { prisma } = database;
    const { register } = await setup(prisma);
    await register('Old News', { ageHours: 48 }); // an upcoming event exists, but nothing new

    expect(digestHasNews(await loadOfficeDigest())).toBe(false);
    const quiet = await sendOfficeDigest({ to: ['jen@test.test'] });
    expect(quiet).toMatchObject({ sent: false, reason: 'quiet' });
    expect(sendOfficeDigestEmail).not.toHaveBeenCalled();

    const forced = await sendOfficeDigest({ to: ['jen@test.test'], force: true });
    expect(forced.sent).toBe(true);
    expect(sendOfficeDigestEmail).toHaveBeenCalledTimes(1);
    expect(sendOfficeDigestEmail.mock.calls[0][0]).toBe('jen@test.test');
  }));

  it('sends one email per recipient when there is news', withEmptyTestDatabase(async ({ database }: any) => {
    const { prisma } = database;
    const { register } = await setup(prisma);
    await register('Fresh Face');

    const result = await sendOfficeDigest({ to: ['a@test.test', 'b@test.test'] });

    expect(result).toMatchObject({ sent: true, newRegistrations: 1 });
    expect(sendOfficeDigestEmail.mock.calls.map(c => c[0])).toEqual(['a@test.test', 'b@test.test']);
  }));

  it('still reaches the other recipients when one address fails', withEmptyTestDatabase(async ({ database }: any) => {
    const { prisma } = database;
    const { register } = await setup(prisma);
    await register('Fresh Face');
    sendOfficeDigestEmail.mockRejectedValueOnce(new Error('bounced'));

    const result = await sendOfficeDigest({ to: ['bad@test.test', 'good@test.test'] });

    expect(result.sent).toBe(true);
    expect(sendOfficeDigestEmail).toHaveBeenCalledTimes(2);
  }));
});
