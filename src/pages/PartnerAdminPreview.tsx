import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, CheckCircle2, TrendingUp } from "lucide-react";

const setMeta = (title: string, description: string, canonicalPath: string) => {
  document.title = title;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute('content', description);
  else {
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

export default function PartnerAdminPreview() {
  const navigate = useNavigate();

  useEffect(() => {
    setMeta(
      "Admin Partner Preview — SoulSpark AI",
      "Preview the SoulSpark AI admin experience with sample stats and insights.",
      "/partner-preview"
    );
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <header className="max-w-6xl mx-auto px-4 pt-14 pb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Admin Partner Preview
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          Explore a read-only preview of the admin dashboard with sample data. Sign up to unlock
          full access for your organization.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="spiritual" onClick={() => navigate('/auth#signup')}>Get Started</Button>
          <Button variant="outline" onClick={() => navigate('/partners')}>Back to Partners</Button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 pb-16 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Total Members</CardTitle>
            <CardDescription>Organization size</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-foreground">1,248</div>
            <p className="text-sm text-muted-foreground mt-1">+5.6% this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /> Daily Check-ins</CardTitle>
            <CardDescription>Engagement today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-foreground">392</div>
            <p className="text-sm text-muted-foreground mt-1">Peak at 10:00 AM</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Weekly Engagement</CardTitle>
            <CardDescription>Active users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-foreground">74%</div>
            <p className="text-sm text-muted-foreground mt-1">Benchmarked vs similar orgs</p>
          </CardContent>
        </Card>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-20 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Moods</CardTitle>
            <CardDescription>Sample distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>Grateful — 28%</li>
              <li>Stressed — 22%</li>
              <li>Hopeful — 18%</li>
              <li>Focused — 16%</li>
              <li>Tired — 9%</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Outcomes</CardTitle>
            <CardDescription>Sample highlights</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>Average streak increased to 7.8 days</li>
              <li>1,120 meals donated this quarter</li>
              <li>Circle engagement up 12%</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
