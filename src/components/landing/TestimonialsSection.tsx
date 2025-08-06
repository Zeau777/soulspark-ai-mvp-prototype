import { Star, Quote } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah M.",
      role: "College Student",
      organization: "University of California",
      quote: "SoulSpark AI has been my daily anchor. The SoulDrops perfectly match my mood and help me find peace between classes and stress.",
      rating: 5,
      impact: "14-day streak"
    },
    {
      name: "Marcus T.",
      role: "Software Engineer",
      organization: "Tech Company ERG",
      quote: "As someone who struggles with work-life balance, the AI coach gives me exactly the spiritual guidance I need, when I need it.",
      rating: 5,
      impact: "Donated 45 meals"
    },
    {
      name: "Priya K.",
      role: "Division I Athlete",
      organization: "Stanford Athletics",
      quote: "Training is intense, but SoulSpark AI helps me stay centered. The personalized prayers and breathwork are game-changers.",
      rating: 5,
      impact: "28-day streak"
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Stories of <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Transformation</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real students, employees, and athletes sharing how SoulSpark AI has strengthened their spiritual and emotional wellbeing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-card border border-border/40 rounded-xl p-6 hover:shadow-spiritual transition-all duration-300 relative"
            >
              {/* Quote icon */}
              <div className="absolute -top-4 left-6">
                <div className="bg-gradient-to-r from-primary to-accent rounded-full w-8 h-8 flex items-center justify-center">
                  <Quote className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4 pt-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-accent fill-current" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-foreground leading-relaxed mb-6 italic">
                "{testimonial.quote}"
              </blockquote>

              {/* Author info */}
              <div className="border-t border-border/40 pt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-muted-foreground mt-1">{testimonial.organization}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium">
                      {testimonial.impact}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-border/40">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-primary mb-2">1K+</div>
            <div className="text-sm text-muted-foreground">Souls Strengthened</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-primary mb-2">5K+</div>
            <div className="text-sm text-muted-foreground">Meals Donated</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-primary mb-2">4.9/5</div>
            <div className="text-sm text-muted-foreground">User Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-primary mb-2">50+</div>
            <div className="text-sm text-muted-foreground">Partner Organizations</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;