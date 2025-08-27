import Navigation from "@/components/landing/Navigation";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PartnersCTASection from "@/components/landing/PartnersCTASection";
import GuaranteeSection from "@/components/landing/GuaranteeSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";


import Footer from "@/components/landing/Footer";
import PricingSection from "@/components/landing/PricingSection";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      <Navigation />
      <HeroSection />
      <HowItWorksSection />
      <PartnersCTASection />
      <GuaranteeSection />
      <PricingSection id="pricing" />
      
      <TestimonialsSection />
      
      {/* Trust Badges Section */}
      <section className="py-8 border-t border-border/40 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 text-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">✅ HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">✅ SOC-2 Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">✅ U.S. Data Privacy Aligned</span>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default LandingPage;