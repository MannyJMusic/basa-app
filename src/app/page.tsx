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
      {/* Hero Section - San Antonio Focused */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Hero Background Image */}
        <Image 
          src="/images/hero/basa-hero-networking.jpg"
          alt="BASA Networking Event"
          fill
          priority
          className="object-cover object-center z-0"
        />
        {/* Background with gradient and San Antonio imagery */}
        <div className="absolute inset-0 basa-gradient-hero z-10" style={{ opacity: 0.7 }}></div>
        <div className="absolute inset-0 bg-pattern-dots opacity-10 z-20"></div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gold-300/20 rounded-full blur-xl animate-float z-30"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-gold-200/10 rounded-full blur-2xl animate-float z-30" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-gold-300/20 rounded-full blur-xl animate-float z-30" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative basa-container text-center text-white z-40">
          <div className="max-w-5xl mx-auto">
            <h1 className="heading-responsive font-bold mb-8 leading-tight animate-slide-up" >
              Where San Antonio's
              <span className="block text-gradient-gold" >
                Business Leaders
              </span>
              Connect & Grow
            </h1>
            
            <p className="text-responsive mb-12 text-gold-100 leading-relaxed max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s', textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
              Join 150+ thriving businesses building meaningful relationships since 2020. 
              From strategic networking events to community partnerships, BASA is your gateway to 
              business success in the Alamo City.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <Button asChild size="lg" className="basa-btn-secondary text-lg px-8 py-4 group" style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>
                <Link href="/membership/join">
                  Join BASA Today
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-gold-300/30 basa-text-navy hover:bg-gold-500/10 text-lg px-8 py-4 backdrop-blur-sm" style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>
                <Link href="/events">View Upcoming Events</Link>
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20" style={{ boxShadow: '0 6px 12px rgba(0,0,0,0.3)' }}>
                <div className="text-3xl font-bold mb-2 text-gold-300" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>150+</div>
                <div className="text-gold-100" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>Active Members</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20" style={{ boxShadow: '0 6px 12px rgba(0,0,0,0.3)' }}>
                <div className="text-3xl font-bold mb-2 text-gold-300" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>4+</div>
                <div className="text-gold-100" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>Years of Excellence</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20" style={{ boxShadow: '0 6px 12px rgba(0,0,0,0.3)' }}>
                <div className="text-3xl font-bold mb-2 text-gold-300" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Monthly</div>
                <div className="text-gold-100" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>Networking Events</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="basa-section bg-basa-light-gray relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-basa-light-gray"></div>
        <div className="relative basa-container">
          <div className="text-center mb-20">
            <Badge variant="secondary" className="mb-6 bg-navy-100 text-navy-800">
              Why Choose BASA?
            </Badge>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-gradient-navy">
              Three Pillars of Success
            </h2>
            <p className="text-lg text-basa-charcoal max-w-3xl mx-auto leading-relaxed">
              We provide comprehensive networking solutions designed to help your business thrive in San Antonio's dynamic market.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Strategic Networking */}
            <Card className="basa-card group hover:scale-105 transition-all duration-500">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-navy-500 to-navy-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Handshake className="w-10 h-10 text-basa-navy-900" />
                </div>
                <CardTitle className="text-2xl text-gradient-navy">Strategic Networking</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-lg mb-8 text-basa-charcoal leading-relaxed">
                  Quality connections over quantity. Our curated events bring together serious business professionals ready to collaborate, refer, and grow together.
                </CardDescription>
                <ul className="text-left space-y-4 text-basa-charcoal">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-navy-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Curated professional events</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-navy-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Quality over quantity approach</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-navy-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Collaboration & referral focus</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Business Growth Opportunities */}
            <Card className="basa-card group hover:scale-105 transition-all duration-500">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-10 h-10 text-basa-gold-900" />
                </div>
                <CardTitle className="text-2xl text-gradient-gold">Business Growth</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-lg mb-8 text-basa-charcoal leading-relaxed">
                  Exclusive sponsorship opportunities, ribbon cutting celebrations, and partnership development that drives real revenue.
                </CardDescription>
                <ul className="text-left space-y-4 text-basa-charcoal">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-gold-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Exclusive sponsorship opportunities</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-gold-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Ribbon cutting celebrations</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-gold-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Partnership development</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Community Impact */}
            <Card className="basa-card group hover:scale-105 transition-all duration-500">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-10 h-10 text-basa-teal-500" />
                </div>
                <CardTitle className="text-2xl text-gradient-teal">Community Impact</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-lg mb-8 text-basa-charcoal leading-relaxed">
                  Make a difference while you network. Our Networking and Giving partnerships create meaningful community connections that enhance your business reputation.
                </CardDescription>
                <ul className="text-left space-y-4 text-basa-charcoal">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Networking and Giving partnerships</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Meaningful community connections</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
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
        {/* Handshake Background Image */}
        <Image
          src="/images/backgrounds/basa-handshake.jpg"
          alt="Handshake"
          fill
          priority
          className="object-cover object-center z-0"
        />
        <div className="absolute inset-0 basa-gradient-hero opacity-80 z-10"></div>
        <div className="relative basa-container text-center z-20">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-8 bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Zap className="w-4 h-4 mr-2" />
              Ready to Join?
            </Badge>
            
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8">
              San Antonio's Premier
              <span className="block text-white">Business Network</span>
            </h2>
            
            <p className="text-lg mb-12 text-navy-100 max-w-3xl mx-auto leading-relaxed">
              Connect with 150+ businesses, grow your network, and make a difference in our community. 
              Join the most influential business association in San Antonio.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button asChild size="lg" className="basa-btn-primary text-white text-lg px-8 py-4 group">
                <Link href="/membership/join">
                  Become a Member
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 basa-text-navy hover:bg-white/10 text-lg px-8 py-4 backdrop-blur-sm">
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
      <section className="basa-section relative bg-cover bg-center" style={{ backgroundImage: 'url(/images/backgrounds/calendar-bg.jpg)' }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-pattern-dots opacity-5"></div>
        <div className="relative basa-container">
          <div className="text-center mb-20">
            <Badge variant="secondary" className="mb-6 bg-teal-100 text-teal-800">
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
            {/* Event Card 1 */}
            <Card className="basa-card group hover:scale-105 transition-all duration-500">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="bg-navy-100 text-navy-800">
                    Networking
                  </Badge>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Monthly
                  </div>
                </div>
                <CardTitle className="text-xl mb-2">BASA Monthly Mixer</CardTitle>
                <CardDescription className="text-basa-charcoal">
                  Connect with fellow business owners in a relaxed, professional setting with curated networking activities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-basa-charcoal mb-6">
                  <MapPin className="w-4 h-4 mr-2" />
                  San Antonio, TX
                </div>
                <Button asChild className="w-full basa-btn-primary text-white group">
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
                  <Badge variant="secondary" className="bg-gold-100 text-gold-800">
                    Ribbon Cutting
                  </Badge>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Weekly
                  </div>
                </div>
                <CardTitle className="text-xl mb-2">Member Business Celebrations</CardTitle>
                <CardDescription className="text-basa-charcoal">
                  Celebrate new member businesses with ribbon cutting ceremonies and community support.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-basa-charcoal mb-6">
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
                  <Badge variant="secondary" className="bg-teal-100 text-teal-800">
                    Community
                  </Badge>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Quarterly
                  </div>
                </div>
                <CardTitle className="text-xl mb-2">Networking & Giving Initiative</CardTitle>
                <CardDescription className="text-basa-charcoal">
                  Partner with local nonprofits to make a positive community impact while networking.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-basa-charcoal mb-6">
                  <MapPin className="w-4 h-4 mr-2" />
                  San Antonio Area
                </div>
                <Button asChild className="w-full basa-btn-accent text-white group">
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