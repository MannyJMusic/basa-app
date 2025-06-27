import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users,
  Award,
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Globe,
  ArrowRight,
  Star,
  Building2,
  Heart,
  Target
} from "lucide-react"

export default function LeadershipPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
              Leadership
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Meet Our Leadership Team
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
              The experienced professionals who guide BASA's mission and ensure we deliver 
              exceptional value to our members and community.
            </p>
          </div>
        </div>
      </section>

      {/* Executive Director */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
                  <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-16 h-16 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-3xl text-gray-900 mb-2">Maria Elena Rodriguez</CardTitle>
                    <p className="text-xl text-blue-600 font-semibold mb-2">Executive Director</p>
                    <p className="text-gray-600 mb-4">Leading BASA's mission since 2020</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <Award className="w-3 h-3 mr-1" />
                        San Antonio Business Journal 40 Under 40
                      </Badge>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Star className="w-3 h-3 mr-1" />
                        Hispanic Chamber Business Leader of the Year
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 text-gray-700 leading-relaxed">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">maria.elena@basa.org</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">(210) 555-0123</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Linkedin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">linkedin.com/in/mariaelenarodriguez</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">San Antonio, TX</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Our Leadership Team
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Director of Member Relations */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-10 h-10 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl text-gray-900">David Chen</CardTitle>
                      <p className="text-green-600 font-semibold">Director of Member Relations</p>
                      <p className="text-gray-600 text-sm">Building meaningful connections since 2021</p>
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
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="w-10 h-10 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl text-gray-900">Sarah Johnson</CardTitle>
                      <p className="text-purple-600 font-semibold">Director of Community Impact</p>
                      <p className="text-gray-600 text-sm">Driving social responsibility since 2022</p>
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
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Globe className="w-10 h-10 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl text-gray-900">Michael Thompson</CardTitle>
                      <p className="text-orange-600 font-semibold">Technology Director</p>
                      <p className="text-gray-600 text-sm">Enabling digital connections since 2021</p>
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

              {/* Director of Operations */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Target className="w-10 h-10 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl text-gray-900">Lisa Rodriguez</CardTitle>
                      <p className="text-red-600 font-semibold">Director of Operations</p>
                      <p className="text-gray-600 text-sm">Ensuring excellence since 2021</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Lisa Rodriguez manages BASA's day-to-day operations, ensuring that all 
                    programs and services run smoothly and efficiently. With over 10 years of 
                    experience in nonprofit management and business operations, Lisa brings 
                    expertise in strategic planning, process improvement, and organizational 
                    development.
                  </p>
                  <p>
                    Her background in legal services and nonprofit management has given her 
                    valuable insights into the operational challenges facing both for-profit 
                    and nonprofit organizations. Lisa has been instrumental in developing 
                    BASA's operational systems and ensuring that our growth is sustainable 
                    and well-managed.
                  </p>
                  <p>
                    Lisa holds a Juris Doctor degree from St. Mary's University School of Law 
                    and has worked with numerous nonprofits and small businesses throughout 
                    her career. She is committed to operational excellence and ensuring that 
                    BASA's infrastructure supports our mission and values.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Board of Directors */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Board of Directors
            </h2>
            
            <div className="space-y-8">
              <div className="text-center mb-8">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Our board of directors provides strategic guidance and oversight, ensuring 
                  that BASA remains true to its mission and values while continuing to grow 
                  and serve the San Antonio business community.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Robert Wilson</h3>
                  <p className="text-blue-600 text-sm font-medium mb-2">Board Chair</p>
                  <p className="text-gray-600 text-sm">CEO, Wilson Healthcare Management</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Jennifer Martinez</h3>
                  <p className="text-green-600 text-sm font-medium mb-2">Vice Chair</p>
                  <p className="text-gray-600 text-sm">Founder, TechFlow Solutions</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">David Thompson</h3>
                  <p className="text-purple-600 text-sm font-medium mb-2">Treasurer</p>
                  <p className="text-gray-600 text-sm">Managing Partner, Thompson Financial Group</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Amanda Garcia</h3>
                  <p className="text-orange-600 text-sm font-medium mb-2">Secretary</p>
                  <p className="text-gray-600 text-sm">Principal, Garcia Consulting Group</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Carlos Mendez</h3>
                  <p className="text-red-600 text-sm font-medium mb-2">Board Member</p>
                  <p className="text-gray-600 text-sm">President, Mendez Construction</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Emily Chen</h3>
                  <p className="text-indigo-600 text-sm font-medium mb-2">Board Member</p>
                  <p className="text-gray-600 text-sm">CEO, Chen Digital Marketing</p>
                </div>
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
              Connect With Our Leadership
            </h2>
            <p className="text-xl mb-8 text-blue-100 leading-relaxed">
              Our leadership team is committed to helping you succeed. Reach out to learn more 
              about BASA and how we can support your business growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="basa-btn-white basa-text-navy">
                <Link href="/contact" className="flex items-center">
                  Contact Our Team
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