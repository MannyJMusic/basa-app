import { withEmptyTestDatabase } from './helpers/test-utils';

const confirmMail = jest.fn().mockResolvedValue(undefined);
const noticeMail = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/basa-emails', () => ({
  EMAIL_CHANGE_LINK_HOURS: 24,
  sendEmailChangeConfirmationEmail: (...a: unknown[]) => confirmMail(...a),
  sendEmailChangeNoticeEmail: (...a: unknown[]) => noticeMail(...a),
}));

import { requestEmailChange, confirmEmailChange, EmailChangeError } from '@/lib/email-change';
import { withoutSecrets } from '@/lib/user-safe';

/**
 * 2026-09-22 audit, M-A8: the profile form wrote a new email straight onto the
 * account. Now it is pending until the link sent to the new address is used.
 */
describe('Changing your email address', () => {
  beforeEach(() => { confirmMail.mockClear(); noticeMail.mockClear(); });

  const user = (prisma: any, email: string) =>
    prisma.user.create({ data: { email, firstName: 'Pat', role: 'MEMBER', isActive: true, accountStatus: 'ACTIVE', hashedPassword: 'h' } });
  const tokenFrom = () => new URL(confirmMail.mock.calls[0][2]).searchParams.get('token')!;

  it(
    'a request changes nothing yet, and emails both addresses',
    withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
      const u = await user(prisma, 'old@test.test');
      const pending = await requestEmailChange(u.id, ' New@Test.test ');
      expect(pending).toBe('new@test.test');
      const after = await prisma.user.findUnique({ where: { id: u.id } });
      expect(after).toMatchObject({ email: 'old@test.test', pendingEmail: 'new@test.test' });
      expect(after.emailChangeToken).toMatch(/^[a-f0-9]{64}$/);
      expect(confirmMail.mock.calls[0][0]).toBe('new@test.test');
      expect(confirmMail.mock.calls[0][2]).toContain('/auth/confirm-email?token=');
      expect(noticeMail.mock.calls[0][0]).toBe('old@test.test');
    })
  );

  it(
    'confirming applies it once, verifies the address and ends every session',
    withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
      const u = await user(prisma, 'old@test.test');
      await requestEmailChange(u.id, 'new@test.test');
      const token = tokenFrom();

      await expect(confirmEmailChange(token)).resolves.toEqual({ email: 'new@test.test' });
      const after = await prisma.user.findUnique({ where: { id: u.id } });
      expect(after).toMatchObject({ email: 'new@test.test', pendingEmail: null, emailChangeToken: null });
      expect(after.emailVerified).not.toBeNull();
      expect(after.sessionsInvalidBefore).not.toBeNull();
      expect(await prisma.auditLog.count({ where: { action: 'EMAIL_CHANGED', entityId: u.id } })).toBe(1);

      await expect(confirmEmailChange(token)).rejects.toThrow(/not valid or has already been used/);
    })
  );

  it(
    'refuses an address another account uses, now or by the time the link is used',
    withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
      const u = await user(prisma, 'old@test.test');
      await user(prisma, 'taken@test.test');
      await expect(requestEmailChange(u.id, 'TAKEN@test.test')).rejects.toBeInstanceOf(EmailChangeError);
      await expect(requestEmailChange(u.id, 'old@test.test')).rejects.toThrow(/already your email/);

      await requestEmailChange(u.id, 'later@test.test');
      const token = tokenFrom();
      await user(prisma, 'Later@test.test');
      await expect(confirmEmailChange(token)).rejects.toThrow(/now used by another account/);
      expect((await prisma.user.findUnique({ where: { id: u.id } }))).toMatchObject({ email: 'old@test.test', pendingEmail: null });
    })
  );

  it(
    'refuses an expired link and a non-string token',
    withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
      const u = await user(prisma, 'old@test.test');
      await requestEmailChange(u.id, 'new@test.test');
      await prisma.user.update({ where: { id: u.id }, data: { emailChangeTokenExpiry: new Date(Date.now() - 1000) } });
      await expect(confirmEmailChange(tokenFrom())).rejects.toThrow(/expired/);
      await expect(confirmEmailChange({ not: '' })).rejects.toThrow(/not valid/);
      expect((await prisma.user.findUnique({ where: { id: u.id } })).email).toBe('old@test.test');
    })
  );

  it('withoutSecrets drops the password hash and every token', () => {
    const safe = withoutSecrets({ id: 'u', email: 'e', hashedPassword: 'h', resetToken: 'r', resetTokenExpiry: 1, verificationToken: 'v', verificationTokenExpiry: 1, emailChangeToken: 'c', emailChangeTokenExpiry: 1, pendingEmail: 'p' });
    expect(safe).toEqual({ id: 'u', email: 'e', pendingEmail: 'p' });
  });
});
