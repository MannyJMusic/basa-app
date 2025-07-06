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
  private containers: StartedTestContainer[] = [];
  private prismaClients: PrismaClient[] = [];
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
   * Create a new test database with Prisma client
   */
  async createTestDatabase(): Promise<TestDatabase> {
    console.log(`🚀 Creating ${this.isCloudEnvironment ? 'cloud' : 'local'} PostgreSQL container...`);
    
    const container = await new PostgreSqlContainer('postgres:15-alpine')
      .withDatabase('basa_test')
      .withUsername('test_user')
      .withPassword('test_password')
      .withExposedPorts(5432)
      .withWaitStrategy(Wait.forLogMessage('database system is ready to accept connections'))
      .withStartupTimeout(120000) // 2 minutes
      .start();

    console.log(`✅ PostgreSQL container started successfully (${this.isCloudEnvironment ? 'cloud' : 'local'})`);
    console.log(`   - Database URL: ${container.getConnectionUri()}`);

    this.containers.push(container);

    const databaseUrl = container.getConnectionUri();
    
    // Set environment variable for Prisma
    process.env.DATABASE_URL = databaseUrl;
    process.env.PRISMA_CLIENT_ENGINE_TYPE = 'binary';
    
    // Create Prisma client with default configuration
    const prisma = new PrismaClient();

    // Store the client for cleanup
    this.prismaClients.push(prisma);

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
      try {
        await database.prisma.$disconnect();
        await database.container.stop();
        this.containers = this.containers.filter(c => c !== database.container);
        this.prismaClients = this.prismaClients.filter(c => c !== database.prisma);
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
          notifyEventRegistrations: true,
          stripeWebhookEndpoint: 'https://basa-test.org/api/webhooks/stripe',
          mailgunWebhookEndpoint: 'https://basa-test.org/api/webhooks/mailgun',
          googleAnalyticsId: 'GA-TEST-123',
          facebookPixelId: 'FB-TEST-123',
          linkedinInsightTag: 'LI-TEST-123',
          twitterPixelId: 'TW-TEST-123',
          customCss: null,
          customJs: null,
          seoTitle: 'BASA Test - Business Association',
          seoDescription: 'Test environment for BASA business association',
          seoKeywords: 'test, business, association, networking',
          seoImage: 'https://basa-test.org/images/seo-test.jpg',
          socialMediaLinks: {
            facebook: 'https://facebook.com/basa-test',
            twitter: 'https://twitter.com/basa-test',
            linkedin: 'https://linkedin.com/company/basa-test',
            instagram: 'https://instagram.com/basa-test',
          },
          footerLinks: [
            { label: 'About', url: '/about' },
            { label: 'Contact', url: '/contact' },
            { label: 'Privacy Policy', url: '/privacy' },
            { label: 'Terms of Service', url: '/terms' },
          ],
          headerLinks: [
            { label: 'Events', url: '/events' },
            { label: 'Membership', url: '/membership' },
            { label: 'Resources', url: '/resources' },
            { label: 'Blog', url: '/blog' },
          ],
          theme: {
            primaryColor: '#1f2937',
            secondaryColor: '#3b82f6',
            accentColor: '#10b981',
            fontFamily: 'Inter, sans-serif',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          },
          features: {
            enableBlog: true,
            enableEvents: true,
            enableMembership: true,
            enableResources: true,
            enableNewsletter: true,
            enableContactForm: true,
            enableTestimonials: true,
            enableAnalytics: true,
            enableSocialLogin: true,
            enableTwoFactor: false,
            enableMaintenanceMode: false,
            enableApiRateLimiting: true,
            enableWebhooks: true,
            enableAuditLogs: true,
            enableBackups: true,
            enableMonitoring: true,
            enableAlerts: true,
            enableReporting: true,
            enableDashboard: true,
            enableAdminPanel: true,
          },
          integrations: {
            stripe: {
              enabled: true,
              publishableKey: 'pk_test_1234567890',
              secretKey: 'sk_test_1234567890',
              webhookSecret: 'whsec_test_1234567890',
            },
            mailgun: {
              enabled: true,
              apiKey: 'key-test_1234567890',
              domain: 'mg.basa-test.org',
              fromEmail: 'noreply@basa-test.org',
            },
            sentry: {
              enabled: true,
              dsn: 'https://test@sentry.io/test',
              org: 'basa-test',
              project: 'basa-test',
            },
            googleAnalytics: {
              enabled: true,
              trackingId: 'GA-TEST-123',
            },
            facebookPixel: {
              enabled: true,
              pixelId: 'FB-TEST-123',
            },
            linkedinInsight: {
              enabled: true,
              partnerId: 'LI-TEST-123',
            },
            twitterPixel: {
              enabled: true,
              pixelId: 'TW-TEST-123',
            },
          },
          notifications: {
            email: {
              enabled: true,
              smtp: {
                host: 'smtp.mailgun.org',
                port: 587,
                secure: false,
                auth: {
                  user: 'postmaster@mg.basa-test.org',
                  pass: 'test-password',
                },
              },
              templates: {
                welcome: 'Welcome to BASA Test!',
                passwordReset: 'Reset your password',
                eventReminder: 'Event reminder',
                membershipRenewal: 'Membership renewal',
                paymentSuccess: 'Payment successful',
                paymentFailure: 'Payment failed',
              },
            },
            sms: {
              enabled: false,
              provider: 'twilio',
              accountSid: 'test-account-sid',
              authToken: 'test-auth-token',
              fromNumber: '+1234567890',
            },
            push: {
              enabled: false,
              vapidPublicKey: 'test-vapid-public-key',
              vapidPrivateKey: 'test-vapid-private-key',
            },
          },
          security: {
            passwordPolicy: {
              minLength: 8,
              requireUppercase: true,
              requireLowercase: true,
              requireNumbers: true,
              requireSpecialChars: true,
              preventCommonPasswords: true,
              preventPersonalInfo: true,
            },
            sessionPolicy: {
              timeout: 30,
              maxConcurrentSessions: 5,
              requireReauthForSensitiveActions: true,
              rememberMeDuration: 30,
            },
            rateLimiting: {
              enabled: true,
              windowMs: 15 * 60 * 1000, // 15 minutes
              maxRequests: 100,
              skipSuccessfulRequests: false,
              skipFailedRequests: false,
            },
            cors: {
              enabled: true,
              origin: ['https://basa-test.org', 'https://www.basa-test.org'],
              credentials: true,
              methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
              allowedHeaders: ['Content-Type', 'Authorization'],
            },
            csrf: {
              enabled: true,
              cookie: {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
              },
            },
            xss: {
              enabled: true,
              mode: 'sanitize',
            },
            sqlInjection: {
              enabled: true,
              mode: 'prevent',
            },
            fileUpload: {
              enabled: true,
              maxSize: 10 * 1024 * 1024, // 10MB
              allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
              scanForViruses: true,
            },
          },
          performance: {
            caching: {
              enabled: true,
              ttl: 300, // 5 minutes
              maxSize: 1000,
            },
            compression: {
              enabled: true,
              level: 6,
            },
            minification: {
              enabled: true,
              css: true,
              js: true,
              html: true,
            },
            cdn: {
              enabled: false,
              provider: 'cloudflare',
              domain: 'cdn.basa-test.org',
            },
            database: {
              connectionPool: {
                min: 2,
                max: 10,
                acquireTimeoutMillis: 30000,
                createTimeoutMillis: 30000,
                destroyTimeoutMillis: 5000,
                idleTimeoutMillis: 30000,
                reapIntervalMillis: 1000,
                createRetryIntervalMillis: 200,
              },
              queryTimeout: 30000,
              maxQueryComplexity: 1000,
            },
          },
          backup: {
            enabled: true,
            schedule: '0 2 * * *', // Daily at 2 AM
            retention: 30, // 30 days
            storage: {
              type: 'local',
              path: '/opt/basa-backups',
            },
            encryption: {
              enabled: true,
              algorithm: 'aes-256-gcm',
            },
            compression: {
              enabled: true,
              algorithm: 'gzip',
              level: 6,
            },
          },
          monitoring: {
            enabled: true,
            healthChecks: {
              enabled: true,
              interval: 60, // 60 seconds
              timeout: 30, // 30 seconds
              endpoints: [
                '/api/health',
                '/api/health/db',
                '/api/health/redis',
                '/api/health/external',
              ],
            },
            logging: {
              enabled: true,
              level: 'info',
              format: 'json',
              destination: 'file',
              path: '/var/log/basa/app.log',
              maxSize: 100 * 1024 * 1024, // 100MB
              maxFiles: 10,
            },
            metrics: {
              enabled: true,
              provider: 'prometheus',
              endpoint: '/metrics',
              interval: 60, // 60 seconds
            },
            alerts: {
              enabled: true,
              channels: ['email', 'slack'],
              rules: [
                {
                  name: 'High CPU Usage',
                  condition: 'cpu_usage > 80',
                  duration: '5m',
                  severity: 'warning',
                },
                {
                  name: 'High Memory Usage',
                  condition: 'memory_usage > 85',
                  duration: '5m',
                  severity: 'warning',
                },
                {
                  name: 'Database Connection Issues',
                  condition: 'db_connection_errors > 10',
                  duration: '1m',
                  severity: 'critical',
                },
                {
                  name: 'Application Errors',
                  condition: 'app_errors > 50',
                  duration: '5m',
                  severity: 'warning',
                },
              ],
            },
          },
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
    const disconnectPromises = this.prismaClients.map(async (client) => {
      try {
        await client.$disconnect();
      } catch (error) {
        console.warn('Error disconnecting Prisma client:', error);
      }
    });
    
    await Promise.all(disconnectPromises);
    this.prismaClients = [];

    // Stop all containers
    const stopPromises = this.containers.map(async (container) => {
      try {
        await container.stop();
      } catch (error) {
        console.warn('Error stopping container:', error);
      }
    });
    
    await Promise.all(stopPromises);
    this.containers = [];
    
    console.log('✅ Testcontainers cleanup completed');
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