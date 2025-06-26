"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Quote, Star, ArrowRight } from "lucide-react"
import { useState } from "react"

interface Testimonial {
  id: string
  name: string
  company: string
  membership: string
  quote: string
  results: string
  image?: string
  rating?: number
}

interface TestimonialsProps {
  testimonials: Testimonial[]
  title?: string
  subtitle?: string
  showViewAll?: boolean
  viewAllHref?: string
}

// Testimonial Card Component
const TestimonialCard = ({ testimonial, index }: { testimonial: Testimonial; index: number }) => {
  const [isHovered, setIsHovered] = useState(false)

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
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group"
    >
      <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm card-modern">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-basa-navy to-basa-teal rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              {testimonial.image ? (
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <Quote className="w-8 h-8 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-basa-navy mb-1">{testimonial.name}</h4>
              <p className="text-basa-teal font-medium">{testimonial.company}</p>
              <p className="text-sm text-gray-500">{testimonial.membership}</p>
            </div>
          </div>
          
          {/* Quote */}
          <blockquote className="text-gray-700 leading-relaxed mb-6 italic relative">
            <Quote className="absolute -top-2 -left-2 w-6 h-6 text-basa-gold/30" />
            "{testimonial.quote}"
          </blockquote>
          
          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {[...Array(testimonial.rating || 5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-basa-gold text-basa-gold" />
              ))}
            </div>
            <Badge variant="secondary" className="bg-basa-gold/10 text-basa-navy border-basa-gold/20">
              {testimonial.results}
            </Badge>
          </div>
          
          {/* Hover Effect Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-gradient-to-br from-basa-navy/5 to-basa-teal/5 rounded-lg pointer-events-none"
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function Testimonials({
  testimonials,
  title = "What Our Members Say",
  subtitle = "Real testimonials from business leaders who've experienced the BASA difference.",
  showViewAll = false,
  viewAllHref = "/testimonials"
}: TestimonialsProps) {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="bg-basa-gold/10 text-basa-navy border-basa-gold/20 mb-4">
            <Quote className="w-4 h-4 mr-2" />
            Member Stories
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-basa-navy mb-6">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </motion.div>
        
        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
          ))}
        </div>
        
        {/* View All Button */}
        {showViewAll && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Button asChild variant="outline" size="lg" className="basa-btn-secondary">
              <a href={viewAllHref} className="flex items-center">
                View All Testimonials
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  )
} 