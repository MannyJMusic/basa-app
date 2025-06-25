import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Testimonials } from "@/components/marketing/testimonials"
import { 
  Users, 
  TrendingUp, 
  Heart, 
  Calendar, 
  Award, 
  Handshake,
  MapPin,
  Clock,
  Star,
  Target,
  Building2
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
              Since April 2020
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Where San Antonio's Business Leaders Connect, Collaborate & Grow
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
              Join 150+ thriving businesses building meaningful relationships since 2020. 
              From networking events to community partnerships, BASA is your gateway to 
              business success in the Alamo City.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                <Link href="/membership/join">Join BASA Today</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <Link href="/events">View Upcoming Events</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">150+</div>
              <div className="text-gray-600">Active Members</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">4+</div>
              <div className="text-gray-600">Years of Excellence</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">Monthly</div>
              <div className="text-gray-600">Networking Events</div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose BASA?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide comprehensive networking solutions designed to help your business thrive in San Antonio's dynamic market.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Strategic Networking */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Handshake className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">🤝 Strategic Networking</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-lg mb-6">
                  Quality connections over quantity. Our curated events bring together serious business professionals ready to collaborate, refer, and grow together.
                </CardDescription>
                <ul className="text-left space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <Users className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                    Curated professional events
                  </li>
                  <li className="flex items-center">
                    <Target className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                    Quality over quantity approach
                  </li>
                  <li className="flex items-center">
                    <Handshake className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                    Collaboration & referral focus
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Business Growth Opportunities */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">📈 Business Growth Opportunities</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-lg mb-6">
                  Exclusive sponsorship opportunities, ribbon cutting celebrations, and partnership development that drives real revenue.
                </CardDescription>
                <ul className="text-left space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <Star className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    Exclusive sponsorship opportunities
                  </li>
                  <li className="flex items-center">
                    <Award className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    Ribbon cutting celebrations
                  </li>
                  <li className="flex items-center">
                    <Building2 className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    Partnership development
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Community Impact */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl">❤️ Community Impact</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-lg mb-6">
                  Make a difference while you network. Our Networking and Giving partnerships create meaningful community connections that enhance your business reputation.
                </CardDescription>
                <ul className="text-left space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <Heart className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                    Networking and Giving partnerships
                  </li>
                  <li className="flex items-center">
                    <MapPin className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                    Meaningful community connections
                  </li>
                  <li className="flex items-center">
                    <Star className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                    Enhanced business reputation
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Join San Antonio's Premier Business Network?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Connect with 150+ businesses, grow your network, and make a difference in our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
              <Link href="/membership/join">Become a Member</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Social Proof - Testimonials & Success Metrics */}
      <Testimonials 
        showMetrics={true}
        maxTestimonials={3}
        title="What San Antonio Business Leaders Say About BASA"
        subtitle="Hear directly from our members about the impact BASA has had on their businesses and careers."
        className="bg-white"
      />

      {/* Featured Events Preview */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Upcoming Events
            </h2>
            <p className="text-xl text-gray-600">
              Don't miss our next networking opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Event Card 1 */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Networking
                  </Badge>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Monthly
                  </div>
                </div>
                <CardTitle>BASA Monthly Mixer</CardTitle>
                <CardDescription>
                  Connect with fellow business owners in a relaxed, professional setting.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mr-2" />
                  San Antonio, TX
                </div>
                <Button asChild className="w-full">
                  <Link href="/events">Learn More</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Event Card 2 */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Ribbon Cutting
                  </Badge>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Weekly
                  </div>
                </div>
                <CardTitle>Member Business Celebrations</CardTitle>
                <CardDescription>
                  Celebrate new member businesses with ribbon cutting ceremonies.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mr-2" />
                  Various Locations
                </div>
                <Button asChild className="w-full">
                  <Link href="/events">Learn More</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Event Card 3 */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    Community
                  </Badge>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Quarterly
                  </div>
                </div>
                <CardTitle>Networking & Giving Initiative</CardTitle>
                <CardDescription>
                  Partner with local nonprofits to make a positive community impact.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mr-2" />
                  San Antonio Area
                </div>
                <Button asChild className="w-full">
                  <Link href="/events">Learn More</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link href="/events">View All Events</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
} 