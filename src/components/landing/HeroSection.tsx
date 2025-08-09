import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Users, Brain, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
const HeroSection = () => {
  const navigate = useNavigate();
  return <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Trust indicators */}
          <div className="flex justify-center items-center space-x-6 mb-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>1,000+ souls strengthened</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Faith-centered care</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>AI-powered wisdom</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-4 leading-tight lg:text-4xl md:text-4xl">
            <span className="text-[hsl(var(--brand-orange))]">The AI Operating System for </span>
            <span className="text-[hsl(var(--brand-orange))]">Soul-Centered</span>
            <span className="text-foreground"> Workplaces, Campuses, and Locker Rooms.</span>
          </h1>

          <p className="text-lg font-medium text-primary mb-6">SoulSpark AI — 60 Seconds a Day to Unlock Your Best Self!</p>

          {/* CTA Button - Moved up for mobile visibility */}
          <div className="flex justify-center mb-8">
            <Button variant="spiritual" size="lg" className="text-lg px-8 py-4 min-w-[200px]" onClick={() => navigate('/auth')}>
              Start Your Journey
            </Button>
          </div>

          <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto leading-relaxed">Meet SoulSpark AI—the first AI-powered soul-care platform built for the soul. It blends timeless principles, proven psychology, and modern insights to help Gen Z and Millennials boost their mental, spiritual, and emotional well-being—judgment-free, in just 60 seconds a day.</p>

          {/* Guarantee Statement */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
            <p className="text-lg font-semibold text-foreground">
              Purpose. Peace. Clarity. Guaranteed in 90 days — or your money back.
            </p>
          </div>


          {/* Proprietary Edge Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">SoulMatch AI™ Engine</h3>
              <p className="text-muted-foreground">Proprietary algorithm that dynamically adapts spiritual content based on your faith level, mood, and growth patterns.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Pulse Tracking AI</h3>
              <p className="text-muted-foreground">Advanced memory + risk scoring system that detects burnout and faith drift before they happen.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Viral Impact Gamification</h3>
              <p className="text-muted-foreground">Leaderboards, impact badges, and shareable spiritual growth moments that create real-world change.</p>
            </div>
          </div>

          {/* Additional Unique Features */}
          <div className="mt-12 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-8 max-w-4xl mx-auto border border-primary/10">
            <h3 className="text-2xl font-bold text-center mb-6">Why SoulSpark AI is Different</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start space-x-3">
                <Heart className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Faith-Centered Behavioral AI</h4>
                  <p className="text-sm text-muted-foreground">Trained on Scripture, ancient wisdom, and psychological frameworks.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Social Impact Engine</h4>
                  <p className="text-sm text-muted-foreground">Every user action creates real-world impact (like TOMS for soul care).</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Sparkles className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Hyper-Personalization Engine</h4>
                  <p className="text-sm text-muted-foreground">Adjusts tone, depth, and doctrine-level per user/org preference.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Brain className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Dynamic Persona-Shaping AI</h4>
                  <p className="text-sm text-muted-foreground">Personal AI soul-care coach that evolves with your spiritual journey.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;