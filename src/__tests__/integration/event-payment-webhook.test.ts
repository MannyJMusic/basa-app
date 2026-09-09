import { TestUtils, withEmptyTestDatabase } from './helpers/test-utils';
import { handleWebhookEvent } from '@/lib/stripe-webhook-handlers';
import { soldCounts } from '@/lib/ticket-tiers';

/**
 * A registration only becomes CONFIRMED when Stripe says the money arrived, and a
 * registration that never gets paid has to give its seats back. Both are things the
 * payment route deliberately does not do itself, so if the webhook is wrong the app
 * either sells seats it never charged for or holds seats forever against failed cards.
 *
 * Tested against a real database because all of it is about aggregate seat counts
 * and unique-constraint behaviour.
 */
describe('Stripe webhook: event registrations', () => {
  async function makeEventWithTier(prisma: any, capacity: number | null = null) {
    const user = await TestUtils.createTestUser(prisma, `org-${Date.now()}-${Math.random()}@test.test`, 'ADMIN');
    const member = await TestUtils.createTestMember(prisma, user.id, 'Org');
    const organizer = await TestUtils.createTestOrganizer(prisma, 'Org', member.id);
    const event = await TestUtils.createTestEvent(prisma, organizer.id, 'Webhook Event');
    await prisma.event.update({ where: { id: event.id }, data: { capacity } });
    const tier = await prisma.ticketTier.create({
      data: { eventId: event.id, name: 'Standard', price: 50 },
    });
    return { event, tier };
  }

  async function makePendingRegistration(
    prisma: any,
    eventId: string,
    tierId: string,
    paymentIntentId: string,
    quantity = 2
  ) {
    const reg = await prisma.eventRegistration.create({
      data: {
        eventId,
        name: 'Guest Buyer',
        email: 'guest@test.test',
        ticketCount: quantity,
        totalAmount: 50 * quantity,
        status: 'PENDING',
        paymentIntentId,
      },
    });
    await prisma.eventRegistrationItem.create({
      data: { registrationId: reg.id, ticketTierId: tierId, quantity, unitPrice: 50 },
    });
    return reg;
  }

  const succeeded = (paymentIntentId: string, eventId: string) => ({
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: paymentIntentId,
        amount: 10000,
        currency: 'usd',
        metadata: { type: 'event', eventId, tickets: '2' },
      },
    },
  });

  it(
    'confirms a pending registration when the payment succeeds',
    withEmptyTestDatabase(async ({ database }: any) => {
      const { prisma } = database;
      const { event, tier } = await makeEventWithTier(prisma);
      const reg = await makePendingRegistration(prisma, event.id, tier.id, 'pi_confirm_1');

      await handleWebhookEvent(succeeded('pi_confirm_1', event.id));

      const after = await prisma.eventRegistration.findUnique({ where: { id: reg.id } });
      expect(after.status).toBe('CONFIRMED');
    })
  );

  it(
    'is idempotent: a redelivered webhook does not duplicate the audit trail',
    withEmptyTestDatabase(async ({ database }: any) => {
      const { prisma } = database;
      const { event, tier } = await makeEventWithTier(prisma);
      await makePendingRegistration(prisma, event.id, tier.id, 'pi_confirm_2');

      // Stripe redelivers on any non-2xx, and on its own schedule besides.
      await handleWebhookEvent(succeeded('pi_confirm_2', event.id));
      await handleWebhookEvent(succeeded('pi_confirm_2', event.id));
      await handleWebhookEvent(succeeded('pi_confirm_2', event.id));

      const audits = await prisma.auditLog.count({
        where: { action: 'EVENT_PAYMENT_COMPLETED' },
      });
      expect(audits).toBe(1);
    })
  );

  it(
    'writes an audit row for a guest purchase, which has no user',
    withEmptyTestDatabase(async ({ database }: any) => {
      const { prisma } = database;
      const { event, tier } = await makeEventWithTier(prisma);
      await makePendingRegistration(prisma, event.id, tier.id, 'pi_guest_1');

      // AuditLog.userId used to be NOT NULL, which made this impossible - and with
      // members no longer signing in to buy tickets, this is the common case.
      await handleWebhookEvent(succeeded('pi_guest_1', event.id));

      const audit = await prisma.auditLog.findFirst({
        where: { action: 'EVENT_PAYMENT_COMPLETED' },
      });
      expect(audit).not.toBeNull();
      expect(audit.userId).toBeNull();
    })
  );

  it(
    'releases the seats when the payment fails',
    withEmptyTestDatabase(async ({ database }: any) => {
      const { prisma } = database;
      const { event, tier } = await makeEventWithTier(prisma, 10);
      await makePendingRegistration(prisma, event.id, tier.id, 'pi_fail_1', 3);

      expect((await soldCounts(event.id)).total).toBe(3);

      await handleWebhookEvent({
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_fail_1',
            metadata: { type: 'event', eventId: event.id },
            last_payment_error: { message: 'card_declined' },
          },
        },
      });

      // The seats must actually come back, not just the status change.
      expect((await soldCounts(event.id)).total).toBe(0);
    })
  );

  it(
    'releases the seats when an abandoned intent is cancelled',
    withEmptyTestDatabase(async ({ database }: any) => {
      const { prisma } = database;
      const { event, tier } = await makeEventWithTier(prisma, 10);
      const reg = await makePendingRegistration(prisma, event.id, tier.id, 'pi_cancel_1', 2);

      await handleWebhookEvent({
        type: 'payment_intent.canceled',
        data: { object: { id: 'pi_cancel_1', metadata: { type: 'event', eventId: event.id } } },
      });

      const after = await prisma.eventRegistration.findUnique({ where: { id: reg.id } });
      expect(after.status).toBe('CANCELLED');
      expect((await soldCounts(event.id)).total).toBe(0);
    })
  );

  it(
    'never cancels an already confirmed registration',
    withEmptyTestDatabase(async ({ database }: any) => {
      const { prisma } = database;
      const { event, tier } = await makeEventWithTier(prisma, 10);
      const reg = await makePendingRegistration(prisma, event.id, tier.id, 'pi_paid_then_fail', 2);

      await handleWebhookEvent(succeeded('pi_paid_then_fail', event.id));

      // A failure event arriving after a successful charge is a refund or dispute
      // question for a human, not grounds for silently voiding a paid ticket.
      await handleWebhookEvent({
        type: 'payment_intent.payment_failed',
        data: { object: { id: 'pi_paid_then_fail', metadata: { type: 'event', eventId: event.id } } },
      });

      const after = await prisma.eventRegistration.findUnique({ where: { id: reg.id } });
      expect(after.status).toBe('CONFIRMED');
    })
  );

  it(
    'does not touch registrations belonging to a different payment',
    withEmptyTestDatabase(async ({ database }: any) => {
      const { prisma } = database;
      const { event, tier } = await makeEventWithTier(prisma, 20);
      const mine = await makePendingRegistration(prisma, event.id, tier.id, 'pi_mine', 2);
      const theirs = await makePendingRegistration(prisma, event.id, tier.id, 'pi_theirs', 4);

      await handleWebhookEvent(succeeded('pi_mine', event.id));

      const a = await prisma.eventRegistration.findUnique({ where: { id: mine.id } });
      const b = await prisma.eventRegistration.findUnique({ where: { id: theirs.id } });
      expect(a.status).toBe('CONFIRMED');
      expect(b.status).toBe('PENDING');
    })
  );

  it(
    'refuses two registrations sharing one payment intent',
    withEmptyTestDatabase(async ({ database }: any) => {
      const { prisma } = database;
      const { event, tier } = await makeEventWithTier(prisma);
      await makePendingRegistration(prisma, event.id, tier.id, 'pi_unique', 1);

      // The unique index is what lets the webhook look a registration up by intent
      // and trust it found the only one.
      await expect(
        makePendingRegistration(prisma, event.id, tier.id, 'pi_unique', 1)
      ).rejects.toThrow();
    })
  );
});
