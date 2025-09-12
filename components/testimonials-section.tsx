"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'CISO at TechCorp',
    company: 'TechCorp',
    avatar: 'SC',
    content: 'Cynerra transformed our vulnerability management process. The automated prioritization and remediation tracking saved us 70% of our time.',
    rating: 5,
    industry: 'Technology'
  },
  {
    name: 'Michael Rodriguez',
    role: 'Security Director at FinanceSecure',
    company: 'FinanceSecure',
    avatar: 'MR',
    content: 'The compliance dashboards and reporting capabilities are outstanding. We achieved SOC 2 compliance 6 months ahead of schedule.',
    rating: 5,
    industry: 'Financial Services'
  },
  {
    name: 'Jennifer Wang',
    role: 'Lead Security Analyst at CloudTech',
    company: 'CloudTech',
    avatar: 'JW',
    content: 'Real-time threat intelligence integration gives us the edge we need. The risk scoring is incredibly accurate and actionable.',
    rating: 5,
    industry: 'Cloud Services'
  },
  {
    name: 'David Thompson',
    role: 'IT Security Manager at GlobalCorp',
    company: 'GlobalCorp',
    avatar: 'DT',
    content: 'The automated asset discovery found vulnerabilities we didn\'t even know existed. Cynerra is now essential to our security operations.',
    rating: 5,
    industry: 'Manufacturing'
  }
];

export function TestimonialsSection() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="testimonials" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#151528]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
          <Badge variant="secondary" className="mb-4 bg-blue-500/20 text-cyan-200 border-blue-500/30 text-xs">
            Customer Success
          </Badge>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 px-2">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
              Security Leaders
            </span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-4xl mx-auto px-4">
            See how organizations worldwide are strengthening their security posture with Cynerra
          </p>
        </div>

        {/* Featured Testimonial */}
        <div className="mb-12 sm:mb-16 animate-fade-in-up stagger-2">
          <Card className="bg-[#1a1a2e]/60 border-blue-900/30 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-8 lg:p-12">
              <div className="flex flex-col items-center text-center gap-6 sm:gap-8">
                <Quote className="h-8 w-8 sm:h-10 sm:w-10 text-cyan-400 flex-shrink-0" />
                <blockquote className="text-base sm:text-lg lg:text-xl text-white leading-relaxed mb-4 sm:mb-6 max-w-4xl">
                  "{testimonials[activeTestimonial].content}"
                </blockquote>
                <div className="flex items-center justify-center gap-1 mb-3 sm:mb-4">
                  {Array.from({ length: testimonials[activeTestimonial].rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="flex items-center justify-center gap-3 sm:gap-4">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                    <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-600 text-white font-medium text-xs sm:text-sm">
                      {testimonials[activeTestimonial].avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center sm:text-left">
                    <div className="font-medium text-white text-xs sm:text-sm">
                      {testimonials[activeTestimonial].name}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {testimonials[activeTestimonial].role}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testimonial Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <Card 
              key={index}
              className="bg-[#1a1a2e]/40 border-blue-900/20 backdrop-blur-sm hover:bg-[#1a1a2e]/60 transition-all duration-300 cursor-pointer animate-fade-in-up touch-manipulation"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => setActiveTestimonial(index)}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-300 mb-4 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                  "{testimonial.content}"
                </blockquote>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-600 text-white font-medium text-xs">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="font-medium text-white text-xs truncate">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-400 text-xs truncate">
                      {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testimonial Navigation */}
        <div className="flex justify-center gap-2 sm:gap-3">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 touch-manipulation ${
                index === activeTestimonial 
                  ? 'bg-cyan-400 scale-110' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
              onClick={() => setActiveTestimonial(index)}
              aria-label={`View testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}