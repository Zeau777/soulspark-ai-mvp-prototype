import { Heart, Mail, Phone, MapPin } from "lucide-react";
const Footer = () => {
  return <footer className="bg-card border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <img src="/lovable-uploads/7dc06000-59f3-4a4f-85de-22d7a9410636.png" alt="SoulSpark AI" className="h-8 w-auto mr-3" />
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6 max-w-md">The AI-Powered Operating System for Soul-Centered Workplaces, Campuses, and Locker Rooms. Strengthening spiritual and emotional wellbeing through personalized, faith-centered support.</p>
            <div className="flex items-center text-sm text-muted-foreground">
              <Heart className="h-4 w-4 text-primary mr-2" />
              <span>Made with love for your emotional and spiritual journey.</span>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">How It Works</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">SoulScan Quiz</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Daily SoulDrops</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">AI Soul-Care Coach</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Impact Tracker</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Pricing</a></li>
            </ul>
          </div>

          {/* Community & Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Community</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">For Students</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">For Employees</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">For Athletes</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Partner Organizations</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Success Stories</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Support Center</a></li>
            </ul>
          </div>
        </div>

        {/* Contact info */}
        <div className="border-t border-border/40 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center text-sm text-muted-foreground">
              <Mail className="h-4 w-4 mr-3 text-primary" />
              <span>hello@mysoulsparkai.com</span>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-3 text-primary" />
              <span>Supporting souls worldwide</span>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-muted-foreground mb-4 md:mb-0">© 2025 SoulSpark AI. All rights reserved.</div>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;