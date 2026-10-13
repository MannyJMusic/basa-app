import { withEmptyTestDatabase } from './helpers/test-utils';
import { loadTransactions } from '@/lib/admin-payments';

/**
 * The Payment Management page reads three tables and merges them. This runs the
 * real queries so a wrong select or relation name fails here, not on the page.
 */
describe('Admin payments data', () => {
  it(
    'merges membership payments, ticket sales and failures, each with what was paid for',
    withEmptyTestDatabase(async ({ database: { prisma } }: any) => {
      const user = await prisma.user.create({ data: { email: 'larry@test.test', firstName: 'Larry', lastName: 'Silva', role: 'MEMBER', accountStatus: 'ACTIVE' } });
      await prisma.member.create({
        data: { userId: user.id, membershipStatus: 'ACTIVE', businessName: 'Heineken USA', membershipTier: 'MIXER_MEMBER', renewalDate: new Date('2027-10-03T05:00:00Z') },
      });
      await prisma.payment.create({
        data: {
          userId: user.id, amount: 199000, status: 'COMPLETED', paymentMethod: 'CREDIT_CARD', stripePaymentIntentId: 'pi_member1',
          metadata: { kind: 'membership', tier: 'MIXER_MEMBER', subscriptionId: 'sub_1', dedupeKey: 'cs_1' },
        },
      });

      const event = await prisma.event.create({
        data: {
          title: 'Taco Tuesday', slug: 'taco-tuesday-pay', description: 'd', location: 'Venue', category: 'NETWORKING', status: 'PUBLISHED',
          startDate: new Date('2026-11-17T14:00:00Z'), endDate: new Date('2026-11-17T16:00:00Z'),
        },
      });
      const tier = await prisma.ticketTier.create({ data: { eventId: event.id, name: 'Member', price: 20 } });
      const reg = await prisma.eventRegistration.create({
        data: {
          eventId: event.id, name: 'Pat Buyer', email: 'pat@test.test', company: 'Acme', ticketCount: 2, totalAmount: 40, status: 'CONFIRMED',
          paymentIntentId: 'pi_tickets1', attendees: [{ name: 'Pat Buyer' }, { name: 'Lee Guest' }],
        },
      });
      await prisma.eventRegistrationItem.create({ data: { registrationId: reg.id, ticketTierId: tier.id, quantity: 2, unitPrice: 20 } });
      // Free registrations (no Stripe payment) are not payments.
      await prisma.eventRegistration.create({ data: { eventId: event.id, name: 'Free', email: 'free@test.test', totalAmount: 0, status: 'CONFIRMED' } });

      await prisma.auditLog.create({
        data: {
          userId: user.id, action: 'MEMBERSHIP_PAYMENT_FAILED', entityType: 'PAYMENT', entityId: 'pi_failed1',
          newValues: { amount: 35000, lastPaymentError: 'Your card was declined.' },
        },
      });

      const rows = await loadTransactions();
      expect(rows).toHaveLength(3);

      const membership = rows.find(r => r.kind === 'membership')!;
      expect(membership).toMatchObject({ customerName: 'Larry Silva', amountCents: 199000, status: 'COMPLETED', reference: 'pi_member1' });
      expect(membership.breakdown.lines[0]).toMatchObject({ label: 'Mixer Member', amountCents: 199000 });
      expect(membership.breakdown.facts).toEqual(expect.arrayContaining([{ label: 'Business', value: 'Heineken USA' }]));

      const tickets = rows.find(r => r.kind === 'tickets')!;
      expect(tickets).toMatchObject({ title: 'Taco Tuesday', amountCents: 4000, status: 'COMPLETED', customerName: 'Pat Buyer' });
      expect(tickets.breakdown.lines).toEqual([{ label: 'Member', note: '$20.00 each', quantity: 2, amountCents: 4000 }]);
      expect(tickets.breakdown.facts).toEqual(expect.arrayContaining([{ label: 'Attendees', value: 'Pat Buyer, Lee Guest' }]));
      expect(tickets.breakdown.links[0]).toEqual({ label: 'View event page', href: '/events/taco-tuesday-pay' });

      const failed = rows.find(r => r.kind === 'failed')!;
      expect(failed).toMatchObject({ status: 'FAILED', amountCents: 35000, customerName: 'Larry Silva' });
      expect(failed.breakdown.facts).toEqual([{ label: 'Decline reason', value: 'Your card was declined.' }]);
    })
  );
});
