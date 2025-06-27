import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Testimonials from "@/components/marketing/testimonials"
import { 
  Star, 
  Quote, 
  Users, 
  Building2, 
  Heart, 
  TrendingUp, 
  Award, 
  Handshake,
  Target,
  CheckCircle,
  Calendar,
  MapPin
} from "lucide-react"

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              Member Success Stories
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              What San Antonio Business Leaders Say About BASA
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Real testimonials from real business leaders who have experienced the power of 
              BASA's networking community and achieved remarkable results.
            </p>
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Impact in Numbers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real results that demonstrate the value of BASA membership and community involvement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">150+</div>
              <div className="text-lg text-gray-700 font-semibold">Active Members</div>
              <div className="text-sm text-gray-600 mt-2">
                Thriving businesses across San Antonio
              </div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-10 h-10 text-green-600" />
              </div>
              <div className="text-4xl font-bold text-green-600 mb-2">$2M+</div>
              <div className="text-lg text-gray-700 font-semibold">Member Referrals Generated</div>
              <div className="text-sm text-gray-600 mt-2">
                Real business value through connections
              </div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-purple-600" />
              </div>
              <div className="text-4xl font-bold text-purple-600 mb-2">24+</div>
              <div className="text-lg text-gray-700 font-semibold">Events Annually</div>
              <div className="text-sm text-gray-600 mt-2">
                Networking opportunities every month
              </div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-red-600" />
              </div>
              <div className="text-4xl font-bold text-red-600 mb-2">15+</div>
              <div className="text-lg text-gray-700 font-semibold">Nonprofit Partners Supported</div>
              <div className="text-sm text-gray-600 mt-2">
                Community impact through giving
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Testimonials */}
      <Testimonials 
        testimonials={[
          {
            id: "1",
            name: "Sarah Johnson",
            company: "Johnson Marketing Group",
            membership: "Professional Member",
            quote: "BASA has been a game-changer for my marketing agency. The quality of connections and the genuine desire to help each other succeed is unmatched. I've generated over $150,000 in new business through BASA referrals alone.",
            results: "$150K+ Results",
            rating: 5
          },
          {
            id: "2",
            name: "Michael Chen",
            company: "Chen Development Group",
            membership: "Corporate Partner",
            quote: "As a real estate developer, BASA has opened doors I never knew existed. The networking events are professional, the connections are genuine, and the business opportunities are real. My company has grown 40% since joining.",
            results: "40% Growth",
            rating: 5
          },
          {
            id: "3",
            name: "Lisa Rodriguez",
            company: "Rodriguez Legal Services",
            membership: "Professional Member",
            quote: "The Networking and Giving initiative is what sets BASA apart. I've been able to grow my business while making a positive impact in our community. The connections I've made are both professional and meaningful.",
            results: "15+ Partnerships",
            rating: 5
          },
          {
            id: "4",
            name: "Jennifer Martinez",
            company: "TechFlow Solutions",
            membership: "Professional Member",
            quote: "BASA's Essential membership was the perfect starting point for my startup. The 50% event discount saved me money while the connections helped me scale. I've since upgraded to Professional and the value keeps increasing.",
            results: "25+ Employees",
            rating: 5
          },
          {
            id: "5",
            name: "David Thompson",
            company: "Thompson Financial Group",
            membership: "Corporate Partner",
            quote: "The Corporate Partnership level has given our company incredible visibility and speaking opportunities. We've hosted ribbon cuttings and gained valuable exposure. The dedicated account management is exceptional.",
            results: "8+ Speaking Events",
            rating: 5
          },
          {
            id: "6",
            name: "Robert Wilson",
            company: "Wilson Healthcare Management",
            membership: "Professional Member",
            quote: "BASA's member directory and business resources have been invaluable. I've found trusted vendors, referral partners, and even new clients. The quality of the network is what makes BASA special.",
            results: "12+ New Clients",
            rating: 5
          }
        ]}
        title="Member Testimonials"
        subtitle="Hear directly from our members about the impact BASA has had on their businesses and careers."
        showViewAll={false}
      />

      {/* Success Stories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real examples of how BASA members have grown their businesses and made an impact.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            
            {/* Success Story 1 */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-100 text-green-800">Featured Story</Badge>
                  <div className="text-sm text-gray-500">2023</div>
                </div>
                <CardTitle className="text-xl">From Startup to Success</CardTitle>
                <CardDescription>
                  How TechFlow Solutions scaled from 3 to 25 employees through BASA connections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Target className="w-4 h-4 mr-2 text-green-600" />
                    <span>Generated $500K+ in new revenue</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-green-600" />
                    <span>Connected with 15+ key clients</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Award className="w-4 h-4 mr-2 text-green-600" />
                    <span>Won BASA Rising Star Award 2023</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    "BASA's networking events and member directory helped us connect with 
                    decision-makers we never would have met otherwise. The quality of 
                    introductions and referrals has been exceptional."
                  </p>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium">Jennifer Martinez, TechFlow Solutions</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Success Story 2 */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-100 text-blue-800">Community Impact</Badge>
                  <div className="text-sm text-gray-500">2023</div>
                </div>
                <CardTitle className="text-xl">Networking & Giving Initiative</CardTitle>
                <CardDescription>
                  How BASA members raised $250K+ for local nonprofits in 2023
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Heart className="w-4 h-4 mr-2 text-blue-600" />
                    <span>Supported 15+ nonprofit organizations</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                    <span>Involved 100+ member volunteers</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                    <span>Increased community partnerships by 40%</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    "The Networking and Giving initiative has created meaningful partnerships 
                    between businesses and nonprofits. It's networking with purpose that 
                    benefits everyone in our community."
                  </p>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                      <Heart className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">Lisa Rodriguez, Rodriguez Legal Services</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Success Story 3 */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-purple-100 text-purple-800">Growth Story</Badge>
                  <div className="text-sm text-gray-500">2022</div>
                </div>
                <CardTitle className="text-xl">Real Estate Development Success</CardTitle>
                <CardDescription>
                  How Chen Development Group grew 40% through BASA connections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Building2 className="w-4 h-4 mr-2 text-purple-600" />
                    <span>40% business growth in 2 years</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Handshake className="w-4 h-4 mr-2 text-purple-600" />
                    <span>Secured 8 major development partnerships</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-purple-600" />
                    <span>Expanded to 3 new markets</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    "BASA opened doors I never knew existed. The networking events are 
                    professional, the connections are genuine, and the business opportunities 
                    are real. My company has grown 40% since joining."
                  </p>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                      <Building2 className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium">Michael Chen, Chen Development Group</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Success Story 4 */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-orange-100 text-orange-800">Marketing Success</Badge>
                  <div className="text-sm text-gray-500">2023</div>
                </div>
                <CardTitle className="text-xl">Marketing Agency Growth</CardTitle>
                <CardDescription>
                  How Johnson Marketing Group generated $150K+ through BASA referrals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4 mr-2 text-orange-600" />
                    <span>$150K+ in new business through referrals</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-orange-600" />
                    <span>Added 12 new long-term clients</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="w-4 h-4 mr-2 text-orange-600" />
                    <span>95% client retention rate</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    "BASA has been a game-changer for my marketing agency. The quality of 
                    connections and the genuine desire to help each other succeed is unmatched. 
                    I've generated over $150,000 in new business through BASA referrals alone."
                  </p>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-2">
                      <TrendingUp className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium">Sarah Johnson, Johnson Marketing Group</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Member Benefits Highlight */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Members Choose BASA
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Based on member feedback and success stories, here are the key benefits that drive results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Handshake className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Connections</h3>
              <p className="text-gray-600">
                95% of members report making meaningful business connections within their first 3 months.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Revenue Growth</h3>
              <p className="text-gray-600">
                Average member reports 25% increase in referral business within the first year.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Impact</h3>
              <p className="text-gray-600">
                100% of members participate in community giving initiatives and report enhanced reputation.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Regular Events</h3>
              <p className="text-gray-600">
                24+ events annually provide consistent networking opportunities and business exposure.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Recognition</h3>
              <p className="text-gray-600">
                Annual awards and recognition programs celebrate member achievements and success.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Diverse Network</h3>
              <p className="text-gray-600">
                150+ members across 25+ industries provide access to diverse business opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join the BASA Success Story
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Become part of San Antonio's most successful business network. 
            Connect, grow, and make an impact with 150+ business leaders.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="basa-btn-white basa-text-navy">
              <Link href="/membership/join">Join BASA Today</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              <Link href="/events">Attend an Event</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
} 