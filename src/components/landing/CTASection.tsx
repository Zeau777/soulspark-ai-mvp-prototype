import { Button } from "@/components/ui/button";
import { GraduationCap, Building2, Trophy, ArrowRight } from "lucide-react";

const CTASection = () => {
  const audiences = [
    {
      icon: GraduationCap,
      title: "Colleges & Universities",
      description: "Support student mental health and spiritual wellbeing across your campus community.",
      cta: "Partner with Us",
      benefits: ["LMS integration", "Student life partnerships", "Chaplaincy team collaboration"]
    },
    {
      icon: Building2,
      title: "Companies & ERGs",
      description: "Strengthen employee wellbeing with faith-centered emotional support and resilience building.",
      cta: "Get Started",
      benefits: ["Slack & Teams integration", "Zoom wellness sessions", "Employee engagement tracking + custom admin dashboard"]
    },
    {
      icon: Trophy,
      title: "Sports Organizations",
      description: "Help athletes maintain mental clarity and spiritual strength alongside physical performance.",
      cta: "Get Started",
      benefits: ["Slack & Teams integration", "Zoom team sessions", "Performance tracking + custom admin dashboard"]
    }
  ];

  return (
    <section id="for-organizations" className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Individual users CTA */}
        <div className="text-center mb-20">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 md:p-12 border border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Transform Your <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Soul-Care Journey?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Join thousands of Gen Z and Millennials who have found peace, purpose, and spiritual growth through AI-powered soul-care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="spiritual" size="lg" className="text-lg px-8 py-4">
                Start Your Journey Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                Join via Invite Code
              </Button>
            </div>
          </div>
        </div>

        {/* Organizations section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Built for <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Your Organization</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Whether you're supporting students, employees, or athletes, SoulSpark AI provides the faith-centered, 
            culturally-aware support your community needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {audiences.map((audience, index) => (
            <div 
              key={index}
              className="bg-card border border-border/40 rounded-xl p-8 hover:shadow-spiritual transition-all duration-300 group"
            >
              {/* Icon */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl w-16 h-16 flex items-center justify-center mb-6 group-hover:from-primary/20 group-hover:to-accent/20 transition-colors">
                <audience.icon className="h-8 w-8 text-primary" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-foreground mb-4">
                {audience.title}
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {audience.description}
              </p>

              {/* Benefits */}
              <ul className="space-y-2 mb-8">
                {audience.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></div>
                    {benefit}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button variant="outline" className="w-full group-hover:bg-primary/5 transition-colors">
                {audience.cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Contact section */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-primary/10">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Ready to Bring SoulSpark AI to Your Organization?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Download our partnership guide to see how our AI-powered soul-care platform can support your community's 
            emotional and spiritual wellbeing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg">
              Download Partnership Guide
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;