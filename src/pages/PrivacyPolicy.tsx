import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2">Last updated: January 2025</p>
        </div>

        <div className="prose prose-gray max-w-none">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Introduction</h2>
              <p className="text-foreground leading-relaxed">
                At SoulSpark AI, we prioritize your privacy. This Privacy Policy explains how we collect, use, share, and protect your data during our beta phase. By using our platform, you agree to this policy, which complies with GDPR and CCPA.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Data We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Personal Data:</h3>
                  <p className="text-foreground leading-relaxed">
                    Information you provide, such as email, SoulScan quiz responses (e.g., faith background, goals), and profile details.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Usage Data:</h3>
                  <p className="text-foreground leading-relaxed">
                    Metrics on how you interact with SoulDrops, check-ins, and platform features.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Device Data:</h3>
                  <p className="text-foreground leading-relaxed">
                    Basic information like device type and browser to ensure mobile-first compatibility.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Data</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Personalization:</h3>
                  <p className="text-foreground leading-relaxed">
                    SoulScan and usage data tailor SoulDrops to your spiritual and emotional needs.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Impact Tracking:</h3>
                  <p className="text-foreground leading-relaxed">
                    Check-in data tracks meal donations for our "1 SoulDrop = 1 Meal" program.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Improvements:</h3>
                  <p className="text-foreground leading-relaxed">
                    Anonymized data helps us enhance the platform during beta testing.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Communication:</h3>
                  <p className="text-foreground leading-relaxed">
                    We use your email to send beta updates, SoulDrops, and responses to inquiries.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Data Sharing</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Charity Partners:</h3>
                  <p className="text-foreground leading-relaxed">
                    Anonymized check-in data is shared with partners to facilitate meal donations.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Organizational Integrations:</h3>
                  <p className="text-foreground leading-relaxed">
                    With your consent, we share limited data with organizations (e.g., colleges, corporations) for Slack, Teams, or LMS integrations.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Third Parties:</h3>
                  <p className="text-foreground leading-relaxed">
                    We use trusted providers (e.g., Mailchimp for email capture) who comply with privacy laws.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Data Security</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Protection:</h3>
                  <p className="text-foreground leading-relaxed">
                    Your data is encrypted and stored securely to prevent unauthorized access.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Beta Limitations:</h3>
                  <p className="text-foreground leading-relaxed">
                    As a beta platform, we continuously improve security but cannot guarantee absolute protection.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Your Rights</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Access:</h3>
                  <p className="text-foreground leading-relaxed">
                    Request a copy of your data by emailing hello@soulspark.ai.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Update:</h3>
                  <p className="text-foreground leading-relaxed">
                    Modify your data via your account or by contacting us.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Delete:</h3>
                  <p className="text-foreground leading-relaxed">
                    Request data deletion, subject to legal obligations.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Opt-Out:</h3>
                  <p className="text-foreground leading-relaxed">
                    Unsubscribe from communications or withdraw consent for data sharing.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Cookies</h2>
              <p className="text-foreground leading-relaxed">
                We use cookies to enhance your experience (e.g., remembering preferences). You can manage cookie settings in your browser.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;