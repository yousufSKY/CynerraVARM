import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { ArrowLeft, Shield, Lock, Eye, Users, Globe } from 'lucide-react'
import { cyberGuardTheme } from '@/lib/clerk-theme'

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#151528] to-[#1a1a2e] relative overflow-hidden">
      {/* Enhanced Background Effects - Responsive */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs - Responsive sizes */}
        <div className="absolute top-16 sm:top-20 left-4 sm:left-10 w-48 sm:w-64 md:w-72 h-48 sm:h-64 md:h-72 bg-blue-500/10 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
        <div className="absolute top-32 sm:top-40 right-4 sm:right-10 w-56 sm:w-80 md:w-96 h-56 sm:h-80 md:h-96 bg-teal-500/10 rounded-full blur-2xl sm:blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-16 sm:bottom-20 left-1/4 sm:left-1/3 w-48 sm:w-64 md:w-80 h-48 sm:h-64 md:h-80 bg-cyan-500/10 rounded-full blur-2xl sm:blur-3xl animate-pulse delay-2000"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDU5LCAxMzAsIDI0NiwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-10 sm:opacity-20"></div>
        
        {/* Floating security icons - Hidden on small screens for cleaner look */}
        <div className="hidden md:block absolute top-1/4 left-1/4 text-cyan-400/20 animate-bounce">
          <Shield className="h-6 w-6 lg:h-8 lg:w-8" />
        </div>
        <div className="hidden md:block absolute top-1/3 right-1/4 text-blue-400/20 animate-bounce delay-700">
          <Lock className="h-5 w-5 lg:h-6 lg:w-6" />
        </div>
        <div className="hidden md:block absolute bottom-1/3 left-1/6 text-teal-400/20 animate-bounce delay-1000">
          <Eye className="h-6 w-6 lg:h-7 lg:w-7" />
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Branding - Hidden on mobile, visible on tablet+ */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-6 sm:px-8 md:px-12 xl:px-20 py-8">
          <div className="max-w-md xl:max-w-lg">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center space-x-3 mb-6 lg:mb-8 group">
              <div className="relative">
                <Shield className="h-10 w-10 lg:h-12 lg:w-12 text-cyan-400 drop-shadow-glow group-hover:text-cyan-300 transition-colors" />
                <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg group-hover:bg-cyan-300/30 transition-all" />
              </div>
              <span className="text-3xl lg:text-4xl font-bold text-cyan-100 tracking-wide group-hover:text-white transition-colors">
                CyberGuard
              </span>
            </Link>

            {/* Tagline */}
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 lg:mb-6 leading-tight">
              Secure Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600"> Digital Assets</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-300 mb-6 lg:mb-8 leading-relaxed">
              Advanced vulnerability assessment and risk management platform trusted by security professionals worldwide.
            </p>

            {/* Features */}
            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-cyan-400" />
                </div>
                <span className="text-sm lg:text-base text-gray-300">Enterprise-grade security scanning</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Lock className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-sm lg:text-base text-gray-300">Real-time threat monitoring</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-teal-400" />
                </div>
                <span className="text-sm lg:text-base text-gray-300">Compliance management</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Globe className="h-4 w-4 text-green-400" />
                </div>
                <span className="text-sm lg:text-base text-gray-300">Global threat intelligence</span>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-blue-900/30">
              <p className="text-sm text-gray-400 mb-3 lg:mb-4">Trusted by 500+ organizations</p>
              <div className="flex flex-wrap items-center gap-2 lg:gap-4">
                <div className="bg-blue-500/10 px-2 lg:px-3 py-1 rounded-full border border-blue-500/20">
                  <span className="text-xs text-blue-400 font-medium">SOC 2 Compliant</span>
                </div>
                <div className="bg-green-500/10 px-2 lg:px-3 py-1 rounded-full border border-green-500/20">
                  <span className="text-xs text-green-400 font-medium">ISO 27001</span>
                </div>
                <div className="bg-purple-500/10 px-2 lg:px-3 py-1 rounded-full border border-purple-500/20">
                  <span className="text-xs text-purple-400 font-medium">GDPR Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Authentication */}
        <div className="w-full lg:w-1/2 relative">
          {/* Back to Home Link - Enhanced for mobile touch */}
          <div className="absolute top-4 left-4 lg:hidden z-10">
            <Link 
              href="/" 
              className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors text-sm py-2 px-3 rounded-lg bg-black/20 backdrop-blur-sm border border-cyan-400/20 touch-manipulation"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>

          {/* Main content container - Enhanced responsive padding */}
          <div className="min-h-screen flex items-center justify-center px-4 py-16 sm:px-6 md:px-8 lg:p-8">
            <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
              {/* Mobile Logo - Enhanced spacing */}
              <div className="lg:hidden text-center pt-8 sm:pt-4">
                <Link href="/" className="inline-flex items-center space-x-3 group touch-manipulation">
                  <div className="relative">
                    <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-cyan-400 drop-shadow-glow group-hover:text-cyan-300 transition-colors" />
                    <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg group-hover:bg-cyan-300/30 transition-all" />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-cyan-100 tracking-wide group-hover:text-white transition-colors">
                    CyberGuard
                  </span>
                </Link>
              </div>

              {/* Welcome Message - Enhanced mobile typography */}
              <div className="text-center px-4">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
                  Welcome Back
                </h2>
                <p className="text-sm sm:text-base text-gray-400">
                  Sign in to access your security dashboard
                </p>
              </div>

              {/* Authentication Card - Enhanced mobile responsive design */}
              <div className="relative">
                {/* Card glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 to-blue-600/20 rounded-2xl blur opacity-75"></div>
                
                <div className="relative bg-[#1a1a2e]/90 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-blue-900/30 shadow-2xl p-4 sm:p-6 md:p-8">
                  <SignIn 
                    appearance={cyberGuardTheme}
                  />
                </div>
              </div>

              {/* Desktop Back Link */}
              <div className="hidden lg:block text-center">
                <Link 
                  href="/" 
                  className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors text-sm py-2 px-3 rounded-lg hover:bg-cyan-400/10 touch-manipulation"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}