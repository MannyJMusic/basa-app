import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  ArrowRight,
  Building2,
  Users,
  Calendar,
  FileText,
  MessageSquare,
  Heart
} from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { href: "/", label: "Home", icon: Building2 },
    { href: "/about", label: "About", icon: Building2 },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/membership", label: "Membership", icon: Users },
    { href: "/contact", label: "Contact", icon: MessageSquare },
  ]

  const socialLinks = [
    { href: "#", label: "Facebook", icon: Facebook },
    { href: "#", label: "Twitter", icon: Twitter },
    { href: "#", label: "LinkedIn", icon: Linkedin },
    { href: "#", label: "Instagram", icon: Instagram },
  ]

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-pattern-dots opacity-5"></div>
      
      <div className="relative basa-container">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <Image
                  src="/images/BASA-LOGO.png"
                  alt="BASA Logo"
                  width={140}
                  height={50}
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                Building stronger business communities through strategic networking and meaningful community partnerships in San Antonio.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <Mail className="w-4 h-4 mr-3 text-blue-400" />
                  <span>info@businessassociationsa.com</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Phone className="w-4 h-4 mr-3 text-blue-400" />
                  <span>(210) 549-7190</span>
                </div>
                <div className="flex items-start text-gray-300">
                  <MapPin className="w-4 h-4 mr-3 mt-0.5 text-blue-400 flex-shrink-0" />
                  <span>9002 Wurbach Rd<br />San Antonio, TX 78240</span>
                </div>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <li key={link.href}>
                      <Link 
                        href={link.href} 
                        className="flex items-center text-gray-300 hover:text-blue-400 transition-colors duration-200 group"
                      >
                        <Icon className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
            
            {/* Newsletter & Social */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Stay Connected</h4>
              <p className="text-gray-300 mb-6">
                Get the latest updates on events, networking opportunities, and community initiatives.
              </p>
              
              {/* Newsletter Signup */}
              <div className="mb-8">
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-r-lg border-l-0">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Social Links */}
              <div>
                <h5 className="text-sm font-semibold mb-4 text-gray-300">Follow Us</h5>
                <div className="flex space-x-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon
                    return (
                      <Link
                        key={social.label}
                        href={social.href}
                        className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-200 group"
                      >
                        <Icon className="w-5 h-5 text-gray-300 group-hover:text-white" />
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-700 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="flex items-center mb-4 lg:mb-0">
              <Image
                src="/images/BASA-LOGO.png"
                alt="BASA Logo"
                width={100}
                height={35}
                className="h-6 w-auto mr-4"
              />
              <span className="text-gray-300">
                &copy; {currentYear} BASA. All rights reserved.
              </span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-300">
              <Link href="/privacy" className="hover:text-blue-400 transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-blue-400 transition-colors duration-200">
                Terms of Service
              </Link>
              <Link href="/sitemap" className="hover:text-blue-400 transition-colors duration-200">
                Sitemap
              </Link>
            </div>
          </div>
          
          {/* Made with love */}
          <div className="text-center mt-6 pt-6 border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              Made with <Heart className="w-4 h-4 inline text-red-500" /> in San Antonio
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
} 