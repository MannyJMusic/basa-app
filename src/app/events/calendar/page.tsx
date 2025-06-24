import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from "lucide-react"

export default function CalendarPage() {
  // Sample calendar data for March 2024
  const calendarDays = [
    // Week 1
    { day: 1, events: [] },
    { day: 2, events: [] },
    { day: 3, events: [] },
    { day: 4, events: [] },
    { day: 5, events: [] },
    { day: 6, events: [] },
    { day: 7, events: [] },
    // Week 2
    { day: 8, events: [] },
    { day: 9, events: [] },
    { day: 10, events: [] },
    { day: 11, events: [] },
    { day: 12, events: [] },
    { day: 13, events: [] },
    { day: 14, events: [] },
    // Week 3
    { day: 15, events: [{ type: 'ribbon-cutting', title: 'Ribbon Cutting', time: '4:00 PM' }] },
    { day: 16, events: [] },
    { day: 17, events: [] },
    { day: 18, events: [] },
    { day: 19, events: [] },
    { day: 20, events: [] },
    { day: 21, events: [{ type: 'networking', title: 'Monthly Mixer', time: '6:00 PM' }] },
    // Week 4
    { day: 22, events: [] },
    { day: 23, events: [] },
    { day: 24, events: [] },
    { day: 25, events: [] },
    { day: 26, events: [] },
    { day: 27, events: [] },
    { day: 28, events: [] },
    // Week 5
    { day: 29, events: [{ type: 'summit', title: 'Tech Summit', time: '9:00 AM' }] },
    { day: 30, events: [] },
    { day: 31, events: [] },
  ]

  const getEventColor = (type: string) => {
    switch (type) {
      case 'networking': return 'bg-blue-100 text-blue-800'
      case 'ribbon-cutting': return 'bg-orange-100 text-orange-800'
      case 'summit': return 'bg-green-100 text-green-800'
      case 'community': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-purple-900 to-purple-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-6">
            <Button asChild variant="ghost" className="text-white hover:bg-white/10 mr-4">
              <Link href="/events">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Link>
            </Button>
          </div>
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              Event Calendar
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              March 2024 Event Calendar
            </h1>
            <p className="text-xl text-purple-100 leading-relaxed">
              Plan your networking schedule with our comprehensive event calendar. 
              Never miss an opportunity to connect and grow your business.
            </p>
          </div>
        </div>
      </section>

      {/* Calendar Navigation */}
      <section className="py-6 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <Button variant="outline" size="sm">
              <ChevronLeft className="w-4 h-4 mr-2" />
              February
            </Button>
            <h2 className="text-2xl font-bold text-gray-900">March 2024</h2>
            <Button variant="outline" size="sm">
              April
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Calendar Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-3 text-center font-semibold text-gray-700 bg-gray-100 rounded-lg">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((dayData, index) => (
                <div 
                  key={index} 
                  className="min-h-[120px] p-2 border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    {dayData.day}
                  </div>
                  {dayData.events.map((event, eventIndex) => (
                    <div 
                      key={eventIndex}
                      className={`text-xs p-1 rounded mb-1 cursor-pointer hover:opacity-80 ${getEventColor(event.type)}`}
                    >
                      <div className="font-medium">{event.title}</div>
                      <div className="text-xs opacity-75">{event.time}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Event Legend */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Types</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-100 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Networking Events</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-orange-100 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Ribbon Cuttings</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Industry Summits</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-100 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Community Events</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Upcoming Events This Month
            </h2>

            <div className="space-y-6">
              {/* Event 1 */}
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-orange-100 text-orange-800">Ribbon Cutting</Badge>
                      <span className="text-sm text-gray-500">March 15, 2024</span>
                    </div>
                    <div className="text-sm text-gray-500">4:00 PM - 6:00 PM</div>
                  </div>
                  <CardTitle className="text-xl">Member Business Grand Opening</CardTitle>
                  <CardDescription>
                    Celebrate new member businesses with ribbon cutting ceremonies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      Downtown San Antonio
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      All Industries Welcome
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-4 h-4 mr-2" />
                      Members: FREE
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button asChild size="sm">
                      <Link href="/events/registration">RSVP Now</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Event 2 */}
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-blue-100 text-blue-800">Networking</Badge>
                      <span className="text-sm text-gray-500">March 21, 2024</span>
                    </div>
                    <div className="text-sm text-gray-500">6:00 PM - 9:00 PM</div>
                  </div>
                  <CardTitle className="text-xl">BASA Monthly Networking Mixer</CardTitle>
                  <CardDescription>
                    The premier networking event for San Antonio's business community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      San Antonio Marriott Rivercenter
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      All Industries Welcome
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-4 h-4 mr-2" />
                      Members: $25
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button asChild size="sm">
                      <Link href="/events/registration">Register Now</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Event 3 */}
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-green-100 text-green-800">Summit</Badge>
                      <span className="text-sm text-gray-500">March 29, 2024</span>
                    </div>
                    <div className="text-sm text-gray-500">9:00 AM - 5:00 PM</div>
                  </div>
                  <CardTitle className="text-xl">Tech & Innovation Summit</CardTitle>
                  <CardDescription>
                    Exclusive insights into San Antonio's growing tech ecosystem
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      San Antonio Tech Hub
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      Technology & Innovation
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-4 h-4 mr-2" />
                      Members: $75
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button asChild size="sm">
                      <Link href="/events/registration">Register Now</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* View All Events CTA */}
            <div className="text-center mt-12">
              <Button asChild variant="outline" size="lg" className="mr-4">
                <Link href="/events">View All Events</Link>
              </Button>
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
                <Link href="/events/list">Browse Event List</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Calendar Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Monthly View</h3>
                <p className="text-gray-600 text-sm">
                  Plan your networking schedule with our comprehensive monthly calendar view.
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Event Details</h3>
                <p className="text-gray-600 text-sm">
                  Click on any event to view detailed information, pricing, and registration options.
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Quick Registration</h3>
                <p className="text-gray-600 text-sm">
                  Register for events directly from the calendar with just a few clicks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 