import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar,
  Users,
  TrendingUp,
  Heart,
  Award,
  MapPin,
  Target,
  CheckCircle,
  ArrowRight,
  Star,
  Building2,
  Globe
} from "lucide-react"

export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
              Our Story
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              The BASA Story: From Vision to Reality
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
              How a small group of San Antonio business leaders transformed the city's 
              networking landscape and created lasting impact in our community.
            </p>
          </div>
        </div>
      </section>

      {/* The Beginning */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                The Beginning: A Vision for Better Business Networking
              </h2>
              
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p>
                  In early 2020, Maria Elena Rodriguez found herself frustrated with the state of 
                  business networking in San Antonio. As the Director of Business Development for 
                  the San Antonio Chamber of Commerce, she had witnessed firsthand how traditional 
                  networking groups often prioritized quantity over quality, leaving business owners 
                  with stacks of business cards but few meaningful connections.
                </p>

                <p>
                  "I was attending networking events where people were more focused on collecting 
                  contacts than building relationships," Maria Elena recalls. "There was this 
                  transactional approach that felt inauthentic and ultimately ineffective. I knew 
                  there had to be a better way."
                </p>

                <p>
                  That spring, Maria Elena reached out to 11 other business leaders she respected 
                  and trusted. They represented diverse industries—real estate, marketing, legal 
                  services, technology, healthcare, and financial services. What united them was 
                  a shared belief that San Antonio's business community deserved better.
                </p>

                <p>
                  "We weren't just looking to create another networking group," says David Chen, 
                  one of the original 12 founders and now BASA's Director of Member Relations. 
                  "We wanted to build something that would genuinely help businesses grow while 
                  strengthening our community. The goal was to create an ecosystem where success 
                  wasn't zero-sum—where helping others succeed would make everyone more successful."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founding Principles */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Our Founding Principles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">Quality Over Quantity</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    We believed that meaningful business relationships require time, trust, and 
                    genuine value exchange. Rather than trying to meet everyone, we focused on 
                    creating deep, lasting connections with people who shared our values and 
                    commitment to excellence.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-green-600" />
                    </div>
                    <CardTitle className="text-xl">Community Impact</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    Business success and community well-being are interconnected. We committed to 
                    creating opportunities for our members to give back to San Antonio while 
                    building their businesses, recognizing that strong communities create strong 
                    business environments.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                    <CardTitle className="text-xl">Measurable Results</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    We wanted to prove that our approach worked. From the beginning, we committed 
                    to tracking member satisfaction, business outcomes, and community impact. 
                    This data-driven approach has helped us continuously improve and demonstrate 
                    the value of authentic networking.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Globe className="w-6 h-6 text-orange-600" />
                    </div>
                    <CardTitle className="text-xl">Innovation & Technology</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    We recognized that modern business requires sophisticated tools to maintain 
                    relationships effectively. We committed to leveraging technology to enhance, 
                    not replace, human connections, making it easier for members to stay connected 
                    and track their networking success.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Key Milestones */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Key Milestones in Our Journey
            </h2>
            
            <div className="space-y-8">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">March 2020 - The First Meeting</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Twelve business leaders gathered at a local restaurant to discuss the future 
                    of business networking in San Antonio. What was supposed to be a one-time 
                    meeting became the foundation of BASA. The group committed to meeting monthly 
                    and developing a new approach to business networking.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">September 2020 - First Public Event</h3>
                  <p className="text-gray-700 leading-relaxed">
                    BASA hosted its first public networking event, "Networking with Purpose," 
                    which attracted 45 business owners. The event's success confirmed that there 
                    was demand for a different kind of networking experience. This marked the 
                    beginning of BASA's public presence in San Antonio.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-8 h-8 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">January 2021 - Networking & Giving Initiative</h3>
                  <p className="text-gray-700 leading-relaxed">
                    BASA launched its signature "Networking and Giving" program, partnering with 
                    local nonprofits to combine business networking with community service. This 
                    innovative approach set BASA apart from traditional networking groups and 
                    established our commitment to community impact.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">June 2021 - 100 Member Milestone</h3>
                  <p className="text-gray-700 leading-relaxed">
                    BASA reached its first major milestone with 100 active members. The organization 
                    had proven that its approach worked, with members reporting significant business 
                    growth and satisfaction. This growth allowed BASA to expand its programs and 
                    services.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="w-8 h-8 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">December 2022 - San Antonio Business Journal Recognition</h3>
                  <p className="text-gray-700 leading-relaxed">
                    BASA was recognized by the San Antonio Business Journal as "Best Business 
                    Networking Organization" and Maria Elena Rodriguez was named one of the city's 
                    "40 Under 40" business leaders. This recognition validated BASA's impact and 
                    approach to business networking.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">March 2023 - $2 Million in Referrals</h3>
                  <p className="text-gray-700 leading-relaxed">
                    BASA members reported generating over $2 million in business referrals through 
                    their network connections. This milestone demonstrated the tangible value of 
                    BASA's relationship-focused approach and solidified our position as San 
                    Antonio's premier business networking organization.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Today */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Our Impact Today
            </h2>
            
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>
                From those original 12 founders, BASA has grown into a thriving community of over 
                150 active members representing every major industry in San Antonio. But our success 
                isn't measured just in numbers—it's measured in the real impact we've had on our 
                members' businesses and our community.
              </p>

              <p>
                Our members have generated over $2 million in business referrals, supported 15+ 
                local nonprofits through our "Networking and Giving" initiative, and created 
                countless partnerships that have transformed how business is done in San Antonio. 
                We've hosted over 200 events, facilitated thousands of introductions, and helped 
                businesses of all sizes grow and succeed.
              </p>

              <p>
                Perhaps most importantly, we've proven that business networking can be both 
                effective and authentic. Our members consistently report that BASA has helped 
                them build genuine relationships, grow their businesses, and make a positive 
                impact in our community. They've found that success doesn't have to come at the 
                expense of others—that when businesses genuinely support each other, everyone 
                benefits.
              </p>

              <p>
                As we look to the future, we remain committed to our founding principles while 
                continuing to innovate and adapt to the changing needs of San Antonio's business 
                community. We believe that the best is yet to come, and we're excited to continue 
                building meaningful connections that drive real business growth and community impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Be Part of Our Story
            </h2>
            <p className="text-xl mb-8 text-blue-100 leading-relaxed">
              Join the growing community of San Antonio business leaders who are building 
              meaningful relationships and driving real business growth through BASA.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="basa-btn-white basa-text-navy">
                <Link href="/membership/join" className="flex items-center">
                  Join BASA Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <Link href="/events">Attend an Event</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 