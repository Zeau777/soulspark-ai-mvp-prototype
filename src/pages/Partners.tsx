import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Trophy, GraduationCap, Shield, BarChart3 } from "lucide-react";
import PricingSection from "@/components/landing/PricingSection";
const setMeta = (title: string, description: string, canonicalPath: string) => {
  document.title = title;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute('content', description);else {
    const m = document.createElement('meta');
    m.setAttribute('name', 'description');
    m.setAttribute('content', description);
    document.head.appendChild(m);
  }
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = `${window.location.origin}${canonicalPath}`;
};
export default function Partners() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const planParam = params.get('plan');
  const plan = planParam === 'starter' || planParam === 'growth' || planParam === 'enterprise' ? planParam : undefined;

  useEffect(() => {
    setMeta("SoulSpark AI Partners — Companies, Sports Teams, Colleges", "Partner with SoulSpark AI. Purpose-driven tools for companies, sports teams, and colleges.", "/partners");
  }, []);

  useEffect(() => {
    if (plan) {
      const el = document.getElementById('partner-plans');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [plan]);

  return <main className="min-h-screen bg-background">
      <header className="max-w-6xl mx-auto px-4 pt-14 pb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Partner with SoulSpark AI
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">Designed for companies, sports organizations, and colleges to foster well-being, belonging, and measurable impact across your community.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="spiritual" onClick={() => navigate('/auth#signup')}>
            Partner Sign Up
          </Button>
          <Button variant="outline" onClick={() => navigate('/auth')}>
            Partner Login
          </Button>
          <Button variant="ghost" onClick={() => navigate('/partner-preview')}>
            View Admin Partner Preview
          </Button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 pb-16 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Companies</CardTitle>
            <CardDescription>Culture, retention, and well-being</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Personalized check-ins, team pulse, and insights to reduce burnout, improve retention, and measurably strengthen culture.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Sports Teams</CardTitle>
            <CardDescription>Performance and mental fitness</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Daily mindset cues, recovery reflections, and confidential support to sustain peak performance across your season.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" /> Colleges</CardTitle>
            <CardDescription>Student success, retention, and belonging</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Boost retention with timely nudges, early support routing, and belonging-building communities.
          </CardContent>
        </Card>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-20 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Privacy-first</CardTitle>
            <CardDescription>Enterprise security and controls</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Built with privacy in mind and role-based access for admins and staff.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Actionable Analytics</CardTitle>
            <CardDescription>Real-time insights</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Track engagement, check-ins, and outcomes to demonstrate ROI.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Getting Started</CardTitle>
            <CardDescription>Fast onboarding</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Create your partner account and explore the Admin preview in minutes.
          </CardContent>
        </Card>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-24">
        <PricingSection id="partner-plans" showHeader={true} selectedPlan={plan} />
      </section>
    </main>;
}