"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { useRef, useState, useEffect } from "react"
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
  ArrowRight,
  DollarSign,
  Users2,
  Sparkles
} from "lucide-react"

// TypeScript Interfaces
interface AnimatedCounterProps {
  value: number
  suffix?: string
  duration?: number
}

interface Testimonial {
  name: string
  company: string
  membership: string
  quote: string
  results: string
}

interface TestimonialCardProps {
  testimonial: Testimonial
  index: number
}

interface ImpactCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  value: number
  suffix: string
  description: string
  delay?: number
}

interface SuccessStory {
  title: string
  description: string
  metrics: Array<{
    value: number
    suffix: string
    label: string
  }>
  link: string
  imageAlt: string
}

interface SuccessStoryProps {
  story: SuccessStory
  index: number
}

// Animated Counter Component
const AnimatedCounter = ({ value, suffix = "", duration = 2 }: AnimatedCounterProps) => {
  const [count, setCount] = useState(0)
  const [isInView, setIsInView] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInView) {
          setIsInView(true)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [isInView])

  useEffect(() => {
    if (isInView) {
      const startTime = Date.now()
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / (duration * 1000), 1)
        const currentCount = Math.floor(progress * value)
        
        setCount(currentCount)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      animate()
    }
  }, [isInView, value, duration])

  return (
    <span ref={ref} className="text-4xl md:text-5xl font-bold text-basa-navy">
      {count.toLocaleString()}{suffix}
    </span>
  )
}

// Testimonial Card Component
const TestimonialCard = ({ testimonial, index }: TestimonialCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3 }
      }}
      className="group"
    >
      <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-basa-navy to-basa-teal rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Quote className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-basa-navy mb-1">{testimonial.name}</h4>
              <p className="text-basa-teal font-medium">{testimonial.company}</p>
              <p className="text-sm text-gray-500">{testimonial.membership}</p>
            </div>
          </div>
          
          <blockquote className="text-gray-700 leading-relaxed mb-6 italic">
            "{testimonial.quote}"
          </blockquote>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-basa-gold text-basa-gold" />
              ))}
            </div>
            <Badge variant="secondary" className="bg-basa-gold/10 text-basa-navy border-basa-gold/20">
              {testimonial.results}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Impact Number Card Component
const ImpactCard = ({ icon: Icon, title, value, suffix, description, delay = 0 }: ImpactCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.3 }
      }}
      className="group"
    >
      <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-8 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-basa-gold/10 to-basa-teal/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-basa-navy to-basa-teal rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Icon className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-2xl font-bold text-basa-navy mb-2">{title}</h3>
            <div className="text-4xl font-bold text-basa-teal mb-4">
              <AnimatedCounter value={value} suffix={suffix} />
            </div>
            <p className="text-gray-600 leading-relaxed">{description}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Success Story Component
