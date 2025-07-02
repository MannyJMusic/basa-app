import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateEventDatesToFuture() {
  try {
    console.log('Updating event dates to future...')
    
    // Get all events
    const events = await prisma.event.findMany()
    console.log(`Found ${events.length} events to update`)
    
    for (const event of events) {
      const currentStartDate = new Date(event.startDate)
      const currentEndDate = new Date(event.endDate)
      
      // Add one year to make them future events
      const newStartDate = new Date(currentStartDate.getFullYear() + 1, currentStartDate.getMonth(), currentStartDate.getDate(), currentStartDate.getHours(), currentStartDate.getMinutes())
      const newEndDate = new Date(currentEndDate.getFullYear() + 1, currentEndDate.getMonth(), currentEndDate.getDate(), currentEndDate.getHours(), currentEndDate.getMinutes())
      
      await prisma.event.update({
        where: { id: event.id },
        data: {
          startDate: newStartDate,
          endDate: newEndDate,
        },
      })
      
      console.log(`Updated event: ${event.title}`)
      console.log(`  Old dates: ${currentStartDate.toISOString()} to ${currentEndDate.toISOString()}`)
      console.log(`  New dates: ${newStartDate.toISOString()} to ${newEndDate.toISOString()}`)
    }
    
    console.log('All events updated with future dates!')
  } catch (error) {
    console.error('Error updating events:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateEventDatesToFuture() 