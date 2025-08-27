import { useEffect, useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";

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
  const [liveMealsYTD, setLiveMealsYTD] = useState<number | null>(null);
  const [impactMonthly, setImpactMonthly] = useState<Array<{ label: string; meals: number }>>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const now = new Date();
        const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0));
        const { data, error } = await supabase
          .from('impact_credits')
          .select('credits, created_at')
          .gte('created_at', start.toISOString())
          .limit(100000);
        if (error) {
          console.warn('impact credits fetch failed', error);
          return;
        }
        const totalCredits = (data || []).reduce((s: number, r: any) => s + Number(r.credits || 0), 0);
        const meals = Math.floor(totalCredits);
        setLiveMealsYTD(meals);
      } catch (e) {
        console.warn('impact credits error', e);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadMonthly = async () => {
      try {
        const { data, error } = await supabase
          .from('impact_batches')
          .select('total_meals, period_start')
          .order('period_start', { ascending: false })
          .limit(12);
        if (error) {
          console.warn('impact batches fetch failed', error);
          return;
        }
        const arr = (data || [])
          .reverse()
          .map((row: any) => {
            const d = new Date(row.period_start);
            const label = d.toLocaleString(undefined, { month: 'short' });
            return { label, meals: Number(row.total_meals || 0) };
          });
        setImpactMonthly(arr);
      } catch (e) {
        console.warn('impact monthly error', e);
      }
    };
    loadMonthly();
  }, []);
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
  const impactMonthlyPreview = [
    { label: "Apr", meals: 2400 },
    { label: "May", meals: 2600 },
    { label: "Jun", meals: 2800 },
    { label: "Jul", meals: 3000 },
  ];
  const totalMeals = groupUsage.reduce((sum, g) => sum + g.meals, 0);

  // Mock engagement metrics data
  const mockTopMoods = [
    { mood: 'peaceful', count: 45 },
    { mood: 'grateful', count: 38 },
    { mood: 'joyful', count: 32 },
    { mood: 'hopeful', count: 28 },
    { mood: 'anxious', count: 19 }
  ];

  const getMoodEmoji = (mood: string) => {
    const moodMap: Record<string, string> = {
      anxious: '😰',
      peaceful: '😌',
      lost: '🤔',
      tired: '😴',
      joyful: '😊',
      stressed: '😤',
      hopeful: '🌟',
      overwhelmed: '😵',
      grateful: '🙏',
      restless: '😣'
    };
    return moodMap[mood] || '😊';
  };

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

      {/* Plan Info */}
      <section className="max-w-6xl mx-auto px-4 pb-8">
        <Card className="shadow-spiritual border-accent/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Current Plan: Professional</CardTitle>
                <CardDescription>
                  245 of 500 seats used
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Seat Usage</div>
                <div className="text-2xl font-bold">49%</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: '49%' }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Preview mode. Sign up to see your actual plan usage.
            </p>
          </CardContent>
        </Card>
      </section>

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

          {/* Impact Engine Progress (live if signed in as org admin) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2">
                <Utensils className="h-5 w-5" /> Impact Engine — No Kid Hungry
              </CardTitle>
              <CardDescription>Progress to 1,000,000 meals this year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-semibold text-foreground">{(liveMealsYTD ?? 125432).toLocaleString()} meals YTD</div>
                  <p className="text-sm text-muted-foreground">Goal: 1,000,000</p>
                </div>
                <div className="text-sm text-muted-foreground">{Math.min(100, Math.round(((liveMealsYTD ?? 125432)/1000000)*100))}%</div>
              </div>
              <div className="mt-3 h-3 w-full rounded-full bg-muted">
                <div
                  className="h-3 rounded-full bg-primary"
                  style={{ width: `${Math.min(100, Math.round(((liveMealsYTD ?? 125432)/1000000)*100))}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{liveMealsYTD == null ? 'Preview shown. Sign in as org admin to see live impact.' : 'Live organization impact.'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Impact Trend</CardTitle>
              <CardDescription>Meals donated per month</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{ meals: { label: "Meals", color: "hsl(var(--primary))" } }}
                className="h-36 w-full"
              >
                <BarChart data={impactMonthly.length ? impactMonthly : impactMonthlyPreview} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis width={28} tickLine={false} axisLine={false} />
                  <Bar dataKey="meals" fill="var(--color-meals)" radius={[6, 6, 0, 0]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ChartContainer>
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

      {/* Overview and Insights */}
      <section className="max-w-6xl mx-auto px-4 pb-16 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Emotional Pulse</CardTitle>
            <CardDescription>Most common moods this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockTopMoods.map(({ mood, count }) => (
                <div key={mood} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getMoodEmoji(mood)}</span>
                    <span className="capitalize">{mood}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{count} check-ins</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Preview data. Sign up to see real emotional insights.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Metrics</CardTitle>
            <CardDescription>Average user performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  8.3 days
                </div>
                <p className="text-muted-foreground">Average user streak</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-semibold text-accent">
                    89%
                  </div>
                  <p className="text-xs text-muted-foreground">Weekly retention</p>
                </div>
                <div>
                  <div className="text-xl font-semibold text-secondary">
                    2.4x
                  </div>
                  <p className="text-xs text-muted-foreground">Daily engagement</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Preview metrics. Actual data available after signup.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Invite Links & Cohort Management */}
      <section className="max-w-6xl mx-auto px-4 pb-24 grid gap-6 md:grid-cols-2">
        <InviteLinksPreview />
        <CohortManagementPreview />
      </section>
    </main>
  );
}

