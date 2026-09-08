import { TestUtils, withEmptyTestDatabase } from './helpers/test-utils';
import { expireLapsedMemberships } from '@/lib/membership-lifecycle';

/**
 * Covers the query behind the daily expiry sweep. The date arithmetic around it is
 * unit-tested; what needs a real database is that the Prisma filter actually selects
 * the right rows - in particular `renewalDate: { not: null, lt: now }`, which has to
 * exclude NULLs rather than treating them as "before now".
 */
describe('Membership expiry sweep', () => {
  const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  async function makeMember(
    prisma: any,
    email: string,
    renewalDate: Date | null,
    membershipStatus: string
  ) {
    const user = await TestUtils.createTestUser(prisma, email, 'MEMBER');
    const member = await TestUtils.createTestMember(prisma, user.id, `Biz ${email}`);
    return prisma.member.update({
      where: { id: member.id },
      data: { renewalDate, membershipStatus },
    });
  }

  it(
    'expires only active members whose term has ended',
    withEmptyTestDatabase(async ({ database }: any) => {
      const { prisma } = database;

      const lapsed = await makeMember(prisma, 'lapsed@test.test', daysFromNow(-1), 'ACTIVE');
      const current = await makeMember(prisma, 'current@test.test', daysFromNow(30), 'ACTIVE');
      const noDate = await makeMember(prisma, 'nodate@test.test', null, 'ACTIVE');
      const already = await makeMember(prisma, 'already@test.test', daysFromNow(-90), 'EXPIRED');
      const pending = await makeMember(prisma, 'pending@test.test', daysFromNow(-5), 'PENDING');

      const result = await expireLapsedMemberships();

      // Only the lapsed ACTIVE member is transitioned.
      expect(result.expired).toBe(1);
      expect(result.missingRenewalDate).toBe(1);

      const status = async (id: string) =>
        (await prisma.member.findUnique({ where: { id } }))?.membershipStatus;

      expect(await status(lapsed.id)).toBe('EXPIRED');
      expect(await status(current.id)).toBe('ACTIVE');
      // A null renewalDate must not be treated as "before now" and silently revoked.
      expect(await status(noDate.id)).toBe('ACTIVE');
      expect(await status(already.id)).toBe('EXPIRED');
      // Only ACTIVE members are swept; PENDING is left for the payment flow to resolve.
      expect(await status(pending.id)).toBe('PENDING');
    })
  );

  it(
    'is safe to run twice - the second pass expires nothing',
    withEmptyTestDatabase(async ({ database }: any) => {
      const { prisma } = database;
      await makeMember(prisma, 'twice@test.test', daysFromNow(-1), 'ACTIVE');

      const first = await expireLapsedMemberships();
      const second = await expireLapsedMemberships();

      expect(first.expired).toBe(1);
      expect(second.expired).toBe(0);
    })
  );

  it(
    'does not expire a membership on its renewal date, only after it',
    withEmptyTestDatabase(async ({ database }: any) => {
      const { prisma } = database;
      // No grace period, so the boundary is exact: still active at the instant the
      // term ends, expired once any time has passed.
      const future = await makeMember(prisma, 'boundary@test.test', daysFromNow(1), 'ACTIVE');

      const result = await expireLapsedMemberships();

      expect(result.expired).toBe(0);
      expect((await prisma.member.findUnique({ where: { id: future.id } }))?.membershipStatus)
        .toBe('ACTIVE');
    })
  );
});
