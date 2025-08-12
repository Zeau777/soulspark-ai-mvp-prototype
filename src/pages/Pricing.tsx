import React, { useMemo } from "react";
import Navigation from "@/components/landing/Navigation";
import Footer from "@/components/landing/Footer";
import PricingSection from "@/components/landing/PricingSection";
import { useSEO } from "@/hooks/useSEO";

const Pricing: React.FC = () => {
  useSEO({
    title: "Pricing Plans | SoulSpark AI",
    description: "Flexible pricing for Starter, Growth, Enterprise, plus Colleges and Sports Teams. Unlock 60-second-a-day well-being.",
    canonical: typeof window !== 'undefined' ? `${window.location.origin}/pricing` : undefined,
  });

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: "SoulSpark AI",
    description: "Purpose-driven well-being platform for organizations.",
    offers: [
      { "@type": "Offer", name: "Starter", price: "6", priceCurrency: "USD", category: "seat/month" },
      { "@type": "Offer", name: "Growth", price: "8", priceCurrency: "USD", category: "seat/month" },
      { "@type": "Offer", name: "Enterprise", price: "12", priceCurrency: "USD", category: "seat/month" }
    ]
  }), []);

  return (
    <div className="min-h-screen bg-background font-inter">
      <Navigation />
      <main>
        <section className="bg-gradient-to-b from-background to-muted/20 border-b">
          <div className="container py-12 md:py-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Pricing Plans</h1>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              Multiple revenue streams with scalable impact. Choose the plan that fits your organization and unlock
              60-second-a-day purpose-driven well-being for your people.
            </p>
          </div>
        </section>
        <PricingSection showHeader={false} />
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
};

export default Pricing;
