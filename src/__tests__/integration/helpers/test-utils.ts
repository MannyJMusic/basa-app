import TestcontainersSetup, { TestEnvironment } from './testcontainers-setup';

/**
 * Test utilities for BASA application testing
 */
export class TestUtils {
  private static setup = TestcontainersSetup.getInstance();
  private static activeClients: any[] = [];

  /**
   * Create a test environment with seeded data
   */
  static async createTestEnvironment(seedData = true): Promise<TestEnvironment> {
    const env = await this.setup.createTestEnvironment(seedData);
    this.activeClients.push(env.database.prisma);
    return env;
  }

  /**
   * Create a test environment without seeded data
   */
  static async createEmptyTestEnvironment(): Promise<TestEnvironment> {
    const env = await this.setup.createTestEnvironment(false);
    this.activeClients.push(env.database.prisma);
    return env;
  }

  /**
   * Create a test user with specified role
   */
  static async createTestUser(
    prisma: any,
    email: string,
    role: string = 'GUEST',
    isActive: boolean = true
  ) {
    return await prisma.user.upsert({
      where: { email },
      update: { role, isActive },
      create: {
        email,
        firstName: role,
        lastName: 'User',
        role,
        hashedPassword: 'test-hashed-password',
        isActive,
      },
    });
  }

  /**
   * Create a test member
   */
  static async createTestMember(
    prisma: any,
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
    prisma: any,
    organizerId: string,
    title: string = 'Test Event'
  ) {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    return await prisma.event.create({
      data: {
        title,
        slug: `${title.toLowerCase().replace(/\s+/g, '-')}-${timestamp}-${randomNum}`,
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
    prisma: any,
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
   * Clean up all test containers and clients
   */
  static async cleanup(): Promise<void> {
    // Disconnect all active clients first
    const disconnectPromises = this.activeClients.map(async (client) => {
      try {
        await client.$disconnect();
      } catch (error) {
        console.warn('Error disconnecting Prisma client:', error);
      }
    });
    
    await Promise.all(disconnectPromises);
    this.activeClients = [];
    
    // Then cleanup containers
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
    const randomNum = Math.floor(Math.random() * 1000);
    return {
      email: `test-${timestamp}-${randomNum}@example.com`,
      businessName: `Test Business ${timestamp}-${randomNum}`,
      eventTitle: `Test Event ${timestamp}-${randomNum}`,
      resourceTitle: `Test Resource ${timestamp}-${randomNum}`,
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
   * Set the mocked Prisma client for API testing
   */
  static setMockedPrismaClient(testPrisma: any) {
    const { prisma } = require('@/lib/db');
    // Replace the mocked prisma with the test database client
    Object.defineProperty(require('@/lib/db'), 'prisma', {
      value: testPrisma,
      writable: true,
    });
  }

  /**
   * Mock authentication for API testing
   */
  static setMockedAuthUser(userId: string) {
    const { auth } = require('@/lib/auth');
    // Mock the auth function to return a test user
    jest.spyOn(require('@/lib/auth'), 'auth').mockResolvedValue({
      user: {
        id: userId,
        email: 'test@example.com',
        role: 'ADMIN',
      },
    });
  }

  /**
   * Create a mock request object that simulates Next.js API route request
   */
  static createMockRequest(data: any = {}) {
    let url: URL;
    try {
      url = new URL(data.url || 'http://localhost:3000/api/test');
    } catch {
      url = new URL('http://localhost:3000/api/test');
    }

    // Add query parameters to URL if provided
    if (data.query) {
      Object.entries(data.query).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
    }

    const headers = new Headers(data.headers || {});
    
    return {
      method: data.method || 'GET',
      url: url.toString(),
      headers,
      body: data.body ? JSON.stringify(data.body) : null,
      json: async () => data.body || {},
      nextUrl: {
        pathname: url.pathname,
        searchParams: url.searchParams,
      },
    };
  }

  /**
   * Create a mock response object that simulates Next.js API route response
   */
  static createMockResponse() {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      headers: new Headers(),
    };
    return response;
  }

  /**
   * Assert that a record exists in the database
   */
  static async assertRecordExists(
    prisma: any,
    model: string,
    where: any
  ) {
    const result = await (prisma as any)[model].findFirst({ where });
    if (!result) {
      throw new Error(`Record not found in ${model} with criteria: ${JSON.stringify(where)}`);
    }
    return result;
  }

  /**
   * Assert that a record does not exist in the database
   */
  static async assertRecordNotExists(
    prisma: any,
    model: string,
    where: any
  ) {
    const result = await (prisma as any)[model].findFirst({ where });
    if (result) {
      throw new Error(`Record found in ${model} with criteria: ${JSON.stringify(where)}`);
    }
  }

  /**
   * Count records in a model
   */
  static async countRecords(
    prisma: any,
    model: string,
    where: any = {}
  ) {
    return await (prisma as any)[model].count({ where });
  }
}

/**
 * Higher-order function to run tests with a test database
 */
export const withTestDatabase = (testFn: (env: TestEnvironment) => Promise<void>) => {
  return async () => {
    const env = await TestUtils.createTestEnvironment(true);
    try {
      await testFn(env);
    } finally {
      await env.cleanup();
    }
  };
};

/**
 * Higher-order function to run tests with an empty test database
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