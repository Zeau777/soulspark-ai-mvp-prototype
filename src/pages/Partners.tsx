import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Users, GraduationCap, Shield, BarChart3 } from "lucide-react";
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
  useEffect(() => {
    setMeta("SoulSpark AI Partners — DEI, Coaches, Colleges", "Partner with SoulSpark AI. Purpose-driven tools for DEI teams, coaches, and colleges.", "/partners");
  }, []);
  return <main className="min-h-screen bg-background">
      <header className="max-w-6xl mx-auto px-4 pt-14 pb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Partner with SoulSpark AI
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">Designed for HR leaders, sports organizations, and colleges to foster well-being, belonging, and measurable impact across your community.</p>
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
            <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> DEI Teams</CardTitle>
            <CardDescription>Strengthen culture and track outcomes</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Personalized check-ins, challenges, and insights to build resilient, inclusive teams.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Coaches</CardTitle>
            <CardDescription>Scale impact with AI-assisted care</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Automate nudges, track engagement, and deliver soul-care at scale.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" /> Colleges</CardTitle>
            <CardDescription>Student well-being and belonging</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Improve retention with timely nudges and community-driven support.
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
    </main>;
}