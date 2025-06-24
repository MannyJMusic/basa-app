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
  DollarSign,
  Target,
  Award,
  Handshake,
  TrendingUp,
  Building2,
  Heart,
  ArrowRight,
  Filter,
  Search
} from "lucide-react"

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-purple-900 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              Event Calendar
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Connect at San Antonio's Premier Business Events
            </h1>
            <p className="text-xl text-purple-100 leading-relaxed">
              Join BASA's curated networking events designed to accelerate your business growth, 
              build meaningful connections, and stay ahead of industry trends.
            </p>
          </div>
        </div>
      </section>

      {/* Event Stats */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600 mb-2">12+</div>
              <div className="text-sm text-gray-600">Events Monthly</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 mb-2">150+</div>
              <div className="text-sm text-gray-600">Attendees Per Event</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 mb-2">50%</div>
              <div className="text-sm text-gray-600">Member Discount</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 mb-2">95%</div>
              <div className="text-sm text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  placeholder="Search events..." 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <Button variant="outline" className="flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Filter Events
              </Button>
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link href="/events/calendar">View Calendar</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Upcoming Featured Events
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't miss these exclusive networking opportunities designed to accelerate your business success.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Event 1: Monthly Networking Mixer */}
            <Card className="hover:shadow-xl transition-shadow duration-300 border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Featured Event
                  </Badge>
                  <div className="text-sm opacity-90">Next Week</div>
                </div>
                <CardTitle className="text-2xl">BASA Monthly Networking Mixer</CardTitle>
                <CardDescription className="text-blue-100">
                  The premier networking event for San Antonio's business community
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Value Proposition */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">🎯 Value Proposition</h4>
                    <p className="text-blue-800 text-sm">
                      Connect with 150+ business leaders, generate qualified leads, and discover 
                      partnership opportunities that drive real revenue growth.
                    </p>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-3 text-purple-600" />
                      <span>Thursday, March 21, 2024 • 6:00 PM - 9:00 PM</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-3 text-purple-600" />
                      <span>San Antonio Marriott Rivercenter</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-3 text-purple-600" />
                      <span>Networking Focus: All Industries Welcome</span>
                    </div>
                  </div>

                  {/* Speaker */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">🎤 Featured Speaker</h4>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <Star className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Sarah Johnson, CEO</p>
                        <p className="text-sm text-gray-600">Johnson Marketing Group • 15+ years in digital marketing</p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">💰 Pricing Structure</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">BASA Members:</span>
                        <span className="font-semibold text-green-700">$25 (Save 50%)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Non-Members:</span>
                        <span className="font-semibold">$50</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">First-Time Guests:</span>
                        <span className="font-semibold text-green-700">$35</span>
                      </div>
                    </div>
                  </div>

                  {/* Expected Outcomes */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">🎯 Expected Outcomes</h4>
                    <ul className="text-sm text-purple-800 space-y-1">
                      <li>• Generate 5-10 qualified business leads</li>
                      <li>• Connect with 3 potential referral partners</li>
                      <li>• Learn 2-3 actionable business growth strategies</li>
                      <li>• Discover new market opportunities</li>
                    </ul>
                  </div>

                  <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                    <Link href="/events/registration">Register Now</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Event 2: Industry-Specific Summit */}
            <Card className="hover:shadow-xl transition-shadow duration-300 border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Industry Summit
                  </Badge>
                  <div className="text-sm opacity-90">2 Weeks</div>
                </div>
                <CardTitle className="text-2xl">Tech & Innovation Summit</CardTitle>
                <CardDescription className="text-green-100">
                  Exclusive insights into San Antonio's growing tech ecosystem
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Value Proposition */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">🎯 Value Proposition</h4>
                    <p className="text-green-800 text-sm">
                      Gain exclusive access to San Antonio's tech ecosystem, connect with startup founders, 
                      and discover investment opportunities in emerging technologies.
                    </p>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-3 text-green-600" />
                      <span>Friday, March 29, 2024 • 9:00 AM - 5:00 PM</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-3 text-green-600" />
                      <span>San Antonio Tech Hub</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-3 text-green-600" />
                      <span>Networking Focus: Technology & Innovation</span>
                    </div>
                  </div>

                  {/* Speaker */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">🎤 Featured Speakers</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                          <Star className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Jennifer Martinez, Founder</p>
                          <p className="text-xs text-gray-600">TechFlow Solutions • Serial Entrepreneur</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                          <Star className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Dr. Robert Wilson, CTO</p>
                          <p className="text-xs text-gray-600">Innovation Labs • Former Google Engineer</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">💰 Pricing Structure</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">BASA Members:</span>
                        <span className="font-semibold text-green-700">$75 (Save 50%)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Non-Members:</span>
                        <span className="font-semibold">$150</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Startup Founders:</span>
                        <span className="font-semibold text-green-700">$50</span>
                      </div>
                    </div>
                  </div>

                  {/* Expected Outcomes */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">🎯 Expected Outcomes</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Connect with 10+ tech industry leaders</li>
                      <li>• Discover 3-5 investment opportunities</li>
                      <li>• Learn emerging technology trends</li>
                      <li>• Build partnerships with startups</li>
                    </ul>
                  </div>

                  <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                    <Link href="/events/registration">Register Now</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Event 3: Ribbon Cutting Celebration */}
            <Card className="hover:shadow-xl transition-shadow duration-300 border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Ribbon Cutting
                  </Badge>
                  <div className="text-sm opacity-90">This Friday</div>
                </div>
                <CardTitle className="text-2xl">Member Business Grand Opening</CardTitle>
                <CardDescription className="text-orange-100">
                  Celebrate new member businesses with ribbon cutting ceremonies
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Value Proposition */}
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2">🎯 Value Proposition</h4>
                    <p className="text-orange-800 text-sm">
                      Support fellow BASA members, build community relationships, and discover 
                      new business opportunities while celebrating local business success.
                    </p>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-3 text-orange-600" />
                      <span>Friday, March 15, 2024 • 4:00 PM - 6:00 PM</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-3 text-orange-600" />
                      <span>Downtown San Antonio (Various Locations)</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-3 text-orange-600" />
                      <span>Networking Focus: Local Business Community</span>
                    </div>
                  </div>

                  {/* Featured Business */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">🏢 Featured Business</h4>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <Building2 className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">Artisan Coffee Co.</p>
                        <p className="text-sm text-gray-600">Premium coffee shop & community hub</p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2">💰 Pricing Structure</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">BASA Members:</span>
                        <span className="font-semibold text-orange-700">FREE</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Non-Members:</span>
                        <span className="font-semibold">$15</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">First-Time Guests:</span>
                        <span className="font-semibold text-orange-700">$10</span>
                      </div>
                    </div>
                  </div>

                  {/* Expected Outcomes */}
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2">🎯 Expected Outcomes</h4>
                    <ul className="text-sm text-orange-800 space-y-1">
                      <li>• Support local business growth</li>
                      <li>• Build community relationships</li>
                      <li>• Discover new business opportunities</li>
                      <li>• Network in relaxed atmosphere</li>
                    </ul>
                  </div>

                  <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
                    <Link href="/events/registration">RSVP Now</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Event 4: Networking & Giving Initiative */}
            <Card className="hover:shadow-xl transition-shadow duration-300 border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Community Impact
                  </Badge>
                  <div className="text-sm opacity-90">Next Month</div>
                </div>
                <CardTitle className="text-2xl">Networking & Giving Initiative</CardTitle>
                <CardDescription className="text-red-100">
                  Make a difference while you network with local nonprofits
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Value Proposition */}
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2">🎯 Value Proposition</h4>
                    <p className="text-red-800 text-sm">
                      Combine networking with community impact. Build meaningful relationships 
                      while supporting local nonprofits and enhancing your business reputation.
                    </p>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-3 text-red-600" />
                      <span>Saturday, April 6, 2024 • 10:00 AM - 2:00 PM</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-3 text-red-600" />
                      <span>San Antonio Community Center</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-3 text-red-600" />
                      <span>Networking Focus: Nonprofit & Business Partnerships</span>
                    </div>
                  </div>

                  {/* Featured Nonprofit */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">❤️ Featured Nonprofit</h4>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <Heart className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">San Antonio Youth Foundation</p>
                        <p className="text-sm text-gray-600">Empowering local youth through education</p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2">💰 Pricing Structure</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">BASA Members:</span>
                        <span className="font-semibold text-red-700">$30 (Save 40%)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Non-Members:</span>
                        <span className="font-semibold">$50</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Nonprofit Staff:</span>
                        <span className="font-semibold text-red-700">$20</span>
                      </div>
                    </div>
                  </div>

                  {/* Expected Outcomes */}
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2">🎯 Expected Outcomes</h4>
                    <ul className="text-sm text-red-800 space-y-1">
                      <li>• Build nonprofit partnerships</li>
                      <li>• Enhance community reputation</li>
                      <li>• Network with purpose-driven leaders</li>
                      <li>• Create meaningful social impact</li>
                    </ul>
                  </div>

                  <Button asChild className="w-full bg-red-600 hover:bg-red-700">
                    <Link href="/events/registration">Register Now</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* View All Events CTA */}
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="mr-4">
              <Link href="/events/calendar">View Full Calendar</Link>
            </Button>
            <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
              <Link href="/events/list">Browse All Events</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Event Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Attend BASA Events?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our events are designed to deliver measurable business value and meaningful connections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Handshake className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle>Quality Networking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Connect with vetted business professionals who are serious about collaboration 
                  and growth opportunities.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle>Business Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Access exclusive insights, strategies, and opportunities that directly impact 
                  your bottom line.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle>Member Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Enjoy 50% discounts on event registration and exclusive access to premium 
                  networking opportunities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
} 