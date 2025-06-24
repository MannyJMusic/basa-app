import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Check, 
  Star, 
  Users, 
  Calendar, 
  FileText, 
  Heart,
  Building2,
  Award,
  Handshake,
  TrendingUp,
  Globe,
  Microphone,
  Gift,
  Crown,
  Zap,
  Shield
} from "lucide-react"

export default function MembershipPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              Membership Tiers
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your Path to Business Success
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Join 150+ businesses in San Antonio's premier networking organization. 
              Select the membership tier that best fits your business goals and growth objectives.
            </p>
          </div>
        </div>
      </section>

      {/* Membership Stats */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 mb-2">150+</div>
              <div className="text-sm text-gray-600">Active Members</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 mb-2">12+</div>
              <div className="text-sm text-gray-600">Events Monthly</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 mb-2">50%</div>
              <div className="text-sm text-gray-600">Event Discount</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 mb-2">95%</div>
              <div className="text-sm text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Membership Tiers & Benefits
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Each tier is designed to provide increasing value as your business grows. 
              Start with Essential and upgrade as your networking needs evolve.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Essential Membership */}
            <Card className="relative border-2 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Essential Membership</CardTitle>
                <div className="text-4xl font-bold text-blue-600">$200</div>
                <div className="text-gray-600">per year</div>
                <CardDescription className="text-lg">
                  Perfect for businesses starting their networking journey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm">50% discount on all events</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm">Member directory listing</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm">Basic business resources access</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm">Networking and Giving participation</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm">Monthly member newsletter</span>
                  </div>
                </div>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link href="/membership/join?tier=essential">Join Essential</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Professional Membership */}
            <Card className="relative border-2 border-purple-500 hover:shadow-xl transition-shadow duration-300">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-600 text-white px-4 py-1">Most Popular</Badge>
              </div>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-2xl">Professional Membership</CardTitle>
                <div className="text-4xl font-bold text-purple-600">$400</div>
                <div className="text-gray-600">per year</div>
                <CardDescription className="text-lg">
                  Ideal for established businesses seeking enhanced networking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm font-medium">All Essential benefits</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm">Enhanced directory profile with logo</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm">Priority event registration</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm">Quarterly business spotlights</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm">Access to member-only events</span>
                  </div>
                </div>
                <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                  <Link href="/membership/join?tier=professional">Join Professional</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Corporate Partnership */}
            <Card className="relative border-2 border-gold-500 hover:shadow-xl transition-shadow duration-300">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-yellow-600 text-white px-4 py-1">Premium</Badge>
              </div>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-yellow-600" />
                </div>
                <CardTitle className="text-2xl">Corporate Partnership</CardTitle>
                <div className="text-4xl font-bold text-yellow-600">$750</div>
                <div className="text-gray-600">per year</div>
                <CardDescription className="text-lg">
                  Maximum visibility and influence for established companies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm font-medium">All Professional benefits</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm">Website logo placement</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm">Speaking opportunities at events</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm">Ribbon cutting ceremony hosting</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm">Custom sponsorship packages</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-sm">Dedicated account management</span>
                  </div>
                </div>
                <Button asChild className="w-full bg-yellow-600 hover:bg-yellow-700">
                  <Link href="/membership/join?tier=corporate">Join Corporate</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Detailed Benefits Comparison */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Detailed Benefits Comparison
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See exactly what each membership tier includes and how they compare.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-4 font-semibold text-gray-900">Benefit</th>
                    <th className="text-center p-4 font-semibold text-blue-600">Essential</th>
                    <th className="text-center p-4 font-semibold text-purple-600">Professional</th>
                    <th className="text-center p-4 font-semibold text-yellow-600">Corporate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium">Event Discount</td>
                    <td className="p-4 text-center">50%</td>
                    <td className="p-4 text-center">50%</td>
                    <td className="p-4 text-center">50%</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium">Directory Listing</td>
                    <td className="p-4 text-center">✓</td>
                    <td className="p-4 text-center">✓ Enhanced</td>
                    <td className="p-4 text-center">✓ Enhanced</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium">Business Resources</td>
                    <td className="p-4 text-center">Basic</td>
                    <td className="p-4 text-center">Enhanced</td>
                    <td className="p-4 text-center">Premium</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium">Priority Registration</td>
                    <td className="p-4 text-center">-</td>
                    <td className="p-4 text-center">✓</td>
                    <td className="p-4 text-center">✓</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium">Member-Only Events</td>
                    <td className="p-4 text-center">-</td>
                    <td className="p-4 text-center">✓</td>
                    <td className="p-4 text-center">✓</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium">Business Spotlights</td>
                    <td className="p-4 text-center">-</td>
                    <td className="p-4 text-center">Quarterly</td>
                    <td className="p-4 text-center">Monthly</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium">Website Logo Placement</td>
                    <td className="p-4 text-center">-</td>
                    <td className="p-4 text-center">-</td>
                    <td className="p-4 text-center">✓</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium">Speaking Opportunities</td>
                    <td className="p-4 text-center">-</td>
                    <td className="p-4 text-center">-</td>
                    <td className="p-4 text-center">✓</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium">Ribbon Cutting Hosting</td>
                    <td className="p-4 text-center">-</td>
                    <td className="p-4 text-center">-</td>
                    <td className="p-4 text-center">✓</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium">Account Management</td>
                    <td className="p-4 text-center">-</td>
                    <td className="p-4 text-center">-</td>
                    <td className="p-4 text-center">Dedicated</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Join BASA?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our membership tiers are designed to provide measurable value and ROI for your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle>Proven ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Members report an average of 3-5 new business opportunities per month, 
                  with 50% event discount providing immediate cost savings.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Handshake className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle>Quality Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Connect with 150+ vetted business professionals who are serious about 
                  collaboration and growth opportunities.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-yellow-600" />
                </div>
                <CardTitle>Exclusive Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Access to premium resources, member-only events, and enhanced visibility 
                  that sets you apart from competitors.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Members Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from current BASA members about their experience and success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Sarah Johnson</p>
                    <p className="text-sm text-gray-600">Essential Member • Marketing Consultant</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "BASA's Essential membership has been a game-changer for my business. 
                  The 50% event discount alone has saved me over $500 this year, and the 
                  connections I've made have generated 3 new clients."
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Michael Chen</p>
                    <p className="text-sm text-gray-600">Professional Member • Real Estate Developer</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "The Professional tier's enhanced directory profile and priority registration 
                  have significantly increased my visibility. I've closed 2 major deals through 
                  BASA connections this quarter."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Accelerate Your Business Growth?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join 150+ businesses already benefiting from BASA membership. 
            Choose your tier and start networking with purpose today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
              <Link href="/membership/join">Join BASA Today</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
} 