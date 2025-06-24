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

  // Create sample members for events
  const sampleMembers = [
    {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@techcorp.com',
      password: 'password123',
      businessName: 'TechCorp Solutions',
      businessType: 'Technology',
      industry: ['Technology', 'Software'],
      city: 'San Antonio',
      state: 'TX',
      membershipTier: 'PREMIUM' as const,
    },
    {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@innovatebiz.com',
      password: 'password123',
      businessName: 'Innovate Business Solutions',
      businessType: 'Consulting',
      industry: ['Consulting', 'Business Services'],
      city: 'San Antonio',
      state: 'TX',
      membershipTier: 'VIP' as const,
    },
    {
      firstName: 'Mike',
      lastName: 'Davis',
      email: 'mike.davis@localchamber.org',
      password: 'password123',
      businessName: 'San Antonio Chamber of Commerce',
      businessType: 'Non-Profit',
      industry: ['Non-Profit', 'Community'],
      city: 'San Antonio',
      state: 'TX',
      membershipTier: 'BASIC' as const,
    },
  ]

  const createdMembers = []

  for (const memberData of sampleMembers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: memberData.email }
    })

    if (!existingUser) {
      const user = await prisma.user.create({
        data: {
          firstName: memberData.firstName,
          lastName: memberData.lastName,
          email: memberData.email,
          hashedPassword: await bcrypt.hash(memberData.password, 10),
          role: 'MEMBER',
          isActive: true,
        },
      })

      const member = await prisma.member.create({
        data: {
          userId: user.id,
          businessName: memberData.businessName,
          businessType: memberData.businessType,
          industry: memberData.industry,
          city: memberData.city,
          state: memberData.state,
          membershipTier: memberData.membershipTier,
          membershipStatus: 'ACTIVE',
        },
      })

      createdMembers.push(member)
      console.log(`Created member: ${memberData.businessName}`)
    } else {
      const member = await prisma.member.findUnique({
        where: { userId: existingUser.id }
      })
      if (member) {
        createdMembers.push(member)
        console.log(`Member already exists: ${memberData.businessName}`)
      }
    }
  }

  // Create sample events
  const sampleEvents = [
    {
      title: 'BASA Networking Mixer',
      slug: 'basa-networking-mixer-2024',
      description: 'Join us for an evening of networking with fellow BASA members and local business leaders. This is a great opportunity to build connections, share ideas, and grow your business network.',
      shortDescription: 'An evening of networking with fellow BASA members',
      startDate: new Date('2025-02-15T18:00:00Z'),
      endDate: new Date('2025-02-15T21:00:00Z'),
      location: 'The Pearl Brewery',
      address: '303 Pearl Parkway',
      city: 'San Antonio',
      state: 'TX',
      zipCode: '78215',
      capacity: 100,
      price: 25.00,
      memberPrice: 15.00,
      category: 'Networking',
      type: 'NETWORKING',
      status: 'PUBLISHED' as const,
      isFeatured: true,
      image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
      organizerId: createdMembers[0]?.id,
      tags: ['networking', 'business', 'san-antonio', 'mixer'],
    },
    {
      title: 'Tech Innovation Summit 2024',
      slug: 'tech-innovation-summit-2024',
      description: 'A full-day summit bringing together technology leaders, entrepreneurs, and innovators to discuss the latest trends in technology and their impact on business. Featuring keynote speakers, panel discussions, and networking opportunities.',
      shortDescription: 'A full-day technology innovation summit',
      startDate: new Date('2025-03-20T09:00:00Z'),
      endDate: new Date('2025-03-20T17:00:00Z'),
      location: 'Henry B. González Convention Center',
      address: '900 E Market St',
      city: 'San Antonio',
      state: 'TX',
      zipCode: '78205',
      capacity: 300,
      price: 150.00,
      memberPrice: 100.00,
      category: 'Technology',
      type: 'SUMMIT',
      status: 'PUBLISHED' as const,
      isFeatured: true,
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      organizerId: createdMembers[1]?.id,
      tags: ['technology', 'innovation', 'summit', 'san-antonio'],
    },
    {
      title: 'Downtown Business Ribbon Cutting',
      slug: 'downtown-business-ribbon-cutting',
      description: 'Celebrate the grand opening of a new downtown business with a traditional ribbon cutting ceremony. Join us for refreshments, networking, and to welcome this new addition to our business community.',
      shortDescription: 'Grand opening ribbon cutting ceremony',
      startDate: new Date('2025-02-28T16:00:00Z'),
      endDate: new Date('2025-02-28T18:00:00Z'),
      location: 'Downtown Business District',
      address: '123 Main Street',
      city: 'San Antonio',
      state: 'TX',
      zipCode: '78205',
      capacity: 50,
      price: 0.00,
      memberPrice: 0.00,
      category: 'Business',
      type: 'RIBBON_CUTTING',
      status: 'PUBLISHED' as const,
      isFeatured: false,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
      organizerId: createdMembers[2]?.id,
      tags: ['ribbon-cutting', 'grand-opening', 'downtown', 'san-antonio'],
    },
    {
      title: 'Community Service Day',
      slug: 'community-service-day-2024',
      description: 'Join BASA members for a day of community service. We\'ll be working on various projects to give back to our community. This is a great opportunity to make a difference while networking with fellow members.',
      shortDescription: 'A day of community service and networking',
      startDate: new Date('2025-04-15T08:00:00Z'),
      endDate: new Date('2025-04-15T16:00:00Z'),
      location: 'Various Locations',
      address: 'Multiple sites across San Antonio',
      city: 'San Antonio',
      state: 'TX',
      zipCode: '78201',
      capacity: 75,
      price: 0.00,
      memberPrice: 0.00,
      category: 'Community',
      type: 'COMMUNITY',
      status: 'DRAFT' as const,
      isFeatured: false,
      image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800',
      organizerId: createdMembers[2]?.id,
      tags: ['community-service', 'volunteer', 'san-antonio', 'giving-back'],
    },
    {
      title: 'Business Growth Workshop',
      slug: 'business-growth-workshop',
      description: 'Learn strategies for growing your business in today\'s competitive market. This workshop will cover topics including marketing, sales, operations, and financial management.',
      shortDescription: 'Workshop on business growth strategies',
      startDate: new Date('2025-03-10T13:00:00Z'),
      endDate: new Date('2025-03-10T17:00:00Z'),
      location: 'BASA Conference Center',
      address: '456 Business Ave',
      city: 'San Antonio',
      state: 'TX',
      zipCode: '78212',
      capacity: 60,
      price: 75.00,
      memberPrice: 50.00,
      category: 'Education',
      type: 'NETWORKING',
      status: 'PUBLISHED' as const,
      isFeatured: false,
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      organizerId: createdMembers[1]?.id,
      tags: ['workshop', 'business-growth', 'education', 'san-antonio'],
    },
  ]

  for (const eventData of sampleEvents) {
    if (!eventData.organizerId) continue

    const existingEvent = await prisma.event.findUnique({
      where: { slug: eventData.slug }
    })

    if (!existingEvent) {
      const event = await prisma.event.create({
        data: eventData,
      })
      console.log(`Created event: ${eventData.title}`)
    } else {
      console.log(`Event already exists: ${eventData.title}`)
    }
  }

  // Create sample event registrations
  const sampleRegistrations = [
    {
      eventSlug: 'basa-networking-mixer-2024',
      registrations: [
        { name: 'Alice Johnson', email: 'alice@techstartup.com', company: 'TechStartup Inc', ticketCount: 1, totalAmount: 15.00, status: 'CONFIRMED' as const },
        { name: 'Bob Wilson', email: 'bob@consulting.com', company: 'Wilson Consulting', ticketCount: 2, totalAmount: 30.00, status: 'CONFIRMED' as const },
        { name: 'Carol Martinez', email: 'carol@designstudio.com', company: 'Martinez Design Studio', ticketCount: 1, totalAmount: 15.00, status: 'PENDING' as const },
      ]
    },
    {
      eventSlug: 'tech-innovation-summit-2024',
      registrations: [
        { name: 'David Chen', email: 'david@ai-company.com', company: 'AI Innovations', ticketCount: 1, totalAmount: 100.00, status: 'CONFIRMED' as const },
        { name: 'Emma Rodriguez', email: 'emma@software.com', company: 'Rodriguez Software', ticketCount: 3, totalAmount: 300.00, status: 'CONFIRMED' as const },
        { name: 'Frank Thompson', email: 'frank@startup.com', company: 'Thompson Startup', ticketCount: 1, totalAmount: 100.00, status: 'CONFIRMED' as const },
        { name: 'Grace Lee', email: 'grace@techcorp.com', company: 'Lee Tech Solutions', ticketCount: 1, totalAmount: 100.00, status: 'PENDING' as const },
      ]
    },
    {
      eventSlug: 'downtown-business-ribbon-cutting',
      registrations: [
        { name: 'Henry Brown', email: 'henry@localbiz.com', company: 'Brown Local Business', ticketCount: 1, totalAmount: 0.00, status: 'CONFIRMED' as const },
        { name: 'Iris Garcia', email: 'iris@chamber.org', company: 'Garcia Chamber', ticketCount: 2, totalAmount: 0.00, status: 'CONFIRMED' as const },
      ]
    },
    {
      eventSlug: 'business-growth-workshop',
      registrations: [
        { name: 'Jack Miller', email: 'jack@smallbiz.com', company: 'Miller Small Business', ticketCount: 1, totalAmount: 50.00, status: 'CONFIRMED' as const },
        { name: 'Kate Anderson', email: 'kate@consulting.com', company: 'Anderson Consulting', ticketCount: 1, totalAmount: 50.00, status: 'CONFIRMED' as const },
        { name: 'Liam O\'Connor', email: 'liam@startup.com', company: 'O\'Connor Startup', ticketCount: 1, totalAmount: 50.00, status: 'PENDING' as const },
      ]
    },
  ]

  for (const registrationData of sampleRegistrations) {
    const event = await prisma.event.findUnique({
      where: { slug: registrationData.eventSlug }
    })

    if (event) {
      for (const reg of registrationData.registrations) {
        const existingRegistration = await prisma.eventRegistration.findFirst({
          where: {
            eventId: event.id,
            email: reg.email
          }
        })

        if (!existingRegistration) {
          await prisma.eventRegistration.create({
            data: {
              eventId: event.id,
              name: reg.name,
              email: reg.email,
              company: reg.company,
              ticketCount: reg.ticketCount,
              totalAmount: reg.totalAmount,
              status: reg.status,
            },
          })
          console.log(`Created registration for ${reg.name} at ${event.title}`)
        }
      }
    }
  }

  // Create sample event speakers
  const sampleSpeakers = [
    {
      eventSlug: 'tech-innovation-summit-2024',
      speakers: [
        { name: 'Dr. Sarah Johnson', title: 'CEO', company: 'Innovate Business Solutions', bio: 'Leading technology consultant with 15+ years of experience in digital transformation.', topic: 'The Future of AI in Business', order: 1 },
        { name: 'Mike Chen', title: 'CTO', company: 'TechCorp Solutions', bio: 'Technology leader specializing in scalable software architecture and cloud solutions.', topic: 'Cloud Computing Trends', order: 2 },
        { name: 'Lisa Rodriguez', title: 'Founder', company: 'Startup Accelerator', bio: 'Serial entrepreneur and startup mentor with expertise in scaling businesses.', topic: 'Scaling Your Tech Startup', order: 3 },
      ]
    },
    {
      eventSlug: 'business-growth-workshop',
      speakers: [
        { name: 'John Smith', title: 'Business Consultant', company: 'TechCorp Solutions', bio: 'Business growth expert with focus on technology companies and digital marketing.', topic: 'Digital Marketing Strategies', order: 1 },
        { name: 'Maria Garcia', title: 'Financial Advisor', company: 'Garcia Financial Services', bio: 'Certified financial planner specializing in small business financial management.', topic: 'Financial Planning for Growth', order: 2 },
      ]
    },
  ]

  for (const speakerData of sampleSpeakers) {
    const event = await prisma.event.findUnique({
      where: { slug: speakerData.eventSlug }
    })

    if (event) {
      for (const speaker of speakerData.speakers) {
        const existingSpeaker = await prisma.eventSpeaker.findFirst({
          where: {
            eventId: event.id,
            name: speaker.name
          }
        })

        if (!existingSpeaker) {
          await prisma.eventSpeaker.create({
            data: {
              eventId: event.id,
              name: speaker.name,
              title: speaker.title,
              company: speaker.company,
              bio: speaker.bio,
              topic: speaker.topic,
              order: speaker.order,
            },
          })
          console.log(`Created speaker ${speaker.name} for ${event.title}`)
        }
      }
    }
  }

  // Create sample event sponsors
  const sampleSponsors = [
    {
      eventSlug: 'tech-innovation-summit-2024',
      sponsors: [
        { name: 'TechCorp Solutions', website: 'https://techcorp.com', tier: 'PLATINUM' as const },
        { name: 'Innovate Business Solutions', website: 'https://innovatebiz.com', tier: 'GOLD' as const },
        { name: 'San Antonio Chamber of Commerce', website: 'https://sachamber.org', tier: 'SILVER' as const },
      ]
    },
    {
      eventSlug: 'basa-networking-mixer-2024',
      sponsors: [
        { name: 'Local Business Association', website: 'https://localbiz.org', tier: 'GOLD' as const },
        { name: 'Community Bank', website: 'https://communitybank.com', tier: 'SILVER' as const },
      ]
    },
  ]

  for (const sponsorData of sampleSponsors) {
    const event = await prisma.event.findUnique({
      where: { slug: sponsorData.eventSlug }
    })

    if (event) {
      for (const sponsor of sponsorData.sponsors) {
        const existingSponsor = await prisma.eventSponsor.findFirst({
          where: {
            eventId: event.id,
            name: sponsor.name
          }
        })

        if (!existingSponsor) {
          await prisma.eventSponsor.create({
            data: {
              eventId: event.id,
              name: sponsor.name,
              website: sponsor.website,
              tier: sponsor.tier,
            },
          })
          console.log(`Created sponsor ${sponsor.name} for ${event.title}`)
        }
      }
    }
  }

  console.log('Seed data creation completed!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect()) 