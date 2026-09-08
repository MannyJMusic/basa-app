import { TestUtils, withEmptyTestDatabase } from './helpers/test-utils';
import { priceSelection, soldCounts, TicketAvailabilityError } from '@/lib/ticket-tiers';

/**
 * Availability is the part worth testing against a real database: it depends on
 * aggregating registration items, and getting it wrong means either overselling an
 * event or refusing money for seats that exist.
 */
describe('Ticket tier pricing and availability', () => {
  async function makeEvent(prisma: any, capacity: number | null) {
    const user = await TestUtils.createTestUser(prisma, `org-${Date.now()}@test.test`, 'ADMIN');
    const member = await TestUtils.createTestMember(prisma, user.id, 'Org');
    const organizer = await TestUtils.createTestOrganizer(prisma, 'Org', member.id);
    const event = await TestUtils.createTestEvent(prisma, organizer.id, 'Tier Event');
    return prisma.event.update({ where: { id: event.id }, data: { capacity } });
  }

  const tier = (prisma: any, eventId: string, o: any) =>
    prisma.ticketTier.create({
      data: {
        eventId,
        name: o.name,
        price: o.price,
        memberPrice: o.memberPrice ?? null,
        quantity: o.quantity ?? null,
        salesStartAt: o.salesStartAt ?? null,
        salesEndAt: o.salesEndAt ?? null,
        isActive: o.isActive ?? true,
      },
    });

  it(
    'charges the member price only to active members',
    withEmptyTestDatabase(async ({ database }: any) => {
      const { prisma } = database;
      const event = await makeEvent(prisma, null);
      const t = await tier(prisma, event.id, { name: 'Standard', price: 50, memberPrice: 25 });

      const guest = await priceSelection(event.id, [{ ticketTierId: t.id, quantity: 2 }], false);
      const mem = await priceSelection(event.id, [{ ticketTierId: t.id, quantity: 2 }], true);

      expect(guest.total.toString()).toBe('100');
      expect(guest.totalCents).toBe(10000);
      expect(mem.total.toString()).toBe('50');
      expect(mem.totalCents).toBe(5000);
    })
  );

  it(
    'falls back to the standard price when a tier has no member price',
    withEmptyTestDatabase(async ({ database }: any) => {
      const { prisma } = database;
      const event = await makeEvent(prisma, null);
      const t = await tier(prisma, event.id, { name: 'Flat', price: 40 });

      const mem = await priceSelection(event.id, [{ ticketTierId: t.id, quantity: 1 }], true);
      expect(mem.total.toString()).toBe('40');
    })
  );

  it(
    'totals several tiers in one order',
    withEmptyTestDatabase(async ({ database }: any) => {
      const { prisma } = database;
      const event = await makeEvent(prisma, null);
      const a = await tier(prisma, event.id, { name: 'Seat', price: 25 });
      const b = await tier(prisma, event.id, { name: 'Table', price: 200 });

      const order = await priceSelection(
        event.id,
        [{ ticketTierId: a.id, quantity: 3 }, { ticketTierId: b.id, quantity: 1 }],
        false
      );
      expect(order.totalTickets).toBe(4);
      expect(order.total.toString()).toBe('275');
      expect(order.lines).toHaveLength(2);
    })
  );

  it(
    'refuses to oversell a tier, counting seats already taken',
    withEmptyTestDatabase(async ({ database }: any) => {
      const { prisma } = database;
      const event = await makeEvent(prisma, null);
      const t = await tier(prisma, event.id, { name: 'Limited', price: 10, quantity: 5 });

      const reg = await prisma.eventRegistration.create({
        data: {
          eventId: event.id, name: 'A', email: 'a@t.test',
          ticketCount: 4, totalAmount: 40, status: 'CONFIRMED',
        },
      });
      await prisma.eventRegistrationItem.create({
        data: { registrationId: reg.id, ticketTierId: t.id, quantity: 4, unitPrice: 10 },
      });

      const sold = await soldCounts(event.id);
      expect(sold.perTier.get(t.id)).toBe(4);

      await expect(priceSelection(event.id, [{ ticketTierId: t.id, quantity: 2 }], false))
        .rejects.toThrow(TicketAvailabilityError);
      // the one remaining seat is still sellable
      await expect(priceSelection(event.id, [{ ticketTierId: t.id, quantity: 1 }], false))
        .resolves.toBeTruthy();
    })
  );

  it(
    'a cancelled registration releases its seats',
    withEmptyTestDatabase(async ({ database }: any) => {
      const { prisma } = database;
      const event = await makeEvent(prisma, null);
      const t = await tier(prisma, event.id, { name: 'Limited', price: 10, quantity: 2 });

      const reg = await prisma.eventRegistration.create({
        data: {
          eventId: event.id, name: 'A', email: 'a@t.test',
          ticketCount: 2, totalAmount: 20, status: 'CANCELLED',
        },
      });
      await prisma.eventRegistrationItem.create({
        data: { registrationId: reg.id, ticketTierId: t.id, quantity: 2, unitPrice: 10 },
      });

      await expect(priceSelection(event.id, [{ ticketTierId: t.id, quantity: 2 }], false))
        .resolves.toBeTruthy();
    })
  );

  it(
    'the event capacity caps the sum of all tiers',
    withEmptyTestDatabase(async ({ database }: any) => {
      const { prisma } = database;
      // Tiers are individually generous; the event is not.
      const event = await makeEvent(prisma, 3);
      const a = await tier(prisma, event.id, { name: 'A', price: 10, quantity: 100 });
      const b = await tier(prisma, event.id, { name: 'B', price: 10, quantity: 100 });

      await expect(
        priceSelection(event.id, [{ ticketTierId: a.id, quantity: 2 }, { ticketTierId: b.id, quantity: 2 }], false)
      ).rejects.toThrow(/places remain|full/);

      await expect(
        priceSelection(event.id, [{ ticketTierId: a.id, quantity: 2 }, { ticketTierId: b.id, quantity: 1 }], false)
      ).resolves.toBeTruthy();
    })
  );

  it(
    'rejects tiers that are inactive or outside their sale window',
    withEmptyTestDatabase(async ({ database }: any) => {
      const { prisma } = database;
      const event = await makeEvent(prisma, null);
      const day = 24 * 60 * 60 * 1000;
      const off = await tier(prisma, event.id, { name: 'Off', price: 10, isActive: false });
      const early = await tier(prisma, event.id, { name: 'Early', price: 10, salesStartAt: new Date(Date.now() + day) });
      const closed = await tier(prisma, event.id, { name: 'Closed', price: 10, salesEndAt: new Date(Date.now() - day) });

      for (const t of [off, early, closed]) {
        await expect(priceSelection(event.id, [{ ticketTierId: t.id, quantity: 1 }], false))
          .rejects.toThrow(TicketAvailabilityError);
      }
    })
  );

  it(
    'rejects a tier belonging to another event, and bad quantities',
    withEmptyTestDatabase(async ({ database }: any) => {
      const { prisma } = database;
      const one = await makeEvent(prisma, null);
      const two = await makeEvent(prisma, null);
      const foreign = await tier(prisma, two.id, { name: 'Elsewhere', price: 10 });
      const mine = await tier(prisma, one.id, { name: 'Mine', price: 10 });

      await expect(priceSelection(one.id, [{ ticketTierId: foreign.id, quantity: 1 }], false))
        .rejects.toThrow(/Unknown ticket type/);
      await expect(priceSelection(one.id, [{ ticketTierId: mine.id, quantity: 0 }], false))
        .rejects.toThrow(/whole numbers/);
      await expect(priceSelection(one.id, [], false)).rejects.toThrow(/No tickets selected/);
    })
  );
});
