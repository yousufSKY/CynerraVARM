"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Shield, Search, AlertTriangle, Lock, Zap, Eye } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 sm:pt-24 md:pt-32 px-4 sm:px-6 lg:px-8 transition-all duration-500">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-4 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-4 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-56 sm:w-80 h-56 sm:h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto relative z-10 max-w-7xl">
        <div className="text-center space-y-6 sm:space-y-8 animate-fade-in-up">
          {/* Security Stats */}
          <div className="flex items-center justify-center gap-2 animate-fade-in-up stagger-1">
            <div className="flex gap-2 sm:gap-4 flex-wrap justify-center">
              <span className="text-cyan-200 text-xs sm:text-sm font-medium bg-[#151528]/60 px-2 sm:px-4 py-1 sm:py-2 rounded-full shadow-inner backdrop-blur-md border border-blue-900">10,000+ Vulnerabilities</span>
              <span className="text-cyan-200 text-xs sm:text-sm font-medium bg-[#151528]/60 px-2 sm:px-4 py-1 sm:py-2 rounded-full shadow-inner backdrop-blur-md border border-blue-900">99.9% Accuracy</span>
              <span className="text-cyan-200 text-xs sm:text-sm font-medium bg-[#151528]/60 px-2 sm:px-4 py-1 sm:py-2 rounded-full shadow-inner backdrop-blur-md border border-blue-900">24/7 Monitoring</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 sm:space-y-6 animate-fade-in-up stagger-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight max-w-5xl mx-auto px-2">
              Advanced Vulnerability Assessment for{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
                Modern Enterprises
              </span>
            </h1>
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent mt-2 sm:mt-4 px-2">
              Comprehensive Security Scanning & Threat Detection 🛡️
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed mt-3 sm:mt-4 lg:mt-6 px-4">
              Discover, analyze, and remediate security vulnerabilities across your entire infrastructure with our AI-powered cybersecurity platform.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-fade-in-up stagger-3 px-4">
            <Button 
              variant="outline" 
              size="default" 
              className="glass border-blue-500/20 text-white hover:border-blue-500/40 hover:bg-blue-500/10 transition-all duration-300 cursor-pointer text-xs px-4 py-2 rounded-lg w-full sm:w-auto"
            >
              Learn More
            </Button>
            <Button 
              variant="default" 
              size="default"
              className="glass-button shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 cursor-pointer text-xs px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-700 hover:from-cyan-300 hover:to-blue-600 w-full sm:w-auto"
              aria-label="Get Started Now"
            >
              Get Started Now
            </Button>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 animate-fade-in-up stagger-4 px-4">
            <Badge variant="secondary" className="text-xs cursor-pointer hover:scale-105 transition-transform bg-blue-500/20 text-cyan-200 border-blue-500/30 px-2 sm:px-3 py-1">
              <Search className="w-3 h-3 mr-1" />
              Vulnerability Scanning
            </Badge>
            <Badge variant="secondary" className="text-xs cursor-pointer hover:scale-105 transition-transform bg-blue-500/20 text-cyan-200 border-blue-500/30 px-2 sm:px-3 py-1">
              <Shield className="w-3 h-3 mr-1" />
              Threat Detection
            </Badge>
            <Badge variant="secondary" className="text-xs cursor-pointer hover:scale-105 transition-transform bg-blue-500/20 text-cyan-200 border-blue-500/30 px-2 sm:px-3 py-1">
              <Zap className="w-3 h-3 mr-1" />
              Real-time Alerts
            </Badge>
            <Badge variant="secondary" className="text-xs cursor-pointer hover:scale-105 transition-transform bg-blue-500/20 text-cyan-200 border-blue-500/30 px-2 sm:px-3 py-1">
              <Lock className="w-3 h-3 mr-1" />
              Compliance Reports
            </Badge>
          </div>
        </div>

        {/* Company Logos */}
        <div className="mt-12 sm:mt-16 lg:mt-20 animate-fade-in-up stagger-5">
          <p className="text-center text-white/60 text-xs mb-6 sm:mb-8 px-4">Trusted by leading Engineers at companies worldwide</p>
          <div className="relative w-full overflow-hidden">
            <style>{`
              @keyframes logo-marquee {
                0% { transform: translate3d(0,0,0); }
                100% { transform: translate3d(-50%,0,0); }
              }
              .logo-marquee {
                display: flex;
                gap: 2rem;
                min-width: 200%;
                animation: logo-marquee 32s linear infinite;
                will-change: transform;
                align-items: center;
              }
              .logo-marquee:hover {
                animation-play-state: paused;
              }
              .logo-item {
                display: flex;
                align-items: center;
                gap: 0.8rem;
                font-size: 1.5rem;
                color: #e5e7eb;
                opacity: 0.7;
                padding: 0.5rem 1rem;
                min-width: 120px;
                max-width: 180px;
                justify-content: flex-start;
              }
              .logo-svg {
                width: 1.6rem;
                height: 1.6rem;
                flex-shrink: 0;
                opacity: 0.8;
                background: transparent;
                border-radius: 0.5rem;
              }
              @media (max-width: 640px) {
                .logo-marquee {
                  gap: 1.5rem;
                }
                .logo-item {
                  font-size: 1.1rem;
                  padding: 0.4rem 0.8rem;
                  min-width: 100px;
                  max-width: 140px;
                  gap: 0.6rem;
                }
                .logo-svg {
                  width: 1.4rem;
                  height: 1.4rem;
                }
              }
              @media (max-width: 480px) {
                .logo-item {
                  font-size: 0.8rem;
                  padding: 0.3rem 0.6rem;
                  min-width: 80px;
                  max-width: 120px;
                }
                .logo-svg {
                  width: 1.2rem;
                  height: 1.2rem;
                }
              }
            `}</style>
            <div className="logo-marquee opacity-80 py-2">
              {Array.from({ length: 5 }).flatMap(() => ([
                { name: "Microsoft", svg: <svg className="logo-svg" viewBox="0 0 32 32"><rect x="4" y="4" width="10" height="10" fill="#e5e7eb" /><rect x="18" y="4" width="10" height="10" fill="#e5e7eb" /><rect x="4" y="18" width="10" height="10" fill="#e5e7eb" /><rect x="18" y="18" width="10" height="10" fill="#e5e7eb" /></svg> },
                { name: "IBM", svg: <svg className="logo-svg" viewBox="0 0 32 32"><rect x="4" y="10" width="24" height="12" rx="2" fill="#e5e7eb" /></svg> },
                { name: "Oracle", svg: <svg className="logo-svg" viewBox="0 0 32 32"><ellipse cx="16" cy="16" rx="12" ry="8" fill="#e5e7eb" /></svg> },
                { name: "Google", svg: <svg className="logo-svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="#e5e7eb" /></svg> },
                { name: "Cisco", svg: <svg className="logo-svg" viewBox="0 0 32 32"><rect x="6" y="8" width="20" height="16" rx="4" fill="#e5e7eb" /></svg> },
                { name: "Amazon", svg: <svg className="logo-svg" viewBox="0 0 32 32"><path d="M4 20 Q16 12 28 20" stroke="#e5e7eb" strokeWidth="2" fill="none"/></svg> },
                { name: "Adobe", svg: <svg className="logo-svg" viewBox="0 0 32 32"><polygon points="16,4 28,28 4,28" fill="#e5e7eb" /></svg> },
                { name: "Intel", svg: <svg className="logo-svg" viewBox="0 0 32 32"><rect x="8" y="8" width="16" height="16" rx="4" fill="#e5e7eb" /></svg> },
                { name: "Salesforce", svg: <svg className="logo-svg" viewBox="0 0 32 32"><circle cx="10" cy="12" r="4" fill="#e5e7eb" /><circle cx="22" cy="12" r="4" fill="#e5e7eb" /><circle cx="16" cy="20" r="4" fill="#e5e7eb" /></svg> },
                { name: "SAP", svg: <svg className="logo-svg" viewBox="0 0 32 32"><rect x="6" y="14" width="20" height="4" fill="#e5e7eb" /></svg> }
              ])).map((item, idx) => (
                <div
                  key={idx}
                  className="logo-item font-semibold whitespace-nowrap transition-transform duration-300 cursor-pointer hover:opacity-100 hover:scale-105"
                  style={{ flex: '0 0 auto' }}
                >
                  {item.svg}
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}