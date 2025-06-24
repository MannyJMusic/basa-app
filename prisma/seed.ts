import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Helper to create admin if not exists
  async function createAdmin(envPrefix: string) {
    const firstName = process.env[`${envPrefix}_FIRST_NAME`]
    const lastName = process.env[`${envPrefix}_LAST_NAME`]
    const email = process.env[`${envPrefix}_EMAIL`]
    const password = process.env[`${envPrefix}_PASSWORD`]

    if (!email || !password) return

    const existing = await prisma.user.findUnique({ where: { email } })
    if (!existing) {
      await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          hashedPassword: await bcrypt.hash(password, 10),
          role: 'ADMIN',
          isActive: true,
        },
      })
      console.log(`Created admin: ${email}`)
    } else {
      console.log(`Admin already exists: ${email}`)
    }
  }

  await createAdmin('ADMIN1')
  await createAdmin('ADMIN2')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect()) 