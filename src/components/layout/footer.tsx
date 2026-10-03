import Link from "next/link"
import Image from "next/image"
import { OFFICE_CONTACT } from "@/lib/feature-flags"
import { NewsletterForm } from "@/components/marketing/newsletter-form"
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Users,
  Calendar,
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

  return (
    <footer className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
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
                  <a href={`mailto:${OFFICE_CONTACT.email}`} className="hover:text-blue-400 transition-colors duration-200">
                    {OFFICE_CONTACT.email}
                  </a>
                </div>
                <div className="flex items-center text-gray-300">
                  <Phone className="w-4 h-4 mr-3 text-blue-400" />
                  <a href={OFFICE_CONTACT.phoneHref} className="hover:text-blue-400 transition-colors duration-200">
                    {OFFICE_CONTACT.phone}
                  </a>
                </div>
                <div className="flex items-start text-gray-300">
                  <MapPin className="w-4 h-4 mr-3 mt-0.5 text-blue-400 shrink-0" />
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
            
            {/* Newsletter */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Stay Connected</h4>
              <p className="text-gray-300 mb-6">
                Get the latest updates on events, networking opportunities, and community initiatives.
              </p>
              
              {/* Newsletter Signup */}
              <NewsletterForm source="footer" tone="dark" />
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
              <a href="/sitemap.xml" className="hover:text-blue-400 transition-colors duration-200">
                Sitemap
              </a>
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