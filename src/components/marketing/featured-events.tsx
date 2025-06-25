import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react"
import { prisma } from "@/lib/db"

async function getFeaturedEvents() {
  try {
    console.log('Fetching featured events from database...')
    
    const events = await prisma.event.findMany({
      where: {
        status: "PUBLISHED",
        startDate: {
          gte: new Date(), // Only future events
        },
      },
      include: {
        organizer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        registrations: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
      take: 3, // Limit to 3 featured events
    })

    console.log(`Found ${events.length} featured events`)
    return events
  } catch (error) {
    console.error("Error fetching featured events:", error)
    // Return empty array to prevent component from crashing
    return []
  }
}

function getEventTypeBadge(type: string) {
  const typeConfig = {
    NETWORKING: { label: "Networking", className: "event-badge-networking" },
    RIBBON_CUTTING: { label: "Ribbon Cutting", className: "event-badge-ribbon-cutting" },
    COMMUNITY: { label: "Community", className: "event-badge-community" },
    SUMMIT: { label: "Summit", className: "event-badge-summit" },
  }
  
  return typeConfig[type as keyof typeof typeConfig] || { label: type, className: "bg-gray-50 text-gray-700 border-gray-200" }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date))
}

function formatPrice(price: any): string {
  if (!price) return ''
  // Handle Prisma Decimal objects
  if (typeof price === 'object' && price.toString) {
    return price.toString()
  }
  // Handle regular numbers
  if (typeof price === 'number') {
    return price.toFixed(2)
  }
  // Handle strings
  if (typeof price === 'string') {
    return price
  }
  return ''
}

export async function FeaturedEvents() {
  const events = await getFeaturedEvents()

  if (events.length === 0) {
    return (
      <section className="basa-section relative bg-cover bg-center" style={{ backgroundImage: 'url(/images/backgrounds/calendar-bg.jpg)' }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-pattern-dots opacity-5"></div>
        <div className="relative basa-container">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-6 event-badge-community">
              <Calendar className="w-4 h-4 mr-2" />
              Upcoming Events
            </Badge>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-gradient-teal">
              Don't Miss Our Next
              <span className="block">Networking Opportunities</span>
            </h2>
            <p className="text-lg text-basa-charcoal max-w-3xl mx-auto leading-relaxed">
              Join our curated events designed to accelerate your business growth and build meaningful connections.
            </p>
          </div>

          <div className="text-center">
            <p className="text-lg text-basa-charcoal mb-8">
              No upcoming events at the moment. Check back soon for new networking opportunities!
            </p>
            <Button asChild variant="outline" size="lg" className="basa-btn-primary text-lg px-8 py-4 group">
              <Link href="/events">
                View All Events
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="basa-section relative bg-cover bg-center" style={{ backgroundImage: 'url(/images/backgrounds/calendar-bg.jpg)' }}>
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="absolute inset-0 bg-pattern-dots opacity-5"></div>
      <div className="relative basa-container">
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-6 event-badge-community">
            <Calendar className="w-4 h-4 mr-2" />
            Upcoming Events
          </Badge>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-gradient-teal">
            Don't Miss Our Next
            <span className="block">Networking Opportunities</span>
          </h2>
          <p className="text-lg text-basa-charcoal max-w-3xl mx-auto leading-relaxed">
            Join our curated events designed to accelerate your business growth and build meaningful connections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => {
            const typeBadge = getEventTypeBadge(event.type || 'NETWORKING')
            const confirmedRegistrations = event.registrations?.filter(r => r.status === 'CONFIRMED').length || 0
            
            return (
              <Card key={event.id} className="basa-card group hover:scale-105 transition-all duration-500">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className={typeBadge.className}>
                      {typeBadge.label}
                    </Badge>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(event.startDate)}
                    </div>
                  </div>
                  <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                  <CardDescription className="text-basa-charcoal">
                    {event.shortDescription || (event.description ? event.description.substring(0, 120) + '...' : 'No description available')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-basa-charcoal mb-4">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location || 'Location TBD'}
                  </div>
                  
                  {event.capacity && (
                    <div className="text-sm text-basa-charcoal mb-4">
                      {confirmedRegistrations} / {event.capacity} registered
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-sm text-basa-charcoal">
                      {formatTime(event.startDate)}
                    </div>
                    {event.price && (
                      <div className="text-sm font-semibold text-basa-charcoal">
                        ${formatPrice(event.price)}
                      </div>
                    )}
                  </div>
                  
                  <Button asChild className="w-full basa-btn-primary text-white group">
                    <Link href={`/events/${event.slug}`}>
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center mt-16">
          <Button asChild variant="outline" size="lg" className="basa-btn-primary text-lg px-8 py-4 group">
            <Link href="/events">
              View All Events
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
} 