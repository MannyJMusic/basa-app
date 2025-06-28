"use client"

import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Menu, 
  X, 
  ChevronDown, 
  User, 
  LogOut,
  Building2,
  Calendar,
  Users,
  FileText,
  MessageSquare,
  Home
} from "lucide-react"

export default function Navigation() {
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigationItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "About", icon: Building2 },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/membership", label: "Membership", icon: Users },
    { href: "/contact", label: "Contact", icon: MessageSquare },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-soft border-b border-gray-100' 
        : 'basa-header'
    }`}>
      <div className="basa-container">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center group">
              <Image
                src="/images/BASA-LOGO.png"
                alt="BASA Logo"
                width={140}
                height={50}
                className={`h-8 w-auto lg:h-10 transition-all duration-300 group-hover:scale-105 ${
                  isScrolled 
                    ? 'filter brightness-0 contrast-200'
                    : 'filter brightness-110'
                }`}
                priority
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-4 py-2 font-medium transition-all duration-300 group ${
                      isScrolled 
                        ? 'text-gray-700 hover:text-navy-600' 
                        : 'text-white hover:text-gold-300'
                    }`}
                  >
                    <span className="flex items-center space-x-1">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </span>
                    <span className={`absolute bottom-0 left-0 w-full h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${
                      isScrolled ? 'bg-gradient-to-r from-navy-600 to-teal-600' : 'bg-gradient-to-r from-gold-400 to-gold-300'
                    }`}></span>
                  </Link>
                )
              })}
            </div>
          </div>
          
          {/* Auth Buttons - Desktop */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-4">
              {session ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" className={`${
                      isScrolled 
                        ? 'text-gray-700 hover:text-navy-600 hover:bg-navy-50' 
                        : 'text-white hover:text-gold-300 hover:bg-white/10'
                    }`}>
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className={`${
                      isScrolled 
                        ? 'border-gray-300 text-gray-700 hover:bg-gray-50' 
                        : 'border-white/30 text-white hover:bg-white/10'
                    }`}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/sign-in">
                    <Button variant="ghost" className={`${
                      isScrolled 
                        ? 'text-gray-700 hover:text-navy-600 hover:bg-navy-50' 
                        : 'text-white hover:text-gold-300 hover:bg-white/10'
                    }`}>
                      Login
                    </Button>
                  </Link>
                  <Link href="/membership/join">
                    <Button className="basa-btn-secondary text-navy">
                      Join BASA
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              className={`${
                isScrolled 
                  ? 'text-gray-700 hover:text-navy-600 hover:bg-navy-50' 
                  : 'text-white hover:text-gold-300 hover:bg-white/10'
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-md rounded-lg border border-gray-100 shadow-soft mb-4">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center px-3 py-3 text-gray-700 hover:text-navy-600 hover:bg-navy-50 rounded-md text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Link>
                )
              })}
              
              {/* Mobile Auth Section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                {session ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center px-3 py-3 text-gray-700 hover:text-navy-600 hover:bg-navy-50 rounded-md text-base font-medium transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="w-5 h-5 mr-3" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        signOut({ callbackUrl: "/" })
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex items-center w-full px-3 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md text-base font-medium transition-colors duration-200"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/sign-in"
                      className="flex items-center px-3 py-3 text-gray-700 hover:text-navy-600 hover:bg-navy-50 rounded-md text-base font-medium transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="w-5 h-5 mr-3" />
                      Login
                    </Link>
                    <Link
                      href="/membership/join"
                      className="flex items-center px-3 py-3 text-navy-900 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 rounded-md text-base font-medium transition-all duration-200 transform hover:scale-105"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Join BASA
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 