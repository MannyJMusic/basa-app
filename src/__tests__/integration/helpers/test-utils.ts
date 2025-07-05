import { PrismaClient } from '@prisma/client';
import TestcontainersSetup, { TestEnvironment } from './testcontainers-setup';

/**
 * Test utilities for BASA application testing
 */
export class TestUtils {
  private static setup = TestcontainersSetup.getInstance();

  /**
   * Create a test environment with seeded data
   */
  static async createTestEnvironment(seedData = true): Promise<TestEnvironment> {
    return await this.setup.createTestEnvironment(seedData);
  }

  /**
   * Create a test environment without seeded data
   */
  static async createEmptyTestEnvironment(): Promise<TestEnvironment> {
    return await this.setup.createTestEnvironment(false);
  }

  /**
   * Create a test user with specified role
   */
  static async createTestUser(
    prisma: PrismaClient,
    email: string,
    role: string = 'GUEST',
    isActive: boolean = true
  ) {
    return await prisma.user.upsert({
      where: { email },
      update: { role, isActive },
      create: {
        email,
        name: `${role} User`,
        firstName: role,
        lastName: 'User',
        role,
        isActive,
      },
    });
  }

  /**
   * Create a test member
   */
  static async createTestMember(
    prisma: PrismaClient,
    userId: string,
    businessName: string = 'Test Business'
  ) {
    return await prisma.member.upsert({
      where: { userId },
      update: { businessName },
      create: {
        userId,
        businessName,
        businessType: 'LLC',
        industry: ['Technology'],
        businessEmail: 'test@business.com',
        city: 'Test City',
        state: 'CA',
        membershipTier: 'BASIC',
        membershipStatus: 'ACTIVE',
        showInDirectory: true,
        allowContact: true,
      },
    });
  }

  /**
   * Create a test event
   */
  static async createTestEvent(
    prisma: PrismaClient,
    organizerId: string,
    title: string = 'Test Event'
  ) {
    const timestamp = Date.now();
    return await prisma.event.create({
      data: {
        title,
        slug: `${title.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`,
        description: `A test event: ${title}`,
        shortDescription: title,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
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
        status: 'PUBLISHED',
        organizerId,
        tags: ['test'],
      },
    });
  }

  /**
   * Create a test resource
   */
  static async createTestResource(
    prisma: PrismaClient,
    title: string = 'Test Resource',
    memberId?: string
  ) {
    return await prisma.resource.create({
      data: {
        title,
        description: `A test resource: ${title}`,
        category: 'Documentation',
        fileType: 'PDF',
        fileUrl: 'https://example.com/test.pdf',
        isActive: true,
        tags: ['test'],
        ...(memberId && { memberId }),
      },
    });
  }

  /**
   * Clean up all test containers
   */
  static async cleanup(): Promise<void> {
    await this.setup.cleanup();
  }

  /**
   * Get container statistics
   */
  static getContainerStats() {
    return this.setup.getContainerStats();
  }

  /**
   * Generate random test data
   */
  static generateRandomData() {
    const timestamp = Date.now();
    return {
      email: `test-${timestamp}@example.com`,
      businessName: `Test Business ${timestamp}`,
      eventTitle: `Test Event ${timestamp}`,
      resourceTitle: `Test Resource ${timestamp}`,
    };
  }

  /**
   * Wait for a condition to be true
   */
  static async waitFor(
    condition: () => boolean | Promise<boolean>,
    timeout: number = 5000,
    interval: number = 100
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }

  /**
   * Mock environment variables for testing
   */
  static mockEnv(env: Record<string, string>) {
    const originalEnv = { ...process.env };
    
    Object.assign(process.env, env);
    
    return {
      restore: () => {
        process.env = originalEnv;
      },
    };
  }

  /**
   * Create a mock request object for API testing
   */
  static createMockRequest(data: any = {}) {
    return {
      method: 'GET',
      url: '/api/test',
      headers: {
        'content-type': 'application/json',
        ...data.headers,
      },
      body: data.body || {},
      query: data.query || {},
      ...data,
    };
  }

  /**
   * Create a mock response object for API testing
   */
  static createMockResponse() {
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      headersSent: false,
    };
    
    return res;
  }

  /**
   * Assert that a database record exists
   */
  static async assertRecordExists(
    prisma: PrismaClient,
    model: string,
    where: any
  ) {
    const record = await (prisma as any)[model].findUnique({ where });
    expect(record).toBeTruthy();
    return record;
  }

  /**
   * Assert that a database record does not exist
   */
  static async assertRecordNotExists(
    prisma: PrismaClient,
    model: string,
    where: any
  ) {
    const record = await (prisma as any)[model].findUnique({ where });
    expect(record).toBeNull();
  }

  /**
   * Count records in a database table
   */
  static async countRecords(
    prisma: PrismaClient,
    model: string,
    where: any = {}
  ) {
    return await (prisma as any)[model].count({ where });
  }
}

/**
 * Jest test setup helper
 */
export const withTestDatabase = (testFn: (env: TestEnvironment) => Promise<void>) => {
  return async () => {
    const env = await TestUtils.createTestEnvironment();
    try {
      await testFn(env);
    } finally {
      await env.cleanup();
    }
  };
};

/**
 * Jest test setup helper for empty database
 */
export const withEmptyTestDatabase = (testFn: (env: TestEnvironment) => Promise<void>) => {
  return async () => {
    const env = await TestUtils.createEmptyTestEnvironment();
    try {
      await testFn(env);
    } finally {
      await env.cleanup();
    }
  };
}; 