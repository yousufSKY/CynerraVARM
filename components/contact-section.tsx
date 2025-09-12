"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Shield, 
  Users, 
  Zap,
  CheckCircle 
} from "lucide-react"

const contactInfo = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get help from our security experts",
    contact: "support@cyberguard.com",
    available: "24/7 Response"
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Speak directly with our team",
    contact: "+1 (555) 123-4567",
    available: "Mon-Fri 9AM-6PM EST"
  },
  {
    icon: MapPin,
    title: "Headquarters",
    description: "Visit our main office",
    contact: "123 Security St, Cyber City, CA 90210",
    available: "By appointment"
  }
];

const consultationTypes = [
  {
    icon: Shield,
    title: "Security Assessment",
    description: "Comprehensive vulnerability analysis"
  },
  {
    icon: Users,
    title: "Enterprise Demo",
    description: "Personalized platform walkthrough"
  },
  {
    icon: Zap,
    title: "Implementation Support",
    description: "Technical integration assistance"
  }
];

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    consultationType: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section id="contact" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#151528]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
          <Badge variant="secondary" className="mb-4 bg-blue-500/20 text-cyan-200 border-blue-500/30 text-xs">
            Get In Touch
          </Badge>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 px-2">
            Ready to{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
              Secure Your Future?
            </span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-4xl mx-auto px-4">
            Connect with our cybersecurity experts to discuss your organization's security needs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Form */}
          <div className="animate-fade-in-up stagger-2 order-2 lg:order-1">
            <Card className="bg-[#1a1a2e]/60 border-blue-900/30 backdrop-blur-sm">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl font-bold text-white">
                  Request Security Consultation
                </CardTitle>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Fill out the form below and our security experts will contact you within 24 hours.
                </p>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {isSubmitted ? (
                  <div className="text-center py-8 sm:py-12">
                    <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Thank You!</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      Your request has been submitted. Our team will contact you within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Full Name *
                        </label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="bg-[#0a0a0f]/50 border-blue-900/30 text-white placeholder-gray-500 h-11 sm:h-12 text-sm sm:text-base"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                          Work Email *
                        </label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="bg-[#0a0a0f]/50 border-blue-900/30 text-white placeholder-gray-500 h-11 sm:h-12 text-xs sm:text-sm"
                          placeholder="john@company.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                          Company Name *
                        </label>
                        <Input
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          required
                          className="bg-[#0a0a0f]/50 border-blue-900/30 text-white placeholder-gray-500 h-11 sm:h-12 text-xs sm:text-sm"
                          placeholder="Your Company"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                          Phone Number
                        </label>
                        <Input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="bg-[#0a0a0f]/50 border-blue-900/30 text-white placeholder-gray-500 h-11 sm:h-12 text-xs sm:text-sm"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                        Consultation Type *
                      </label>
                      <select
                        name="consultationType"
                        value={formData.consultationType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-3 sm:py-3.5 bg-[#0a0a0f]/50 border border-blue-900/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 text-xs sm:text-sm h-11 sm:h-12"
                      >
                        <option value="">Select consultation type</option>
                        <option value="security-assessment">Security Assessment</option>
                        <option value="enterprise-demo">Enterprise Demo</option>
                        <option value="implementation-support">Implementation Support</option>
                        <option value="custom-solution">Custom Solution</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                        Message
                      </label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={4}
                        className="bg-[#0a0a0f]/50 border-blue-900/30 text-white placeholder-gray-500 text-xs sm:text-sm resize-none"
                        placeholder="Tell us about your security requirements and challenges..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-cyan-400 to-blue-700 text-white font-medium py-2 rounded-lg hover:from-cyan-300 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-cyan-400/20 disabled:opacity-50 text-xs touch-manipulation"
                    >
                      {isSubmitting ? 'Submitting...' : 'Request Consultation'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6 sm:space-y-8 animate-fade-in-up stagger-3 order-1 lg:order-2">
            {/* Contact Methods */}
            <div className="space-y-4 sm:space-y-6">
              {contactInfo.map((info, index) => (
                <Card key={index} className="bg-[#1a1a2e]/40 border-blue-900/20 backdrop-blur-sm">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-cyan-400/20 to-blue-600/20 flex items-center justify-center flex-shrink-0">
                        <info.icon className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-white mb-1 text-xs sm:text-sm">
                          {info.title}
                        </h3>
                        <p className="text-gray-400 text-xs mb-2">
                          {info.description}
                        </p>
                        <p className="text-cyan-300 font-medium text-xs sm:text-sm break-all sm:break-normal">
                          {info.contact}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          {info.available}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Consultation Types */}
            <Card className="bg-[#1a1a2e]/40 border-blue-900/20 backdrop-blur-sm">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg font-bold text-white">
                  Our Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                {consultationTypes.map((type, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <type.icon className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="font-medium text-white text-xs sm:text-sm">{type.title}</div>
                      <div className="text-xs text-gray-400">{type.description}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-[#1a1a2e]/40 border-blue-900/20 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-cyan-400">24/7</div>
                    <div className="text-xs sm:text-sm text-gray-400">Support</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-cyan-400">10K+</div>
                    <div className="text-xs sm:text-sm text-gray-400">Assets Protected</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}