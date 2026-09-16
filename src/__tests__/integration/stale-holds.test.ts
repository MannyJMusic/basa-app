import { TestUtils, withEmptyTestDatabase } from './helpers/test-utils';
import { releaseStaleHolds } from '@/lib/stale-holds';

// Stripe is the source of truth for whether an abandoned hold was actually paid.
// The sweep asks it per registration; here we script the answers.
const retrieve = jest.fn();
const cancel = jest.fn();
jest.mock('@/lib/stripe', () => ({
  getStripe: () => ({ paymentIntents: { retrieve, cancel } }),
  stripe: { paymentIntents: { retrieve, cancel } },
}));

// The webhook module sends the ticket email on confirmation; keep that out of here.
jest.mock('@/lib/basa-emails', () => ({ sendEventTicketEmail: jest.fn().mockResolvedValue(undefined) }));

const MIN = 60_000;

describe('Stale registration holds (#160)', () => {
  beforeEach(() => {
    retrieve.mockReset();
    cancel.mockReset();
    cancel.mockResolvedValue({});
  });

  async function fixture(prisma: any, opts: { ageMinutes: number; status?: 'PENDING' | 'CONFIRMED'; pi?: string | null }) {
    const user = await TestUtils.createTestUser(prisma, `hold-${Date.now()}-${Math.random()}@test.test`, 'ADMIN');
    const member = await TestUtils.createTestMember(prisma, user.id, 'Hold');
    const organizer = await TestUtils.createTestOrganizer(prisma, 'Hold', member.id);
    const event = await TestUtils.createTestEvent(prisma, organizer.id, 'Hold Event');
    const tier = await prisma.ticketTier.create({ data: { eventId: event.id, name: 'GA', price: 20, sortOrder: 0, isActive: true, quantity: 10 } });
    const pi = opts.pi === undefined ? `pi_test_${Math.random().toString(36).slice(2)}` : opts.pi;
    const reg = await prisma.eventRegistration.create({
      data: {
        eventId: event.id, name: 'Holder', email: `holder-${Math.random()}@test.test`, ticketCount: 1, totalAmount: 20,
        status: opts.status ?? 'PENDING', paymentIntentId: pi, ticketToken: 'a'.repeat(64).replace(/a/g, () => 'abcdef0123456789'[Math.floor(Math.random() * 16)]),
        createdAt: new Date(Date.now() - opts.ageMinutes * MIN),
        items: { create: [{ ticketTierId: tier.id, quantity: 1, unitPrice: 20 }] },
      },
    });
    return { reg, pi };
  }

  it('cancels the PaymentIntent and releases a hold the buyer abandoned', async () => {
    await withEmptyTestDatabase(async prisma => {
      const { reg, pi } = await fixture(prisma, { ageMinutes: 45 });
      retrieve.mockResolvedValue({ id: pi, status: 'requires_payment_method' });

      const result = await releaseStaleHolds();

      expect(result).toMatchObject({ examined: 1, released: 1, confirmed: 0, stillProcessing: 0, failed: 0 });
      expect(cancel).toHaveBeenCalledWith(pi, { cancellation_reason: 'abandoned' });
      const after = await prisma.eventRegistration.findUnique({ where: { id: reg.id } });
      expect(after!.status).toBe('CANCELLED');
    });
  });

  it('leaves a young hold alone: the buyer may still be typing', async () => {
    await withEmptyTestDatabase(async prisma => {
      const { reg } = await fixture(prisma, { ageMinutes: 5 });
      const result = await releaseStaleHolds();
      expect(result.examined).toBe(0);
      expect(retrieve).not.toHaveBeenCalled();
      expect((await prisma.eventRegistration.findUnique({ where: { id: reg.id } }))!.status).toBe('PENDING');
    });
  });

  it('confirms a hold whose payment succeeded but whose webhook never arrived', async () => {
    await withEmptyTestDatabase(async prisma => {
      const { reg, pi } = await fixture(prisma, { ageMinutes: 60 });
      retrieve.mockResolvedValue({ id: pi, status: 'succeeded', amount: 2000, currency: 'usd', metadata: { type: 'event' } });

      const result = await releaseStaleHolds();

      expect(result).toMatchObject({ examined: 1, confirmed: 1, released: 0 });
      expect(cancel).not.toHaveBeenCalled();
      expect((await prisma.eventRegistration.findUnique({ where: { id: reg.id } }))!.status).toBe('CONFIRMED');
    });
  });

  it('waits on a payment Stripe is still processing', async () => {
    await withEmptyTestDatabase(async prisma => {
      const { reg, pi } = await fixture(prisma, { ageMinutes: 60 });
      retrieve.mockResolvedValue({ id: pi, status: 'processing' });
      const result = await releaseStaleHolds();
      expect(result).toMatchObject({ stillProcessing: 1, released: 0, confirmed: 0 });
      expect((await prisma.eventRegistration.findUnique({ where: { id: reg.id } }))!.status).toBe('PENDING');
    });
  });

  it('never touches a confirmed registration, and survives a Stripe error on one row', async () => {
    await withEmptyTestDatabase(async prisma => {
      const { reg: confirmed } = await fixture(prisma, { ageMinutes: 90, status: 'CONFIRMED' });
      const { reg: broken, pi: brokenPi } = await fixture(prisma, { ageMinutes: 90 });
      const { reg: stale, pi: stalePi } = await fixture(prisma, { ageMinutes: 90 });
      retrieve.mockImplementation(async (id: string) => {
        if (id === brokenPi) throw new Error('stripe unreachable');
        if (id === stalePi) return { id, status: 'canceled' };
        return { id, status: 'requires_payment_method' };
      });

      const result = await releaseStaleHolds();

      expect(result).toMatchObject({ examined: 2, released: 1, failed: 1 });
      expect((await prisma.eventRegistration.findUnique({ where: { id: confirmed.id } }))!.status).toBe('CONFIRMED');
      expect((await prisma.eventRegistration.findUnique({ where: { id: broken.id } }))!.status).toBe('PENDING');
      expect((await prisma.eventRegistration.findUnique({ where: { id: stale.id } }))!.status).toBe('CANCELLED');
    });
  });

  it('is safe to run twice', async () => {
    await withEmptyTestDatabase(async prisma => {
      const { pi } = await fixture(prisma, { ageMinutes: 45 });
      retrieve.mockResolvedValue({ id: pi, status: 'requires_payment_method' });
      await releaseStaleHolds();
      const second = await releaseStaleHolds();
      expect(second).toMatchObject({ examined: 0, released: 0 });
      expect(cancel).toHaveBeenCalledTimes(1);
    });
  });
});
