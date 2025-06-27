import { prisma } from '../src/lib/db'

async function main() {
  const userId = 'cmcfenko40002y9hoxp4bgj3k'
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      console.error(`User with ID ${userId} not found`)
      process.exit(1)
    }

    console.log(`Found user: ${user.email} (${user.firstName} ${user.lastName})`)
    console.log(`Current emailVerified: ${user.emailVerified}`)

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        emailVerified: new Date(),
        accountStatus: 'ACTIVE'
      }
    })

    console.log(`✅ Successfully updated user ${updatedUser.email}`)
    console.log(`New emailVerified: ${updatedUser.emailVerified}`)
    console.log(`New accountStatus: ${updatedUser.accountStatus}`)
  } catch (error) {
    console.error('Error updating user:', error)
    process.exit(1)
  }
}

main().then(() => {
  console.log('Script completed successfully!')
  process.exit(0)
}).catch((e) => {
  console.error(e)
  process.exit(1)
})