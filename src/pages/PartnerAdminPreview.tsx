import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, CheckCircle2, TrendingUp, Eye, Utensils, UploadCloud, Download } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import InviteLinksPreview from "@/components/partner-admin/InviteLinksPreview";
import CohortManagementPreview from "@/components/partner-admin/CohortManagementPreview";

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

  const { toast } = useToast();

  // Sample preview data (read-only)
  const pulseDaily = [
    { label: "Mon", stress: 32, engagement: 68, burnout: 12 },
    { label: "Tue", stress: 28, engagement: 71, burnout: 11 },
    { label: "Wed", stress: 30, engagement: 70, burnout: 10 },
    { label: "Thu", stress: 27, engagement: 73, burnout: 9 },
    { label: "Fri", stress: 25, engagement: 75, burnout: 8 },
  ];
  const pulseWeekly = [
    { label: "W1", stress: 34, engagement: 66, burnout: 13 },
    { label: "W2", stress: 31, engagement: 69, burnout: 11 },
    { label: "W3", stress: 29, engagement: 71, burnout: 10 },
    { label: "W4", stress: 26, engagement: 74, burnout: 9 },
  ];
  const categoriesData = [
    { name: "Faith", value: 38 },
    { name: "Joy", value: 27 },
    { name: "Calm", value: 22 },
    { name: "Identity", value: 18 },
  ];
  const groupUsage = [
    { group: "Marketing", members: 180, active: 76, checkins: 58, meals: 210 },
    { group: "Engineering", members: 220, active: 81, checkins: 72, meals: 265 },
    { group: "Campus — Freshman", members: 350, active: 69, checkins: 95, meals: 410 },
    { group: "Team — Women’s Soccer", members: 28, active: 88, checkins: 19, meals: 54 },
  ];
  const usageTrend = [
    { name: "W1", active: 62 },
    { name: "W2", active: 66 },
    { name: "W3", active: 71 },
    { name: "W4", active: 74 },
  ];
  const totalMeals = groupUsage.reduce((sum, g) => sum + g.meals, 0);

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

      {/* KPI summary */}
      <section className="max-w-6xl mx-auto px-4 pb-16 grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Total Users Onboarded</CardTitle>
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
            <CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" /> SoulDrop Views</CardTitle>
            <CardDescription>Today’s inspiration reach</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-foreground">1,024</div>
            <p className="text-sm text-muted-foreground mt-1">Top category: Faith</p>
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

      {/* Trends & Categories */}
      <section className="max-w-6xl mx-auto px-4 pb-16 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily/Weekly Pulse Trends</CardTitle>
            <CardDescription>Stress, engagement, burnout detection</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="daily">
              <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
              </TabsList>
              <TabsContent value="daily">
                <ChartContainer
                  config={{
                    stress: { label: "Stress", color: "hsl(var(--destructive))" },
                    engagement: { label: "Engagement", color: "hsl(var(--primary))" },
                    burnout: { label: "Burnout", color: "hsl(var(--muted-foreground))" },
                  }}
                  className="h-64 w-full"
                >
                  <LineChart data={pulseDaily} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis width={28} tickLine={false} axisLine={false} />
                    <Line type="monotone" dataKey="stress" stroke="var(--color-stress)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="engagement" stroke="var(--color-engagement)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="burnout" stroke="var(--color-burnout)" strokeWidth={2} dot={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </LineChart>
                </ChartContainer>
              </TabsContent>
              <TabsContent value="weekly">
                <ChartContainer
                  config={{
                    stress: { label: "Stress", color: "hsl(var(--destructive))" },
                    engagement: { label: "Engagement", color: "hsl(var(--primary))" },
                    burnout: { label: "Burnout", color: "hsl(var(--muted-foreground))" },
                  }}
                  className="h-64 w-full"
                >
                  <LineChart data={pulseWeekly} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis width={28} tickLine={false} axisLine={false} />
                    <Line type="monotone" dataKey="stress" stroke="var(--color-stress)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="engagement" stroke="var(--color-engagement)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="burnout" stroke="var(--color-burnout)" strokeWidth={2} dot={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </LineChart>
                </ChartContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Used SoulDrop Categories</CardTitle>
            <CardDescription>Faith, Joy, Calm, Identity</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ value: { label: "Views", color: "hsl(var(--primary))" } }}
              className="h-64 w-full"
            >
              <BarChart data={categoriesData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis width={28} tickLine={false} axisLine={false} />
                <Bar dataKey="value" fill="var(--color-value)" radius={[6, 6, 0, 0]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>

      {/* Group overview and actions */}
      <section className="max-w-6xl mx-auto px-4 pb-20 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overview by Group</CardTitle>
            <CardDescription>Members, activity, check-ins, impact</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group</TableHead>
                  <TableHead className="text-right">Members</TableHead>
                  <TableHead className="text-right">Active %</TableHead>
                  <TableHead className="text-right">Check-ins (today)</TableHead>
                  <TableHead className="text-right">Meals</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupUsage.map((g) => (
                  <TableRow key={g.group}>
                    <TableCell className="font-medium">{g.group}</TableCell>
                    <TableCell className="text-right">{g.members}</TableCell>
                    <TableCell className="text-right">{g.active}%</TableCell>
                    <TableCell className="text-right">{g.checkins}</TableCell>
                    <TableCell className="text-right">{g.meals}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Utensils className="h-5 w-5" /> Impact Tracker</CardTitle>
              <CardDescription>Total impact and usage trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-foreground">{totalMeals.toLocaleString()} meals donated</div>
              <p className="text-sm text-muted-foreground mt-1">Quarter to date</p>
              <div className="mt-4">
                <ChartContainer
                  config={{ active: { label: "Active %", color: "hsl(var(--primary))" } }}
                  className="h-36 w-full"
                >
                  <BarChart data={usageTrend} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis width={28} tickLine={false} axisLine={false} />
                    <Bar dataKey="active" fill="var(--color-active)" radius={[6, 6, 0, 0]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UploadCloud className="h-5 w-5" /> Team Resources</CardTitle>
              <CardDescription>Upload resources, affirmations, or announcements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input type="file" disabled aria-label="Upload file (sign in required)" />
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => navigate('/auth#signup')}>Sign in to Upload</Button>
                <Button variant="outline" onClick={() => navigate('/auth#signup')}>Manage Library</Button>
              </div>
              <p className="text-xs text-muted-foreground">Preview only. Sign in to enable uploads.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" /> Exportable Reports</CardTitle>
              <CardDescription>Share insights with key stakeholders</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button onClick={() => { toast({ title: "Sign in required", description: "Create an account to export HR/DEI reports." }); navigate('/auth#signup'); }}>HR / DEI Report</Button>
              <Button variant="outline" onClick={() => { toast({ title: "Sign in required", description: "Create an account to export College Wellness reports." }); navigate('/auth#signup'); }}>College Wellness Report</Button>
              <Button variant="outline" onClick={() => { toast({ title: "Sign in required", description: "Create an account to export Sports Team reports." }); navigate('/auth#signup'); }}>Sports Team Report</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Invite Links & Cohort Management */}
      <section className="max-w-6xl mx-auto px-4 pb-24 grid gap-6 md:grid-cols-2">
        <InviteLinksPreview />
        <CohortManagementPreview />
      </section>
    </main>
  );
}

