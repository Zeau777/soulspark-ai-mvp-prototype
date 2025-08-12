import { Heart, Mail, Phone, MapPin } from "lucide-react";
const Footer = () => {
  return <footer className="bg-card border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <img src="/lovable-uploads/7dc06000-59f3-4a4f-85de-22d7a9410636.png" alt="SoulSpark AI" className="h-12 md:h-16 w-auto mr-3" />
            </div>
            <h4 className="font-semibold text-foreground mb-2 text-sm">Why Organizations Choose SoulSpark AI</h4>
            <p className="text-muted-foreground leading-relaxed mb-6 max-w-md text-sm">Gen Z and Millennials are facing record stress, burnout, and disconnection—hurting engagement and retention. SoulSpark AI delivers personalized, 24/7 soul-care that boosts mental, emotional, and inner wellbeing. Organizations see stronger culture, higher performance, and real-world impact—every check-in funds a meal for a child in need. It’s more than a perk; it’s a culture shift.</p>
            <div className="flex items-center text-sm text-muted-foreground">
              <Heart className="h-4 w-4 text-primary mr-2" />
              <span>Made with love for your emotional and spiritual journey.</span>
            </div>
          </div>

          {/* Product links */}
          

          {/* Community & Support */}
          
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
            <a href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
            <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;