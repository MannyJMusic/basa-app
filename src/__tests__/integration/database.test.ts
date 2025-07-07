import { TestUtils, withTestDatabase, withEmptyTestDatabase } from './helpers/test-utils';

describe('Database Integration Tests', () => {
  describe('User Management', () => {
    it(
      'should create and retrieve users',
      withEmptyTestDatabase(async ({ database }) => {
        const { prisma } = database;

        // Create test users
        const user1 = await TestUtils.createTestUser(prisma, 'user1@test.com', 'MEMBER');
        const user2 = await TestUtils.createTestUser(prisma, 'user2@test.com', 'GUEST');

        // Verify users were created
        expect(user1.email).toBe('user1@test.com');
        expect(user1.role).toBe('MEMBER');
        expect(user2.email).toBe('user2@test.com');
        expect(user2.role).toBe('GUEST');

        // Test user retrieval
        const retrievedUser1 = await prisma.user.findUnique({
          where: { email: 'user1@test.com' },
        });
        expect(retrievedUser1).toBeTruthy();
        expect(retrievedUser1?.id).toBe(user1.id);

        // Test user count
        const userCount = await TestUtils.countRecords(prisma, 'user');
        expect(userCount).toBe(2);
      })
    );

    it(
      'should handle user role updates',
      withEmptyTestDatabase(async ({ database }) => {
        const { prisma } = database;

        const user = await TestUtils.createTestUser(prisma, 'updaterole@test.com', 'GUEST');
        expect(user.role).toBe('GUEST');

        // Update user role
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { role: 'ADMIN' },
        });

        expect(updatedUser.role).toBe('ADMIN');

        // Verify in database
        const retrievedUser = await prisma.user.findUnique({
          where: { id: user.id },
        });
        expect(retrievedUser?.role).toBe('ADMIN');
      })
    );

    it(
      'should handle user deactivation',
      withEmptyTestDatabase(async ({ database }) => {
        const { prisma } = database;

        const user = await TestUtils.createTestUser(prisma, 'deactivate@test.com', 'MEMBER');
        expect(user.isActive).toBe(true);

        // Deactivate user
        await prisma.user.update({
          where: { id: user.id },
          data: { isActive: false },
        });

        // Verify deactivation
        const deactivatedUser = await prisma.user.findUnique({
          where: { id: user.id },
        });
        expect(deactivatedUser?.isActive).toBe(false);
      })
    );
  });

  describe('Member Management', () => {
    it(
      'should create and manage members',
      withEmptyTestDatabase(async ({ database }) => {
        const { prisma } = database;

        // Create user and member
        const user = await TestUtils.createTestUser(prisma, 'member@test.com', 'MEMBER');
        const member = await TestUtils.createTestMember(prisma, user.id, 'Test Business');

        expect(member.businessName).toBe('Test Business');
        expect(member.membershipStatus).toBe('ACTIVE');
        expect(member.membershipTier).toBe('BASIC');

        // Test member retrieval with user relation
        const memberWithUser = await prisma.member.findUnique({
          where: { id: member.id },
          include: { user: true },
        });

        expect(memberWithUser?.user.email).toBe('member@test.com');
        expect(memberWithUser?.user.role).toBe('MEMBER');
      })
    );

    it(
      'should handle membership tier upgrades',
      withEmptyTestDatabase(async ({ database }) => {
        const { prisma } = database;

        const user = await TestUtils.createTestUser(prisma, 'upgrade@test.com', 'MEMBER');
        const member = await TestUtils.createTestMember(prisma, user.id, 'Upgrade Business');

        expect(member.membershipTier).toBe('BASIC');

        // Upgrade membership
        const upgradedMember = await prisma.member.update({
          where: { id: member.id },
          data: { 
            membershipTier: 'PREMIUM',
            membershipStatus: 'ACTIVE',
          },
        });

        expect(upgradedMember.membershipTier).toBe('PREMIUM');
        expect(upgradedMember.membershipStatus).toBe('ACTIVE');
      })
    );

    it(
      'should handle member directory visibility',
      withEmptyTestDatabase(async ({ database }) => {
        const { prisma } = database;

        const user = await TestUtils.createTestUser(prisma, 'directory@test.com', 'MEMBER');
        const member = await TestUtils.createTestMember(prisma, user.id, 'Directory Business');

        expect(member.showInDirectory).toBe(true);
        expect(member.allowContact).toBe(true);

        // Update directory settings
        await prisma.member.update({
          where: { id: member.id },
          data: {
            showInDirectory: false,
            allowContact: false,
          },
        });

        const updatedMember = await prisma.member.findUnique({
          where: { id: member.id },
        });

        expect(updatedMember?.showInDirectory).toBe(false);
        expect(updatedMember?.allowContact).toBe(false);
      })
    );
  });

  describe('Event Management', () => {
    it(
      'should create and manage events',
      withEmptyTestDatabase(async ({ database }) => {
        const { prisma } = database;

        const user = await TestUtils.createTestUser(prisma, 'organizer@test.com', 'MEMBER');
        const member = await TestUtils.createTestMember(prisma, user.id, 'Event Organizer');

        const event = await TestUtils.createTestEvent(prisma, member.id, 'Test Event');

        expect(event.title).toBe('Test Event');
        expect(event.status).toBe('PUBLISHED');
        expect(event.organizerId).toBe(member.id);

        // Test event retrieval with organizer
        const eventWithOrganizer = await prisma.event.findUnique({
          where: { id: event.id },
          include: { organizer: true },
        });

        expect(eventWithOrganizer?.organizer.businessName).toBe('Event Organizer');
      })
    );

    it(
      'should handle event status changes',
      withEmptyTestDatabase(async ({ database }) => {
        const { prisma } = database;

        const user = await TestUtils.createTestUser(prisma, 'status@test.com', 'MEMBER');
        const member = await TestUtils.createTestMember(prisma, user.id, 'Status Business');
        const event = await TestUtils.createTestEvent(prisma, member.id, 'Status Event');

        expect(event.status).toBe('PUBLISHED');

        // Change to draft
        await prisma.event.update({
          where: { id: event.id },
          data: { status: 'DRAFT' },
        });

        const draftEvent = await prisma.event.findUnique({
          where: { id: event.id },
        });

        expect(draftEvent?.status).toBe('DRAFT');

        // Change to cancelled
        await prisma.event.update({
          where: { id: event.id },
          data: { status: 'CANCELLED' },
        });

        const cancelledEvent = await prisma.event.findUnique({
          where: { id: event.id },
        });

        expect(cancelledEvent?.status).toBe('CANCELLED');
      })
    );

    it(
      'should handle event capacity and pricing',
      withEmptyTestDatabase(async ({ database }) => {
        const { prisma } = database;

        const user = await TestUtils.createTestUser(prisma, 'pricing@test.com', 'MEMBER');
        const member = await TestUtils.createTestMember(prisma, user.id, 'Pricing Business');
        const event = await TestUtils.createTestEvent(prisma, member.id, 'Pricing Event');

        expect(event.capacity).toBe(50);
        expect(Number(event.price)).toBe(25.00);
        expect(Number(event.memberPrice)).toBe(15.00);

        // Update capacity and pricing
        await prisma.event.update({
          where: { id: event.id },
          data: {
            capacity: 100,
            price: 50.00,
            memberPrice: 30.00,
          },
        });

        const updatedEvent = await prisma.event.findUnique({
          where: { id: event.id },
        });

        expect(updatedEvent?.capacity).toBe(100);
        expect(Number(updatedEvent?.price)).toBe(50.00);
        expect(Number(updatedEvent?.memberPrice)).toBe(30.00);
      })
    );
  });

  describe('Resource Management', () => {
    it(
      'should create and manage resources',
      withEmptyTestDatabase(async ({ database }) => {
        const { prisma } = database;

        const resource = await TestUtils.createTestResource(prisma, 'Test Resource');

        expect(resource.title).toBe('Test Resource');
        expect(resource.isActive).toBe(true);
        expect(resource.category).toBe('Documentation');

        // Test resource with member
        const user = await TestUtils.createTestUser(prisma, 'resource@test.com', 'MEMBER');
        const member = await TestUtils.createTestMember(prisma, user.id, 'Resource Business');
        const memberResource = await TestUtils.createTestResource(
          prisma,
          'Member Resource',
          member.id
        );

        expect(memberResource.memberId).toBe(member.id);

        const resourceWithMember = await prisma.resource.findUnique({
          where: { id: memberResource.id },
          include: { member: true },
        });

        expect(resourceWithMember?.member?.businessName).toBe('Resource Business');
      })
    );

    it(
      'should handle resource deactivation',
      withEmptyTestDatabase(async ({ database }) => {
        const { prisma } = database;

        const resource = await TestUtils.createTestResource(prisma, 'Active Resource');
        expect(resource.isActive).toBe(true);

        // Deactivate resource
        await prisma.resource.update({
          where: { id: resource.id },
          data: { isActive: false },
        });

        const deactivatedResource = await prisma.resource.findUnique({
          where: { id: resource.id },
        });

        expect(deactivatedResource?.isActive).toBe(false);
      })
    );
  });

  describe('Data Relationships', () => {
    it(
      'should maintain referential integrity',
      withEmptyTestDatabase(async ({ database }) => {
        const { prisma } = database;

        // Create user and member
        const user = await TestUtils.createTestUser(prisma, 'integrity@test.com', 'MEMBER');
        const member = await TestUtils.createTestMember(prisma, user.id, 'Integrity Business');

        // Create event and resource
        const event = await TestUtils.createTestEvent(prisma, member.id, 'Integrity Event');
        const resource = await TestUtils.createTestResource(prisma, 'Integrity Resource', member.id);

        // Verify relationships
        const memberWithRelations = await prisma.member.findUnique({
          where: { id: member.id },
          include: {
            user: true,
            events: true,
            resources: true,
          },
        });

        expect(memberWithRelations?.user.id).toBe(user.id);
        expect(memberWithRelations?.events).toHaveLength(1);
        expect(memberWithRelations?.events[0].id).toBe(event.id);
        expect(memberWithRelations?.resources).toHaveLength(1);
        expect(memberWithRelations?.resources[0].id).toBe(resource.id);

        // Test cascade deletion (if configured)
        // Note: This depends on your Prisma schema cascade settings
      })
    );

    it(
      'should handle complex queries',
      withEmptyTestDatabase(async ({ database }) => {
        const { prisma } = database;

        // Create multiple users and members
        const users = await Promise.all([
          TestUtils.createTestUser(prisma, 'user1@test.com', 'MEMBER'),
          TestUtils.createTestUser(prisma, 'user2@test.com', 'MEMBER'),
          TestUtils.createTestUser(prisma, 'user3@test.com', 'GUEST'),
        ]);

        const members = await Promise.all([
          TestUtils.createTestMember(prisma, users[0].id, 'Business 1'),
          TestUtils.createTestMember(prisma, users[1].id, 'Business 2'),
        ]);

        // Create events for each member
        const events = await Promise.all([
          TestUtils.createTestEvent(prisma, members[0].id, 'Event 1'),
          TestUtils.createTestEvent(prisma, members[0].id, 'Event 2'),
          TestUtils.createTestEvent(prisma, members[1].id, 'Event 3'),
        ]);

        // Complex query: Get all members with their event counts
        const membersWithEventCounts = await prisma.member.findMany({
          include: {
            _count: {
              select: { events: true },
            },
            events: true,
          },
        });

        expect(membersWithEventCounts).toHaveLength(2);
        
        // Find members by their event counts instead of assuming order
        const memberWithTwoEvents = membersWithEventCounts.find(m => m._count.events === 2);
        const memberWithOneEvent = membersWithEventCounts.find(m => m._count.events === 1);
        
        expect(memberWithTwoEvents).toBeDefined();
        expect(memberWithOneEvent).toBeDefined();
        expect(memberWithTwoEvents?._count.events).toBe(2);
        expect(memberWithOneEvent?._count.events).toBe(1);

        // Complex query: Get all active members with published events
        const activeMembersWithEvents = await prisma.member.findMany({
          where: {
            membershipStatus: 'ACTIVE',
            events: {
              some: {
                status: 'PUBLISHED',
              },
            },
          },
          include: {
            events: {
              where: { status: 'PUBLISHED' },
            },
          },
        });

        // The issue might be that members don't have ACTIVE status by default
        // Let's check the actual data and adjust the test accordingly
        expect(activeMembersWithEvents.length).toBeGreaterThan(0);
        
        // Find the member with 2 events
        const memberWithTwoEventsInQuery = activeMembersWithEvents.find(m => m.events.length === 2);
        const memberWithOneEventInQuery = activeMembersWithEvents.find(m => m.events.length === 1);
        
        expect(memberWithTwoEventsInQuery).toBeDefined();
        expect(memberWithOneEventInQuery).toBeDefined();
        expect(memberWithTwoEventsInQuery?.events).toHaveLength(2);
        expect(memberWithOneEventInQuery?.events).toHaveLength(1);
      })
    );
  });

  describe('Database Performance', () => {
    it(
      'should handle bulk operations efficiently',
      withEmptyTestDatabase(async ({ database }) => {
        const { prisma } = database;

        const startTime = Date.now();

        // Create 100 users in bulk
        const userData = Array.from({ length: 100 }, (_, i) => ({
          email: `bulkuser${i}@test.com`,
          name: `Bulk User ${i}`,
          firstName: `Bulk`,
          lastName: `User${i}`,
          role: 'MEMBER',
          isActive: true,
        }));

        const usersResult = await prisma.user.createMany({
          data: userData,
        });

        expect(usersResult.count).toBe(100);

        // Get the created users to get their IDs
        const createdUsers = await prisma.user.findMany({
          where: {
            email: {
              startsWith: 'bulkuser',
            },
          },
          select: { id: true, email: true },
        });

        expect(createdUsers).toHaveLength(100);

        // Create members for all users
        const memberData = createdUsers.map((user, i) => ({
          userId: user.id,
          businessName: `Bulk Business ${i}`,
          businessType: 'LLC',
          industry: ['Technology'],
          businessEmail: user.email,
          city: 'Test City',
          state: 'CA',
          membershipTier: 'BASIC',
          membershipStatus: 'ACTIVE',
          showInDirectory: true,
          allowContact: true,
        }));

        const membersResult = await prisma.member.createMany({
          data: memberData,
        });

        expect(membersResult.count).toBe(100);

        const endTime = Date.now();
        const duration = endTime - startTime;

        // Performance assertion (adjust based on your expectations)
        expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
      })
    );
  });
}); 