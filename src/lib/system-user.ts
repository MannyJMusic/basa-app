import { prisma } from '@/lib/db'

const SYSTEM_USER_EMAIL = 'system@basa.org'

export async function getSystemUser() {
  // Try to find existing system user
  let systemUser = await prisma.user.findUnique({
    where: { email: SYSTEM_USER_EMAIL }
  })

  // Create system user if it doesn't exist
  if (!systemUser) {
    systemUser = await prisma.user.create({
      data: {
        email: SYSTEM_USER_EMAIL,
        firstName: 'System',
        lastName: 'User',
        name: 'System User',
        role: 'ADMIN',
        isActive: true,
        newsletterSubscribed: false
      }
    })
  }

  return systemUser
} 