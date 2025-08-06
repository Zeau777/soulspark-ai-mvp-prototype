import { Button } from "@/components/ui/button";
import { GraduationCap, Building2, Trophy, ArrowRight, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LeadMagnetForm from "./LeadMagnetForm";
import { supabase } from "@/integrations/supabase/client";

const CTASection = () => {
  const navigate = useNavigate();
  
  const leadMagnets = [
    {
      icon: GraduationCap,
      title: "Colleges",
      headline: "Bring Soul-Care to Your Campus",
      subheadline: "Discover how SoulSpark AI helps your students grow emotionally, spiritually, and academically — one daily check-in at a time.",
      ctaText: "Download the College Partnership Guide",
      trustBadge: "Built for Chaplaincy • Campus Ministry • Student Life",
      fields: [
        { name: "firstName", label: "First Name", placeholder: "Enter your first name" },
        { name: "lastName", label: "Last Name", placeholder: "Enter your last name" },
        { name: "email", label: "Email Address", type: "email", placeholder: "Enter your email" },
        { name: "schoolName", label: "School Name", placeholder: "Enter your school name" },
        { name: "role", label: "Role/Title", placeholder: "e.g., Chaplain, Student Life Coordinator" },
        { name: "demo", label: "", type: "checkbox", placeholder: "I'd like a free demo" }
      ]
    },
    {
      icon: Building2,
      title: "Companies",
      headline: "Support Gen Z Wellness at Work",
      subheadline: "See how SoulSpark AI helps reduce burnout, boost morale, and connect your teams to purpose with personalized AI-powered soul-care.",
      ctaText: "Download the Corporate Partnership Guide",
      trustBadge: "Trusted by DEI, ERG, and People Teams",
      fields: [
        { name: "firstName", label: "First Name", placeholder: "Enter your first name" },
        { name: "lastName", label: "Last Name", placeholder: "Enter your last name" },
        { name: "email", label: "Email Address", type: "email", placeholder: "Enter your email" },
        { name: "companyName", label: "Company Name", placeholder: "Enter your company name" },
        { name: "role", label: "Role/Department", placeholder: "e.g., People Operations, DEI Lead" },
        { name: "demo", label: "", type: "checkbox", placeholder: "I'd like a free demo" }
      ]
    },
    {
      icon: Trophy,
      title: "Sports Teams",
      headline: "Fuel Athlete Identity Beyond Performance",
      subheadline: "Empower your athletes with a daily moment to reconnect with who they are — not just what they do.",
      ctaText: "Download the Sports Partnership Guide",
      trustBadge: "Designed for Faith-Based & Character-Driven Programs",
      fields: [
        { name: "firstName", label: "First Name", placeholder: "Enter your first name" },
        { name: "lastName", label: "Last Name", placeholder: "Enter your last name" },
        { name: "email", label: "Email Address", type: "email", placeholder: "Enter your email" },
        { name: "organizationName", label: "Organization/Team", placeholder: "Enter your team/organization name" },
        { name: "role", label: "Role", placeholder: "e.g., Coach, Chaplain, Staff" },
        { name: "demo", label: "", type: "checkbox", placeholder: "I'd like a free demo" }
      ]
    }
  ];

  const handleLeadMagnetSubmit = async (data: Record<string, string>, type: string) => {
    try {
      // Map form data to database fields
      const organizationFieldMap: Record<string, string> = {
        'Colleges': 'schoolName',
        'Companies': 'companyName', 
        'Sports Teams': 'organizationName'
      };
      
      const organizationField = organizationFieldMap[type];
      const organizationName = data[organizationField] || '';

      // Save lead to database
      const { error } = await supabase
        .from('partnership_leads')
        .insert({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          organization_name: organizationName,
          role: data.role,
          partnership_type: type.toLowerCase().replace(' ', '_'),
          wants_demo: data.demo === 'true'
        });

      if (error) {
        console.error('Error saving lead:', error);
        throw error;
      }

      console.log(`${type} lead saved successfully:`, data);
    } catch (error) {
      console.error('Failed to save lead:', error);
      throw error;
    }
  };

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
              <Button 
                variant="spiritual" 
                size="lg" 
                className="text-lg px-8 py-4"
                onClick={() => navigate('/auth')}
              >
                Start Your Journey Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-4"
                onClick={() => navigate('/auth')}
              >
                Join via Invite Code
              </Button>
            </div>
          </div>
        </div>

        {/* Lead Magnets section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Built for <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Your Organization</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Download your free partnership guide and discover how SoulSpark AI can support your community's 
            emotional and spiritual wellbeing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {leadMagnets.map((magnet, index) => (
            <div 
              key={index}
              className="bg-card border border-border/40 rounded-xl p-8 hover:shadow-spiritual transition-all duration-300"
            >
              {/* Icon */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl w-16 h-16 flex items-center justify-center mb-6">
                <magnet.icon className="h-8 w-8 text-primary" />
              </div>

              {/* Headline & Subheadline */}
              <h3 className="text-2xl font-bold text-foreground mb-3">
                {magnet.headline}
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {magnet.subheadline}
              </p>

              {/* Trust Badge */}
              <div className="flex items-center gap-2 mb-6 p-3 bg-primary/5 rounded-lg">
                <Shield className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm text-primary font-medium">{magnet.trustBadge}</span>
              </div>

              {/* Lead Magnet Form */}
              <LeadMagnetForm
                title={magnet.title}
                ctaText={magnet.ctaText}
                fields={magnet.fields}
                onSubmit={(data) => handleLeadMagnetSubmit(data, magnet.title)}
              />
            </div>
          ))}
        </div>

        {/* Additional Contact section */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-primary/10">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Questions About Partnership?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Already have a partnership guide and ready to talk? Our team is here to help you get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/auth')}
            >
              Schedule a Call
            </Button>
            <Button 
              variant="ghost" 
              size="lg"
              onClick={() => window.open('mailto:partners@mysoulsparkai.com', '_blank')}
            >
              Email Us Directly
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;