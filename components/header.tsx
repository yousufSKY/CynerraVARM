"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserButton, useUser } from '@clerk/nextjs'
import { cyberGuardTheme } from '@/lib/clerk-theme'
import { 
  Shield, 
  Menu, 
  X, 
  ChevronDown,
  Search,
  AlertTriangle,
  Lock,
  Users
} from "lucide-react"

const navigationItems = [
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Testimonials', href: '#testimonials' },
  { name: 'FAQ', href: '#faq' },
  { name: 'Contact', href: '#contact' }
];

const services = [
  { name: 'Vulnerability Scanning', href: '/services/scanning', icon: Search },
  { name: 'Threat Detection', href: '/services/detection', icon: AlertTriangle },
  { name: 'Compliance Monitoring', href: '/services/compliance', icon: Lock },
  { name: 'Security Training', href: '/services/training', icon: Users }
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const { isSignedIn } = useUser();

  return (
    <header className="fixed top-0 z-50 w-full bg-[rgba(10,10,15,0.85)] border-b border-blue-900/60 shadow-lg backdrop-blur-xl">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <Shield className="h-7 w-7 text-cyan-400 drop-shadow-glow group-hover:text-cyan-300 transition-colors" />
            <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg group-hover:bg-cyan-300/30 transition-all" />
          </div>
          <span className="text-xl font-semibold text-cyan-100 tracking-wide group-hover:text-white transition-colors">
            CyberGuard
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {/* Services Dropdown */}
          <div className="relative">
            <button
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
              className="flex items-center text-sm text-blue-200 hover:text-cyan-400 transition-colors"
            >
              Services
              <ChevronDown className="h-4 w-4 ml-1" />
            </button>
            
            {isServicesOpen && (
              <div
                onMouseEnter={() => setIsServicesOpen(true)}
                onMouseLeave={() => setIsServicesOpen(false)}
                className="absolute top-full left-0 mt-2 w-64 bg-[#1a1a2e]/95 border border-blue-900/30 rounded-lg shadow-xl backdrop-blur-xl"
              >
                <div className="p-4 space-y-3">
                  {services.map((service) => (
                    <Link
                      key={service.name}
                      href={service.href}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-blue-500/10 transition-colors group"
                    >
                      <service.icon className="h-5 w-5 text-cyan-400 group-hover:text-cyan-300" />
                      <span className="text-sm text-blue-200 group-hover:text-white">{service.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Regular Navigation Items */}
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm text-blue-200 hover:text-cyan-400 transition-colors"
            >
              {item.name}
            </Link>
          ))}

          {/* Authentication Buttons */}
          {isSignedIn ? (
            <>
              <Link 
                href="/dashboard" 
                className="text-sm text-blue-200 hover:text-cyan-400 transition-colors"
              >
                Dashboard
              </Link>
              <UserButton 
                appearance={cyberGuardTheme}
              />
            </>
          ) : (
            <>
              <Link 
                href="/sign-in"
                className="text-sm text-blue-200 hover:text-cyan-400 transition-colors"
              >
                Login
              </Link>

              {/* CTA Button */}
              <Link href="/sign-up">
                <Button className="bg-gradient-to-r from-cyan-400 to-blue-700 shadow-lg shadow-cyan-400/30 text-white font-medium text-xs px-3 py-1.5 rounded-lg hover:from-cyan-300 hover:to-blue-600 transition-all focus:ring-2 focus:ring-cyan-400">
                  Start Free Trial
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-cyan-200 hover:text-cyan-400"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-blue-900/30 bg-[rgba(10,10,15,0.95)] backdrop-blur-xl">
          <div className="px-4 py-6 space-y-4">
            {/* Services Section */}
            <div className="space-y-3">
              <div className="text-cyan-400 font-medium text-xs uppercase tracking-wide">
                Services
              </div>
              {services.map((service) => (
                <Link
                  key={service.name}
                  href={service.href}
                  className="flex items-center gap-3 text-sm text-blue-200 hover:text-cyan-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <service.icon className="h-4 w-4" />
                  {service.name}
                </Link>
              ))}
            </div>

            <div className="border-t border-blue-900/30 pt-4 space-y-3">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-sm text-blue-200 hover:text-cyan-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Authentication */}
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="block text-sm text-blue-200 hover:text-cyan-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  className="block text-sm text-blue-200 hover:text-cyan-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile CTA */}
            {!isSignedIn && (
              <div className="pt-4">
                <Link href="/sign-up">
                  <Button 
                    className="w-full bg-gradient-to-r from-cyan-400 to-blue-700 shadow-lg shadow-cyan-400/30 text-white font-medium text-xs px-3 py-1.5 rounded-lg hover:from-cyan-300 hover:to-blue-600 transition-all focus:ring-2 focus:ring-cyan-400"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile User Menu */}
            {isSignedIn && (
              <div className="pt-4 flex justify-center">
                <UserButton 
                  appearance={cyberGuardTheme}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}