"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"

const pricingTiers = [
  {
    name: 'Starter',
    price: '₹4,099',
    period: '/month',
    description: 'Perfect for small teams and startups',
    features: [
      'Up to 100 assets',
      'Basic vulnerability scanning',
      'Standard reporting',
      'Email support',
      '30-day retention',
      'Community access'
    ],
    popular: false,
    color: 'from-gray-600 to-gray-800'
  },
  {
    name: 'Professional',
    price: '₹12,499',
    period: '/month',
    description: 'Ideal for growing organizations',
    features: [
      'Up to 1,000 assets',
      'Advanced scanning & prioritization',
      'Compliance dashboards',
      'API integrations',
      '90-day retention',
      'Priority support',
      'Custom risk algorithms',
      'JIRA/ServiceNow integration'
    ],
    popular: true,
    color: 'from-cyan-400 to-blue-700'
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'pricing',
    description: 'For large-scale deployments',
    features: [
      'Unlimited assets',
      'Advanced threat intelligence',
      'White-label options',
      'Dedicated support',
      'Custom retention policies',
      'SSO integration',
      'Advanced analytics',
      'On-premise deployment'
    ],
    popular: false,
    color: 'from-teal-500 to-blue-600'
  }
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
          <Badge variant="secondary" className="mb-4 bg-blue-500/20 text-cyan-200 border-blue-500/30 text-xs">
            Pricing Plans
          </Badge>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 px-2">
            Flexible{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
              Security Solutions
            </span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-4xl mx-auto px-4">
            Choose the perfect plan for your organization's security needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch mb-12 sm:mb-16">
          {pricingTiers.map((tier, index) => (
            <Card 
              key={index}
              className={`relative bg-[#1a1a2e]/60 border-blue-900/30 backdrop-blur-sm hover:bg-[#1a1a2e]/80 transition-all duration-300 flex flex-col animate-fade-in-up ${
                tier.popular ? 'ring-2 ring-cyan-400/50 lg:scale-105 z-10' : ''
              }`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {tier.popular && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-cyan-400 to-blue-700 text-white font-medium px-3 sm:px-4 py-1 text-xs">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4 pt-6 sm:pt-8">
                <CardTitle className="text-lg sm:text-xl font-bold text-white mb-2">
                  {tier.name}
                </CardTitle>
                <div className="mb-3 sm:mb-4">
                  <span className="text-2xl sm:text-3xl font-bold text-white">{tier.price}</span>
                  <span className="text-gray-400 ml-1 text-xs sm:text-sm">{tier.period}</span>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm px-2">{tier.description}</p>
              </CardHeader>

              <CardContent className="space-y-4 flex-1 px-4 sm:px-6">
                <ul className="space-y-2 sm:space-y-3">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start text-gray-300 text-xs sm:text-sm">
                      <CheckCircle className="h-4 w-4 text-cyan-400 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 sm:pt-6">
                  <Button 
                    className={`w-full py-2 font-medium rounded-lg transition-all duration-300 text-xs ${
                      tier.popular 
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-700 text-white hover:from-cyan-300 hover:to-blue-600 shadow-lg shadow-cyan-400/20' 
                        : 'border border-blue-500/30 text-blue-300 hover:bg-blue-500/10 bg-transparent'
                    }`}
                    variant={tier.popular ? "default" : "outline"}
                  >
                    {tier.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="text-center animate-fade-in-up stagger-4">
          <p className="text-gray-400 text-sm sm:text-base px-4">
            All plans include 24/7 monitoring and regular security updates.{" "}
            <a href="#contact" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Need a custom solution?
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}