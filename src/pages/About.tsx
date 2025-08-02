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
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            SoulSpark AI exists to ignite a global movement of emotionally resilient, purpose-driven young people by pioneering AI-powered, faith-centered soul care.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Target className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold">Our Mission</h2>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Our mission is to help Gen Z and Millennials heal emotionally, grow spiritually, and reconnect with their God-given identity — one soul, one spark, and one meal at a time.
          </p>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Eye className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold">Our Vision</h2>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">By 2028, SoulSpark AI will be the go-to soul care OS platform among Gen Z and Millennials, powering millions of lives across campuses, companies, and communities — and serving as the official soul care partner of the LA Olympics. One minute a day. One soul at a time. One world forever changed.</p>
          <blockquote className="border-l-4 border-primary pl-6 italic text-lg text-foreground">
            "Just like people check Calm or Spotify daily — they'll check SoulSpark AI for the health of their soul."
          </blockquote>
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
            Founded by a diverse team passionate about faith, technology, and social good, SoulSpark AI was born from a simple yet profound idea: wellness apps often overlook the soul. Inspired by the rising stress, loneliness and identity crisis among Gen Z and Millennials, we created a platform that meets you where you are—spiritually and emotionally. Our beta program is already sparking change, with early users praising its impact on their daily lives.
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
            Every action on SoulSpark AI makes a difference. Through our "1 SoulDrop = 1 Meal" initiative, each check-in supports a child in need via our charity partners. Our beta users have already donated thousands of meals, proving that personal growth can fuel global hope. Join us to spark your soul and change the world.
          </p>
        </div>
      </section>
    </div>;
};
export default About;