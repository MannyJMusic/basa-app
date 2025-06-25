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

  // Initialize default settings if none exist
  const existingSettings = await prisma.settings.findFirst()
  if (!existingSettings) {
    await prisma.settings.create({
      data: {
        organizationName: 'BASA - Business Association of San Antonio',
        contactEmail: 'admin@basa.org',
        phoneNumber: '(210) 555-0123',
        website: 'https://basa.org',
        address: '123 Business District, San Antonio, TX 78205',
        description: 'BASA is the premier business association in San Antonio, connecting entrepreneurs and business leaders for growth and success.',
        maintenanceMode: false,
        autoApproveMembers: false,
        emailNotifications: true,
        requireTwoFactor: true,
        sessionTimeout: 30,
        enforcePasswordPolicy: true,
        apiRateLimit: 100,
        notifyNewMembers: true,
        notifyPayments: true,
        notifyEventRegistrations: true,
        notifySystemAlerts: true,
        adminEmails: 'admin@basa.org\nmanager@basa.org',
        stripeTestMode: true,
        primaryColor: '#1e40af',
        secondaryColor: '#059669',
        showMemberCount: true,
        showEventCalendar: true,
        showTestimonials: true,
      }
    })
    console.log('Created default settings')
  } else {
    console.log('Settings already exist')
  }

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
      businessEmail: 'john@techcorp.com',
      businessPhone: '(210) 555-0101',
      businessAddress: '123 Tech Blvd, Suite 100',
      zipCode: '78205',
      website: 'https://techcorp.com',
      description: 'Innovative software solutions for growing businesses',
      tagline: 'Building the future, one line of code at a time',
      specialties: ['Web Development', 'Mobile Apps', 'Cloud Solutions'],
      certifications: ['AWS Certified', 'Google Cloud Professional'],
      showInDirectory: true,
      allowContact: true,
      showAddress: true,
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
      businessEmail: 'sarah@innovatebiz.com',
      businessPhone: '(210) 555-0202',
      businessAddress: '456 Business Ave, Floor 3',
      zipCode: '78209',
      website: 'https://innovatebiz.com',
      description: 'Strategic business consulting to help companies grow and succeed',
      tagline: 'Your success is our mission',
      specialties: ['Business Strategy', 'Process Improvement', 'Leadership Development'],
      certifications: ['Certified Management Consultant', 'Six Sigma Black Belt'],
      showInDirectory: true,
      allowContact: true,
      showAddress: false,
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
      businessEmail: 'mike@localchamber.org',
      businessPhone: '(210) 555-0303',
      businessAddress: '789 Chamber Way',
      zipCode: '78212',
      website: 'https://localchamber.org',
      description: 'Supporting local businesses and economic development',
      tagline: 'Building a stronger business community',
      specialties: ['Business Advocacy', 'Economic Development', 'Community Events'],
      certifications: ['Chamber Management Professional'],
      showInDirectory: true,
      allowContact: true,
      showAddress: true,
    },
    {
      firstName: 'Jennifer',
      lastName: 'Chen',
      email: 'jennifer.chen@marketingpros.com',
      password: 'password123',
      businessName: 'Marketing Pros SA',
      businessType: 'Marketing',
      industry: ['Marketing', 'Digital Marketing'],
      city: 'San Antonio',
      state: 'TX',
      membershipTier: 'PREMIUM' as const,
      businessEmail: 'jennifer@marketingpros.com',
      businessPhone: '(210) 555-0404',
      businessAddress: '321 Marketing Ave',
      zipCode: '78215',
      website: 'https://marketingpros.com',
      description: 'Strategic marketing solutions that drive results',
      tagline: 'Where creativity meets strategy',
      specialties: ['Digital Marketing', 'Brand Strategy', 'Social Media'],
      certifications: ['Google Ads Certified', 'Facebook Blueprint'],
      showInDirectory: true,
      allowContact: true,
      showAddress: true,
    },
    {
      firstName: 'David',
      lastName: 'Thompson',
      email: 'david.thompson@thompsonconstruction.com',
      password: 'password123',
      businessName: 'Thompson Construction Co.',
      businessType: 'Construction',
      industry: ['Construction', 'Real Estate'],
      city: 'San Antonio',
      state: 'TX',
      membershipTier: 'BASIC' as const,
      businessEmail: 'david@thompsonconstruction.com',
      businessPhone: '(210) 555-0505',
      businessAddress: '654 Construction Way',
      zipCode: '78218',
      website: 'https://thompsonconstruction.com',
      description: 'Quality construction services for commercial and residential projects',
      tagline: 'Building excellence, one project at a time',
      specialties: ['Commercial Construction', 'Renovation', 'Project Management'],
      certifications: ['Licensed General Contractor', 'LEED Certified'],
      showInDirectory: true,
      allowContact: true,
      showAddress: true,
    },
    {
      firstName: 'Lisa',
      lastName: 'Garcia',
      email: 'lisa.garcia@garciarealty.com',
      password: 'password123',
      businessName: 'Garcia Realty Group',
      businessType: 'Real Estate',
      industry: ['Real Estate', 'Property Management'],
      city: 'San Antonio',
      state: 'TX',
      membershipTier: 'PREMIUM' as const,
      businessEmail: 'lisa@garciarealty.com',
      businessPhone: '(210) 555-0606',
      businessAddress: '987 Real Estate Blvd',
      zipCode: '78221',
      website: 'https://garciarealty.com',
      description: 'Premier real estate services in San Antonio and surrounding areas',
      tagline: 'Your home, our passion',
      specialties: ['Residential Sales', 'Commercial Properties', 'Investment Properties'],
      certifications: ['Texas Real Estate License', 'Certified Residential Specialist'],
      showInDirectory: true,
      allowContact: true,
      showAddress: false,
    },
    {
      firstName: 'Robert',
      lastName: 'Williams',
      email: 'robert.williams@williamsaccounting.com',
      password: 'password123',
      businessName: 'Williams Accounting Services',
      businessType: 'Accounting',
      industry: ['Accounting', 'Financial Services'],
      city: 'San Antonio',
      state: 'TX',
      membershipTier: 'BASIC' as const,
      businessEmail: 'robert@williamsaccounting.com',
      businessPhone: '(210) 555-0707',
      businessAddress: '147 Accounting Circle',
      zipCode: '78224',
      website: 'https://williamsaccounting.com',
      description: 'Comprehensive accounting and tax services for businesses',
      tagline: 'Numbers that tell your story',
      specialties: ['Tax Preparation', 'Bookkeeping', 'Business Consulting'],
      certifications: ['Certified Public Accountant', 'QuickBooks ProAdvisor'],
      showInDirectory: true,
      allowContact: true,
      showAddress: true,
    },
    {
      firstName: 'Amanda',
      lastName: 'Martinez',
      email: 'amanda.martinez@martinezdesign.com',
      password: 'password123',
      businessName: 'Martinez Design Studio',
      businessType: 'Design',
      industry: ['Design', 'Creative Services'],
      city: 'San Antonio',
      state: 'TX',
      membershipTier: 'BASIC' as const,
      businessEmail: 'amanda@martinezdesign.com',
      businessPhone: '(210) 555-0808',
      businessAddress: '258 Design Street',
      zipCode: '78227',
      website: 'https://martinezdesign.com',
      description: 'Creative design solutions for brands and businesses',
      tagline: 'Design that speaks volumes',
      specialties: ['Graphic Design', 'Brand Identity', 'Web Design'],
      certifications: ['Adobe Certified Expert', 'Design Thinking Practitioner'],
      showInDirectory: true,
      allowContact: true,
      showAddress: false,
    },
    {
      firstName: 'James',
      lastName: 'Anderson',
      email: 'james.anderson@andersonconsulting.com',
      password: 'password123',
      businessName: 'Anderson Business Consulting',
      businessType: 'Consulting',
      industry: ['Consulting', 'Business Services'],
      city: 'San Antonio',
      state: 'TX',
      membershipTier: 'VIP' as const,
      businessEmail: 'james@andersonconsulting.com',
      businessPhone: '(210) 555-0909',
      businessAddress: '369 Consulting Drive',
      zipCode: '78230',
      website: 'https://andersonconsulting.com',
      description: 'Strategic business consulting to help companies grow and succeed',
      tagline: 'Your success is our mission',
      specialties: ['Business Strategy', 'Process Improvement', 'Leadership Development'],
      certifications: ['Certified Management Consultant', 'Six Sigma Black Belt'],
      showInDirectory: true,
      allowContact: true,
      showAddress: true,
    },
    {
      firstName: 'Maria',
      lastName: 'Lopez',
      email: 'maria.lopez@lopezinsurance.com',
      password: 'password123',
      businessName: 'Lopez Insurance Agency',
      businessType: 'Insurance',
      industry: ['Insurance', 'Financial Services'],
      city: 'San Antonio',
      state: 'TX',
      membershipTier: 'PREMIUM' as const,
      businessEmail: 'maria@lopezinsurance.com',
      businessPhone: '(210) 555-1010',
      businessAddress: '741 Insurance Lane',
      zipCode: '78233',
      website: 'https://lopezinsurance.com',
      description: 'Comprehensive insurance solutions for individuals and businesses',
      tagline: 'Protecting what matters most',
      specialties: ['Business Insurance', 'Life Insurance', 'Health Insurance'],
      certifications: ['Licensed Insurance Agent', 'Certified Insurance Counselor'],
      showInDirectory: true,
      allowContact: true,
      showAddress: false,
    }
  ]

  const createdMembers = []

  for (const memberData of sampleMembers) {
    const existingUser = await prisma.user.findUnique({ where: { email: memberData.email } })

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
          businessEmail: memberData.businessEmail,
          businessPhone: memberData.businessPhone,
          businessAddress: memberData.businessAddress,
          city: memberData.city,
          state: memberData.state,
          zipCode: memberData.zipCode,
          website: memberData.website,
          membershipTier: memberData.membershipTier,
          membershipStatus: 'ACTIVE',
          joinedAt: new Date(),
          description: memberData.description,
          tagline: memberData.tagline,
          specialties: memberData.specialties,
          certifications: memberData.certifications,
          showInDirectory: memberData.showInDirectory,
          allowContact: memberData.allowContact,
          showAddress: memberData.showAddress,
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
    // June 2025 Events
    {
      title: 'Summer Networking Mixer',
      slug: 'summer-networking-mixer-2025',
      description: 'Beat the summer heat with our indoor networking mixer! Connect with fellow BASA members in a relaxed, air-conditioned setting. Perfect for building relationships and discovering new business opportunities.',
      shortDescription: 'Beat the heat with indoor networking',
      startDate: new Date('2025-06-12T18:00:00Z'),
      endDate: new Date('2025-06-12T21:00:00Z'),
      location: 'San Antonio Marriott Rivercenter',
      address: '101 Bowie Street',
      city: 'San Antonio',
      state: 'TX',
      zipCode: '78205',
      capacity: 120,
      price: 30.00,
      memberPrice: 20.00,
      category: 'Networking',
      type: 'NETWORKING',
      status: 'PUBLISHED' as const,
      isFeatured: true,
      image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
      organizerId: createdMembers[0]?.id,
      tags: ['networking', 'summer', 'business', 'san-antonio'],
    },
    {
      title: 'Tech Startup Showcase',
      slug: 'tech-startup-showcase-2025',
      description: 'Discover the next generation of tech startups in San Antonio! This event features presentations from innovative startups, networking with investors, and opportunities to learn about emerging technologies.',
      shortDescription: 'Showcase of innovative tech startups',
      startDate: new Date('2025-06-25T14:00:00Z'),
      endDate: new Date('2025-06-25T18:00:00Z'),
      location: 'Geekdom Event Center',
      address: '131 Soledad Street',
      city: 'San Antonio',
      state: 'TX',
      zipCode: '78205',
      capacity: 200,
      price: 50.00,
      memberPrice: 35.00,
      category: 'Technology',
      type: 'SUMMIT',
      status: 'PUBLISHED' as const,
      isFeatured: true,
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      organizerId: createdMembers[1]?.id,
      tags: ['startup', 'technology', 'innovation', 'san-antonio'],
    },
    {
      title: 'Restaurant Grand Opening',
      slug: 'restaurant-grand-opening-2025',
      description: 'Join us for the grand opening of a new local restaurant! Celebrate this exciting addition to our community with a traditional ribbon cutting ceremony, food tastings, and networking.',
      shortDescription: 'Grand opening of new local restaurant',
      startDate: new Date('2025-06-30T17:00:00Z'),
      endDate: new Date('2025-06-30T19:00:00Z'),
      location: 'The Pearl District',
      address: '303 Pearl Parkway',
      city: 'San Antonio',
      state: 'TX',
      zipCode: '78215',
      capacity: 80,
      price: 0.00,
      memberPrice: 0.00,
      category: 'Business',
      type: 'RIBBON_CUTTING',
      status: 'PUBLISHED' as const,
      isFeatured: false,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
      organizerId: createdMembers[2]?.id,
      tags: ['ribbon-cutting', 'restaurant', 'grand-opening', 'pearl-district'],
    },
    // July 2025 Events
    {
      title: 'Independence Day Business Mixer',
      slug: 'independence-day-business-mixer-2025',
      description: 'Celebrate Independence Day with a patriotic business mixer! Red, white, and blue themed networking event with special discounts for veterans and active military personnel.',
      shortDescription: 'Patriotic themed business networking',
      startDate: new Date('2025-07-03T18:00:00Z'),
      endDate: new Date('2025-07-03T21:00:00Z'),
      location: 'VFW Post 76',
      address: '10 Tenth Street',
      city: 'San Antonio',
      state: 'TX',
      zipCode: '78205',
      capacity: 100,
      price: 25.00,
      memberPrice: 15.00,
      category: 'Networking',
      type: 'NETWORKING',
      status: 'PUBLISHED' as const,
      isFeatured: false,
      image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
      organizerId: createdMembers[0]?.id,
      tags: ['networking', 'independence-day', 'veterans', 'patriotic'],
    },
    {
      title: 'Healthcare Innovation Summit',
      slug: 'healthcare-innovation-summit-2025',
      description: 'Explore the future of healthcare technology and innovation in San Antonio. This summit brings together healthcare professionals, technology leaders, and entrepreneurs to discuss emerging trends and opportunities.',
      shortDescription: 'Healthcare technology and innovation summit',
      startDate: new Date('2025-07-15T09:00:00Z'),
      endDate: new Date('2025-07-15T17:00:00Z'),
      location: 'UT Health San Antonio',
      address: '7703 Floyd Curl Drive',
      city: 'San Antonio',
      state: 'TX',
      zipCode: '78229',
      capacity: 250,
      price: 125.00,
      memberPrice: 85.00,
      category: 'Healthcare',
      type: 'SUMMIT',
      status: 'PUBLISHED' as const,
      isFeatured: true,
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
      organizerId: createdMembers[1]?.id,
      tags: ['healthcare', 'innovation', 'technology', 'medical'],
    },
    {
      title: 'Community Garden Volunteer Day',
      slug: 'community-garden-volunteer-day-2025',
      description: 'Give back to the community by helping maintain our local community garden. This volunteer event is perfect for team building and making a positive impact on our environment.',
      shortDescription: 'Volunteer day at community garden',
      startDate: new Date('2025-07-26T08:00:00Z'),
      endDate: new Date('2025-07-26T12:00:00Z'),
      location: 'San Antonio Community Garden',
      address: '789 Garden Street',
      city: 'San Antonio',
      state: 'TX',
      zipCode: '78210',
      capacity: 40,
      price: 0.00,
      memberPrice: 0.00,
      category: 'Community',
      type: 'COMMUNITY',
      status: 'PUBLISHED' as const,
      isFeatured: false,
      image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800',
      organizerId: createdMembers[2]?.id,
      tags: ['volunteer', 'community-garden', 'environment', 'team-building'],
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

  // --- Seed Blog Posts ---
  const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (adminUser) {
    const sampleBlogPosts = [
      {
        title: 'Welcome to the BASA Blog',
        slug: 'welcome-to-basa-blog',
        excerpt: 'An introduction to the BASA blog and what you can expect.',
        content: 'Welcome to the official BASA blog! Here you will find news, updates, and resources for our business community.',
        featuredImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
        status: 'PUBLISHED',
        tags: ['welcome', 'basa', 'news'],
        metaTitle: 'Welcome to BASA Blog',
        metaDescription: 'Introduction to the BASA blog.',
        isFeatured: true,
      },
      {
        title: 'Networking Tips for Entrepreneurs',
        slug: 'networking-tips-entrepreneurs',
        excerpt: 'Top strategies for effective business networking.',
        content: 'Networking is key to business growth. Here are our top tips for making meaningful connections.',
        featuredImage: 'https://images.unsplash.com/photo-1515168833906-d2a3b82b3029?w=800',
        status: 'PUBLISHED',
        tags: ['networking', 'tips', 'entrepreneurs'],
        metaTitle: 'Networking Tips',
        metaDescription: 'Top networking strategies for entrepreneurs.',
        isFeatured: false,
      },
    ]
    for (const post of sampleBlogPosts) {
      const exists = await prisma.blogPost.findUnique({ where: { slug: post.slug } })
      if (!exists) {
        await prisma.blogPost.create({
          data: {
            ...post,
            authorId: adminUser.id,
            publishedAt: new Date(),
          },
        })
        console.log(`Created blog post: ${post.title}`)
      }
    }
  }

  // --- Seed Testimonials ---
  if (createdMembers.length > 0) {
    const sampleTestimonials = [
      {
        authorName: 'John Smith',
        authorTitle: 'CEO',
        authorCompany: 'TechCorp Solutions',
        content: 'BASA has been instrumental in growing our business. The networking opportunities and resources have helped us connect with key clients and partners.',
        rating: 5,
        status: 'APPROVED',
        isFeatured: true,
        memberId: createdMembers[0].id,
      },
      {
        authorName: 'Sarah Johnson',
        authorTitle: 'Founder',
        authorCompany: 'Innovate Business Solutions',
        content: 'The mentorship program and business resources have been invaluable. I have learned so much from fellow entrepreneurs in the BASA community.',
        rating: 5,
        status: 'APPROVED',
        isFeatured: false,
        memberId: createdMembers[1].id,
      },
    ]
    for (const testimonial of sampleTestimonials) {
      const exists = await prisma.testimonial.findFirst({ where: { authorName: testimonial.authorName, memberId: testimonial.memberId } })
      if (!exists) {
        await prisma.testimonial.create({ data: testimonial })
        console.log(`Created testimonial: ${testimonial.authorName}`)
      }
    }
  }

  // --- Seed Resources ---
  if (createdMembers.length > 0) {
    const sampleResources = [
      {
        title: 'Business Plan Template',
        description: 'A comprehensive template for creating a professional business plan.',
        fileUrl: 'https://example.com/business-plan-template.pdf',
        fileType: 'PDF',
        fileSize: 1024000,
        isActive: true,
        category: 'Templates',
        tags: ['template', 'business', 'plan'],
        memberId: createdMembers[0].id,
      },
      {
        title: 'Networking Guide',
        description: 'Tips and strategies for effective business networking.',
        fileUrl: 'https://example.com/networking-guide.pdf',
        fileType: 'PDF',
        fileSize: 512000,
        isActive: true,
        category: 'Guides',
        tags: ['networking', 'guide'],
        memberId: createdMembers[1].id,
      },
    ]
    for (const resource of sampleResources) {
      const exists = await prisma.resource.findFirst({ where: { title: resource.title, memberId: resource.memberId } })
      if (!exists) {
        await prisma.resource.create({ data: resource })
        console.log(`Created resource: ${resource.title}`)
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