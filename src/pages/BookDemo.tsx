import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Clock, TrendingUp, Users, CheckCircle, Calendar, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
const BookDemo = () => {
  const {
    toast
  } = useToast();
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
    const {
      name,
      value
    } = e.target;
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
        description: "We'll be in touch within 24 hours to schedule your personalized demo."
      });
    } catch (error) {
      console.error('Failed to submit demo request:', error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly at sales@mysoulsparkai.com",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (isSubmitted) {
    return <div className="min-h-screen bg-background">
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
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Form */}
          <div>
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Book a <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Demo</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Provide your details below and equip your people to thrive. SoulSpark AI helps employees, students, and athletes build resilience, connection, and well-being—while driving engagement, retention, and measurable organizational impact.
              </p>
            </div>

            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Your full name" />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" name="role" value={formData.role} onChange={handleInputChange} required placeholder="e.g., HR Director, Dean of Students" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="workEmail">Work Email</Label>
                  <Input id="workEmail" name="workEmail" type="email" value={formData.workEmail} onChange={handleInputChange} required placeholder="your.email@company.com" />
                </div>

                <div>
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input id="organizationName" name="organizationName" value={formData.organizationName} onChange={handleInputChange} required placeholder="Your organization or company name" />
                </div>

                <div>
                  <Label htmlFor="painPoints">Describe your current pain points (e.g. high burnout)</Label>
                  <Textarea id="painPoints" name="painPoints" value={formData.painPoints} onChange={handleInputChange} required placeholder="Tell us about the challenges your organization is facing..." rows={4} />
                </div>

                {/* Call-to-Action Banner */}
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20">
                  <p className="text-lg font-medium text-foreground mb-0">
                    See how SoulSpark AI improves resilience, culture, and retention in just 90 days.
                  </p>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-glow transition-all duration-300" size="lg">
                  <Calendar className="h-5 w-5 mr-2" />
                  {isSubmitting ? "Submitting..." : "📅 Book a 30-Minute Discovery Demo"}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  SoulSpark AI is HIPAA compliant and built with enterprise-grade data security.
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
              <img src="/lovable-uploads/f071bb3c-ad6b-4d6f-8760-6892fc0be615.png" alt="SoulSpark AI mobile app demo showing partner and user interfaces" className="max-w-full h-auto mx-auto rounded-lg shadow-lg" />
            </div>

            {/* FAQs */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">FAQs for Partner Organizations</h2>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">
                    <span className="font-semibold text-foreground">Differentiation - What makes SoulSpark AI different?</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">Unlike traditional wellness programs that people rarely use, SoulSpark AI is designed for the way Gen Z and Millennials live today. Our human-centered AI delivers bite-sized well-being practices and 24/7 personalized support that drive real engagement, resilience, and belonging—while giving leaders the data they need to measure cultural and performance impact.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left">
                    <span className="font-semibold text-foreground">Time Commitment - How much time does it take?</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">Just 60 seconds a day plus 24/7 AI support.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left">
                    <span className="font-semibold text-foreground">Organizational Benefits - How does it help us?</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">Boosts engagement, retention, and productivity while reducing burnout.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left">
                    <span className="font-semibold text-foreground">Compliance & Privacy ✅ - Is SoulSpark AI secure and compliant?</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">Yes. SoulSpark is built with enterprise-grade security, HIPAA compliance, and strict adherence to U.S. data privacy regulations. Your people's data is safe, encrypted, and never shared without consent.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-left">
                    <span className="font-semibold text-foreground">Customization - Is it customizable?</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">Yes—tailored to your organization's values, culture, and goals.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger className="text-left">
                    <span className="font-semibold text-foreground">Implementation - What does implementation look like?</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">Fast, seamless, and plug-and-play. </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Five Questions Leaders Are Already Asking */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-foreground mb-4">Five questions leaders are asking.</h3>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="question-1">
                    <AccordionTrigger className="text-left">
                      <span className="font-medium text-foreground">Will my people actually use it?</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">Yes. SoulSpark is designed to be sticky, with quick and relatable interactions.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="question-2">
                    <AccordionTrigger className="text-left">
                      <span className="font-medium text-foreground">How is this different from our EAP or mental health benefits?</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">We're proactive, personalized, and daily—not just reactive.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="question-3">
                    <AccordionTrigger className="text-left">
                      <span className="font-medium text-foreground">Does this work for diverse groups?</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">Absolutely. SoulSpark adapts across workplaces, campuses, and athletic programs.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="question-4">
                    <AccordionTrigger className="text-left">
                      <span className="font-medium text-foreground">Is it secure and compliant?</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">100%. HIPAA compliant, data encrypted, and aligned with U.S. privacy regulations.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="question-5">
                    <AccordionTrigger className="text-left">
                      <span className="font-medium text-foreground">How do I know ROI is real?</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">Clear dashboards track engagement, retention, and cultural impact.</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section with Organization Info and Trust Badges */}
        <div className="mt-16 py-8 border-t border-border/40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Side - Why Organizations Choose SoulSpark AI */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-lg">Why Organizations Choose SoulSpark AI</h4>
              <p className="text-muted-foreground leading-relaxed mb-6">Gen Z and Millennials are experiencing unprecedented levels of stress, burnout, and disconnection—costing organizations billions in lost productivity and engagement. SoulSpark AI provides personalized, 24/7 well-being support that strengthens mental, emotional, and inner resilience. The result: healthier cultures, higher performance, and greater retention. Plus, every check-in creates real-world impact by funding meals for children in need. It's more than a wellness perk—it's a culture shift.</p>
              <div className="flex items-center text-muted-foreground">
                <Heart className="h-4 w-4 text-primary mr-2" />
                <span>Purpose-built for holistic wellbeing at work, school, and beyond.</span>
              </div>
            </div>

            {/* Right Side - Trust Badges */}
            <div className="flex flex-wrap justify-center lg:justify-end items-center gap-6">
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
    </div>;
};
export default BookDemo;