import { UserPlus, Brain, Heart, Activity, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HowItWorksSection = () => {
  const navigate = useNavigate();
  const steps = [
    {
      icon: UserPlus,
      title: "Join Your Community",
      description: "Enter via organization invite or public link. Choose your path: Student, Employee, or Athlete.",
      step: "01"
    },
    {
      icon: Brain,
      title: "Take the SoulScan",
      description: "A 1-minute personalized check-in to understand your mindset, emotional state, and personal goals.",
      step: "02"
    },
    {
      icon: Activity,
      title: "Pulse Check",
      description: "Log how you're feeling, and SoulSpark AI responds instantly with personalized support when you need it most.",
      step: "03"
    },
    {
      icon: Heart,
      title: "Receive Daily SoulDrops",
      description: "Get tailored 60-second well-being boosts—like guided reflection, micro-journaling, breathwork, or motivational insights—powered by your context.",
      step: "04"
    },
    {
      icon: TrendingUp,
      title: "Grow & Create Impact",
      description: "Track your progress, build positive habits, and contribute to real-world impact through our social good initiatives.",
      step: "05"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            How <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">SoulSpark AI</span> Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Five simple steps to transform well-being and create meaningful impact
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="relative bg-card border border-border/40 rounded-xl p-6 hover:shadow-spiritual transition-all duration-300 group"
            >
              {/* Step number */}
              <div className="absolute -top-4 -left-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
                {step.step}
              </div>

              {/* Icon */}
              <div className="bg-primary/10 rounded-xl w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <step.icon className="h-8 w-8 text-primary" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>

              {/* Connecting line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary/40 to-accent/40"></div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mt-16">
          <Button variant="spiritual" size="lg" className="text-lg px-8 py-4 min-w-[200px]" onClick={() => navigate('/auth')}>
            Join SoulSpark AI
          </Button>
        </div>

      </div>
    </section>
  );
};

export default HowItWorksSection;