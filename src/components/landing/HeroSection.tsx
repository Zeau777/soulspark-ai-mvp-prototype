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
              <span>Human-centered care</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>AI-powered wisdom</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-4 leading-tight lg:text-4xl md:text-4xl">
            <span className="text-[hsl(var(--brand-orange))]">The AI Operating System for </span>
            <span className="text-[hsl(var(--brand-orange))]">Purpose-Driven</span>
            <span className="text-foreground"> Workplaces, Campuses, and Locker Rooms.</span>
          </h1>

          <p className="text-lg font-medium text-primary mb-6">SoulSpark AI — Upgrade Your Inner Life with AI-Powered Daily Boosts.</p>


          <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto leading-relaxed">Gen Z and Millennials are upgrading everything, from our skills to our devices to our hustle. But what about our inner life? SoulSpark AI is the first platform designed to supercharge your mental, emotional, and purpose-driven well-being in just 60 seconds a day. It is powered by timeless wisdom, proven science, and human-centered AI, and is always accessible and always judgment-free.</p>
          



          {/* Proprietary Edge Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">SoulMatch AI™ Engine</h3>
              <p className="text-muted-foreground">A proprietary system that personalizes content in real time—adapting to each person's mood, mindset, and growth patterns.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Pulse Tracking AI</h3>
              <p className="text-muted-foreground">An advanced well-being tracker that uses memory and predictive signals to detect stress and burnout before they surface.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Impact Gamification</h3>
              <p className="text-muted-foreground">Leaderboards, progress badges, and shareable milestones that motivate positive habits and foster lasting change.</p>
            </div>
          </div>

          {/* Additional Unique Features */}
          <div className="mt-12 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-8 max-w-4xl mx-auto border border-primary/10">
            <h3 className="text-2xl font-bold text-center mb-6">Why SoulSpark AI is Different</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start space-x-3">
                <Heart className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Human-Centered Behavioral AI</h4>
                  <p className="text-sm text-muted-foreground">Built on psychology, wisdom traditions, and modern behavioral science to support whole-person well-being.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Social Impact Engine</h4>
                  <p className="text-sm text-muted-foreground">Every action in the platform contributes to meaningful real-world outcomes, turning personal growth into collective impact.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Sparkles className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Hyper-Personalization Engine</h4>
                  <p className="text-sm text-muted-foreground">Customizes tone, depth, and guidance for each user and organization's unique culture and preferences.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Brain className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Dynamic Growth Coach AI</h4>
                  <p className="text-sm text-muted-foreground">An adaptive digital coach that evolves with each user's journey, offering support that feels more human over time.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;