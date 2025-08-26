import { useSEO } from "@/hooks/useSEO";

const CookiePolicy = () => {
  useSEO({
    title: "Cookie Policy - SoulSpark AI",
    description: "Learn about how SoulSpark AI uses cookies to provide you with the best experience on our platform.",
    canonical: "/cookies"
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-8">SoulSpark AI Cookie Policy</h1>
          
          <p className="text-muted-foreground mb-8">
            <strong>Effective Date:</strong> 8/8/2025
          </p>

          <p className="text-foreground mb-8">
            At SoulSpark AI, we use cookies and similar technologies to provide you with the best experience on our platform. This Cookie Policy explains what cookies are, how we use them, and your choices.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. What Are Cookies?</h2>
            <p className="text-foreground">
              Cookies are small text files placed on your device when you visit a website or use an app. They help us remember your preferences, improve performance, and personalize your experience.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Types of Cookies We Use</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Essential Cookies:</h3>
                <p className="text-foreground">Necessary for the platform to function (e.g., secure login, session management).</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Performance Cookies:</h3>
                <p className="text-foreground">Help us understand how users interact with our platform so we can improve.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Functional Cookies:</h3>
                <p className="text-foreground">Remember your settings and preferences to personalize your experience.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Analytics & Marketing Cookies:</h3>
                <p className="text-foreground">Provide insights into usage and may deliver relevant content or ads.</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Why We Use Cookies</h2>
            <ul className="list-disc pl-6 space-y-2 text-foreground">
              <li>To keep the platform secure and reliable.</li>
              <li>To remember your preferences and settings.</li>
              <li>To analyze platform performance and user behavior.</li>
              <li>To improve features and content for your well-being journey.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Your Choices</h2>
            <p className="text-foreground">
              You can manage or disable cookies through your browser settings. Please note that disabling essential cookies may affect your ability to use certain features of SoulSpark AI.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Updates to This Policy</h2>
            <p className="text-foreground">
              We may update this Cookie Policy from time to time to reflect changes in technology, law, or our practices. Updates will be posted on this page with a new effective date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Contact Us</h2>
            <p className="text-foreground">
              If you have questions about our Cookie Policy, please contact us at:{" "}
              <a href="mailto:hello@mysoulsparkai.com" className="text-primary hover:underline">
                hello@mysoulsparkai.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;