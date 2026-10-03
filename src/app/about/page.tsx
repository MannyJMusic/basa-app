"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import {
  Star,
  Building2,
  MapPin,
  Target,
  Shield,
  ArrowRight,
  Users2,
  Sparkles
} from "lucide-react"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section - Traditional Layout */}
      <section className="relative bg-linear-to-r from-blue-900 to-blue-700 text-white py-16 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/backgrounds/about-bg.jpg')"
          }}
        />
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-linear-to-r from-blue-900/60 to-blue-700/60"></div>
        
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
              Business Association of San Antonio
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
                How BASA got started.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6"
            >
              <Image 
                src="/images/profile/Jen-Bio.jpg" 
                alt="Jennifer Bonomo, Founder of BASA" 
                width={160}
                height={160}
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
                reopening has grown into a San Antonio business networking organization. Jennifer's 
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
              The people behind BASA.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {[
              {
                name: "Jennifer Bonomo",
                title: "Founder",
                tagline: "Visionary leader and BASA's original connector",
                image: "/images/profile/Jen-Bio.jpg"
              },
              {
                name: "Manny Moreno",
                title: "Technical Lead",
                tagline: "Empowering BASA with technology and innovation",
                image: "/images/profile/Manny-Bio.jpg"
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
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-linear-to-br from-white to-gray-50/50 backdrop-blur-xs">
                  <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Image 
                        src={leader.image} 
                        alt={leader.name + ' profile photo'} 
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full object-cover border-2 border-basa-gold shadow-sm" 
                      />
                    </div>
                    <h3 className="text-xl font-bold text-basa-navy mb-2">{leader.name}</h3>
                    <p className="text-basa-teal font-medium mb-2">{leader.title}</p>
                    <p className="text-sm text-gray-600">{leader.tagline}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What Sets BASA Apart - Traditional 3-Column Grid */}
      <section className="relative py-16 bg-gray-50 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/backgrounds/basa-approach-bg.jpg')"
          }}
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-white/40"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="bg-basa-gold text-basa-navy border-basa-gold mb-4">
              <Star className="w-4 h-4 mr-2" />
              Our Approach
            </Badge>
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              style={{ textShadow: '0 4px 24px rgba(0,0,0,0.85), 0 1.5px 0 #000' }}
            >
              What Sets BASA Apart
            </h2>
            <p
              className="text-xl text-white max-w-3xl mx-auto"
              style={{ textShadow: '0 3px 16px rgba(0,0,0,0.85), 0 1px 0 #000' }}
            >
              We focus on quality, purpose, and local impact.
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
              <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-linear-to-br from-white to-gray-50/50 backdrop-blur-xs">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-linear-to-br from-basa-navy to-basa-teal rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-basa-navy mb-4">Quality Over Quantity</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We focus on building deep, lasting relationships rather than
                    superficial networks.
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
              <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-linear-to-br from-white to-gray-50/50 backdrop-blur-xs">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-linear-to-br from-basa-gold to-basa-teal rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
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
              <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-linear-to-br from-white to-gray-50/50 backdrop-blur-xs">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-linear-to-br from-basa-teal to-basa-navy rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
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

      {/* Call-to-Action Section - Traditional Layout */}
      <section className="relative py-16 text-white overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/backgrounds/basa-connect-bg.jpg')"
          }}
        />
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-linear-to-r from-blue-900/70 to-blue-700/70"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2
              className="text-3xl md:text-4xl font-bold mb-6 text-basa-gold"
              style={{ textShadow: '0 4px 24px rgba(0,0,0,0.85), 0 1.5px 0 #000' }}
            >
              Ready to Join BASA?
            </h2>
            <p
              className="text-xl mb-12 text-blue-100 leading-relaxed"
              style={{ textShadow: '0 3px 16px rgba(0,0,0,0.85), 0 1px 0 #000' }}
            >
              Meet San Antonio business owners and professionals at our networking events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-basa-gold text-basa-navy hover:bg-basa-gold/90 focus:bg-basa-gold/80 text-lg px-8 py-4 border-2 border-basa-gold shadow-2xl">
                <Link href="/membership/join" className="flex items-center">
                  Apply for Membership
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-basa-navy hover:bg-white/10 text-lg px-8 py-4 shadow-2xl">
                <Link href="/events">Attend an Event</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
} 