const SuccessStory = ({ story, index }: SuccessStoryProps) => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      viewport={{ once: true }}
      className={`py-16 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
            <motion.div
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <Badge variant="secondary" className="bg-basa-gold/10 text-basa-navy border-basa-gold/20 w-fit">
                Success Story
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-basa-navy leading-tight">
                {story.title}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                {story.description}
              </p>
              
              <div className="grid grid-cols-2 gap-6 pt-6">
                {story.metrics.map((metric, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-2xl font-bold text-basa-teal mb-1">
                      <AnimatedCounter value={metric.value} suffix={metric.suffix} />
                    </div>
                    <p className="text-sm text-gray-600">{metric.label}</p>
                  </div>
                ))}
              </div>
              
              <div className="pt-4">
                <Button asChild className="basa-btn-primary">
                  <Link href={story.link}>
                    Read Full Story
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-video bg-gradient-to-br from-basa-navy to-basa-teal rounded-2xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-basa-navy/80 to-basa-teal/80 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Building2 className="w-16 h-16 mx-auto mb-4 opacity-80" />
                    <p className="text-lg font-medium">{story.imageAlt}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

export default function AboutPage() {
  const testimonials = [
    {
      name: "Sarah Martinez",
      company: "TechFlow Solutions",
      membership: "Professional Member",
      quote: "BASA transformed our business. Through their network, we've secured $150K+ in new contracts and built lasting partnerships that continue to drive growth.",
      results: "$150K+ Results"
    },
    {
      name: "Michael Chen",
      company: "Chen Development Group",
      membership: "Corporate Partner",
      quote: "The quality of connections at BASA is unmatched. Every interaction has been meaningful and has directly contributed to our company's success.",
      results: "40+ New Clients"
    },
    {
      name: "Elena Rodriguez",
      company: "Rodriguez Consulting",
      membership: "Essential Member",
      quote: "BASA's focus on community impact while building business relationships is what sets them apart. It's networking with purpose.",
      results: "15+ Partnerships"
    }
  ]

  const successStories = [
    {
      title: "TechFlow Solutions: From Startup to Market Leader",
      description: "How a local tech startup leveraged BASA's network to secure major contracts and scale from 5 to 50 employees in just 18 months.",
      metrics: [
        { value: 150, suffix: "K+", label: "Revenue Generated" },
        { value: 45, suffix: "", label: "New Employees" },
        { value: 12, suffix: "", label: "Major Contracts" },
        { value: 300, suffix: "%", label: "Growth Rate" }
      ],
      link: "/success-stories/techflow",
      imageAlt: "TechFlow Solutions Office"
    },
    {
      title: "Networking & Giving: $250K+ for Local Nonprofits",
      description: "Our innovative approach to networking that combines business development with community impact, creating a win-win for everyone involved.",
      metrics: [
        { value: 250, suffix: "K+", label: "Funds Raised" },
        { value: 15, suffix: "", label: "Nonprofits Supported" },
        { value: 1000, suffix: "+", label: "Volunteer Hours" },
        { value: 25, suffix: "", label: "Community Events" }
      ],
      link: "/success-stories/networking-giving",
      imageAlt: "Community Impact Event"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section - Traditional Layout */}
      <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/backgrounds/about-bg.jpg')"
          }}
        />
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 to-blue-700/60"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
                <Sparkles className="w-4 h-4 mr-2" />
                About BASA
              </Badge>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-basa-gold"
            >
              San Antonio's Premier Business Network
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl text-blue-100 leading-relaxed max-w-3xl mx-auto"
            >
              Connecting business leaders through meaningful relationships and collaborative growth since 2020.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Impact Numbers - Traditional Grid */}
      {/* <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="bg-basa-gold/10 text-basa-navy border-basa-gold/20 mb-4">
              <TrendingUp className="w-4 h-4 mr-2" />
              Our Impact
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-basa-navy mb-6">
              Real Results, Real Growth
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our members have achieved remarkable success through meaningful connections 
              and collaborative opportunities.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <ImpactCard
              icon={Users}
              title="Active Members"
              value={150}
              suffix="+"
              description="Diverse business leaders across San Antonio"
              delay={0.1}
            />
            <ImpactCard
              icon={DollarSign}
              title="Member Referrals"
              value={2000}
              suffix="K+"
              description="Generated through BASA connections"
              delay={0.2}
            />
            <ImpactCard
              icon={Calendar}
              title="Annual Events"
              value={40}
              suffix="+"
              description="Networking and community events"
              delay={0.3}
            />
            <ImpactCard
              icon={Heart}
              title="Community Impact"
              value={250}
              suffix="K+"
              description="Raised for local nonprofits"
              delay={0.4}
            />
          </div>
        </div>
      </section> */}

      {/* Our Story Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <Badge variant="secondary" className="bg-basa-teal/10 text-basa-navy border-basa-teal/20 mb-4">
                <Building2 className="w-4 h-4 mr-2" />
                Our Story
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-basa-navy mb-6">
                From Vision to Reality
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                How BASA evolved from a small gathering of business leaders to San Antonio's premier networking organization.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6"
            >
              <img 
                src="/images/profile/Jen-Bio.jpg" 
                alt="Jennifer Bonomo, Founder of BASA" 
                className="float-left w-40 h-40 object-cover aspect-square rounded-full mr-8 mb-4 shadow-lg border-2 border-basa-gold max-sm:float-none max-sm:mx-auto max-sm:mb-6" 
              />
              <p>
                BASA was founded by Jennifer Bonomo in April 2020, during one of the most challenging periods 
                for businesses worldwide. As a respected leader in San Antonio's marketing community, Jennifer 
                brought unmatched experience from her work with top radio stations including Cox Media and 
                iHeart Media, as well as direct mail marketing with ValPak and other print publications.
              </p>

              <p>
                Jennifer's strongest value comes from her extensive experience planning and promoting events. 
                Having been personally affected by the COVID-19 pandemic, she recognized the urgent need to 
                support local businesses through this unprecedented crisis. Her motivation for founding BASA 
                arose from a genuine desire to help local businesses endure and recover from the pandemic's 
                devastating impact.
              </p>

              <p>
                What began as a mission to connect like-minded professionals and help them prepare for 
                reopening has evolved into San Antonio's premier business networking organization. Jennifer's 
                vision of creating meaningful connections that go beyond traditional networking has resulted 
                in a community where businesses genuinely support each other, driving growth for individual 
                entrepreneurs and the broader San Antonio economy.
              </p>

              <p>
                Beyond BASA, Jennifer is passionate about partnering with nonprofit organizations, 
                particularly those supporting the military and elderly communities. When not working to 
                strengthen San Antonio's business community, she enjoys traveling, sports, and relaxing 
                on the beach.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What Sets BASA Apart - Traditional 3-Column Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="bg-basa-teal/10 text-basa-navy border-basa-teal/20 mb-4">
              <Star className="w-4 h-4 mr-2" />
              Our Approach
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-basa-navy mb-6">
              What Sets BASA Apart
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've redefined business networking by focusing on quality, purpose, and local impact.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-basa-navy to-basa-teal rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-basa-navy mb-4">Quality Over Quantity</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Curated membership ensures every connection is meaningful. We focus on building 
                    deep, lasting relationships rather than superficial networks.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-basa-gold to-basa-teal rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-basa-navy mb-4">Networking with Purpose</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our "Networking and Giving" initiative combines business development with 
                    community impact, creating opportunities that benefit everyone.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-basa-teal to-basa-navy rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-basa-navy mb-4">Local Impact</h3>
                  <p className="text-gray-600 leading-relaxed">
                    San Antonio-focused connections that strengthen our local economy and 
                    create opportunities for collaborative growth within our community.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Member Testimonials - Traditional Layout */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="bg-basa-gold/10 text-basa-navy border-basa-gold/20 mb-4">
              <Quote className="w-4 h-4 mr-2" />
              Member Stories
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-basa-navy mb-6">
              What Our Members Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real testimonials from business leaders who've experienced the BASA difference.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories - Traditional Layout */}
      {successStories.map((story, index) => (
        <SuccessStory key={index} story={story} index={index} />
      ))}

      {/* Leadership Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="bg-basa-teal/10 text-basa-navy border-basa-teal/20 mb-4">
              <Users2 className="w-4 h-4 mr-2" />
              Leadership
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-basa-navy mb-6">
              Meet Our Leadership Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experienced professionals dedicated to building San Antonio's premier business network.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Maria Elena Rodriguez",
                title: "Executive Director",
                description: "Leading BASA's mission since 2020",
                icon: Users,
                color: "from-basa-navy to-basa-teal"
              },
              {
                name: "David Chen",
                title: "Director of Member Relations",
                description: "Building meaningful connections since 2021",
                icon: Handshake,
                color: "from-basa-gold to-basa-teal"
              },
              {
                name: "Sarah Johnson",
                title: "Director of Community Impact",
                description: "Driving social responsibility since 2022",
                icon: Heart,
                color: "from-basa-teal to-basa-navy"
              },
              {
                name: "Michael Thompson",
                title: "Technology Director",
                description: "Enabling digital connections since 2021",
                icon: Globe,
                color: "from-basa-navy to-basa-gold"
              }
            ].map((leader, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className={`w-20 h-20 bg-gradient-to-br ${leader.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <leader.icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-basa-navy mb-2">{leader.name}</h3>
                    <p className="text-basa-teal font-medium mb-2">{leader.title}</p>
                    <p className="text-sm text-gray-600">{leader.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action Section - Traditional Layout */}
      <section className="py-16 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Join San Antonio's Most Connected Business Network?
            </h2>
            <p className="text-xl mb-12 text-blue-100 leading-relaxed">
              Connect with 150+ business leaders who've discovered the power of meaningful 
              relationships and collaborative growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="basa-btn-primary text-lg px-8 py-4">
                <Link href="/membership/join" className="flex items-center">
                  Apply for Membership
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-basa-navy hover:bg-white/10 text-lg px-8 py-4">
                <Link href="/events">Attend an Event</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
} 