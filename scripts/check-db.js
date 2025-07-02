const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('🔍 Checking database state...')
    
    // Check users
    const users = await prisma.user.findMany()
    console.log(`📊 Users: ${users.length}`)
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`)
    })
    
    // Check members
    const members = await prisma.member.findMany()
    console.log(`📊 Members: ${members.length}`)
    members.forEach(member => {
      console.log(`  - ${member.businessName} (${member.membershipTier})`)
    })
    
    // Check events
    const events = await prisma.event.findMany()
    console.log(`📊 Events: ${events.length}`)
    events.forEach(event => {
      console.log(`  - ${event.title} (${event.status})`)
    })
    
    // Check settings
    const settings = await prisma.settings.findFirst()
    console.log(`📊 Settings: ${settings ? 'Exists' : 'Missing'}`)
    
  } catch (error) {
    console.error('❌ Error checking database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase() 