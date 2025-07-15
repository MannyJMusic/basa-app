const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@basa.org',
        firstName: 'Admin',
        lastName: 'User',
        name: 'Admin User',
        hashedPassword: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        accountStatus: 'ACTIVE',
        emailVerified: new Date()
      }
    });

    console.log('Admin user created successfully:');
    console.log('Email: admin@basa.org');
    console.log('Password: admin123');
    console.log('User ID:', adminUser.id);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 