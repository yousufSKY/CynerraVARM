import { Appearance } from '@clerk/types'

// Cynerra Dark Theme Configuration for Clerk
export const cynerraTheme: Appearance = {
  variables: {
    // Color Variables
    colorPrimary: '#00D8FF',
    colorBackground: '#0D1117',
    colorInputBackground: '#1E293B',
    colorInputText: '#F8FAFC',
    colorText: '#F8FAFC',
    colorTextSecondary: '#94A3B8',
    colorTextOnPrimaryBackground: '#0F172A',
    colorDanger: '#EF4444',
    colorSuccess: '#10B981',
    colorWarning: '#F59E0B',
    colorNeutral: '#64748B',
    
    // Border Variables
    borderRadius: '0.75rem',
    
    // Font Variables
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: '14px',
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  elements: {
    // Main Card Container - transparent to work with our custom card
    card: 'bg-transparent shadow-none border-none w-full',
    rootBox: 'w-full flex flex-col items-center',
    
    // Header Elements
    headerTitle: 'text-2xl font-bold text-white text-center mb-2',
    headerSubtitle: 'text-slate-400 text-sm text-center mb-6',
    
    // Form Elements
    formButtonPrimary: {
      background: 'linear-gradient(135deg, #00D8FF, #0EA5E9)',
      color: '#0F172A',
      fontWeight: '600',
      fontSize: '16px', // Accessible font size
      padding: '16px 24px',
      minHeight: '48px', // Touch-friendly height
      borderRadius: '8px',
      border: 'none',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 14px 0 rgba(0, 216, 255, 0.25)',
      cursor: 'pointer',
      touchAction: 'manipulation',
      '&:hover': {
        background: 'linear-gradient(135deg, #22D3EE, #0284C7)',
        transform: 'translateY(-1px)',
        boxShadow: '0 6px 20px 0 rgba(0, 216, 255, 0.35)',
      },
      '&:active': {
        transform: 'translateY(0)',
      },
      // Mobile-specific styles
      '@media (max-width: 640px)': {
        fontSize: '16px',
        padding: '18px 24px',
        minHeight: '52px',
        width: '100%',
      }
    },
    
    // Input Fields
    formFieldInput: {
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid #334155',
      borderRadius: '8px',
      color: '#F8FAFC',
      padding: '14px 16px',
      fontSize: '16px', // Prevents zoom on iOS
      lineHeight: '1.5',
      minHeight: '48px', // Touch-friendly height
      transition: 'all 0.3s ease',
      touchAction: 'manipulation',
      '&:focus': {
        borderColor: '#00D8FF',
        boxShadow: '0 0 0 3px rgba(0, 216, 255, 0.1)',
        outline: 'none',
      },
      '&::placeholder': {
        color: '#64748B',
      },
      // Mobile-specific styles
      '@media (max-width: 640px)': {
        fontSize: '16px', // Prevent zoom on mobile
        padding: '16px',
        minHeight: '52px',
      }
    },
    
    formFieldLabel: 'text-slate-200 text-sm font-medium mb-2',
    
    // Social OAuth Buttons
    socialButtonsBlockButton: {
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid #334155',
      borderRadius: '8px',
      color: '#F8FAFC',
      padding: '14px 16px',
      minHeight: '48px', // Touch-friendly height
      transition: 'all 0.3s ease',
      marginBottom: '12px',
      cursor: 'pointer',
      touchAction: 'manipulation',
      '&:hover': {
        backgroundColor: 'rgba(0, 216, 255, 0.1)',
        borderColor: '#00D8FF',
      },
      // Mobile-specific styles
      '@media (max-width: 640px)': {
        padding: '16px',
        minHeight: '52px',
        fontSize: '16px',
      }
    },
    
    socialButtonsBlockButtonText: 'text-slate-200 font-medium',
    
    // Links and Actions
    footerActionLink: {
      color: '#00D8FF',
      fontSize: '0.875rem',
      textDecoration: 'none',
      fontWeight: '500',
      transition: 'color 0.2s ease',
      display: 'inline',
      verticalAlign: 'baseline',
      lineHeight: '1.2',
      padding: '0.25rem 0.5rem',
      minHeight: 'auto',
      borderRadius: '0.25rem',
      '&:hover': {
        color: '#22D3EE',
        backgroundColor: 'rgba(0, 216, 255, 0.1)',
        textDecoration: 'none',
      },
    },
    formResendCodeLink: 'text-cyan-400 font-medium hover:text-cyan-300 transition-colors duration-300',
    
    // Divider
    dividerLine: 'bg-slate-600',
    dividerText: 'text-slate-500 text-sm',
    
    // Error and Success Messages
    formFieldErrorText: 'text-red-400 text-xs mt-1',
    formFieldSuccessText: 'text-green-400 text-xs mt-1',
    
    // Footer
    footer: {
      borderTop: '1px solid rgba(100, 116, 139, 0.3)',
      paddingTop: '1.5rem',
      marginTop: '1.5rem',
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'center',
      gap: '0.25rem',
      textAlign: 'center',
      lineHeight: '1.2',
    },
    footerText: {
      color: '#94A3B8',
      fontSize: '0.875rem',
      textAlign: 'center',
      margin: '0',
      display: 'inline',
      verticalAlign: 'baseline',
      lineHeight: '1.2',
    },
    
    // Identity Preview
    identityPreviewText: 'text-slate-400',
    
    // UserButton Styling
    userButtonBox: 'border border-slate-600/30 rounded-lg transition-all duration-300 hover:border-cyan-400 hover:shadow-cyan-400/10',
    
    // UserButton Dropdown
    userButtonPopoverCard: 'bg-slate-800/95 backdrop-blur-xl border border-slate-600/30 rounded-xl shadow-2xl',
    userButtonPopoverActionButton: 'text-slate-200 rounded-lg transition-all duration-300 hover:bg-cyan-400/10 hover:text-cyan-400',
    
    // Organization Switcher
    organizationSwitcherTrigger: {
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid #334155',
      borderRadius: '8px',
      color: '#F8FAFC',
      transition: 'all 0.3s ease',
      '&:hover': {
        borderColor: '#00D8FF',
        backgroundColor: 'rgba(0, 216, 255, 0.1)',
      }
    },
    
    // Modal overlay
    modalContent: 'bg-slate-800/95 backdrop-blur-xl border border-slate-600/30 rounded-2xl shadow-2xl',
    modalCloseButton: 'text-slate-400 hover:text-white transition-colors duration-300',
    
    // Loading states
    spinner: 'border-slate-600 border-t-cyan-400',
    
    // Badge elements
    badge: 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 rounded-full',
  },
  layout: {
    logoPlacement: 'inside' as const,
    showOptionalFields: true,
    socialButtonsVariant: 'blockButton' as const,
    socialButtonsPlacement: 'top' as const,
  },
}

// Simplified theme for basic usage
export const cynerraSimpleTheme: Appearance = {
  variables: {
    colorPrimary: '#00D8FF',
    colorBackground: '#0D1117',
    colorInputBackground: '#1E293B',
    colorText: '#F8FAFC',
    borderRadius: '0.75rem',
  },
  elements: {
    card: 'bg-slate-800/80 backdrop-blur-xl border border-slate-600/30 shadow-2xl rounded-2xl',
    headerTitle: 'text-white font-bold',
    headerSubtitle: 'text-slate-400',
    formButtonPrimary: 'bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-900 font-medium shadow-lg shadow-cyan-400/25',
    formFieldInput: 'bg-slate-900/50 border-slate-600 text-white focus:border-cyan-400',
    formFieldLabel: 'text-slate-200',
    footerActionLink: 'text-cyan-400 hover:text-cyan-300',
  },
}