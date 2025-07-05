import { TestUtils, withTestDatabase } from './helpers/test-utils';
import { GET, POST, PUT, DELETE } from '@/app/api/events/route';

describe('Events API Integration Tests', () => {
  describe('GET /api/events', () => {
    it(
      'should return published events',
      withTestDatabase(async ({ database }) => {
        const { prisma } = database;
        
        // Create test data
        const user = await TestUtils.createTestUser(prisma, 'organizer@test.com', 'MEMBER');
        const member = await TestUtils.createTestMember(prisma, user.id, 'Test Organizer');
        
        const event1 = await TestUtils.createTestEvent(prisma, member.id, 'Published Event 1');
        const event2 = await TestUtils.createTestEvent(prisma, member.id, 'Published Event 2');
        
        // Create a draft event (should not be returned)
        await prisma.event.create({
          data: {
            ...event1,
            id: undefined,
            title: 'Draft Event',
            slug: 'draft-event',
            status: 'DRAFT',
          },
        });

        // Mock request
        const req = TestUtils.createMockRequest({
          method: 'GET',
          url: '/api/events',
          query: {
            status: 'PUBLISHED',
            sortBy: 'startDate',
            sortOrder: 'asc',
          },
        });

        const res = TestUtils.createMockResponse();

        // Call the API
        await GET(req as any, res as any);

        // Assertions
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            events: expect.arrayContaining([
              expect.objectContaining({
                id: event1.id,
                title: 'Published Event 1',
                status: 'PUBLISHED',
              }),
              expect.objectContaining({
                id: event2.id,
                title: 'Published Event 2',
                status: 'PUBLISHED',
              }),
            ]),
          })
        );

        // Verify draft event is not included
        const responseData = (res.json as jest.Mock).mock.calls[0][0];
        expect(responseData.events).toHaveLength(2);
        expect(responseData.events.find((e: any) => e.title === 'Draft Event')).toBeUndefined();
      })
    );

    it(
      'should filter events by category',
      withTestDatabase(async ({ database }) => {
        const { prisma } = database;
        
        const user = await TestUtils.createTestUser(prisma, 'organizer@test.com', 'MEMBER');
        const member = await TestUtils.createTestMember(prisma, user.id, 'Test Organizer');
        
        await TestUtils.createTestEvent(prisma, member.id, 'Networking Event');
        await TestUtils.createTestEvent(prisma, member.id, 'Workshop Event');
        
        // Update one event to have different category
        await prisma.event.updateMany({
          where: { title: 'Workshop Event' },
          data: { category: 'Workshop' },
        });

        const req = TestUtils.createMockRequest({
          method: 'GET',
          url: '/api/events',
          query: { category: 'Networking' },
        });

        const res = TestUtils.createMockResponse();

        await GET(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(200);
        const responseData = (res.json as jest.Mock).mock.calls[0][0];
        expect(responseData.events).toHaveLength(1);
        expect(responseData.events[0].category).toBe('Networking');
      })
    );

    it(
      'should handle pagination',
      withTestDatabase(async ({ database }) => {
        const { prisma } = database;
        
        const user = await TestUtils.createTestUser(prisma, 'organizer@test.com', 'MEMBER');
        const member = await TestUtils.createTestMember(prisma, user.id, 'Test Organizer');
        
        // Create multiple events
        for (let i = 1; i <= 5; i++) {
          await TestUtils.createTestEvent(prisma, member.id, `Event ${i}`);
        }

        const req = TestUtils.createMockRequest({
          method: 'GET',
          url: '/api/events',
          query: { page: '1', limit: '2' },
        });

        const res = TestUtils.createMockResponse();

        await GET(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(200);
        const responseData = (res.json as jest.Mock).mock.calls[0][0];
        expect(responseData.events).toHaveLength(2);
        expect(responseData.pagination).toBeDefined();
        expect(responseData.pagination.page).toBe(1);
        expect(responseData.pagination.limit).toBe(2);
      })
    );
  });

  describe('POST /api/events', () => {
    it(
      'should create a new event',
      withTestDatabase(async ({ database }) => {
        const { prisma } = database;
        
        const user = await TestUtils.createTestUser(prisma, 'organizer@test.com', 'MEMBER');
        const member = await TestUtils.createTestMember(prisma, user.id, 'Test Organizer');

        const eventData = {
          title: 'New Test Event',
          description: 'A new test event',
          shortDescription: 'Test event',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          location: 'Test Location',
          address: '123 Test St',
          city: 'Test City',
          state: 'CA',
          zipCode: '12345',
          capacity: 50,
          price: 25.00,
          memberPrice: 15.00,
          category: 'Networking',
          type: 'NETWORKING',
          tags: ['test'],
        };

        const req = TestUtils.createMockRequest({
          method: 'POST',
          url: '/api/events',
          body: eventData,
          headers: {
            'content-type': 'application/json',
            'x-user-id': user.id,
          },
        });

        const res = TestUtils.createMockResponse();

        await POST(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(201);
        const responseData = (res.json as jest.Mock).mock.calls[0][0];
        expect(responseData.event.title).toBe('New Test Event');
        expect(responseData.event.organizerId).toBe(member.id);

        // Verify event was created in database
        await TestUtils.assertRecordExists(prisma, 'event', {
          title: 'New Test Event',
        });
      })
    );

    it(
      'should validate required fields',
      withTestDatabase(async ({ database }) => {
        const { prisma } = database;
        
        const user = await TestUtils.createTestUser(prisma, 'organizer@test.com', 'MEMBER');

        const req = TestUtils.createMockRequest({
          method: 'POST',
          url: '/api/events',
          body: {
            // Missing required fields
            description: 'A test event',
          },
          headers: {
            'content-type': 'application/json',
            'x-user-id': user.id,
          },
        });

        const res = TestUtils.createMockResponse();

        await POST(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(400);
        const responseData = (res.json as jest.Mock).mock.calls[0][0];
        expect(responseData.error).toBeDefined();
      })
    );
  });

  describe('PUT /api/events/[id]', () => {
    it(
      'should update an existing event',
      withTestDatabase(async ({ database }) => {
        const { prisma } = database;
        
        const user = await TestUtils.createTestUser(prisma, 'organizer@test.com', 'MEMBER');
        const member = await TestUtils.createTestMember(prisma, user.id, 'Test Organizer');
        const event = await TestUtils.createTestEvent(prisma, member.id, 'Original Event');

        const updateData = {
          title: 'Updated Event Title',
          description: 'Updated description',
          capacity: 100,
        };

        const req = TestUtils.createMockRequest({
          method: 'PUT',
          url: `/api/events/${event.id}`,
          body: updateData,
          headers: {
            'content-type': 'application/json',
            'x-user-id': user.id,
          },
        });

        const res = TestUtils.createMockResponse();

        await PUT(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(200);
        const responseData = (res.json as jest.Mock).mock.calls[0][0];
        expect(responseData.event.title).toBe('Updated Event Title');
        expect(responseData.event.capacity).toBe(100);

        // Verify database was updated
        const updatedEvent = await prisma.event.findUnique({
          where: { id: event.id },
        });
        expect(updatedEvent?.title).toBe('Updated Event Title');
      })
    );
  });

  describe('DELETE /api/events/[id]', () => {
    it(
      'should delete an event',
      withTestDatabase(async ({ database }) => {
        const { prisma } = database;
        
        const user = await TestUtils.createTestUser(prisma, 'organizer@test.com', 'MEMBER');
        const member = await TestUtils.createTestMember(prisma, user.id, 'Test Organizer');
        const event = await TestUtils.createTestEvent(prisma, member.id, 'Event to Delete');

        const req = TestUtils.createMockRequest({
          method: 'DELETE',
          url: `/api/events/${event.id}`,
          headers: {
            'x-user-id': user.id,
          },
        });

        const res = TestUtils.createMockResponse();

        await DELETE(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(200);
        const responseData = (res.json as jest.Mock).mock.calls[0][0];
        expect(responseData.message).toContain('deleted');

        // Verify event was deleted from database
        await TestUtils.assertRecordNotExists(prisma, 'event', { id: event.id });
      })
    );
  });
}); 