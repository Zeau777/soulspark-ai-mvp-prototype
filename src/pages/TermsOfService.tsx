import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const TermsOfService = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Terms of Service | SoulSpark AI";

    // Meta description
    const metaDesc =
      (document.querySelector('meta[name="description"]') as HTMLMetaElement) ||
      document.createElement("meta");
    metaDesc.setAttribute("name", "description");
    metaDesc.setAttribute(
      "content",
      "SoulSpark AI Terms of Service: your rights, responsibilities, and service usage guidelines."
    );
    if (!metaDesc.parentNode) document.head.appendChild(metaDesc);

    // Canonical
    const canonicalUrl = window.location.href;
    const existingCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (existingCanonical) {
      existingCanonical.setAttribute("href", canonicalUrl);
    } else {
      const link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      link.setAttribute("href", canonicalUrl);
      document.head.appendChild(link);
    }

    // JSON-LD
    const ld = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Terms of Service | SoulSpark AI",
      url: canonicalUrl,
    } as const;
    const scriptId = "ld-terms-of-service";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = scriptId;
      document.head.appendChild(script);
    }
    script.text = JSON.stringify(ld);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">SoulSpark AI – Terms of Service</h1>
          <p className="text-muted-foreground mt-2">Effective Date: 8/8/2025</p>
          <p className="text-muted-foreground">Last Updated: 8/8/2025</p>
        </header>

        <main className="prose prose-gray max-w-none">
          <section className="space-y-4">
            <p className="text-foreground leading-relaxed">
              Welcome to SoulSpark AI. These Terms of Service (“Terms”) govern your access to and use of SoulSpark AI’s website, mobile applications, and services (collectively, the “Service”). Please read these Terms carefully before using our Service.
            </p>
            <p className="text-foreground leading-relaxed">
              By accessing or using SoulSpark AI, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, do not use the Service.
            </p>
          </section>

          <section className="space-y-2" aria-labelledby="mission">
            <h2 className="text-2xl font-semibold text-foreground mb-2">1. Our Mission</h2>
            <p className="text-foreground leading-relaxed">
              SoulSpark AI is a faith-centered behavioral AI platform designed to provide personalized spiritual, emotional, and mental wellness support for individuals, organizations, and teams. Our platform is not a substitute for professional medical, psychological, or pastoral counseling.
            </p>
          </section>

          <section className="space-y-2" aria-labelledby="eligibility">
            <h2 className="text-2xl font-semibold text-foreground mb-2">2. Eligibility</h2>
            <p className="text-foreground leading-relaxed">You may use the Service only if you:</p>
            <ul className="list-disc pl-6 text-foreground">
              <li>Are at least 16 years old, or have parental/guardian consent.</li>
              <li>Have the authority to enter into these Terms on behalf of yourself or your organization.</li>
              <li>Comply with all applicable laws and regulations.</li>
            </ul>
          </section>

          <section className="space-y-2" aria-labelledby="account">
            <h2 className="text-2xl font-semibold text-foreground mb-2">3. Your Account</h2>
            <ul className="list-disc pl-6 text-foreground">
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You agree to provide accurate, current, and complete information.</li>
              <li>You are responsible for all activities that occur under your account.</li>
            </ul>
          </section>

          <section className="space-y-2" aria-labelledby="acceptable-use">
            <h2 className="text-2xl font-semibold text-foreground mb-2">4. Acceptable Use</h2>
            <p className="text-foreground leading-relaxed">You agree not to:</p>
            <ul className="list-disc pl-6 text-foreground">
              <li>Use the Service for unlawful purposes or in violation of these Terms.</li>
              <li>Upload harmful, offensive, or discriminatory content.</li>
              <li>Attempt to interfere with or disrupt the Service.</li>
              <li>Reverse-engineer, copy, or resell our platform without written permission.</li>
            </ul>
          </section>

          <section className="space-y-2" aria-labelledby="ai-guidance-disclaimer">
            <h2 className="text-2xl font-semibold text-foreground mb-2">5. AI Guidance Disclaimer</h2>
            <p className="text-foreground leading-relaxed">
              SoulSpark AI provides guidance based on Scripture, timeless wisdom, and psychological frameworks, but it is for informational and inspirational purposes only. It does not constitute medical, mental health, or legal advice.
            </p>
            <p className="text-foreground leading-relaxed">Always seek professional help when needed.</p>
            <p className="text-foreground leading-relaxed">We make no guarantees of specific outcomes.</p>
          </section>

          <section className="space-y-2" aria-labelledby="donations">
            <h2 className="text-2xl font-semibold text-foreground mb-2">6. Donations and Impact</h2>
            <p className="text-foreground leading-relaxed">
              For every qualifying check-in on SoulSpark AI, we commit to donating a meal to a child in need through our partner organizations. While we strive to honor this commitment, donation fulfillment may be affected by factors beyond our control.
            </p>
          </section>

          <section className="space-y-2" aria-labelledby="payments">
            <h2 className="text-2xl font-semibold text-foreground mb-2">7. Payment &amp; Subscriptions</h2>
            <ul className="list-disc pl-6 text-foreground">
              <li>Certain features require payment or a subscription.</li>
              <li>All fees are billed in advance and are non-refundable, unless otherwise required by law.</li>
              <li>We may change pricing with prior notice.</li>
            </ul>
          </section>

          <section className="space-y-2" aria-labelledby="ip">
            <h2 className="text-2xl font-semibold text-foreground mb-2">8. Intellectual Property</h2>
            <ul className="list-disc pl-6 text-foreground">
              <li>All content, trademarks, and technology of SoulSpark AI are owned by SoulSpark AI, Inc.</li>
              <li>You may not copy, modify, or distribute our content without written consent.</li>
            </ul>
          </section>

          <section className="space-y-2" aria-labelledby="third-parties">
            <h2 className="text-2xl font-semibold text-foreground mb-2">9. Third-Party Services</h2>
            <p className="text-foreground leading-relaxed">
              We may link to or integrate with third-party services. We are not responsible for their content, policies, or practices.
            </p>
          </section>

          <section className="space-y-2" aria-labelledby="termination">
            <h2 className="text-2xl font-semibold text-foreground mb-2">10. Termination</h2>
            <p className="text-foreground leading-relaxed">
              We may suspend or terminate your access to the Service if you violate these Terms or engage in harmful conduct. You may cancel your account at any time.
            </p>
          </section>

          <section className="space-y-2" aria-labelledby="liability">
            <h2 className="text-2xl font-semibold text-foreground mb-2">11. Limitation of Liability</h2>
            <p className="text-foreground leading-relaxed">
              To the fullest extent permitted by law, SoulSpark AI is not liable for any indirect, incidental, or consequential damages arising from your use of the Service.
            </p>
          </section>

          <section className="space-y-2" aria-labelledby="law">
            <h2 className="text-2xl font-semibold text-foreground mb-2">12. Governing Law</h2>
            <p className="text-foreground leading-relaxed">
              These Terms are governed by the laws of the State of California, without regard to its conflict of laws provisions.
            </p>
          </section>

          <section className="space-y-2" aria-labelledby="changes">
            <h2 className="text-2xl font-semibold text-foreground mb-2">13. Changes to These Terms</h2>
            <p className="text-foreground leading-relaxed">
              We may update these Terms from time to time. Continued use of the Service after changes means you accept the updated Terms.
            </p>
          </section>

          <section className="space-y-2" aria-labelledby="contact">
            <h2 className="text-2xl font-semibold text-foreground mb-2">14. Contact Us</h2>
            <address className="not-italic text-foreground leading-relaxed">
              If you have questions about these Terms, please contact us at:<br />
              SoulSpark AI, Inc.<br />
              hello@mysoulsparkai.com
            </address>
          </section>
        </main>
      </div>
    </div>
  );
};

export default TermsOfService;
