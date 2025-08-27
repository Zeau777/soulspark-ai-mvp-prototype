import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Shield, Clock, TrendingUp, Users, CheckCircle, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";

const BookDemo = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    workEmail: "",
    organizationName: "",
    painPoints: ""
  });

  useSEO({
    title: "Book a Demo - SoulSpark AI | Transform Your Organization's Wellbeing",
    description: "Schedule a personalized demo to see how SoulSpark AI drives engagement, retention, and measurable impact for employees, students, and athletes.",
    canonical: "https://mysoulsparkai.com/book-demo"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send to MailChimp via edge function
      const mailchimpPayload = {
        email: formData.workEmail,
        firstName: formData.name.split(' ')[0] || formData.name,
        lastName: formData.name.split(' ').slice(1).join(' ') || '',
        company: formData.organizationName,
        phone: '',
        interest: 'Demo Request',
        demo: 'true',
        role: formData.role,
        painPoints: formData.painPoints
      };

      const response = await supabase.functions.invoke('submit-mailchimp-lead', {
        body: mailchimpPayload
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      console.log('Demo request submitted successfully:', response.data);
      setIsSubmitted(true);
      toast({
        title: "Demo Request Submitted!",
        description: "We'll be in touch within 24 hours to schedule your personalized demo.",
      });
    } catch (error) {
      console.error('Failed to submit demo request:', error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly at partners@mysoulsparkai.com",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-foreground mb-4">Thank You!</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your demo request has been submitted. We'll contact you within 24 hours to schedule your personalized demo.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Form */}
          <div>
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Book a <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Demo</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Provide your details below and equip your people with resilience and belonging. SoulSpark AI helps employees, students, and athletes thrive emotionally and mentally—while driving engagement, retention, and measurable impact.
              </p>
            </div>

            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., HR Director, Dean of Students"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="workEmail">Work Email</Label>
                  <Input
                    id="workEmail"
                    name="workEmail"
                    type="email"
                    value={formData.workEmail}
                    onChange={handleInputChange}
                    required
                    placeholder="your.email@company.com"
                  />
                </div>

                <div>
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input
                    id="organizationName"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    required
                    placeholder="Your organization or company name"
                  />
                </div>

                <div>
                  <Label htmlFor="painPoints">Describe your current pain points (e.g. high burnout)</Label>
                  <Textarea
                    id="painPoints"
                    name="painPoints"
                    value={formData.painPoints}
                    onChange={handleInputChange}
                    required
                    placeholder="Tell us about the challenges your organization is facing..."
                    rows={4}
                  />
                </div>

                {/* Call-to-Action Banner */}
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 border border-primary/20">
                  <p className="text-lg font-medium text-foreground mb-4">
                    ✨ "If you've ever wondered how to truly engage the next generation, SoulSpark AI was built for you."
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-glow transition-all duration-300"
                  size="lg"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  {isSubmitting ? "Submitting..." : "📅 Book a 30-Minute Discovery Demo"}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  SoulSpark is HIPAA compliant and built with enterprise-grade data security.
                  <br />
                  Your people's well-being data is safe, private, and never shared.
                </p>
              </form>
            </Card>
          </div>

          {/* Right Side - Image and FAQs */}
          <div className="space-y-8">
            {/* Mobile Image */}
            <div className="text-center">
              <img 
                src="/lovable-uploads/f071bb3c-ad6b-4d6f-8760-6892fc0be615.png" 
                alt="SoulSpark AI mobile app demo showing partner and user interfaces"
                className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
              />
            </div>

            {/* FAQs */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">FAQs for Partner Organizations</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">1️⃣ Differentiation</h3>
                  <p className="text-sm font-medium text-primary mb-1">What makes SoulSpark different?</p>
                  <p className="text-sm text-muted-foreground">Unlike generic wellness apps, SoulSpark AI is emotionally intelligent, values-aligned, and built for the way Gen Z & Millennials live and work.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">2️⃣ Time Commitment</h3>
                  <p className="text-sm font-medium text-primary mb-1">How much time does it take?</p>
                  <p className="text-sm text-muted-foreground">Just 60 seconds a day plus 24/7 AI support.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">3️⃣ Organizational Benefits</h3>
                  <p className="text-sm font-medium text-primary mb-1">How does it help us?</p>
                  <p className="text-sm text-muted-foreground">Boosts engagement, retention, and productivity while reducing burnout.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">4️⃣ Compliance & Privacy ✅</h3>
                  <p className="text-sm font-medium text-primary mb-1">Is SoulSpark AI secure and compliant?</p>
                  <p className="text-sm text-muted-foreground">Yes. SoulSpark is built with enterprise-grade security, HIPAA compliance, and strict adherence to U.S. data privacy regulations. Your people's data is safe, encrypted, and never shared without consent.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">5️⃣ Customization</h3>
                  <p className="text-sm font-medium text-primary mb-1">Is it customizable?</p>
                  <p className="text-sm text-muted-foreground">Yes—tailored to your organization's values, culture, and goals.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">6️⃣ Implementation</h3>
                  <p className="text-sm font-medium text-primary mb-1">What does implementation look like?</p>
                  <p className="text-sm text-muted-foreground">Fast, seamless, and plug-and-play. Launch in days, not months.</p>
                </div>
              </div>

              {/* Five Questions Leaders Are Already Asking */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-foreground mb-4">🤔 Five Questions Leaders Are Already Asking</h3>
                <div className="space-y-3 text-sm">
                  <p><strong>Will my people actually use it?</strong> → Yes. SoulSpark is designed to be sticky, with quick and relatable interactions.</p>
                  <p><strong>How is this different from our EAP or mental health benefits?</strong> → We're proactive, personalized, and daily—not just reactive.</p>
                  <p><strong>Does this work for diverse groups?</strong> → Absolutely. SoulSpark adapts across workplaces, campuses, and athletic programs.</p>
                  <p><strong>Is it secure and compliant?</strong> → 100%. HIPAA compliant, data encrypted, and aligned with U.S. privacy regulations.</p>
                  <p><strong>How do I know ROI is real?</strong> → Clear dashboards track engagement, retention, and cultural impact.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges Row */}
        <div className="mt-16 py-8 border-t border-border/40">
          <div className="flex flex-wrap justify-center items-center gap-8 text-center">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">✅ HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">✅ SOC-2 Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">✅ U.S. Data Privacy Aligned</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDemo;