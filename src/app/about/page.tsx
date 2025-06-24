import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Heart,
  Star,
  Quote,
  Award,
  Handshake,
  Building2,
  MapPin,
  Target,
  CheckCircle
} from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              About BASA
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Building San Antonio's Business Community Since 2020
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              BASA is more than a networking organization. We're a catalyst for business growth, 
              community impact, and meaningful connections that drive real results.
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

      {/* Member Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What San Antonio Business Leaders Say About BASA
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear directly from our members about the impact BASA has had on their businesses and careers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Testimonial 1 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                </div>
                <Quote className="w-8 h-8 text-blue-600 mb-4" />
                <p className="text-gray-700 mb-6 italic">
                  "BASA has been a game-changer for my marketing agency. The quality of connections 
                  and the genuine desire to help each other succeed is unmatched. I've generated 
                  over $150,000 in new business through BASA referrals alone."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Sarah Johnson</p>
                    <p className="text-sm text-gray-600">CEO, Johnson Marketing Group</p>
                    <p className="text-xs text-gray-500">Professional Member since 2021</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                </div>
                <Quote className="w-8 h-8 text-green-600 mb-4" />
                <p className="text-gray-700 mb-6 italic">
                  "As a real estate developer, BASA has opened doors I never knew existed. The 
                  networking events are professional, the connections are genuine, and the 
                  business opportunities are real. My company has grown 40% since joining."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Building2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Michael Chen</p>
                    <p className="text-sm text-gray-600">Founder, Chen Development Group</p>
                    <p className="text-xs text-gray-500">Corporate Partner since 2020</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                </div>
                <Quote className="w-8 h-8 text-purple-600 mb-4" />
                <p className="text-gray-700 mb-6 italic">
                  "The Networking and Giving initiative is what sets BASA apart. I've been able 
                  to grow my business while making a positive impact in our community. The 
                  connections I've made are both professional and meaningful."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <Heart className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Lisa Rodriguez</p>
                    <p className="text-sm text-gray-600">Principal, Rodriguez Legal Services</p>
                    <p className="text-xs text-gray-500">Professional Member since 2022</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 4 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                </div>
                <Quote className="w-8 h-8 text-orange-600 mb-4" />
                <p className="text-gray-700 mb-6 italic">
                  "BASA's Essential membership was the perfect starting point for my startup. 
                  The 50% event discount saved me money while the connections helped me scale. 
                  I've since upgraded to Professional and the value keeps increasing."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Jennifer Martinez</p>
                    <p className="text-sm text-gray-600">Founder, TechFlow Solutions</p>
                    <p className="text-xs text-gray-500">Professional Member since 2023</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 5 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                </div>
                <Quote className="w-8 h-8 text-red-600 mb-4" />
                <p className="text-gray-700 mb-6 italic">
                  "The Corporate Partnership level has given our company incredible visibility 
                  and speaking opportunities. We've hosted ribbon cuttings and gained valuable 
                  exposure. The dedicated account management is exceptional."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <Award className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">David Thompson</p>
                    <p className="text-sm text-gray-600">Managing Partner, Thompson Financial Group</p>
                    <p className="text-xs text-gray-500">Corporate Partner since 2021</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 6 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                </div>
                <Quote className="w-8 h-8 text-indigo-600 mb-4" />
                <p className="text-gray-700 mb-6 italic">
                  "BASA's member directory and business resources have been invaluable. I've 
                  found trusted vendors, referral partners, and even new clients. The quality 
                  of the network is what makes BASA special."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                    <Handshake className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Robert Wilson</p>
                    <p className="text-sm text-gray-600">CEO, Wilson Healthcare Management</p>
                    <p className="text-xs text-gray-500">Professional Member since 2020</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

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
            <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
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