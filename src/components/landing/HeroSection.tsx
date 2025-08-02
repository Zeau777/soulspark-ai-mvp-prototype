import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Users } from "lucide-react";
const HeroSection = () => {
  return <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Trust indicators */}
          <div className="flex justify-center items-center space-x-6 mb-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>10,000+ souls strengthened</span>
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

          <h1 className="text-4xl font-bold text-foreground mb-6 leading-tight lg:text-5xl md:text-5xl">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI-Powered Soul-Care
            </span>
            <br />
            <span className="text-foreground">for a Purpose-Driven Generation.</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed md:text-lg">Experience personalized, faith-centered emotional and spiritual support designed for Gen Z and Millennials. Daily soul care that meets you where you are, speaks your language, and helps you grow from the inside out. It's like Duolingo for your soul, but smarter.</p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button variant="spiritual" size="lg" className="text-lg px-8 py-4 min-w-[200px]">
              Start Your Journey
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 min-w-[200px]">
              Request Demo
            </Button>
          </div>

          {/* Value propositions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Daily SoulDrops</h3>
              <p className="text-muted-foreground">60-second soul-care experiences tailored to your emotional and spiritual rhythm.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">AI Soul-Care Coach</h3>
              <p className="text-muted-foreground">Empathetic, faith-based guidance whenever you need support or a soul-friend to talk to.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Impact That Matters</h3>
              <p className="text-muted-foreground">Your spiritual growth creates real-world impact through our  “1 SoulDrop = 1 Meal” initiative.</p>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;