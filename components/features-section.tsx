"use client"

import { Shield, Search, AlertTriangle, Lock, Zap, Eye, BarChart3, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Shield,
    title: 'Advanced Vulnerability Scanning',
    description: 'Comprehensive scanning with CVE database integration and real-time threat detection across your entire infrastructure.',
    color: 'text-cyan-400'
  },
  {
    icon: BarChart3,
    title: 'Risk Assessment & Prioritization',
    description: 'CVSS-based scoring with business impact analysis and custom risk algorithms for informed decision making.',
    color: 'text-blue-400'
  },
  {
    icon: Eye,
    title: 'Asset Discovery & Management',
    description: 'Automated asset inventory with device categorization and comprehensive vulnerability tracking.',
    color: 'text-teal-400'
  },
  {
    icon: Zap,
    title: 'Automated Remediation',
    description: 'Smart remediation suggestions with JIRA/ServiceNow integration and progress tracking.',
    color: 'text-cyan-400'
  },
  {
    icon: Users,
    title: 'Compliance Reporting',
    description: 'NIST, ISO 27001, OWASP compliance dashboards with automated report generation.',
    color: 'text-blue-400'
  },
  {
    icon: AlertTriangle,
    title: 'Threat Intelligence',
    description: 'Real-time threat feeds with IOC management and comprehensive threat landscape analysis.',
    color: 'text-teal-400'
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#151528]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
          <Badge variant="secondary" className="mb-4 bg-blue-500/20 text-cyan-200 border-blue-500/30 text-xs">
            Platform Features
          </Badge>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 px-2">
            Complete{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
              Security Assessment
            </span>{" "}
            Suite
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-4xl mx-auto px-4">
            Discover, analyze, and remediate security vulnerabilities with our comprehensive cybersecurity platform
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="bg-[#1a1a2e]/60 border-blue-900/30 backdrop-blur-sm hover:bg-[#1a1a2e]/80 transition-all duration-300 group animate-fade-in-up h-full"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-3 sm:pb-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-base sm:text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors leading-tight">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center animate-fade-in-up stagger-4">
          <p className="text-gray-400 mb-6 text-sm sm:text-base">
            Ready to secure your infrastructure?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <button className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-400 to-blue-700 text-white font-semibold rounded-lg hover:from-cyan-300 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-cyan-400/20 text-sm sm:text-base w-full sm:w-auto">
              Start Free Trial
            </button>
            <button className="px-6 sm:px-8 py-3 sm:py-4 border border-blue-500/30 text-blue-300 font-semibold rounded-lg hover:bg-blue-500/10 transition-all duration-300 text-sm sm:text-base w-full sm:w-auto">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}