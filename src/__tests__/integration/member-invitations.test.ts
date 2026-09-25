import { TestUtils, withEmptyTestDatabase } from './helpers/test-utils';

const sendMemberInvitationEmail = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/basa-emails', () => ({
  INVITATION_LINK_DAYS: 7,
  sendMemberInvitationEmail: (...a: unknown[]) => sendMemberInvitationEmail(...a),
}));

import { listInvitableMembers, sendInvitations, INVITATION_ACTION } from '@/lib/member-invitations';

const DAY = 24 * 60 * 60 * 1000;

/**
 * Invitations go only to active members whose account has never had a password,
 * whatever ids the admin page sends; the link is a 7-day single-use reset token.
 */
describe('Member account invitations', () => {
  beforeEach(() => { sendMemberInvitationEmail.mockReset(); sendMemberInvitationEmail.mockResolvedValue(undefined); });

  async function person(prisma: any, email: string, o: { status?: string; claimed?: boolean } = {}) {
    const user = await prisma.user.create({
      data: {
        email, firstName: email.split('@')[0], role: 'GUEST',
        isActive: !!o.claimed, accountStatus: o.claimed ? 'ACTIVE' : 'INACTIVE',
        hashedPassword: o.claimed ? 'x' : null,
      },
    });
    await prisma.member.create({ data: { userId: user.id, membershipStatus: (o.status ?? 'ACTIVE') as any } });
    return user;
  }

  it(
    'sends a 7-day setup link to an unclaimed active member and records it',
    withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
      const admin = await TestUtils.createTestUser(prisma, `admin-${Math.random()}@test.test`, 'ADMIN');
      const u = await person(prisma, 'pending@test.test');

      const [r] = await sendInvitations([u.id], admin.id);

      expect(r).toMatchObject({ status: 'sent', email: 'pending@test.test' });
      const after = await prisma.user.findUnique({ where: { id: u.id } });
      expect(after.resetToken).toMatch(/^[a-f0-9]{64}$/);
      const days = (after.resetTokenExpiry.getTime() - Date.now()) / DAY;
      expect(days).toBeGreaterThan(6.9); expect(days).toBeLessThan(7.1);
      const url = sendMemberInvitationEmail.mock.calls[0][2];
      expect(url).toContain(`token=${after.resetToken}`);
      expect(url).toContain('claim=1');
      expect(await prisma.auditLog.count({ where: { action: INVITATION_ACTION, entityId: u.id, userId: admin.id } })).toBe(1);

      const list = await listInvitableMembers();
      expect(list.pending).toHaveLength(1);
      expect(list.pending[0]).toMatchObject({ userId: u.id, invitations: 1 });
      expect(list.pending[0].lastInvitedAt).not.toBeNull();
    })
  );

  it(
    'skips claimed accounts and inactive memberships, whatever the page sends',
    withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
      const admin = await TestUtils.createTestUser(prisma, `admin-${Math.random()}@test.test`, 'ADMIN');
      const claimed = await person(prisma, 'claimed@test.test', { claimed: true });
      const expired = await person(prisma, 'expired@test.test', { status: 'EXPIRED' });

      const results = await sendInvitations([claimed.id, expired.id, 'no-such-user'], admin.id);

      expect(results.map(r => r.status)).toEqual(['skipped', 'skipped', 'skipped']);
      expect(sendMemberInvitationEmail).not.toHaveBeenCalled();
      expect((await prisma.user.findUnique({ where: { id: claimed.id } })).resetToken).toBeNull();
      const list = await listInvitableMembers();
      expect(list.pending).toHaveLength(0);
      expect(list.setUp).toBe(1);
    })
  );

  it(
    'a second invitation replaces the first link',
    withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
      const admin = await TestUtils.createTestUser(prisma, `admin-${Math.random()}@test.test`, 'ADMIN');
      const u = await person(prisma, 'twice@test.test');
      await sendInvitations([u.id], admin.id);
      const first = (await prisma.user.findUnique({ where: { id: u.id } })).resetToken;
      await sendInvitations([u.id], admin.id);
      const second = (await prisma.user.findUnique({ where: { id: u.id } })).resetToken;
      expect(second).not.toBe(first);
      expect((await listInvitableMembers()).pending[0].invitations).toBe(2);
    })
  );

  it(
    'a failed send is reported and the rest still go out',
    withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
      const admin = await TestUtils.createTestUser(prisma, `admin-${Math.random()}@test.test`, 'ADMIN');
      const a = await person(prisma, 'a@test.test');
      const b = await person(prisma, 'b@test.test');
      sendMemberInvitationEmail.mockRejectedValueOnce(new Error('mailgun down'));

      const results = await sendInvitations([a.id, b.id], admin.id);

      expect(results.map(r => r.status)).toEqual(['failed', 'sent']);
      expect(await prisma.auditLog.count({ where: { action: INVITATION_ACTION } })).toBe(1);
    })
  );
});
