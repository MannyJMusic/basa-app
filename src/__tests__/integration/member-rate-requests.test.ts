import { TestUtils, withEmptyTestDatabase } from './helpers/test-utils';

// Stripe is scripted: the card hold is what the admin's decision settles.
const retrieve = jest.fn();
const capture = jest.fn();
const cancel = jest.fn();
jest.mock('@/lib/stripe', () => ({
  getStripe: () => ({ paymentIntents: { retrieve, capture, cancel } }),
  stripe: { paymentIntents: { retrieve, capture, cancel } },
}));

const sendEventTicketEmail = jest.fn().mockResolvedValue(undefined);
const sendMemberRateRequestAdminEmail = jest.fn().mockResolvedValue(undefined);
const sendMemberRateDecisionEmail = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/basa-emails', () => ({
  sendEventTicketEmail: (...a: unknown[]) => sendEventTicketEmail(...a),
  sendMemberRateRequestAdminEmail: (...a: unknown[]) => sendMemberRateRequestAdminEmail(...a),
  sendMemberRateDecisionEmail: (...a: unknown[]) => sendMemberRateDecisionEmail(...a),
}));

import { handleWebhookEvent } from '@/lib/stripe-webhook-handlers';
import { releaseStaleHolds } from '@/lib/stale-holds';
import {
  decideMemberRateRequest,
  expireMemberRateRequests,
  MemberRateRequestError,
  DECISION_DAYS,
} from '@/lib/member-rate-requests';

const DAY = 24 * 60 * 60 * 1000;
const hex = () => Array.from({ length: 64 }, () => 'abcdef0123456789'[Math.floor(Math.random() * 16)]).join('');

/**
 * A guest who says they are a member: the card is authorized for the non-member
 * price, and an admin's decision captures either the member total or the whole
 * hold. Real database, because the decision is claimed with a conditional update
 * and the registration's lines are rewritten to what was charged.
 */
