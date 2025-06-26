import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  CheckCircle,
  Globe,
  Lightbulb,
  Shield,
  ArrowRight
} from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
              About BASA
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Building San Antonio's Business Community Since 2020
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
              BASA represents the evolution of business networking in San Antonio, 
              transforming traditional networking into a comprehensive ecosystem 
              that drives real business growth and community impact.
            </p>
          </div>
        </div>
      </section>

      {/* Company Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Our Story: From Vision to Reality
              </h2>
              
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p>
                  BASA was born from a simple observation: traditional business networking in San Antonio 
                  was fragmented, transactional, and often failed to deliver meaningful results. In 2020, 
                  a group of local business leaders recognized that the city's growing economy needed a 
                  more sophisticated approach to business connections—one that prioritized quality over 
                  quantity, relationships over transactions, and community impact over individual gain.
                </p>

                <p>
                  What began as a small gathering of 12 business owners has evolved into San Antonio's 
                  premier business networking organization, serving over 150 active members across 
                  diverse industries. Our growth wasn't accidental; it was the result of a deliberate 
                  approach that combines proven networking principles with innovative technology and 
                  a deep commitment to the San Antonio business community.
                </p>

                <p>
                  Unlike traditional networking groups that focus solely on lead generation, BASA 
                  operates on the principle that sustainable business growth comes from building 
                  authentic relationships, sharing knowledge, and creating opportunities for 
                  collaborative success. We've found that when businesses genuinely support each 
                  other, everyone benefits—from individual entrepreneurs to the broader San Antonio 
                  economy.
                </p>

                <p>
                  Our success is measured not just in membership numbers, but in the tangible impact 
                  our members have on each other's businesses and the community. We've facilitated 
                  over $2 million in member referrals, supported 15+ local nonprofits, and created 
                  countless partnerships that have transformed how business is done in San Antonio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy/Approach Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Our Philosophy: The BASA Approach
              </h2>
              
              <div className="space-y-8 text-gray-700 leading-relaxed">
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Lightbulb className="w-6 h-6 text-blue-600 mr-3" />
                    1. Quality Over Quantity
                  </h3>
                  <p>
                    We believe that meaningful business relationships are built on trust, mutual respect, 
                    and genuine value exchange. Rather than focusing on the number of connections, we 
                    emphasize the depth and quality of relationships. This philosophy is reflected in 
                    our selective membership process, which ensures that every BASA member brings 
                    expertise, integrity, and a commitment to collaborative success.
                  </p>
                  <p className="mt-4">
                    Research consistently shows that strong business networks are more valuable than 
                    large ones. A study by the Harvard Business Review found that professionals with 
                    smaller, more focused networks often achieve better business outcomes than those 
                    with extensive but shallow connections. We've designed BASA around this principle, 
                    creating an environment where members can develop deep, lasting relationships.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Shield className="w-6 h-6 text-green-600 mr-3" />
                    2. Community Impact Through Business
                  </h3>
                  <p>
                    Our "Networking and Giving" initiative represents a fundamental shift in how we 
                    think about business networking. We believe that successful businesses have a 
                    responsibility to contribute to the communities that support them. This isn't 
                    just philanthropy—it's smart business strategy that creates stronger, more 
                    resilient local economies.
                  </p>
                  <p className="mt-4">
                    By partnering with local nonprofits and community organizations, our members 
                    gain valuable insights into community needs while building their reputations 
                    as responsible business leaders. This approach has proven particularly effective 
                    in San Antonio, where community values and business success are deeply intertwined.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Globe className="w-6 h-6 text-purple-600 mr-3" />
                    3. Technology-Enhanced Human Connection
                  </h3>
                  <p>
                    While we value face-to-face interactions, we recognize that modern business 
                    requires sophisticated tools to maintain and leverage relationships effectively. 
                    Our digital platform complements our in-person events, providing members with 
                    tools to track connections, share resources, and maintain relationships between 
                    meetings.
                  </p>
                  <p className="mt-4">
                    This hybrid approach ensures that our members can build and maintain relationships 
                    regardless of their schedules or locations, while still benefiting from the 
                    irreplaceable value of personal interactions. Our technology serves to enhance, 
                    not replace, human connections.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Target className="w-6 h-6 text-red-600 mr-3" />
                    4. Measurable Results and Continuous Improvement
                  </h3>
                  <p>
                    We believe that effective networking should deliver measurable business results. 
                    Our approach includes regular assessment of member satisfaction, business outcomes, 
                    and community impact. This data-driven approach allows us to continuously improve 
                    our programs and ensure that BASA membership delivers genuine value.
                  </p>
                  <p className="mt-4">
                    We track everything from referral generation to community impact, using this 
                    information to refine our approach and provide members with insights into their 
                    networking effectiveness. This commitment to measurement and improvement sets 
                    BASA apart from traditional networking organizations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Profiles Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Leadership Team
            </h2>
            
            <div className="space-y-12">
              {/* Executive Director */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-start space-x-6">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-12 h-12 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl text-gray-900">Maria Elena Rodriguez</CardTitle>
                      <p className="text-lg text-blue-600 font-semibold">Executive Director</p>
                      <p className="text-gray-600">Leading BASA's mission since 2020</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Maria Elena Rodriguez brings over 15 years of experience in business development 
                    and community engagement to her role as BASA's Executive Director. Prior to 
                    founding BASA, she served as the Director of Business Development for the San 
                    Antonio Chamber of Commerce, where she developed and implemented strategies that 
                    connected over 500 local businesses with growth opportunities.
                  </p>
                  <p>
                    Her expertise in relationship building and strategic networking has been 
                    instrumental in BASA's rapid growth and success. Maria Elena has been recognized 
                    by the San Antonio Business Journal as one of the city's "40 Under 40" business 
                    leaders and has received the Hispanic Chamber of Commerce's "Business Leader of 
                    the Year" award for her contributions to the local business community.
                  </p>
                  <p>
                    Under her leadership, BASA has expanded from a small networking group to San 
                    Antonio's premier business organization, generating over $2 million in member 
                    referrals and supporting numerous local nonprofits. Maria Elena holds a Master's 
                    degree in Business Administration from the University of Texas at San Antonio 
                    and is a certified business coach.
                  </p>
                </CardContent>
              </Card>

              {/* Director of Member Relations */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-start space-x-6">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Handshake className="w-12 h-12 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl text-gray-900">David Chen</CardTitle>
                      <p className="text-lg text-green-600 font-semibold">Director of Member Relations</p>
                      <p className="text-gray-600">Building meaningful connections since 2021</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    David Chen oversees BASA's member relations and event programming, bringing 
                    extensive experience in relationship management and strategic networking. Before 
                    joining BASA, David served as the Vice President of Business Development at 
                    Chen Development Group, where he managed a portfolio of over 200 client 
                    relationships and generated $15 million in new business opportunities.
                  </p>
                  <p>
                    His background in real estate development and property management has given him 
                    unique insights into the challenges facing San Antonio's business community. 
                    David has been instrumental in developing BASA's signature networking events, 
                    including the annual Business Summit and the monthly "Networking and Giving" 
                    series that has raised over $250,000 for local nonprofits.
                  </p>
                  <p>
                    David holds a Bachelor's degree in Business Administration from Texas A&M 
                    University and is a certified professional in relationship management. He 
                    serves on the board of several local nonprofits and is actively involved in 
                    the San Antonio business community.
                  </p>
                </CardContent>
              </Card>

              {/* Director of Community Impact */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-start space-x-6">
                    <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="w-12 h-12 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl text-gray-900">Sarah Johnson</CardTitle>
                      <p className="text-lg text-purple-600 font-semibold">Director of Community Impact</p>
                      <p className="text-gray-600">Driving social responsibility since 2022</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Sarah Johnson leads BASA's community impact initiatives, bringing a unique 
                    combination of business acumen and social responsibility expertise. As the 
                    founder and CEO of Johnson Marketing Group, Sarah has built a successful 
                    marketing agency that specializes in helping businesses create meaningful 
                    connections with their communities.
                  </p>
                  <p>
                    Her work with BASA's "Networking and Giving" initiative has transformed how 
                    local businesses approach community engagement. Under her leadership, BASA 
                    has partnered with over 15 local nonprofits, facilitated thousands of volunteer 
                    hours, and created innovative programs that benefit both businesses and the 
                    community.
                  </p>
                  <p>
                    Sarah holds a Master's degree in Nonprofit Management from the University of 
                    Texas at Austin and has been recognized for her contributions to community 
                    development. She serves on the board of several local nonprofits and is a 
                    frequent speaker on the intersection of business success and social impact.
                  </p>
                </CardContent>
              </Card>

              {/* Technology Director */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-start space-x-6">
                    <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Globe className="w-12 h-12 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl text-gray-900">Michael Thompson</CardTitle>
                      <p className="text-lg text-orange-600 font-semibold">Technology Director</p>
                      <p className="text-gray-600">Enabling digital connections since 2021</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Michael Thompson oversees BASA's technology infrastructure and digital platforms, 
                    ensuring that our members can maintain and leverage their connections effectively. 
                    With over 12 years of experience in software development and digital strategy, 
                    Michael has been instrumental in creating BASA's member portal and mobile 
                    applications.
                  </p>
                  <p>
                    Prior to joining BASA, Michael served as the Chief Technology Officer at 
                    Thompson Financial Group, where he developed innovative digital solutions for 
                    financial services. His expertise in user experience design and data analytics 
                    has helped BASA create technology that enhances, rather than replaces, human 
                    connections.
                  </p>
                  <p>
                    Michael holds a Bachelor's degree in Computer Science from the University of 
                    Texas at San Antonio and is certified in multiple programming languages and 
                    platforms. He is passionate about using technology to solve real business 
                    problems and create meaningful connections.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Footer */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Join the BASA Community?
            </h2>
            <p className="text-xl mb-8 text-blue-100 leading-relaxed">
              Connect with San Antonio's most successful business leaders and discover 
              how meaningful relationships can transform your business and our community.
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