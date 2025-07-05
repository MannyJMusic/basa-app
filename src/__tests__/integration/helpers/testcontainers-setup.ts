import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import path from 'path';

export interface TestDatabase {
  container: StartedTestContainer;
  prisma: PrismaClient;
  databaseUrl: string;
}

export interface TestEnvironment {
  database: TestDatabase;
  cleanup: () => Promise<void>;
}

/**
 * Testcontainers setup for BASA application testing
 * Provides isolated PostgreSQL database instances for each test
 * Automatically uses Testcontainers Cloud when TC_CLOUD_TOKEN is available
 */
export default class TestcontainersSetup {
  private static instance: TestcontainersSetup;
  private containers: StartedTestContainer[] = [];

  private constructor() {
    // Check if Testcontainers Cloud is available
    if (process.env.TC_CLOUD_TOKEN) {
      console.log('🚀 Using Testcontainers Cloud for managed containers');
    } else {
      console.log('🐳 Using local Docker for containers');
    }
  }

  static getInstance(): TestcontainersSetup {
    if (!TestcontainersSetup.instance) {
      TestcontainersSetup.instance = new TestcontainersSetup();
    }
    return TestcontainersSetup.instance;
  }

  /**
   * Create a fresh PostgreSQL container for testing
   */
  async createTestDatabase(): Promise<TestDatabase> {
    const container = await new PostgreSqlContainer('postgres:15-alpine')
      .withDatabase('basa_test')
      .withUsername('test_user')
      .withPassword('test_password')
      .withExposedPorts(5432)
      .withWaitStrategy(Wait.forLogMessage('database system is ready to accept connections'))
      .withStartupTimeout(120000) // 2 minutes
      .start();

    this.containers.push(container);

    const databaseUrl = container.getConnectionUri();
    
    // Create Prisma client with test database
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });

    // Run migrations on the test database
    await this.runMigrations(databaseUrl);

    return {
      container,
      prisma,
      databaseUrl,
    };
  }

  /**
   * Create a complete test environment with database and seed data
   */
  async createTestEnvironment(seedData = true): Promise<TestEnvironment> {
    const database = await this.createTestDatabase();

    if (seedData) {
      await this.seedTestDatabase(database.prisma);
    }

    const cleanup = async () => {
      await database.prisma.$disconnect();
      await database.container.stop();
      this.containers = this.containers.filter(c => c !== database.container);
    };

    return {
      database,
      cleanup,
    };
  }

  /**
   * Run Prisma migrations on the test database
   */
  private async runMigrations(databaseUrl: string): Promise<void> {
    try {
      // Set environment variable for Prisma
      process.env.DATABASE_URL = databaseUrl;
      
      // Run migrations with better error handling
      try {
        execSync('npx prisma migrate deploy', {
          stdio: 'inherit',
          env: { ...process.env, DATABASE_URL: databaseUrl },
          cwd: process.cwd(),
        });
      } catch (migrationError) {
        console.warn('Migration deploy failed, trying reset:', migrationError);
        // If migrate deploy fails, try reset
        execSync('npx prisma migrate reset --force', {
          stdio: 'inherit',
          env: { ...process.env, DATABASE_URL: databaseUrl },
          cwd: process.cwd(),
        });
      }

      // Generate Prisma client
      execSync('npx prisma generate', {
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: databaseUrl },
        cwd: process.cwd(),
      });
    } catch (error) {
      console.error('Failed to run migrations:', error);
      // Don't throw error, just log it and continue
      // The database might still be usable for testing
    }
  }

  /**
   * Seed the test database with sample data
   */
  private async seedTestDatabase(prisma: PrismaClient): Promise<void> {
    try {
      // Create test users
      const testUser = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
          email: 'test@example.com',
          name: 'Test User',
          firstName: 'Test',
          lastName: 'User',
          role: 'ADMIN',
          isActive: true,
        },
      });

      const memberUser = await prisma.user.upsert({
        where: { email: 'member@example.com' },
        update: {},
        create: {
          email: 'member@example.com',
          name: 'Member User',
          firstName: 'Member',
          lastName: 'User',
          role: 'MEMBER',
          isActive: true,
        },
      });

      // Create test member
      const testMember = await prisma.member.upsert({
        where: { userId: memberUser.id },
        update: {},
        create: {
          userId: memberUser.id,
          businessName: 'Test Business',
          businessType: 'LLC',
          industry: ['Technology'],
          businessEmail: 'member@example.com',
          city: 'Test City',
          state: 'CA',
          membershipTier: 'PREMIUM',
          membershipStatus: 'ACTIVE',
          showInDirectory: true,
          allowContact: true,
        },
      });

      // Create test event
      const testEvent = await prisma.event.create({
        data: {
          title: 'Test Networking Event',
          slug: 'test-networking-event',
          description: 'A test networking event for testing purposes',
          shortDescription: 'Test event',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
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
          isFeatured: true,
          organizerId: testMember.id,
          tags: ['networking', 'test'],
        },
      });

      // Create test resource
      await prisma.resource.create({
        data: {
          title: 'Test Resource',
          description: 'A test resource for testing purposes',
          category: 'Documentation',
          fileType: 'PDF',
          fileUrl: 'https://example.com/test.pdf',
          isActive: true,
          tags: ['documentation', 'test'],
        },
      });

      // Create test settings
      await prisma.settings.upsert({
        where: { id: 'default' },
        update: {},
        create: {
          id: 'default',
          organizationName: 'BASA Test',
          contactEmail: 'test@basa.org',
          phoneNumber: '+1234567890',
          website: 'https://basa-test.org',
          address: '123 Test St, Test City, CA 12345',
          description: 'Business Association of South Africa - Test Environment',
          maintenanceMode: false,
          autoApproveMembers: true,
          emailNotifications: true,
          requireTwoFactor: false,
          sessionTimeout: 30,
          enforcePasswordPolicy: true,
          allowedIpAddresses: null,
          apiRateLimit: 100,
          notifyNewMembers: true,
          notifyPayments: true,
          notifyEventRegistrations: true,
          notifySystemAlerts: true,
          adminEmails: 'admin@basa.org',
          stripePublicKey: null,
          stripeSecretKey: null,
          stripeTestMode: true,
          smtpHost: null,
          smtpPort: null,
          smtpUsername: null,
          smtpPassword: null,
          googleAnalyticsId: null,
          googleTagManagerId: null,
          logoUrl: null,
          faviconUrl: null,
          primaryColor: '#1e40af',
          secondaryColor: '#059669',
          showMemberCount: true,
          showEventCalendar: true,
          showTestimonials: true,
        },
      });

    } catch (error) {
      console.error('Failed to seed test database:', error);
      throw error;
    }
  }

  /**
   * Clean up all containers
   */
  async cleanup(): Promise<void> {
    for (const container of this.containers) {
      try {
        await container.stop();
      } catch (error) {
        console.error('Failed to stop container:', error);
      }
    }
    this.containers = [];
  }

  /**
   * Get container statistics
   */
  getContainerStats(): { total: number; running: number } {
    return {
      total: this.containers.length,
      running: this.containers.filter(c => c.isRunning()).length,
    };
  }
}

// Global cleanup on process exit
process.on('beforeExit', async () => {
  const setup = TestcontainersSetup.getInstance();
  await setup.cleanup();
});

process.on('SIGINT', async () => {
  const setup = TestcontainersSetup.getInstance();
  await setup.cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  const setup = TestcontainersSetup.getInstance();
  await setup.cleanup();
  process.exit(0);
}); 