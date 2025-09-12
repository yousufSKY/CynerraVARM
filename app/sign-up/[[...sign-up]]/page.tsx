import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#151528] to-[#1a1a2e] flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10">
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-gradient-to-r from-cyan-400 to-blue-700 hover:from-cyan-300 hover:to-blue-600 text-sm',
              card: 'bg-[#1a1a2e]/80 border-blue-900/30 backdrop-blur-xl shadow-2xl',
              headerTitle: 'text-white',
              headerSubtitle: 'text-gray-400',
              socialButtonsBlockButton: 'bg-[#0a0a0f]/50 border-blue-900/30 text-white hover:bg-blue-500/10',
              formFieldInput: 'bg-[#0a0a0f]/50 border-blue-900/30 text-white',
              formFieldLabel: 'text-gray-300',
              identityPreviewText: 'text-gray-400',
              formResendCodeLink: 'text-cyan-400 hover:text-cyan-300',
              footerActionLink: 'text-cyan-400 hover:text-cyan-300',
            },
          }}
        />
      </div>
    </div>
  )
}