import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
const PrivacyPolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Privacy Policy | SoulSpark AI";
    // Meta description
    const metaDesc =
      (document.querySelector('meta[name="description"]') as HTMLMetaElement) ||
      document.createElement("meta");
    metaDesc.setAttribute("name", "description");
    metaDesc.setAttribute(
      "content",
      "SoulSpark AI Privacy Policy: how we collect, use, store, and protect your data."
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
      name: "Privacy Policy | SoulSpark AI",
      url: canonicalUrl,
    } as const;
    const scriptId = "ld-privacy-policy";
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
          <h1 className="text-3xl font-bold text-foreground">SoulSpark AI – Privacy Policy</h1>
          <p className="text-muted-foreground mt-2">Effective Date: 8/8/2025</p>
          <p className="text-muted-foreground">Last Updated: 8/8/2025</p>
        </header>

        <main className="prose prose-gray max-w-none">
          <section className="space-y-4" aria-labelledby="intro">
            <p className="text-foreground leading-relaxed">
              SoulSpark AI (“we,” “our,” or “us”) is committed to protecting your privacy and safeguarding your personal information.
              This Privacy Policy explains how we collect, use, store, and share information when you use our website, mobile applications,
              and related services (collectively, the “Service”). By using SoulSpark AI, you agree to the practices described in this Privacy Policy.
            </p>
          </section>

          <section className="space-y-4" aria-labelledby="information-we-collect">
            <h2 className="text-2xl font-semibold text-foreground mb-2">1. Information We Collect</h2>
            <p className="text-foreground leading-relaxed">We collect information in the following ways:</p>

            <h3 className="text-lg font-medium text-foreground">a. Information You Provide Directly</h3>
            <ul className="list-disc pl-6 text-foreground">
              <li>Account details (name, email address, password, profile photo)</li>
              <li>Faith and wellness preferences for personalized guidance</li>
              <li>Messages, journal entries, and interactions within the platform</li>
              <li>Payment details when you subscribe or make purchases</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground">b. Information We Collect Automatically</h3>
            <ul className="list-disc pl-6 text-foreground">
              <li>Device type, operating system, and browser type</li>
              <li>IP address and general location (city, state, country)</li>
              <li>Usage data, such as pages visited, time spent, and features used</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground">c. Information from Third Parties</h3>
            <ul className="list-disc pl-6 text-foreground">
              <li>If you log in using social media or organizational accounts, we may receive profile and verification information</li>
              <li>Partner organizations (such as donation partners) may share limited data to confirm impact metrics</li>
            </ul>
          </section>

          <section className="space-y-2" aria-labelledby="how-we-use">
            <h2 className="text-2xl font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
            <p className="text-foreground leading-relaxed">We use your information to:</p>
            <ul className="list-disc pl-6 text-foreground">
              <li>Provide, personalize, and improve the SoulSpark AI experience</li>
              <li>Deliver faith-centered, emotional, and spiritual guidance</li>
              <li>Process payments and subscriptions</li>
              <li>Communicate with you about updates, promotions, and impact reports</li>
              <li>Monitor usage and detect fraud or security issues</li>
              <li>Fulfill our “meal for every check-in” donation commitment</li>
            </ul>
          </section>

          <section className="space-y-2" aria-labelledby="ai-guidance">
            <h2 className="text-2xl font-semibold text-foreground mb-2">3. AI Guidance &amp; Privacy of Your Content</h2>
            <p className="text-foreground leading-relaxed">
              Your journal entries, chats, and personal reflections are private to you unless you choose to share them.
            </p>
            <p className="text-foreground leading-relaxed">
              We may use anonymized, aggregated data to train and improve our AI systems — never in a way that identifies you personally.
            </p>
          </section>

          <section className="space-y-2" aria-labelledby="how-we-share">
            <h2 className="text-2xl font-semibold text-foreground mb-2">4. How We Share Your Information</h2>
            <p className="text-foreground leading-relaxed">We do not sell your personal information. We may share your data only with:</p>
            <ul className="list-disc pl-6 text-foreground">
              <li>Service providers (e.g., payment processors, cloud hosting, analytics) under strict confidentiality agreements</li>
              <li>Donation partners (aggregated, non-personal check-in counts to track meals donated)</li>
              <li>Law enforcement if required by law or in cases of safety concerns</li>
            </ul>
          </section>

          <section className="space-y-2" aria-labelledby="retention">
            <h2 className="text-2xl font-semibold text-foreground mb-2">5. Data Retention</h2>
            <p className="text-foreground leading-relaxed">
              We keep your data for as long as you have an active account or as needed to provide the Service.
              You can request deletion of your account and personal data at any time.
            </p>
          </section>

          <section className="space-y-2" aria-labelledby="your-rights">
            <h2 className="text-2xl font-semibold text-foreground mb-2">6. Your Rights</h2>
            <p className="text-foreground leading-relaxed">Depending on your location, you may have rights to:</p>
            <ul className="list-disc pl-6 text-foreground">
              <li>Access and receive a copy of your personal data</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your data</li>
              <li>Limit certain types of processing</li>
            </ul>
            <p className="text-foreground leading-relaxed">
              To exercise these rights, contact us at hello@mysoulsparkai.com.
            </p>
          </section>

          <section className="space-y-2" aria-labelledby="security">
            <h2 className="text-2xl font-semibold text-foreground mb-2">7. Security</h2>
            <p className="text-foreground leading-relaxed">
              We use encryption, secure servers, and other technical safeguards to protect your information. However, no system is 100% secure, and you use the Service at your own risk.
            </p>
          </section>

          <section className="space-y-2" aria-labelledby="children">
            <h2 className="text-2xl font-semibold text-foreground mb-2">8. Children’s Privacy</h2>
            <p className="text-foreground leading-relaxed">
              Our Service is not directed to children under 16 without parental or guardian consent. If we discover we have collected personal information from a child without proper consent, we will delete it.
            </p>
          </section>

          <section className="space-y-2" aria-labelledby="changes">
            <h2 className="text-2xl font-semibold text-foreground mb-2">9. Changes to This Policy</h2>
            <p className="text-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any significant changes and update the “Last Updated” date.
            </p>
          </section>

          <section className="space-y-2" aria-labelledby="contact">
            <h2 className="text-2xl font-semibold text-foreground mb-2">10. Contact Us</h2>
            <address className="not-italic text-foreground leading-relaxed">
              SoulSpark AI, Inc.<br />
              hello@mysoulsparkai.com
            </address>
          </section>
        </main>
      </div>
    </div>
  );
};

export default PrivacyPolicy;