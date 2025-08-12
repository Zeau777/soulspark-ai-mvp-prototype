import Navigation from "@/components/landing/Navigation";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PartnersCTASection from "@/components/landing/PartnersCTASection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";

import Footer from "@/components/landing/Footer";
import PricingSection from "@/components/landing/PricingSection";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      <Navigation />
      <HeroSection />
      <HowItWorksSection />
      <PartnersCTASection />
      <TestimonialsSection />
      <PricingSection id="pricing" />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;