"use client"

import Link from "next/link"
import { 
  Shield, 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Linkedin, 
  Github,
  Award,
  Lock,
  Globe
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

const footerSections = [
  {
    title: "Platform",
    links: [
      { name: "Vulnerability Scanning", href: "/platform/scanning" },
      { name: "Threat Detection", href: "/platform/detection" },
      { name: "Risk Assessment", href: "/platform/risk-assessment" },
      { name: "Compliance Monitoring", href: "/platform/compliance" },
      { name: "Asset Management", href: "/platform/assets" }
    ]
  },
  {
    title: "Solutions",
    links: [
      { name: "Enterprise Security", href: "/solutions/enterprise" },
      { name: "Small Business", href: "/solutions/small-business" },
      { name: "Cloud Security", href: "/solutions/cloud" },
      { name: "DevSecOps", href: "/solutions/devsecops" },
      { name: "Compliance", href: "/solutions/compliance" }
    ]
  },
  {
    title: "Resources",
    links: [
      { name: "Documentation", href: "/docs" },
      { name: "API Reference", href: "/api" },
      { name: "Security Blog", href: "/blog" },
      { name: "Case Studies", href: "/case-studies" },
      { name: "Webinars", href: "/webinars" }
    ]
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Contact", href: "/contact" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" }
    ]
  }
];

const certifications = [
  { name: "SOC 2 Type II", icon: Award },
  { name: "ISO 27001", icon: Lock },
  { name: "GDPR Compliant", icon: Globe }
];

const socialLinks = [
  { name: "Twitter", icon: Twitter, href: "https://twitter.com/cyberguard" },
  { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/cyberguard" },
  { name: "GitHub", icon: Github, href: "https://github.com/cyberguard" }
];

export function Footer() {
  return (
    <footer className="bg-[#0a0a0f] border-t border-blue-900/30">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Mobile Compact Layout */}
        <div className="block md:hidden">
          {/* Company Info - Compact */}
          <div className="text-center mb-6">
            <Link href="/" className="flex items-center justify-center space-x-2 mb-3">
              <Shield className="h-4 w-4 text-cyan-400" />
              <span className="text-base font-semibold text-cyan-100">CyberGuard</span>
            </Link>
            <p className="text-gray-400 text-xs leading-relaxed mb-3 px-4">
              Advanced cybersecurity solutions for modern enterprises.
            </p>
            
            {/* Contact Info - Horizontal */}
            <div className="flex flex-wrap justify-center gap-4 text-xs mb-4">
              <div className="flex items-center text-gray-400">
                <Mail className="h-3 w-3 mr-1 text-cyan-400" />
                <span>support@cyberguard.com</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Phone className="h-3 w-3 mr-1 text-cyan-400" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>

          {/* Footer Links - Compact Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {footerSections.map((section, index) => (
              <div key={index} className="text-center">
                <h3 className="text-white font-medium mb-2 text-xs">{section.title}</h3>
                <ul className="space-y-1">
                  {section.links.slice(0, 3).map((link) => (
                    <li key={link.name}>
                      <Link 
                        href={link.href}
                        className="text-gray-400 hover:text-cyan-400 transition-colors text-xs"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Certifications - Horizontal */}
          <div className="text-center mb-4">
            <div className="flex flex-wrap justify-center gap-2">
              {certifications.map((cert) => (
                <Badge 
                  key={cert.name}
                  variant="secondary" 
                  className="bg-green-500/20 text-green-400 border-green-500/30 text-xs px-2 py-1"
                >
                  <cert.icon className="w-2 h-2 mr-1" />
                  {cert.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-8">
          {/* Company Info */}
          <div className="md:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-4 sm:mb-6">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
              <span className="text-lg sm:text-xl font-semibold text-cyan-100">CyberGuard</span>
            </Link>
            <p className="text-gray-400 mb-4 sm:mb-6 leading-relaxed text-xs sm:text-sm">
              Advanced vulnerability assessment and cybersecurity solutions for modern enterprises. 
              Protect your infrastructure with AI-powered threat detection and comprehensive security monitoring.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 sm:space-y-3 text-xs">
              <div className="flex items-center text-gray-400">
                <Mail className="h-3 w-3 mr-2 sm:mr-3 text-cyan-400 flex-shrink-0" />
                <span className="break-all sm:break-normal">support@cyberguard.com</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Phone className="h-3 w-3 mr-2 sm:mr-3 text-cyan-400 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-start text-gray-400">
                <MapPin className="h-3 w-3 mr-2 sm:mr-3 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>123 Security St, Cyber City, CA 90210</span>
              </div>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, index) => (
            <div key={index} className="min-w-0">
              <h3 className="text-white font-medium mb-3 sm:mb-4 text-xs sm:text-sm">{section.title}</h3>
              <ul className="space-y-2 sm:space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-cyan-400 transition-colors text-xs block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Security Certifications - Desktop Only */}
        <div className="hidden md:block border-t border-blue-900/30 pt-6 sm:pt-8 mt-8 sm:mt-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8">
            <div className="w-full lg:w-auto">
              <h4 className="text-white font-medium mb-3 sm:mb-4 text-xs sm:text-sm">Security & Compliance</h4>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {certifications.map((cert) => (
                  <Badge 
                    key={cert.name}
                    variant="secondary" 
                    className="bg-green-500/20 text-green-400 border-green-500/30 text-xs px-2 py-1"
                  >
                    <cert.icon className="w-2 h-2 mr-1" />
                    {cert.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="w-full lg:w-auto lg:text-right">
              <h4 className="text-white font-medium mb-2 text-xs sm:text-sm">Security Updates</h4>
              <p className="text-gray-400 text-xs mb-3 sm:mb-4">
                Get the latest threat intelligence and security insights
              </p>
              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 sm:flex-none px-2 py-1.5 bg-[#1a1a2e]/60 border border-blue-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-xs"
                />
                <button className="px-2 py-1.5 bg-gradient-to-r from-cyan-400 to-blue-700 text-white font-medium rounded-lg hover:from-cyan-300 hover:to-blue-600 transition-all text-xs touch-manipulation">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-blue-900/30 bg-[#151528]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          {/* Mobile Layout - Compact */}
          <div className="block md:hidden text-center space-y-2">
            <div className="text-gray-400 text-xs">
              © 2025 CyberGuard. All rights reserved.
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-gray-400 text-xs">Follow:</span>
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-cyan-400 transition-colors touch-manipulation"
                  aria-label={social.name}
                >
                  <social.icon className="h-3 w-3" />
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex md:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="text-gray-400 text-xs text-center sm:text-left">
              © 2025 CyberGuard. All rights reserved. | Protecting enterprises worldwide.
            </div>
            
            {/* Social Links */}
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-gray-400 text-xs">Follow us:</span>
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-cyan-400 transition-colors touch-manipulation"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trust Indicators - Horizontal on Mobile */}
      <div className="bg-[#0a0a0f] border-t border-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Shield className="h-2 w-2 sm:h-3 sm:w-3 text-green-400 flex-shrink-0" />
              <span>SSL Encryption</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="h-2 w-2 sm:h-3 sm:w-3 text-green-400 flex-shrink-0" />
              <span>Zero-Trust</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="h-2 w-2 sm:h-3 sm:w-3 text-green-400 flex-shrink-0" />
              <span>Industry Leading</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}