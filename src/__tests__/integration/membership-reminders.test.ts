/**
 * The sweep runs every day, so the thing that matters is that it cannot send the
 * same notice twice - and that it never mails the 135 lapsed contacts the PMPro
 * import brought in (#82, #58).
 *
 * Mailgun is mocked: the acceptance criterion is "no mail is sent by an importer
 * or a re-run", and a test that could actually send would be a poor way to check it.
 */
jest.mock('@/lib/basa-emails', () => ({
  sendMembershipRenewalReminderEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'test' }),
  sendMembershipExpiredEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'test' }),
}));

import { TestUtils, withEmptyTestDatabase } from './helpers/test-utils';
import { sendDueRenewalNotices } from '@/lib/membership-reminders';
import { sendMembershipRenewalReminderEmail, sendMembershipExpiredEmail } from '@/lib/basa-emails';

const reminderMock = sendMembershipRenewalReminderEmail as jest.Mock;
const expiredMock = sendMembershipExpiredEmail as jest.Mock;

describe('Renewal notices', () => {
  const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  beforeEach(() => {
    reminderMock.mockClear();
    expiredMock.mockClear();
  });

  async function makeMember(
    prisma: any, email: string, renewalDate: Date | null, membershipStatus: string
  ) {
    const user = await TestUtils.createTestUser(prisma, email, 'MEMBER');
    const member = await TestUtils.createTestMember(prisma, user.id, `Biz ${email}`);
    return prisma.member.update({
      where: { id: member.id },
      data: { renewalDate, membershipStatus },
    });
  }

  it(
    'sends one notice per member and nothing on a second run the same day',
    withEmptyTestDatabase(async ({ database }: any) => {
      const { prisma } = database;

      await makeMember(prisma, 'thirty@test.test', daysFromNow(30), 'ACTIVE');
      await makeMember(prisma, 'seven@test.test', daysFromNow(7), 'ACTIVE');
      await makeMember(prisma, 'tomorrow@test.test', daysFromNow(1), 'ACTIVE');
      // Outside every window, and one that can never be reminded at all.
      await makeMember(prisma, 'faroff@test.test', daysFromNow(90), 'ACTIVE');
      await makeMember(prisma, 'nodate@test.test', null, 'ACTIVE');

      const first = await sendDueRenewalNotices();
      expect(first.remindersSent).toBe(3);
      expect(first.missingRenewalDate).toBe(1);
      expect(reminderMock).toHaveBeenCalledTimes(3);

      // A second run the same day is the case that a daily cron actually hits.
      const second = await sendDueRenewalNotices();
      expect(second.remindersSent).toBe(0);
      expect(second.alreadySent).toBe(3);
      expect(reminderMock).toHaveBeenCalledTimes(3);
    })
  );

  it(
    'quotes the real days remaining, not the interval it matched',
    withEmptyTestDatabase(async ({ database }: any) => {
      const { prisma } = database;
      // Three days out falls in the 7-day bucket after a missed run.
      await makeMember(prisma, 'three@test.test', daysFromNow(3), 'ACTIVE');

      await sendDueRenewalNotices();

      expect(reminderMock).toHaveBeenCalledTimes(1);
      const [, , , daysRemaining] = reminderMock.mock.calls[0];
      expect(daysRemaining).toBe(3);
    })
  );

  it(
    'opens a fresh set of notices once the member renews',
    withEmptyTestDatabase(async ({ database }: any) => {
      const { prisma } = database;
      const member = await makeMember(prisma, 'renewer@test.test', daysFromNow(7), 'ACTIVE');

      await sendDueRenewalNotices();
      expect(reminderMock).toHaveBeenCalledTimes(1);

      // Renewal moves the date on a year; a year later they hear from us again.
      await prisma.member.update({
        where: { id: member.id },
        data: { renewalDate: daysFromNow(7 + 365) },
      });
      await sendDueRenewalNotices();
      expect(reminderMock).toHaveBeenCalledTimes(1); // too far out yet

      await prisma.member.update({
        where: { id: member.id },
        data: { renewalDate: daysFromNow(7) },
      });
      await sendDueRenewalNotices();
      expect(reminderMock).toHaveBeenCalledTimes(1); // same cycle as the first send

      await prisma.member.update({
        where: { id: member.id },
        data: { renewalDate: daysFromNow(6) },
      });
      const later = await sendDueRenewalNotices();
      expect(later.remindersSent).toBe(1); // a different date is a different cycle
    })
  );

  it(
    'tells a member who just lapsed, and never one who lapsed years ago',
    withEmptyTestDatabase(async ({ database }: any) => {
      const { prisma } = database;

      await makeMember(prisma, 'justlapsed@test.test', daysFromNow(-1), 'EXPIRED');
      // What the PMPro import produced: EXPIRED, with a renewal date from 2022.
      await makeMember(prisma, 'legacy@test.test', daysFromNow(-1200), 'EXPIRED');
      await makeMember(prisma, 'legacy2@test.test', daysFromNow(-400), 'EXPIRED');

      const result = await sendDueRenewalNotices();

      expect(result.expiredNoticesSent).toBe(1);
      expect(expiredMock).toHaveBeenCalledTimes(1);
      expect(expiredMock.mock.calls[0][0]).toBe('justlapsed@test.test');
    })
  );

  it(
    'records a claim before sending, so a failed send is not retried daily',
    withEmptyTestDatabase(async ({ database }: any) => {
      const { prisma } = database;
      await makeMember(prisma, 'bounces@test.test', daysFromNow(7), 'ACTIVE');
      reminderMock.mockResolvedValueOnce({ success: false, error: 'Mailgun is down' });

      const first = await sendDueRenewalNotices();
      expect(first.failed).toBe(1);
      expect(first.remindersSent).toBe(0);

      // Tomorrow's run must not try again: a broken mail key would otherwise turn
      // into a flood aimed at whoever happens to be inside a window.
      const second = await sendDueRenewalNotices();
      expect(second.remindersSent).toBe(0);
      expect(second.alreadySent).toBe(1);
    })
  );
});
