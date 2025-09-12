'use client';

import { Header } from '@/components/header';
import { HeroSection } from '@/components/HeroSection';
import { FeaturesSection } from '@/components/features-section';
import { PricingSection } from '@/components/pricing-section';
import { TestimonialsSection } from '@/components/testimonials-section';
import { FaqSection } from '@/components/faq-section';
import { ContactSection } from '@/components/contact-section';
import { Footer } from '@/components/footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#151528] to-[#1a1a2e] flex flex-col">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
        <FaqSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}