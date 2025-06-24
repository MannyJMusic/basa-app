import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Star, 
  Quote, 
  Users, 
  Building2, 
  Heart, 
  TrendingUp, 
  Award, 
  Handshake 
} from "lucide-react"

interface Testimonial {
  id: string
  quote: string
  author: string
  title: string
  company: string
  memberSince: string
  memberType: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  bgColor: string
}

interface SuccessMetric {
  value: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    quote: "BASA has been a game-changer for my marketing agency. The quality of connections and the genuine desire to help each other succeed is unmatched. I've generated over $150,000 in new business through BASA referrals alone.",
    author: "Sarah Johnson",
    title: "CEO",
    company: "Johnson Marketing Group",
    memberSince: "2021",
    memberType: "Professional Member",
    icon: Users,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  {
    id: "2",
    quote: "As a real estate developer, BASA has opened doors I never knew existed. The networking events are professional, the connections are genuine, and the business opportunities are real. My company has grown 40% since joining.",
    author: "Michael Chen",
    title: "Founder",
    company: "Chen Development Group",
    memberSince: "2020",
    memberType: "Corporate Partner",
    icon: Building2,
    iconColor: "text-green-600",
    bgColor: "bg-green-100"
  },
  {
    id: "3",
    quote: "The Networking and Giving initiative is what sets BASA apart. I've been able to grow my business while making a positive impact in our community. The connections I've made are both professional and meaningful.",
    author: "Lisa Rodriguez",
    title: "Principal",
    company: "Rodriguez Legal Services",
    memberSince: "2022",
    memberType: "Professional Member",
    icon: Heart,
    iconColor: "text-purple-600",
    bgColor: "bg-purple-100"
  },
  {
    id: "4",
    quote: "BASA's Essential membership was the perfect starting point for my startup. The 50% event discount saved me money while the connections helped me scale. I've since upgraded to Professional and the value keeps increasing.",
    author: "Jennifer Martinez",
    title: "Founder",
    company: "TechFlow Solutions",
    memberSince: "2023",
    memberType: "Professional Member",
    icon: TrendingUp,
    iconColor: "text-orange-600",
    bgColor: "bg-orange-100"
  },
  {
    id: "5",
    quote: "The Corporate Partnership level has given our company incredible visibility and speaking opportunities. We've hosted ribbon cuttings and gained valuable exposure. The dedicated account management is exceptional.",
    author: "David Thompson",
    title: "Managing Partner",
    company: "Thompson Financial Group",
    memberSince: "2021",
    memberType: "Corporate Partner",
    icon: Award,
    iconColor: "text-red-600",
    bgColor: "bg-red-100"
  },
  {
    id: "6",
    quote: "BASA's member directory and business resources have been invaluable. I've found trusted vendors, referral partners, and even new clients. The quality of the network is what makes BASA special.",
    author: "Robert Wilson",
    title: "CEO",
    company: "Wilson Healthcare Management",
    memberSince: "2020",
    memberType: "Professional Member",
    icon: Handshake,
    iconColor: "text-indigo-600",
    bgColor: "bg-indigo-100"
  }
]

const successMetrics: SuccessMetric[] = [
  {
    value: "150+",
    label: "Active Members",
    description: "Thriving businesses across San Antonio",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  {
    value: "$2M+",
    label: "Member Referrals Generated",
    description: "Real business value through connections",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
  {
    value: "24+",
    label: "Events Annually",
    description: "Networking opportunities every month",
    icon: Award,
    color: "text-purple-600",
    bgColor: "bg-purple-100"
  },
  {
    value: "15+",
    label: "Nonprofit Partners Supported",
    description: "Community impact through giving",
    icon: Heart,
    color: "text-red-600",
    bgColor: "bg-red-100"
  }
]

interface TestimonialsProps {
  showMetrics?: boolean
  maxTestimonials?: number
  title?: string
  subtitle?: string
  className?: string
}

export function Testimonials({ 
  showMetrics = true, 
  maxTestimonials = 6,
  title = "What San Antonio Business Leaders Say About BASA",
  subtitle = "Hear directly from our members about the impact BASA has had on their businesses and careers.",
  className = ""
}: TestimonialsProps) {
  const displayTestimonials = testimonials.slice(0, maxTestimonials)

  return (
    <section className={`py-16 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Success Metrics */}
        {showMetrics && (
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Impact in Numbers
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Real results that demonstrate the value of BASA membership and community involvement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {successMetrics.map((metric, index) => (
                <div key={index} className="text-center">
                  <div className={`w-20 h-20 ${metric.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <metric.icon className={`w-10 h-10 ${metric.color}`} />
                  </div>
                  <div className={`text-4xl font-bold ${metric.color} mb-2`}>{metric.value}</div>
                  <div className="text-lg text-gray-700 font-semibold">{metric.label}</div>
                  <div className="text-sm text-gray-600 mt-2">{metric.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {displayTestimonials.map((testimonial) => (
            <Card key={testimonial.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
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
                <Quote className={`w-8 h-8 ${testimonial.iconColor} mb-4`} />
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${testimonial.bgColor} rounded-full flex items-center justify-center mr-3`}>
                    <testimonial.icon className={`w-6 h-6 ${testimonial.iconColor}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.title}, {testimonial.company}</p>
                    <p className="text-xs text-gray-500">{testimonial.memberType} since {testimonial.memberSince}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 