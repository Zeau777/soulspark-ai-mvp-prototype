import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border/40 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/7dc06000-59f3-4a4f-85de-22d7a9410636.png" 
              alt="SoulSpark AI logo"
              className="h-12 md:h-16 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="/about" className="text-foreground hover:text-primary transition-colors font-medium">
                About
              </a>
              <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors font-medium">
                How It Works
              </a>
              <a href="#testimonials" className="text-foreground hover:text-primary transition-colors font-medium">
                Stories
              </a>
              <a href="/pricing" className="text-foreground hover:text-primary transition-colors font-medium">
                Pricing
              </a>
              <a href="/partners" className="text-foreground hover:text-primary transition-colors font-medium">
                For Organizations
              </a>
            </div>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                navigate('/book-demo');
                window.scrollTo(0, 0);
              }}
              className="bg-black text-white border-black hover:bg-black/90 hover:text-white"
            >
              Book a Demo
            </Button>
            <Button variant="spiritual" size="sm" onClick={() => navigate('/auth')}>
              Join Now
            </Button>
          </div>

          {/* Mobile CTA and menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                navigate('/book-demo');
                window.scrollTo(0, 0);
              }}
              className="bg-black text-white border-black hover:bg-black/90 hover:text-white text-xs px-3"
            >
              Book Demo
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border/40">
            <a
              href="/about"
              className="block px-3 py-2 text-foreground hover:text-primary transition-colors font-medium"
              onClick={() => setIsOpen(false)}
            >
              About
            </a>
            <a
              href="#how-it-works"
              className="block px-3 py-2 text-foreground hover:text-primary transition-colors font-medium"
              onClick={() => setIsOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#testimonials"
              className="block px-3 py-2 text-foreground hover:text-primary transition-colors font-medium"
              onClick={() => setIsOpen(false)}
            >
              Stories
            </a>
            <a
              href="/pricing"
              className="block px-3 py-2 text-foreground hover:text-primary transition-colors font-medium"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </a>
            <a
              href="/partners"
              className="block px-3 py-2 text-foreground hover:text-primary transition-colors font-medium"
              onClick={() => setIsOpen(false)}
            >
              For Organizations
            </a>
            <div className="flex flex-col space-y-2 px-3 pt-4">
               <Button 
                variant="outline" 
                size="sm" 
                className="w-full bg-black text-white border-black hover:bg-black/90 hover:text-white" 
                onClick={() => {
                  navigate('/book-demo');
                  window.scrollTo(0, 0);
                  setIsOpen(false);
                }}
              >
                Book a Demo
              </Button>
              <Button variant="spiritual" size="sm" className="w-full" onClick={() => navigate('/auth')}>
                Join Now
              </Button>
            </div>
          </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;