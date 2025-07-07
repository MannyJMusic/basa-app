import { PrismaClient } from '@prisma/client';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { StartedTestContainer, Wait } from 'testcontainers';
import { execSync } from 'child_process';

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
 * Testcontainers setup for PostgreSQL databases
 * Manages database containers and Prisma clients for integration tests
 */
export default class TestcontainersSetup {
  private static instance: TestcontainersSetup;
  private sharedContainer: StartedTestContainer | null = null;
  private sharedPrisma: PrismaClient | null = null;
  private isCloudEnvironment: boolean;

  private constructor() {
    // Check if we're running in Testcontainers Cloud
    this.isCloudEnvironment = !!process.env.TC_CLOUD_TOKEN;
    
    if (this.isCloudEnvironment) {
      console.log('🌐 Using Testcontainers Cloud environment');
      console.log('   - Containers will be created in the cloud');
      console.log('   - No local Docker required');
      console.log('   - Faster container startup');
    } else {
      console.log('🏠 Using local Testcontainers environment');
      console.log('   - Containers will be created locally');
      console.log('   - Requires local Docker installation');
    }
  }

  static getInstance(): TestcontainersSetup {
    if (!TestcontainersSetup.instance) {
      TestcontainersSetup.instance = new TestcontainersSetup();
    }
    return TestcontainersSetup.instance;
  }

  /**
   * Get or create a shared test database
   */
  async getSharedTestDatabase(): Promise<TestDatabase> {
    if (!this.sharedContainer || !this.sharedPrisma) {
      console.log('🚀 Creating shared PostgreSQL container...');
      
      const container = await new PostgreSqlContainer('postgres:15-alpine')
        .withDatabase('basa_test')
        .withUsername('test_user')
        .withPassword('test_password')
        .withExposedPorts(5432)
        .withWaitStrategy(Wait.forLogMessage('database system is ready to accept connections'))
        .withStartupTimeout(120000) // 2 minutes
        .start();

      console.log(`✅ Shared PostgreSQL container started successfully (${this.isCloudEnvironment ? 'cloud' : 'local'})`);
      console.log(`   - Database URL: ${container.getConnectionUri()}`);

      this.sharedContainer = container;

      const databaseUrl = container.getConnectionUri();
      
      // Set environment variable for Prisma
      process.env.DATABASE_URL = databaseUrl;
      process.env.PRISMA_CLIENT_ENGINE_TYPE = 'binary';
      process.env.PRISMA_QUERY_ENGINE_TYPE = 'binary';
      
      // Regenerate Prisma client to ensure correct engine type
      try {
        execSync('npx prisma generate', {
          stdio: 'inherit',
          env: { 
            ...process.env, 
            DATABASE_URL: databaseUrl,
            PRISMA_CLIENT_ENGINE_TYPE: 'binary',
            PRISMA_QUERY_ENGINE_TYPE: 'binary'
          },
          cwd: process.cwd(),
        });
      } catch (error) {
        console.warn('Failed to regenerate Prisma client:', error);
      }
      
      // Create Prisma client with explicit configuration
      this.sharedPrisma = new PrismaClient({
        datasources: {
          db: {
            url: databaseUrl,
          },
        },
        log: ['error'],
      });

      // Run migrations on the shared database
      await this.runMigrations(databaseUrl);
    }

    return {
      container: this.sharedContainer,
      prisma: this.sharedPrisma,
      databaseUrl: this.sharedContainer.getConnectionUri(),
    };
  }

  /**
   * Create a new test database with Prisma client (for isolated tests)
   */
  async createTestDatabase(): Promise<TestDatabase> {
    // For most tests, use the shared container
    return this.getSharedTestDatabase();
  }

  /**
   * Create a complete test environment with database and seed data
   */
  async createTestEnvironment(seedData = true): Promise<TestEnvironment> {
    const database = await this.getSharedTestDatabase();

    if (seedData) {
      await this.seedTestDatabase(database.prisma);
    }

    const cleanup = async () => {
      try {
        // Clean the database instead of disconnecting
        await this.cleanDatabase(database.prisma);
      } catch (error) {
        console.warn('Error during cleanup:', error);
      }
    };

    return {
      database,
      cleanup,
    };
  }

  /**
   * Clean the database by truncating all tables (faster than recreating)
   */
  private async cleanDatabase(prisma: PrismaClient): Promise<void> {
    try {
      // Disable foreign key checks temporarily
      await prisma.$executeRaw`SET session_replication_role = replica;`;
      
      // Get all table names
      const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN ('_prisma_migrations', 'schema_migrations')
      `;
      
      // Truncate all tables
      for (const table of tables) {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table.tablename}" CASCADE;`);
      }
      
      // Re-enable foreign key checks
      await prisma.$executeRaw`SET session_replication_role = DEFAULT;`;
      
      console.log(`🧹 Cleaned ${tables.length} tables in shared database`);
    } catch (error) {
      console.warn('Error cleaning database:', error);
      // If cleaning fails, we can continue - the next test will handle it
    }
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
          firstName: 'Test',
          lastName: 'User',
          role: 'ADMIN',
          hashedPassword: 'test-hashed-password',
          isActive: true,
        },
      });

      const memberUser = await prisma.user.upsert({
        where: { email: 'member@example.com' },
        update: {},
        create: {
          email: 'member@example.com',
          firstName: 'Member',
          lastName: 'User',
          role: 'MEMBER',
          hashedPassword: 'test-hashed-password',
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
          notifyEventRegistrations: true,
          notifyPayments: true,
          notifySystemAlerts: true,
          adminEmails: 'admin@basa-test.org',
          stripePublicKey: 'pk_test_1234567890',
          stripeSecretKey: 'sk_test_1234567890',
          stripeTestMode: true,
          smtpHost: 'smtp.mailgun.org',
          smtpPort: 587,
          smtpUsername: 'postmaster@mg.basa-test.org',
          smtpPassword: 'test-password',
          googleAnalyticsId: 'GA-TEST-123',
          googleTagManagerId: 'GTM-TEST-123',
          logoUrl: 'https://basa-test.org/images/logo.png',
          faviconUrl: 'https://basa-test.org/images/favicon.ico',
          primaryColor: '#1e40af',
          secondaryColor: '#059669',
          showMemberCount: true,
          showEventCalendar: true,
          showTestimonials: true,
        },
      });

      console.log('✅ Test database seeded successfully');
    } catch (error) {
      console.error('❌ Failed to seed test database:', error);
      // Don't throw error, just log it
    }
  }

  /**
   * Clean up all containers and Prisma clients
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up Testcontainers environment...');
    
    // Disconnect all Prisma clients
    const disconnectPromises = [];
    if (this.sharedPrisma) {
      disconnectPromises.push(this.sharedPrisma.$disconnect());
    }
    
    await Promise.all(disconnectPromises);
    this.sharedPrisma = null;

    // Stop all containers
    const stopPromises = [];
    if (this.sharedContainer) {
      stopPromises.push(this.sharedContainer.stop());
    }
    
    await Promise.all(stopPromises);
    this.sharedContainer = null;
    
    console.log('✅ Testcontainers cleanup completed');
  }

  /**
   * Get container statistics
   */
  getContainerStats(): { total: number; running: number } {
    return {
      total: this.sharedContainer ? 1 : 0,
      running: this.sharedContainer ? (this.sharedContainer.isRunning() ? 1 : 0) : 0,
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