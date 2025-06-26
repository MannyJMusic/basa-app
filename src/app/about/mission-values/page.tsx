import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Target,
  Heart,
  Users,
  Shield,
  Lightbulb,
  Globe,
  Award,
  CheckCircle,
  ArrowRight,
  Star,
  Building2,
  Handshake
} from "lucide-react"

export default function MissionValuesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
              Mission & Values
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Our Mission & Core Values
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
              The principles that guide everything we do at BASA, from how we build relationships 
              to how we measure success and impact in our community.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Our Mission
              </h2>
              
              <div className="bg-blue-50 p-8 rounded-lg border-l-4 border-blue-600 mb-8">
                <p className="text-xl text-gray-800 leading-relaxed font-medium">
                  "To transform business networking in San Antonio by building authentic relationships 
                  that drive real business growth while creating meaningful community impact."
                </p>
              </div>
              
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p>
                  Our mission reflects our belief that business networking should be more than 
                  just exchanging business cards or attending events. We believe that meaningful 
                  business relationships are built on trust, mutual respect, and genuine value 
                  exchange. When businesses genuinely support each other, everyone benefits—from 
                  individual entrepreneurs to the broader San Antonio economy.
                </p>

                <p>
                  We also believe that successful businesses have a responsibility to contribute 
                  to the communities that support them. Our "Networking and Giving" initiative 
                  embodies this belief, creating opportunities for our members to grow their 
                  businesses while making a positive impact in San Antonio.
                </p>

                <p>
                  This mission guides every decision we make, from how we select new members to 
                  how we design our events and programs. It's not just a statement on our website—it's 
                  the foundation of everything we do.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Our Core Values
            </h2>
            
            <div className="space-y-8">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <Handshake className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-gray-900">Authenticity</CardTitle>
                      <p className="text-blue-600 font-semibold">Be genuine in all interactions</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    We believe that authentic relationships are the foundation of successful business 
                    networking. This means being genuine in our interactions, honest about our 
                    capabilities and limitations, and transparent about our intentions. We encourage 
                    our members to be themselves rather than trying to fit into a predetermined mold.
                  </p>
                  <p>
                    Authenticity also means admitting when we don't have the right solution for 
                    someone and being willing to refer them to someone who does. It means celebrating 
                    others' successes genuinely and offering support during challenges without 
                    expecting anything in return.
                  </p>
                  <p>
                    This value is reflected in our selective membership process, which ensures that 
                    every BASA member shares our commitment to authenticity and genuine relationship 
                    building.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <Heart className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-gray-900">Community Impact</CardTitle>
                      <p className="text-green-600 font-semibold">Give back to San Antonio</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    We believe that successful businesses have a responsibility to contribute to 
                    the communities that support them. Our "Networking and Giving" initiative 
                    embodies this value, creating opportunities for our members to give back to 
                    San Antonio while building their businesses.
                  </p>
                  <p>
                    This isn't just philanthropy—it's smart business strategy. When we support 
                    local nonprofits and community organizations, we gain valuable insights into 
                    community needs while building our reputations as responsible business leaders. 
                    This approach has proven particularly effective in San Antonio, where community 
                    values and business success are deeply intertwined.
                  </p>
                  <p>
                    We track our community impact and share these results with our members, 
                    demonstrating that business success and community well-being can go hand in hand.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-gray-900">Collaborative Success</CardTitle>
                      <p className="text-purple-600 font-semibold">Success is not zero-sum</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    We reject the notion that business success is a zero-sum game. Instead, we 
                    believe that when businesses genuinely support each other, everyone benefits. 
                    This collaborative approach is reflected in everything we do, from how we 
                    structure our events to how we measure success.
                  </p>
                  <p>
                    Our members consistently report that helping others succeed has actually 
                    accelerated their own business growth. This happens because collaborative 
                    relationships create trust, which leads to more referrals, better partnerships, 
                    and stronger business networks.
                  </p>
                  <p>
                    We encourage our members to think beyond immediate transactions and focus on 
                    building long-term relationships that benefit everyone involved. This approach 
                    has proven to be both more satisfying and more profitable than traditional 
                    competitive networking.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                      <Target className="w-8 h-8 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-gray-900">Excellence</CardTitle>
                      <p className="text-orange-600 font-semibold">Strive for the highest standards</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    We are committed to excellence in everything we do, from the quality of our 
                    events to the caliber of our membership to the impact we create in our community. 
                    This commitment to excellence is reflected in our selective membership process, 
                    our rigorous event planning, and our continuous improvement efforts.
                  </p>
                  <p>
                    Excellence doesn't mean perfection—it means consistently striving to be better. 
                    We regularly assess our programs, gather feedback from our members, and make 
                    adjustments to ensure we're delivering maximum value. This commitment to 
                    continuous improvement has been key to our success and growth.
                  </p>
                  <p>
                    We also encourage our members to pursue excellence in their own businesses 
                    and to support each other in achieving their goals. This creates a culture 
                    of high standards and mutual support that benefits everyone in our network.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                      <Shield className="w-8 h-8 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-gray-900">Integrity</CardTitle>
                      <p className="text-red-600 font-semibold">Do what's right, always</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Integrity is the foundation of trust, and trust is the foundation of meaningful 
                    business relationships. We believe in doing what's right, even when it's not 
                    easy or convenient. This means being honest about our capabilities, keeping 
                    our promises, and treating everyone with respect and fairness.
                  </p>
                  <p>
                    Our commitment to integrity is reflected in our transparent membership process, 
                    our honest communication about what BASA can and cannot provide, and our 
                    willingness to address issues openly and constructively.
                  </p>
                  <p>
                    We also expect our members to act with integrity in their business dealings 
                    and to represent BASA well in the community. This creates a network of trusted 
                    professionals who can confidently refer business to each other.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How We Live Our Values */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              How We Live Our Values
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                  In Our Membership Process
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  We carefully select members who share our values and commitment to authentic 
                  relationship building. Our application process includes interviews and references 
                  to ensure alignment with our mission and values.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                  In Our Events & Programs
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Every event and program is designed to reflect our values. From our "Networking 
                  and Giving" initiative to our educational workshops, everything we do is 
                  intentional and aligned with our mission.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                  In Our Community Engagement
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  We actively partner with local nonprofits and community organizations, creating 
                  opportunities for our members to give back while building their businesses. 
                  This commitment to community impact is central to who we are.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                  In Our Measurement & Improvement
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  We regularly assess our impact and gather feedback from our members to ensure 
                  we're living up to our values and delivering on our mission. This commitment 
                  to continuous improvement is key to our success.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Join Us in Living These Values
            </h2>
            <p className="text-xl mb-8 text-blue-100 leading-relaxed">
              If our mission and values resonate with you, we invite you to join our community 
              of business leaders who are committed to authentic relationships and community impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="basa-btn-white basa-text-navy">
                <Link href="/membership/join" className="flex items-center">
                  Join BASA Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <Link href="/contact">Contact Our Team</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 