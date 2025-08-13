import { Check, TrendingUp, Users, Leaf, MessageCircle, TrendingDown, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import sarahPhoto from "@/assets/sarah-hr-director.jpg";

const GuaranteeSection = () => {
  const benefits = [
    {
      icon: TrendingUp,
      text: "Higher Engagement: More participation in well-being programs"
    },
    {
      icon: Users,
      text: "Stronger Connection: Increased sense of belonging and team cohesion"
    },
    {
      icon: Leaf,
      text: "Lower Burnout: Daily micro-interventions that reduce stress levels"
    },
    {
      icon: MessageCircle,
      text: "Positive Feedback: Employees report improved emotional and purpose-driven well-being"
    },
    {
      icon: TrendingDown,
      text: "Better Retention: Early signs of reduced turnover and higher satisfaction"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto p-8 lg:p-12 shadow-lg border-primary/20">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">💡</div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Our 90-Day Impact Guarantee
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We believe your people are your greatest asset—and that SoulSpark AI will unlock their best selves. 
              That's why we back every partnership with a simple promise: <strong>measurable improvements in 90 days or your money back.</strong>
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <Check className="w-6 h-6 text-primary mr-2" />
              <h3 className="text-xl font-semibold text-foreground">In your first 90 days, you can expect:</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div key={index} className="flex items-start space-x-3 p-4 rounded-lg bg-background/50">
                    <IconComponent className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="text-center lg:text-left bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
              <p className="text-foreground font-medium mb-2">
                If you don't see these results, we'll work with you until you do—or give you a full refund.
              </p>
              <p className="text-primary font-semibold">
                Because your people matter, and so do results.
              </p>
            </div>

            <Card className="p-6 bg-gradient-to-br from-background to-primary/5 border-primary/20">
              <div className="flex items-start space-x-4">
                <Quote className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="text-foreground mb-4 italic leading-relaxed">
                    "Within 60 days of rolling out SoulSpark AI, our engagement scores jumped by 28%, and employees were actually excited to check in daily. The 90-Day Guarantee gave us confidence, but the results spoke for themselves."
                  </p>
                  <div className="flex items-center space-x-3">
                    <img 
                      src={sarahPhoto} 
                      alt="Sarah M., HR Director" 
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                    />
                    <div>
                      <p className="font-semibold text-foreground">Sarah M.</p>
                      <p className="text-sm text-muted-foreground">HR Director, Beta Test Partner</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default GuaranteeSection;