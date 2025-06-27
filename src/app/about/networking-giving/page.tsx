import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Heart,
  Users,
  TrendingUp,
  Calendar,
  Award,
  MapPin,
  Target,
  CheckCircle,
  ArrowRight,
  Star,
  Building2,
  Globe,
  DollarSign,
  Handshake
} from "lucide-react"

export default function NetworkingGivingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
              Networking & Giving
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Networking with Purpose
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
              How BASA combines business networking with community impact to create meaningful 
              change in San Antonio while helping our members grow their businesses.
            </p>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                The BASA Difference: Networking with Purpose
              </h2>
              
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p>
                  Traditional business networking often focuses solely on lead generation and 
                  business development. While these are important goals, we believe that the 
                  most successful business relationships are built on shared values and a 
                  commitment to making a positive impact in our community.
                </p>

                <p>
                  Our "Networking and Giving" initiative represents a fundamental shift in how 
                  we think about business networking. We've found that when businesses come 
                  together to support local nonprofits and community organizations, they not 
                  only make a positive impact but also build stronger, more meaningful 
                  relationships with each other.
                </p>

                <p>
                  This approach has proven to be both more satisfying and more effective than 
                  traditional networking. Our members consistently report that participating 
                  in community service activities has helped them build deeper relationships, 
                  gain valuable insights into community needs, and develop their reputations 
                  as responsible business leaders.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Community Impact
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real results that demonstrate the power of combining business networking with 
              community service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-10 h-10 text-red-600" />
              </div>
              <div className="text-4xl font-bold text-red-600 mb-2">$250K+</div>
              <div className="text-lg text-gray-700 font-semibold">Funds Raised</div>
              <div className="text-sm text-gray-600 mt-2">
                For local nonprofits through BASA events
              </div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">15+</div>
              <div className="text-lg text-gray-700 font-semibold">Nonprofit Partners</div>
              <div className="text-sm text-gray-600 mt-2">
                Supported through our initiatives
              </div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-green-600" />
              </div>
              <div className="text-4xl font-bold text-green-600 mb-2">2,500+</div>
              <div className="text-lg text-gray-700 font-semibold">Volunteer Hours</div>
              <div className="text-sm text-gray-600 mt-2">
                Contributed by BASA members
              </div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-purple-600" />
              </div>
              <div className="text-4xl font-bold text-purple-600 mb-2">100%</div>
              <div className="text-lg text-gray-700 font-semibold">Member Participation</div>
              <div className="text-sm text-gray-600 mt-2">
                In community service activities
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              How Networking & Giving Works
            </h2>
            
            <div className="space-y-8">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Identify Community Needs</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We work closely with local nonprofits and community organizations to identify 
                    pressing needs in San Antonio. This includes everything from fundraising 
                    campaigns to volunteer opportunities to pro bono services. Our goal is to 
                    address real community challenges while creating meaningful networking 
                    opportunities for our members.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Handshake className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Create Collaborative Opportunities</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We design events and programs that bring our members together to address 
                    these needs. This might include fundraising events, volunteer days, skills 
                    workshops, or pro bono consulting sessions. The key is that these activities 
                    provide natural opportunities for networking while making a positive impact.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Build Meaningful Relationships</h3>
                  <p className="text-gray-700 leading-relaxed">
                    As members work together on community projects, they naturally build deeper, 
                    more authentic relationships. Working side by side on a common cause creates 
                    bonds that go beyond typical networking interactions. These relationships 
                    often lead to business opportunities, but they're built on a foundation of 
                    shared values and mutual respect.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">4. Measure and Celebrate Impact</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We track the impact of our community initiatives and share these results 
                    with our members. This includes funds raised, volunteer hours contributed, 
                    and the specific outcomes achieved by our nonprofit partners. Celebrating 
                    these successes reinforces the value of our approach and motivates continued 
                    participation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Programs */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Featured Programs
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-100 text-blue-800">Monthly Program</Badge>
                    <div className="text-sm text-gray-500">Ongoing</div>
                  </div>
                  <CardTitle className="text-xl">Networking & Giving Luncheons</CardTitle>
                  <p className="text-gray-600">
                    Monthly luncheons that combine networking with presentations from local nonprofits
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                      <span>Second Tuesday of each month</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2 text-blue-600" />
                      <span>Average attendance: 75+ members</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
                      <span>Raised $150K+ for local nonprofits</span>
                    </div>
                    <p className="text-gray-700 text-sm">
                      These luncheons feature presentations from local nonprofits, followed by 
                      networking time where members can connect while learning about community 
                      needs and opportunities to get involved.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-green-100 text-green-800">Annual Event</Badge>
                    <div className="text-sm text-gray-500">November</div>
                  </div>
                  <CardTitle className="text-xl">BASA Community Impact Summit</CardTitle>
                  <p className="text-gray-600">
                    Our signature annual event celebrating community impact and business networking
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-green-600" />
                      <span>Annual event in November</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2 text-green-600" />
                      <span>200+ attendees from business and nonprofit sectors</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                      <span>Raised $75K+ in 2023</span>
                    </div>
                    <p className="text-gray-700 text-sm">
                      This day-long event brings together business leaders and nonprofit 
                      executives to share best practices, build relationships, and raise funds 
                      for community causes.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-purple-100 text-purple-800">Quarterly Program</Badge>
                    <div className="text-sm text-gray-500">Ongoing</div>
                  </div>
                  <CardTitle className="text-xl">Pro Bono Consulting Program</CardTitle>
                  <p className="text-gray-600">
                    BASA members provide free consulting services to local nonprofits
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                      <span>Quarterly consulting sessions</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2 text-purple-600" />
                      <span>50+ nonprofits served</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Target className="w-4 h-4 mr-2 text-purple-600" />
                      <span>Focus areas: marketing, finance, operations</span>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Our members provide free consulting services to local nonprofits, helping 
                      them improve their operations while building relationships with potential 
                      clients and partners.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-orange-100 text-orange-800">Ongoing Program</Badge>
                    <div className="text-sm text-gray-500">Year-round</div>
                  </div>
                  <CardTitle className="text-xl">Volunteer Matching Program</CardTitle>
                  <p className="text-gray-600">
                    Connecting BASA members with volunteer opportunities at local nonprofits
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                      <span>Year-round opportunities</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2 text-orange-600" />
                      <span>2,500+ volunteer hours contributed</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Heart className="w-4 h-4 mr-2 text-orange-600" />
                      <span>15+ nonprofit partners</span>
                    </div>
                    <p className="text-gray-700 text-sm">
                      We match BASA members with volunteer opportunities that align with their 
                      skills and interests, creating opportunities for networking while serving 
                      the community.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Success Stories
            </h2>
            
            <div className="space-y-8">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-green-100 text-green-800">Featured Story</Badge>
                    <div className="text-sm text-gray-500">2023</div>
                  </div>
                  <CardTitle className="text-xl">TechFlow Solutions & Habitat for Humanity</CardTitle>
                  <p className="text-gray-600">
                    How a BASA member's pro bono work led to a major business opportunity
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      Jennifer Martinez, founder of TechFlow Solutions, volunteered to help 
                      Habitat for Humanity improve their donor management system. During this 
                      pro bono project, she met several other BASA members who were also 
                      volunteering their time.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      "Working together on this project helped us build genuine relationships," 
                      Jennifer says. "We weren't just exchanging business cards—we were solving 
                      real problems together. That created a level of trust that's hard to 
                      achieve through traditional networking."
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      The relationships Jennifer built during this project led to three major 
                      client referrals and a partnership opportunity that helped her company 
                      grow 40% in the following year.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-100 text-blue-800">Community Impact</Badge>
                    <div className="text-sm text-gray-500">2023</div>
                  </div>
                  <CardTitle className="text-xl">BASA's Support for San Antonio Food Bank</CardTitle>
                  <p className="text-gray-600">
                    How our networking events helped address food insecurity in San Antonio
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      In 2023, BASA members raised over $50,000 for the San Antonio Food Bank 
                      through a series of networking events and fundraising campaigns. But the 
                      impact went beyond just the money raised.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      "BASA members didn't just write checks," says Eric Cooper, CEO of the 
                      San Antonio Food Bank. "They got involved, volunteered their time, and 
                      helped us improve our operations. The relationships we built with BASA 
                      members have been invaluable."
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Several BASA members have since become regular volunteers and donors, 
                      and the Food Bank has hired BASA members for consulting projects and 
                      vendor services.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Join Us in Making a Difference
            </h2>
            <p className="text-xl mb-8 text-blue-100 leading-relaxed">
              Become part of a community that combines business networking with meaningful 
              community impact. Grow your business while making San Antonio a better place.
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