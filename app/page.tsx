import { LandingHeader } from '@/components/landing/header';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { FooterSection } from '@/components/landing/footer-section';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-graphite">
      <LandingHeader />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <FooterSection />
    </div>
  );
}
