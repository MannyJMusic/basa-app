import { withEmptyTestDatabase } from './helpers/test-utils';
import {
  getAdminOverview,
  getMembershipSummary,
  getMyRegistrations,
  describeAuditAction,
} from '@/lib/member-dashboard';

const DAY = 24 * 60 * 60 * 1000;

/**
 * The member dashboard, My Membership and the admin overview read real rows
 * (#260). Most imported members have no tier, and most registrations have no
 * member link, so the fallbacks are what members actually see.
 */
describe('Member dashboard data', () => {
  let n = 0;
  async function event(prisma: any, startsInDays: number, status = 'PUBLISHED') {
    n++;
    const start = new Date(Date.now() + startsInDays * DAY);
    return prisma.event.create({
      data: {
        title: `Event ${n}`, slug: `event-${n}-${Math.random()}`, description: 'd', location: 'Venue',
        category: 'NETWORKING', status, startDate: start, endDate: new Date(start.getTime() + 2 * 60 * 60 * 1000),
      },
    });
  }
  async function member(prisma: any, email: string, data: Record<string, unknown> = {}) {
    const user = await prisma.user.create({ data: { email, firstName: 'Pat', role: 'MEMBER', accountStatus: 'ACTIVE' } });
    const m = await prisma.member.create({ data: { userId: user.id, membershipStatus: 'ACTIVE', ...data } });
    return { user, member: m };
  }
  const registration = (prisma: any, eventId: string, o: Record<string, unknown>) =>
    prisma.eventRegistration.create({
      data: { eventId, name: 'Pat', email: 'x@test.test', totalAmount: 25, status: 'CONFIRMED', ...o },
    });

  it(
    'uses the tier when set, else the latest legacy level, with its price',
    withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
      const a = await member(prisma, 'tier@test.test', { membershipTier: 'TRIO_MEMBER' });
      expect(await getMembershipSummary(a.user.id)).toMatchObject({ planLabel: 'TRIO Member', priceCents: 29500 });

      const b = await member(prisma, 'legacy@test.test', { membershipStatus: 'EXPIRED' });
      await prisma.legacyMembership.createMany({
        data: [
          { memberId: b.member.id, wpId: 1, wpLevelId: 1, levelName: 'SS Meeting Membership - Annual', price: 149, status: 'expired', startedAt: new Date('2022-01-01') },
          { memberId: b.member.id, wpId: 2, wpLevelId: 2, levelName: 'SS TRIO Membership - Annual', price: 295, status: 'expired', startedAt: new Date('2024-01-01') },
        ],
      });
      const s = await getMembershipSummary(b.user.id);
      expect(s).toMatchObject({ status: 'EXPIRED', planLabel: 'SS TRIO Membership - Annual', priceCents: 29500 });
      expect(s!.history.map(h => h.levelName)).toEqual(['SS TRIO Membership - Annual', 'SS Meeting Membership - Annual']);

      const guest = await prisma.user.create({ data: { email: 'guest@test.test', role: 'GUEST' } });
      expect(await getMembershipSummary(guest.id)).toBeNull();
    })
  );

  it(
    'finds confirmed tickets by member link or buyer email, and splits upcoming from past',
    withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
      const { user, member: m } = await member(prisma, 'Pat@Test.test');
      const soon = await event(prisma, 3);
      const later = await event(prisma, 10);
      const past = await event(prisma, -20);
      const other = await event(prisma, 5);

      await registration(prisma, later.id, { memberId: m.id });
      await registration(prisma, soon.id, { email: 'pat@test.TEST', ticketCount: 2 }); // no member link, email differs in case
      await registration(prisma, past.id, { email: 'pat@test.test' });
      await registration(prisma, other.id, { email: 'pat@test.test', status: 'PENDING' }); // unpaid hold
      await registration(prisma, other.id, { email: 'someone-else@test.test' });

      const r = await getMyRegistrations(user.id, user.email);
      expect(r.upcoming.map(x => x.event.title)).toEqual([soon.title, later.title]);
      expect(r.upcoming[0].ticketCount).toBe(2);
      expect(r.attendedCount).toBe(1);

      const nobody = await getMyRegistrations('no-such-user', null);
      expect(nobody).toEqual({ upcoming: [], attendedCount: 0 });
    })
  );

  it(
    'admin overview counts real rows',
    withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
      await member(prisma, 'a@test.test');
      await member(prisma, 'b@test.test', { joinedAt: new Date(Date.now() - 400 * DAY) });
      await member(prisma, 'c@test.test', { membershipStatus: 'EXPIRED' });
      const up = await event(prisma, 4);
      await event(prisma, 6, 'DRAFT');
      const held = await event(prisma, -3);
      await registration(prisma, up.id, { totalAmount: 40 });
      await registration(prisma, held.id, { totalAmount: 25.5, createdAt: new Date(Date.now() - 60 * DAY) });
      await registration(prisma, held.id, { totalAmount: 99, status: 'CANCELLED' });
      await prisma.lead.create({ data: { name: 'L', email: 'l@test.test' } });
      await prisma.lead.create({ data: { name: 'M', email: 'm@test.test', status: 'CONTACTED', createdAt: new Date(Date.now() - 90 * DAY) } });

      const o = await getAdminOverview();
      expect(o).toMatchObject({
        activeMembers: 2,
        newMembers: 1,
        upcomingEvents: 1,
        eventsLastMonth: 1,
        ticketRevenueCents: 6550,
        ticketRevenueMonthCents: 4000,
        openLeads: 1,
        newLeads: 1,
        pendingRateRequests: 0,
      });
    })
  );

  it('labels audit actions', () => {
    expect(describeAuditAction('MEMBERSHIP_ACTIVATED_MANUALLY')).toBe('Membership activated');
    expect(describeAuditAction('MEMBER_RATE_APPROVED')).toBe('Member rate approved');
  });
});
