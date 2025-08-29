import { Heart, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <img 
                src="/lovable-uploads/7dc06000-59f3-4a4f-85de-22d7a9410636.png" 
                alt="SoulSpark AI" 
                className="h-12 md:h-16 w-auto mr-3" 
              />
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
        <div className="border-t border-border/40 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground mb-4 md:mb-0">
              © 2025 SoulSpark AI. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a 
                href="/privacy-policy" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </a>
              <a 
                href="/terms" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </a>
              <a 
                href="/cookies" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground/70 italic font-light">
              "Many are the plans in a person's heart, but it is the Lord's purpose that prevails." — Proverbs 19:21
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;