describe('Member-rate verification', () => {
  beforeEach(() => {
    [retrieve, capture, cancel, sendEventTicketEmail, sendMemberRateRequestAdminEmail, sendMemberRateDecisionEmail].forEach(m => m.mockClear());
    capture.mockResolvedValue({ status: 'succeeded' });
    cancel.mockResolvedValue({ status: 'canceled' });
  });

  /** Two tickets on the member tier, held at the paired $35, member rate $25. */
  async function fixture(prisma: any, opts: { registrationStatus?: 'PENDING' | 'CONFIRMED'; requestStatus?: string; deadlineAt?: Date | null; ageMinutes?: number } = {}) {
    const admin = await TestUtils.createTestUser(prisma, `admin-${Math.random()}@test.test`, 'ADMIN');
    const member = await TestUtils.createTestMember(prisma, admin.id, 'Org');
    const organizer = await TestUtils.createTestOrganizer(prisma, 'Org', member.id);
    const event = await TestUtils.createTestEvent(prisma, organizer.id, 'Mixer');
    const non = await prisma.ticketTier.create({ data: { eventId: event.id, name: 'Future Member', price: 35, audience: 'NON_MEMBER' } });
    const mem = await prisma.ticketTier.create({ data: { eventId: event.id, name: 'Member Rate', price: 25, audience: 'MEMBER', nonMemberTierId: non.id } });
    const pi = `pi_test_${Math.random().toString(36).slice(2)}`;
    const reg = await prisma.eventRegistration.create({
      data: {
        eventId: event.id, name: 'Maybe Member', email: `buyer-${Math.random()}@test.test`, ticketCount: 2, totalAmount: 70,
        status: opts.registrationStatus ?? 'PENDING', paymentIntentId: pi, ticketToken: hex(),
        createdAt: new Date(Date.now() - (opts.ageMinutes ?? 0) * 60_000),
        items: { create: [{ ticketTierId: mem.id, quantity: 2, unitPrice: 35, memberUnitPrice: 25 }] },
        memberRateRequest: {
          create: {
            heldCents: 7000, memberCents: 5000,
            status: (opts.requestStatus ?? 'AWAITING_PAYMENT') as any,
            ...(opts.deadlineAt !== undefined ? { deadlineAt: opts.deadlineAt, authorizedAt: new Date() } : {}),
          },
        },
      },
      include: { memberRateRequest: true, items: true },
    });
    return { admin, event, non, mem, reg, pi, request: reg.memberRateRequest! };
  }

  const authorized = (pi: string) => ({ id: pi, status: 'requires_capture', amount: 7000, currency: 'usd', metadata: { type: 'event' } });

  it(
    'confirms the seat when the card is authorized, and asks the admins once',
    withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
      const { reg, pi, request, admin } = await fixture(prisma);
      const event = { id: 'evt_1', type: 'payment_intent.amount_capturable_updated', data: { object: authorized(pi) } };

      await handleWebhookEvent(event);
      await handleWebhookEvent(event); // Stripe redelivers

      expect((await prisma.eventRegistration.findUnique({ where: { id: reg.id } })).status).toBe('CONFIRMED');
      const after = await prisma.memberRateRequest.findUnique({ where: { id: request.id } });
      expect(after.status).toBe('PENDING');
      expect(after.deadlineAt.getTime() - after.authorizedAt.getTime()).toBe(DECISION_DAYS * DAY);

      expect(sendMemberRateRequestAdminEmail).toHaveBeenCalledTimes(1);
      expect(sendMemberRateRequestAdminEmail.mock.calls[0][0]).toContain(admin.email);
      expect(sendMemberRateRequestAdminEmail.mock.calls[0][1]).toMatchObject({ requestId: request.id, heldCents: 7000, memberCents: 5000, tickets: 2 });
      // The buyer's ticket email explains the hold instead of the usual receipt.
      expect(sendEventTicketEmail).toHaveBeenCalledTimes(1);
      expect(sendEventTicketEmail.mock.calls[0][1]).toMatchObject({ pendingMemberRate: { heldCents: 7000, memberCents: 5000 } });
      expect(capture).not.toHaveBeenCalled();
    })
  );

  it(
    'the stale-hold sweep confirms an authorized request whose webhook was missed',
    withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
      const { reg, pi, request } = await fixture(prisma, { ageMinutes: 45 });
      retrieve.mockResolvedValue(authorized(pi));

      const result = await releaseStaleHolds();

      expect(result).toMatchObject({ confirmed: 1, released: 0, failed: 0 });
      expect(cancel).not.toHaveBeenCalled();
      expect((await prisma.eventRegistration.findUnique({ where: { id: reg.id } })).status).toBe('CONFIRMED');
      expect((await prisma.memberRateRequest.findUnique({ where: { id: request.id } })).status).toBe('PENDING');
      expect(sendMemberRateRequestAdminEmail).toHaveBeenCalledTimes(1);
    })
  );

  it(
    'approve captures only the member total and records it',
    withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
      const { reg, pi, request, admin, mem } = await fixture(prisma, { registrationStatus: 'CONFIRMED', requestStatus: 'PENDING', deadlineAt: new Date(Date.now() + DAY) });
      retrieve.mockResolvedValue(authorized(pi));

      const result = await decideMemberRateRequest(request.id, 'approve', admin.id, 'On the 2025 roster');

      expect(result).toEqual({ outcome: 'APPROVED', chargedCents: 5000, membership: null });
      expect(capture).toHaveBeenCalledWith(pi, { amount_to_capture: 5000 }, { idempotencyKey: `mrr-settle:${request.id}` });
      const after = await prisma.memberRateRequest.findUnique({ where: { id: request.id } });
      expect(after).toMatchObject({ status: 'APPROVED', chargedCents: 5000, decidedById: admin.id, decisionNote: 'On the 2025 roster' });
      const regAfter = await prisma.eventRegistration.findUnique({ where: { id: reg.id }, include: { items: true } });
      expect(Number(regAfter.totalAmount)).toBe(50);
      expect(Number(regAfter.items[0].unitPrice)).toBe(25);
      expect(regAfter.items[0].ticketTierId).toBe(mem.id);
      expect(sendMemberRateDecisionEmail.mock.calls[0][1]).toMatchObject({ outcome: 'APPROVED', chargedCents: 5000 });
    })
  );

  it(
    'deny captures the whole hold and moves the ticket to the non-member tier',
    withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
      const { reg, pi, request, admin, non } = await fixture(prisma, { registrationStatus: 'CONFIRMED', requestStatus: 'PENDING', deadlineAt: new Date(Date.now() + DAY) });
      retrieve.mockResolvedValue(authorized(pi));

      await decideMemberRateRequest(request.id, 'deny', admin.id);

      expect(capture).toHaveBeenCalledWith(pi, { amount_to_capture: 7000 }, expect.anything());
      const regAfter = await prisma.eventRegistration.findUnique({ where: { id: reg.id }, include: { items: true } });
      expect(Number(regAfter.totalAmount)).toBe(70);
      expect(Number(regAfter.items[0].unitPrice)).toBe(35);
      expect(regAfter.items[0].ticketTierId).toBe(non.id);
      expect((await prisma.memberRateRequest.findUnique({ where: { id: request.id } })).status).toBe('DENIED');
      expect(sendMemberRateDecisionEmail.mock.calls[0][1]).toMatchObject({ outcome: 'DENIED', chargedCents: 7000 });
    })
  );

  it(
    'a second decision is refused and charges nothing more',
    withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
      const { pi, request, admin } = await fixture(prisma, { registrationStatus: 'CONFIRMED', requestStatus: 'PENDING', deadlineAt: new Date(Date.now() + DAY) });
      retrieve.mockResolvedValue(authorized(pi));

      const [a, b] = await Promise.allSettled([
        decideMemberRateRequest(request.id, 'approve', admin.id),
        decideMemberRateRequest(request.id, 'deny', admin.id),
      ]);

      const ok = [a, b].filter(r => r.status === 'fulfilled');
      const refused = [a, b].filter(r => r.status === 'rejected') as PromiseRejectedResult[];
      expect(ok).toHaveLength(1);
      expect(refused).toHaveLength(1);
      expect(refused[0].reason).toBeInstanceOf(MemberRateRequestError);
      expect(refused[0].reason.message).toMatch(/already/);
      expect(capture).toHaveBeenCalledTimes(1);
    })
  );

  it(
    'a Stripe failure leaves the request open and nothing recorded as charged',
    withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
      const { pi, request, admin } = await fixture(prisma, { registrationStatus: 'CONFIRMED', requestStatus: 'PENDING', deadlineAt: new Date(Date.now() + DAY) });
      retrieve.mockResolvedValue(authorized(pi));
      capture.mockRejectedValueOnce(new Error('Stripe is down'));

      await expect(decideMemberRateRequest(request.id, 'approve', admin.id)).rejects.toThrow(/Nothing was charged/);

      const after = await prisma.memberRateRequest.findUnique({ where: { id: request.id } });
      expect(after).toMatchObject({ status: 'PENDING', chargedCents: null, decidedById: null });
      expect(sendMemberRateDecisionEmail).not.toHaveBeenCalled();
    })
  );

  it(
    'refuses to settle a hold that is no longer open',
    withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
      const { pi, request, admin } = await fixture(prisma, { registrationStatus: 'CONFIRMED', requestStatus: 'PENDING', deadlineAt: new Date(Date.now() + DAY) });
      retrieve.mockResolvedValue({ ...authorized(pi), status: 'canceled' });

      await expect(decideMemberRateRequest(request.id, 'approve', admin.id)).rejects.toThrow(/no longer open/);
      expect(capture).not.toHaveBeenCalled();
      expect((await prisma.memberRateRequest.findUnique({ where: { id: request.id } })).status).toBe('PENDING');
    })
  );

  it(
    'charges the non-member rate on requests nobody decided in time, and only those',
    withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
      const due = await fixture(prisma, { registrationStatus: 'CONFIRMED', requestStatus: 'PENDING', deadlineAt: new Date(Date.now() - 60_000) });
      const notYet = await fixture(prisma, { registrationStatus: 'CONFIRMED', requestStatus: 'PENDING', deadlineAt: new Date(Date.now() + DAY) });
      retrieve.mockImplementation(async (id: string) => authorized(id));

      const result = await expireMemberRateRequests();

      expect(result).toEqual({ expired: 1, failed: 0 });
      expect(capture).toHaveBeenCalledWith(due.pi, { amount_to_capture: 7000 }, expect.anything());
      expect((await prisma.memberRateRequest.findUnique({ where: { id: due.request.id } }))).toMatchObject({ status: 'EXPIRED', decidedById: null, chargedCents: 7000 });
      expect((await prisma.memberRateRequest.findUnique({ where: { id: notYet.request.id } })).status).toBe('PENDING');
      expect(sendMemberRateDecisionEmail.mock.calls[0][1]).toMatchObject({ outcome: 'EXPIRED' });
    })
  );

  it(
    'an abandoned checkout cancels its request without charging',
    withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
      const { reg, pi, request } = await fixture(prisma, { ageMinutes: 45 });
      retrieve.mockResolvedValue({ id: pi, status: 'requires_payment_method', metadata: { type: 'event' } });

      await releaseStaleHolds();

      expect((await prisma.eventRegistration.findUnique({ where: { id: reg.id } })).status).toBe('CANCELLED');
      expect((await prisma.memberRateRequest.findUnique({ where: { id: request.id } })).status).toBe('CANCELLED');
      expect(sendMemberRateRequestAdminEmail).not.toHaveBeenCalled();
      expect(capture).not.toHaveBeenCalled();
    })
  );

  describe('approve and make them a member', () => {
    const pending = (prisma: any) => fixture(prisma, { registrationStatus: 'CONFIRMED', requestStatus: 'PENDING', deadlineAt: new Date(Date.now() + DAY) });

    it(
      'creates a claimable account with an active membership and links the ticket',
      withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
        const { reg, pi, request, admin } = await pending(prisma);
        retrieve.mockResolvedValue(authorized(pi));

        const result = await decideMemberRateRequest(request.id, 'approve', admin.id, undefined, { tier: 'ASSOCIATE_MEMBER' });

        expect(result.membership).toMatchObject({ status: 'created' });
        const user = await prisma.user.findFirst({ where: { email: reg.email }, include: { member: true } });
        expect(user).toMatchObject({ hashedPassword: null, accountStatus: 'INACTIVE', isActive: false, firstName: 'Maybe', lastName: 'Member' });
        expect(user.member).toMatchObject({ membershipStatus: 'ACTIVE', membershipTier: 'ASSOCIATE_MEMBER' });
        expect(user.member.renewalDate.getTime()).toBeGreaterThan(Date.now() + 360 * DAY);
        expect((await prisma.eventRegistration.findUnique({ where: { id: reg.id } })).memberId).toBe(user.member.id);
        expect(await prisma.auditLog.count({ where: { action: 'MEMBERSHIP_ACTIVATED_MANUALLY', entityId: user.member.id } })).toBe(1);
      })
    );

    it(
      'reactivates an expired membership on the same email',
      withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
        const { reg, pi, request, admin } = await pending(prisma);
        const existing = await prisma.user.create({ data: { email: reg.email.toUpperCase(), role: 'GUEST', member: { create: { membershipStatus: 'EXPIRED' } } }, include: { member: true } });
        retrieve.mockResolvedValue(authorized(pi));

        const result = await decideMemberRateRequest(request.id, 'approve', admin.id, undefined, { renewalDate: new Date('2027-06-30T12:00:00Z') });

        expect(result.membership).toMatchObject({ status: 'activated', userId: existing.id });
        const m = await prisma.member.findUnique({ where: { id: existing.member.id } });
        expect(m.membershipStatus).toBe('ACTIVE');
        expect(m.renewalDate.toISOString()).toBe('2027-06-30T12:00:00.000Z');
        expect(await prisma.user.count({ where: { email: { equals: reg.email, mode: 'insensitive' } } })).toBe(1);
      })
    );

    it(
      'leaves an active membership alone',
      withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
        const { reg, pi, request, admin } = await pending(prisma);
        const renewal = new Date('2028-01-01T00:00:00Z');
        const existing = await prisma.user.create({ data: { email: reg.email, role: 'GUEST', member: { create: { membershipStatus: 'ACTIVE', renewalDate: renewal, membershipTier: 'TRIO_MEMBER' } } }, include: { member: true } });
        retrieve.mockResolvedValue(authorized(pi));

        const result = await decideMemberRateRequest(request.id, 'approve', admin.id, undefined, { tier: 'MEETING_MEMBER' });

        expect(result.membership).toMatchObject({ status: 'already_active' });
        const m = await prisma.member.findUnique({ where: { id: existing.member.id } });
        expect(m).toMatchObject({ membershipTier: 'TRIO_MEMBER' });
        expect(m.renewalDate.toISOString()).toBe(renewal.toISOString());
      })
    );

    it(
      'a denial never touches membership',
      withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
        const { reg, pi, request, admin } = await pending(prisma);
        retrieve.mockResolvedValue(authorized(pi));

        const result = await decideMemberRateRequest(request.id, 'deny', admin.id, undefined, { tier: 'ASSOCIATE_MEMBER' });

        expect(result.membership).toBeNull();
        expect(await prisma.user.count({ where: { email: reg.email } })).toBe(0);
      })
    );
  });
});

