#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🗄️ Setting up BASA database...');

async function checkDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    execSync('npx prisma db execute --stdin', { 
      input: 'SELECT 1;',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    return false;
  }
}

async function checkDatabaseSchema() {
  try {
    console.log('🔍 Checking if database has existing schema...');
    const result = execSync('npx prisma db execute --stdin', { 
      input: `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '_prisma_migrations'
        );
      `,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    const hasMigrationsTable = result.toString().includes('t');
    console.log(`Database has migrations table: ${hasMigrationsTable}`);
    
    if (hasMigrationsTable) {
      // Check if there are any tables
      const tablesResult = execSync('npx prisma db execute --stdin', { 
        input: `
          SELECT COUNT(*) as table_count 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name NOT LIKE 'pg_%' 
          AND table_name != '_prisma_migrations';
        `,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      const tableCount = parseInt(tablesResult.toString().match(/\d+/)?.[0] || '0');
      console.log(`Database has ${tableCount} user tables`);
      
      return {
        hasMigrationsTable: true,
        hasUserTables: tableCount > 0
      };
    }
    
    return {
      hasMigrationsTable: false,
      hasUserTables: false
    };
  } catch (error) {
    console.log('⚠️ Could not check database schema:', error.message);
    return {
      hasMigrationsTable: false,
      hasUserTables: false
    };
  }
}

async function setupDatabase() {
  try {
    // Test database connection
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Cannot connect to database');
    }

    // Check database state
    const dbState = await checkDatabaseSchema();
    
    if (dbState.hasMigrationsTable && dbState.hasUserTables) {
      // Database has existing schema and data - use migrations
      console.log('📦 Database has existing schema, running migrations...');
      try {
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        console.log('✅ Migrations completed successfully!');
      } catch (migrateError) {
        console.log('⚠️ Migration failed, trying schema push...');
        execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
        console.log('✅ Schema push completed successfully!');
      }
    } else if (dbState.hasMigrationsTable && !dbState.hasUserTables) {
      // Database has migrations table but no user tables - run migrations
      console.log('📦 Database has migrations table but no user tables, running migrations...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ Migrations completed successfully!');
    } else {
      // Fresh database - use schema push
      console.log('📦 Fresh database detected, pushing schema...');
      execSync('npx prisma db push', { stdio: 'inherit' });
      console.log('✅ Schema push completed successfully!');
    }

    // Seed the database
    console.log('🌱 Seeding database...');
    try {
      execSync('pnpm run db:seed', { stdio: 'inherit' });
      console.log('✅ Database seeded successfully!');
    } catch (seedError) {
      console.log('⚠️ Database seeding failed (may already have data):', seedError.message);
    }

    console.log('✅ Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupDatabase(); 