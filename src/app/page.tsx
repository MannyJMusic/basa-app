import Link from "next/link"
import Image from "next/image"
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
  Building2,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Globe,
  Zap
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with gradient and pattern */}
        <div className="absolute inset-0 basa-gradient-primary"></div>
        <div className="absolute inset-0 bg-pattern-dots opacity-10"></div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative basa-container text-center text-white z-10">
          <div className="max-w-5xl mx-auto">
            <Badge variant="secondary" className="mb-8 bg-white/20 text-white border-white/30 backdrop-blur-sm animate-fade-in">
              <Sparkles className="w-4 h-4 mr-2" />
              Since April 2020
            </Badge>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight animate-slide-up">
              Where San Antonio's
              <span className="block text-gradient-blue bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Business Leaders
              </span>
              Connect & Grow
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-blue-100 leading-relaxed max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Join 150+ thriving businesses building meaningful relationships since 2020. 
              From strategic networking events to community partnerships, BASA is your gateway to 
              business success in the Alamo City.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <Button asChild size="lg" className="basa-btn-primary text-lg px-8 py-4 group">
                <Link href="/membership/join">
                  Join BASA Today
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4 backdrop-blur-sm">
                <Link href="/events">View Upcoming Events</Link>
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-3xl font-bold mb-2">150+</div>
                <div className="text-blue-100">Active Members</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-3xl font-bold mb-2">4+</div>
                <div className="text-blue-100">Years of Excellence</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-3xl font-bold mb-2">Monthly</div>
                <div className="text-blue-100">Networking Events</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="basa-section bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>
        <div className="relative basa-container">
          <div className="text-center mb-20">
            <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-800">
              Why Choose BASA?
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gradient-blue">
              Three Pillars of Success
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We provide comprehensive networking solutions designed to help your business thrive in San Antonio's dynamic market.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Strategic Networking */}
            <Card className="basa-card group hover:scale-105 transition-all duration-500">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Handshake className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-2xl text-gradient-blue">Strategic Networking</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-lg mb-8 text-gray-600 leading-relaxed">
                  Quality connections over quantity. Our curated events bring together serious business professionals ready to collaborate, refer, and grow together.
                </CardDescription>
                <ul className="text-left space-y-4 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Curated professional events</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Quality over quantity approach</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Collaboration & referral focus</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Business Growth Opportunities */}
            <Card className="basa-card group hover:scale-105 transition-all duration-500">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-2xl text-gradient-green">Business Growth</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-lg mb-8 text-gray-600 leading-relaxed">
                  Exclusive sponsorship opportunities, ribbon cutting celebrations, and partnership development that drives real revenue.
                </CardDescription>
                <ul className="text-left space-y-4 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Exclusive sponsorship opportunities</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Ribbon cutting celebrations</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Partnership development</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Community Impact */}
            <Card className="basa-card group hover:scale-105 transition-all duration-500">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-2xl text-gradient-purple">Community Impact</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-lg mb-8 text-gray-600 leading-relaxed">
                  Make a difference while you network. Our Networking and Giving partnerships create meaningful community connections that enhance your business reputation.
                </CardDescription>
                <ul className="text-left space-y-4 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Networking and Giving partnerships</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Meaningful community connections</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Enhanced business reputation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="basa-section basa-gradient-secondary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern-grid opacity-5"></div>
        <div className="relative basa-container text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-8 bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Zap className="w-4 h-4 mr-2" />
              Ready to Join?
            </Badge>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
              San Antonio's Premier
              <span className="block text-white">Business Network</span>
            </h2>
            
            <p className="text-xl mb-12 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Connect with 150+ businesses, grow your network, and make a difference in our community. 
              Join the most influential business association in San Antonio.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button asChild size="lg" className="basa-btn-primary text-lg px-8 py-4 group">
                <Link href="/membership/join">
                  Become a Member
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4 backdrop-blur-sm">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
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
      <section className="basa-section bg-gradient-to-b from-gray-50 to-white relative">
        <div className="absolute inset-0 bg-pattern-dots opacity-5"></div>
        <div className="relative basa-container">
          <div className="text-center mb-20">
            <Badge variant="secondary" className="mb-6 bg-purple-100 text-purple-800">
              <Calendar className="w-4 h-4 mr-2" />
              Upcoming Events
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gradient-purple">
              Don't Miss Our Next
              <span className="block">Networking Opportunities</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join our curated events designed to accelerate your business growth and build meaningful connections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Event Card 1 */}
            <Card className="basa-card group hover:scale-105 transition-all duration-500">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Networking
                  </Badge>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Monthly
                  </div>
                </div>
                <CardTitle className="text-xl mb-2">BASA Monthly Mixer</CardTitle>
                <CardDescription className="text-gray-600">
                  Connect with fellow business owners in a relaxed, professional setting with curated networking activities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-gray-600 mb-6">
                  <MapPin className="w-4 h-4 mr-2" />
                  San Antonio, TX
                </div>
                <Button asChild className="w-full basa-btn-primary group">
                  <Link href="/events">
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Event Card 2 */}
            <Card className="basa-card group hover:scale-105 transition-all duration-500">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Ribbon Cutting
                  </Badge>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Weekly
                  </div>
                </div>
                <CardTitle className="text-xl mb-2">Member Business Celebrations</CardTitle>
                <CardDescription className="text-gray-600">
                  Celebrate new member businesses with ribbon cutting ceremonies and community support.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-gray-600 mb-6">
                  <MapPin className="w-4 h-4 mr-2" />
                  Various Locations
                </div>
                <Button asChild className="w-full basa-btn-secondary group">
                  <Link href="/events">
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Event Card 3 */}
            <Card className="basa-card group hover:scale-105 transition-all duration-500">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    Community
                  </Badge>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Quarterly
                  </div>
                </div>
                <CardTitle className="text-xl mb-2">Networking & Giving Initiative</CardTitle>
                <CardDescription className="text-gray-600">
                  Partner with local nonprofits to make a positive community impact while networking.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-gray-600 mb-6">
                  <MapPin className="w-4 h-4 mr-2" />
                  San Antonio Area
                </div>
                <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group">
                  <Link href="/events">
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
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
    </div>
  )
} 