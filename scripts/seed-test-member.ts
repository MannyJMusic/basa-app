import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'manny@mannyjmusic.com'
  const password = 'password123'
  const firstName = 'Manny'
  const lastName = 'Moreno'
  const businessName = 'Test Business'

  // Check if user exists
  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        hashedPassword: await bcrypt.hash(password, 10),
        role: 'MEMBER',
        isActive: true,
        accountStatus: 'ACTIVE',
        membershipPaymentConfirmed: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      }
    })
    console.log('Created test user:', user.id)
  } else {
    console.log('Test user already exists:', user.id)
  }

  // Check if member exists
  let member = await prisma.member.findUnique({ where: { userId: user.id } })
  if (!member) {
    member = await prisma.member.create({
      data: {
        userId: user.id,
        businessName,
        membershipTier: 'BASIC',
        membershipStatus: 'ACTIVE',
        joinedAt: new Date(),
      }
    })
    console.log('Created test member:', member.id)
  } else {
    console.log('Test member already exists:', member.id)
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) }) 