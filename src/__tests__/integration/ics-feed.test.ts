/**
 * What a calendar subscriber actually receives (#56). The document format is
 * unit tested; this covers the part that needs a database - which events are in
 * the feed at all.
 */
import { TestUtils, withTestDatabase } from './helpers/test-utils';
import { selectFeedEvents } from '@/lib/ics-feed';
import { buildCalendar } from '@/lib/ics';

describe('Events calendar feed', () => {
  it(
    'carries upcoming events and leaves finished ones out',
    withTestDatabase(async ({ database }) => {
      const { prisma } = database;
      const user = await TestUtils.createTestUser(prisma, 'organizer@test.com', 'MEMBER');
      const member = await TestUtils.createTestMember(prisma, user.id, 'Test Organizer');
      const template = await TestUtils.createTestEventForMember(prisma, member.id, 'Upcoming Mixer');

      const hour = 60 * 60 * 1000;
      const day = 24 * hour;

      await prisma.event.create({
        data: {
          ...template, id: undefined,
          title: 'Finished Last Month', slug: `finished-${Date.now()}`,
          startDate: new Date(Date.now() - 30 * day),
          endDate: new Date(Date.now() - 30 * day + 2 * hour),
        },
      });
      // Started this morning, ends tonight: a subscriber still wants to see it.
      await prisma.event.create({
        data: {
          ...template, id: undefined,
          title: 'Running Right Now', slug: `running-${Date.now()}`,
          startDate: new Date(Date.now() - hour),
          endDate: new Date(Date.now() + hour),
        },
      });

      const titles = (await selectFeedEvents(prisma as never)).map((e) => e.title);

      expect(titles).toContain('Upcoming Mixer');
      expect(titles).toContain('Running Right Now');
      expect(titles).not.toContain('Finished Last Month');
    })
  );

  it(
    'keeps cancelled events in, marked cancelled, and leaves drafts out',
    withTestDatabase(async ({ database }) => {
      const { prisma } = database;
      const user = await TestUtils.createTestUser(prisma, 'organizer@test.com', 'MEMBER');
      const member = await TestUtils.createTestMember(prisma, user.id, 'Test Organizer');
      const template = await TestUtils.createTestEventForMember(prisma, member.id, 'Still On');

      await prisma.event.create({
        data: { ...template, id: undefined, title: 'Called Off', slug: `called-off-${Date.now()}`, status: 'CANCELLED' },
      });
      await prisma.event.create({
        data: { ...template, id: undefined, title: 'Not Announced Yet', slug: `draft-${Date.now()}`, status: 'DRAFT' },
      });

      const events = await selectFeedEvents(prisma as never);
      const titles = events.map((e) => e.title);

      expect(titles).toContain('Called Off');
      expect(titles).not.toContain('Not Announced Yet');

      // A subscriber has to see the cancellation, not lose the entry silently.
      const ics = buildCalendar(
        events.filter((e) => e.title === 'Called Off'),
        { origin: 'https://app.businessassociationsa.com' }
      );
      expect(ics).toContain('STATUS:CANCELLED');
    })
  );

  it(
    'filters by type without dropping the rest of the rules',
    withTestDatabase(async ({ database }) => {
      const { prisma } = database;
      const user = await TestUtils.createTestUser(prisma, 'organizer@test.com', 'MEMBER');
      const member = await TestUtils.createTestMember(prisma, user.id, 'Test Organizer');
      const template = await TestUtils.createTestEventForMember(prisma, member.id, 'Networking One');

      await prisma.event.create({
        data: {
          ...template, id: undefined,
          title: 'A Ribbon Cutting', slug: `ribbon-${Date.now()}`, type: 'RIBBON_CUTTING',
        },
      });
      await prisma.event.create({
        data: {
          ...template, id: undefined,
          title: 'An Old Ribbon Cutting', slug: `old-ribbon-${Date.now()}`, type: 'RIBBON_CUTTING',
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        },
      });

      const titles = (await selectFeedEvents(prisma as never, { type: 'RIBBON_CUTTING' })).map((e) => e.title);

      expect(titles).toContain('A Ribbon Cutting');
      expect(titles).not.toContain('Networking One');
      expect(titles).not.toContain('An Old Ribbon Cutting');
    })
  );
});
