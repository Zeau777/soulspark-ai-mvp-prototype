import { Users, Target, Eye, BookOpen, Heart } from "lucide-react";
const About = () => {
  return <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About <span className="text-gradient">SoulSpark AI</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">SoulSpark AI is reimagining well-being for the next generation. Our AI-powered platform gives Gen Z and Millennials personalized support that strengthens mental, emotional, and inner resilience in just 60-second a day. It feels simple, relatable, and built for the way they actually live.

We work with leading companies, colleges, and athletic programs to improve engagement, retention, and performance, while also growing a direct-to-user community. Every interaction on SoulSpark creates real-world impact by helping provide meals to children in need.

By making meaningful support both scalable and deeply personal, SoulSpark AI is opening an untapped market and shaping the future of well-being at scale.</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Target className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold">Our Mission</h2>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">SoulSpark AI exists to empower the next generation with the resilience, purpose, and support they need to thrive—using AI to make personal well-being as natural and universal as daily life itself.</p>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Eye className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold">Our Vision</h2>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">SoulSpark AI will become the daily home for the inner well-being of a generation—empowering millions of young people to build resilience, find purpose, and thrive in life, work, and play. Just as people turn to Spotify for music or Calm for meditation, they will turn to SoulSpark for the health of their soul.</p>
          
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold">Our Story</h2>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            SoulSpark AI was created with a bold belief: the next generation deserves more than surface-level wellness. While most apps track steps or offer quick fixes, they often miss what matters most—the soul. Seeing the rise in stress, burnout, and disconnection among Gen Z and Millennials, we set out to build something different: a platform that blends behavioral science, cultural relevance, and AI into support that feels personal, practical, and inspiring. What began as an idea is already proving its power—our beta users report feeling more grounded, connected, and resilient in just minutes a day.
          </p>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold">Our Impact</h2>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            At SoulSpark AI, growth doesn't stop with the individual. Every daily check-in creates a ripple of change in the world. Through our "1 SoulDrop = 1 Meal" initiative, each moment of reflection on the platform helps provide meals to children in need. Already, our early community has fueled thousands of meals—turning personal well-being into global hope. With SoulSpark, taking care of yourself means helping take care of others.
          </p>
        </div>
      </section>
    </div>;
};
export default About;