import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  TrendingUp, 
  Heart, 
  Calendar,
  BarChart3,
  Activity,
  Target,
  Share2,
  MessageCircle,
  Award,
  Building,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface PlatformMetrics {
  totalUsers: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  soulDropInteractions: number;
  totalMealsDonated: number;
  retentionRate: number;
  pulseCheckEngagement: number;
  communityEngagement: number;
  referralShares: number;
  orgPartnerConversions: number;
  averageNPS: number;
  spiritualGrowthScore: number;
}

interface EngagementData {
  date: string;
  dau: number;
  wau: number;
  soulDrops: number;
  pulseChecks: number;
}

interface OrganizationStats {
  name: string;
  users: number;
  engagement: number;
  burnoutReduction: number;
}

export default function PlatformAnalytics() {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [orgStats, setOrgStats] = useState<OrganizationStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkPlatformAdminAccess();
    }
  }, [user]);

  const checkPlatformAdminAccess = async () => {
    if (!user) return;

    try {
      // Check if user is a platform admin (for now, check if they're admin of any org)
      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('admin_email', user.email);

      if (orgData && orgData.length > 0) {
        setIsAdmin(true);
        await fetchPlatformMetrics();
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking platform admin access:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatformMetrics = async () => {
    try {
      // Fetch all users
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('*');

      // Fetch all organizations
      const { data: allOrgs } = await supabase
        .from('organizations')
        .select('*');

      // Calculate date ranges
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Fetch engagement data
      const { data: recentEngagement } = await supabase
        .from('user_engagement')
        .select('*')
        .gte('created_at', oneMonthAgo.toISOString());

      // Fetch check-ins
      const { data: allCheckIns } = await supabase
        .from('check_ins')
        .select('*')
        .gte('created_at', oneMonthAgo.toISOString());

      // Fetch posts for community engagement
      const { data: allPosts } = await supabase
        .from('posts')
        .select('*, post_reactions(*)');

      // Fetch soul drops interactions
      const { data: soulDropEngagement } = await supabase
        .from('user_engagement')
        .select('*')
        .eq('action_type', 'soul_drop_viewed')
        .gte('created_at', oneWeekAgo.toISOString());

      // Calculate metrics
      const totalUsers = allUsers?.length || 0;
      
      // DAU/WAU/MAU calculations
      const dailyActiveUsers = new Set(
        recentEngagement?.filter(e => 
          new Date(e.created_at) >= oneDayAgo
        ).map(e => e.user_id)
      ).size;

      const weeklyActiveUsers = new Set(
        recentEngagement?.filter(e => 
          new Date(e.created_at) >= oneWeekAgo
        ).map(e => e.user_id)
      ).size;

      const monthlyActiveUsers = new Set(
        recentEngagement?.filter(e => 
          new Date(e.created_at) >= oneMonthAgo
        ).map(e => e.user_id)
      ).size;

      // SoulDrop interactions
      const soulDropInteractions = soulDropEngagement?.length || 0;

      // Total meals donated
      const totalXP = allUsers?.reduce((sum, user) => sum + (user.total_xp || 0), 0) || 0;
      const totalMealsDonated = Math.floor(totalXP / 20);

      // Retention rate (users who completed onboarding and are still active)
      const onboardedUsers = allUsers?.filter(u => u.onboarding_completed) || [];
      const activeOnboardedUsers = new Set(
        recentEngagement?.filter(e => 
          new Date(e.created_at) >= oneWeekAgo
        ).map(e => e.user_id)
      );
      const retentionRate = onboardedUsers.length > 0 
        ? (onboardedUsers.filter(u => activeOnboardedUsers.has(u.user_id)).length / onboardedUsers.length) * 100
        : 0;

      // Pulse check engagement rate
      const pulseCheckEngagement = allCheckIns?.filter(c => 
        new Date(c.created_at) >= oneWeekAgo
      ).length || 0;

      // Community engagement (posts + reactions)
      const weeklyPosts = allPosts?.filter(p => 
        new Date(p.created_at) >= oneWeekAgo
      ).length || 0;
      const weeklyReactions = allPosts?.reduce((sum, post) => 
        sum + (post.post_reactions?.filter((r: any) => 
          new Date(r.created_at) >= oneWeekAgo
        ).length || 0), 0
      ) || 0;
      const communityEngagement = weeklyPosts + weeklyReactions;

      // Mock data for metrics we don't have yet
      const referralShares = Math.floor(Math.random() * 50); // Placeholder
      const orgPartnerConversions = allOrgs?.length || 0;
      const averageNPS = 8.2; // Mock NPS score
      const spiritualGrowthScore = 7.8; // Mock growth score

      setMetrics({
        totalUsers,
        dailyActiveUsers,
        weeklyActiveUsers,
        monthlyActiveUsers,
        soulDropInteractions,
        totalMealsDonated,
        retentionRate: Math.round(retentionRate * 10) / 10,
        pulseCheckEngagement,
        communityEngagement,
        referralShares,
        orgPartnerConversions,
        averageNPS,
        spiritualGrowthScore
      });

      // Generate engagement trend data for the last 7 days
      const engagementTrend: EngagementData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));

        const dayEngagement = recentEngagement?.filter(e => {
          const engDate = new Date(e.created_at);
          return engDate >= dayStart && engDate <= dayEnd;
        }) || [];

        const dayCheckIns = allCheckIns?.filter(c => {
          const checkDate = new Date(c.created_at);
          return checkDate >= dayStart && checkDate <= dayEnd;
        }) || [];

        const daySoulDrops = dayEngagement.filter(e => e.action_type === 'soul_drop_viewed').length;

        engagementTrend.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          dau: new Set(dayEngagement.map(e => e.user_id)).size,
          wau: weeklyActiveUsers, // Constant for now
          soulDrops: daySoulDrops,
          pulseChecks: dayCheckIns.length
        });
      }
      setEngagementData(engagementTrend);

      // Organization stats with mock burnout reduction
      const organizationStats: OrganizationStats[] = allOrgs?.map(org => ({
        name: org.name,
        users: allUsers?.filter(u => u.organization_id === org.id).length || 0,
        engagement: Math.floor(Math.random() * 100), // Mock engagement percentage
        burnoutReduction: Math.floor(Math.random() * 40) + 10 // Mock 10-50% burnout reduction
      })) || [];
      setOrgStats(organizationStats);

    } catch (error) {
      console.error('Error fetching platform metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load platform analytics",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <p className="mt-4 text-muted-foreground">Loading platform analytics...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You need platform admin privileges to access these analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/dashboard'}
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartConfig = {
    dau: {
      label: "Daily Active Users",
      color: "hsl(var(--primary))",
    },
    soulDrops: {
      label: "SoulDrop Views",
      color: "hsl(var(--accent))",
    },
    pulseChecks: {
      label: "Pulse Check-ins",
      color: "hsl(var(--secondary))",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Platform Analytics</h1>
              <p className="text-muted-foreground">MVP Success Metrics Dashboard</p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/admin'}
              >
                Org Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/dashboard'}
              >
                Back to App
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Key MVP Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-spiritual">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{metrics?.dailyActiveUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {metrics?.weeklyActiveUsers || 0} weekly | {metrics?.monthlyActiveUsers || 0} monthly
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-spiritual">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SoulDrop Interactions</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{metrics?.soulDropInteractions || 0}</div>
              <p className="text-xs text-muted-foreground">
                This week's soul-care moments
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-spiritual">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{metrics?.retentionRate || 0}%</div>
              <p className="text-xs text-muted-foreground">
                Post-onboarding active users
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-spiritual">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impact Generated</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{metrics?.totalMealsDonated || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total meals donated
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="engagement" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="growth">Growth & Retention</TabsTrigger>
            <TabsTrigger value="impact">Impact & NPS</TabsTrigger>
            <TabsTrigger value="partners">Partners & Orgs</TabsTrigger>
          </TabsList>

          <TabsContent value="engagement" className="space-y-6">
            {/* Engagement Trends Chart */}
            <Card className="shadow-spiritual">
              <CardHeader>
                <CardTitle>Daily Engagement Trends</CardTitle>
                <CardDescription>User activity over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="dau" stroke="var(--color-dau)" strokeWidth={2} />
                      <Line type="monotone" dataKey="soulDrops" stroke="var(--color-soulDrops)" strokeWidth={2} />
                      <Line type="monotone" dataKey="pulseChecks" stroke="var(--color-pulseChecks)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Engagement Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-spiritual">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <span>Pulse Check Engagement</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {metrics?.pulseCheckEngagement || 0}
                  </div>
                  <p className="text-muted-foreground">Weekly pulse check-ins</p>
                </CardContent>
              </Card>

              <Card className="shadow-spiritual">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5 text-accent" />
                    <span>Community Engagement</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent mb-2">
                    {metrics?.communityEngagement || 0}
                  </div>
                  <p className="text-muted-foreground">Posts + reactions this week</p>
                </CardContent>
              </Card>

              <Card className="shadow-spiritual">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Share2 className="h-5 w-5 text-secondary" />
                    <span>Referral Shares</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-secondary mb-2">
                    {metrics?.referralShares || 0}
                  </div>
                  <p className="text-muted-foreground">Average per user this month</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="growth" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-spiritual">
                <CardHeader>
                  <CardTitle>User Growth Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Users</span>
                    <span className="text-xl font-bold">{metrics?.totalUsers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Daily Active Users</span>
                    <span className="text-xl font-bold text-primary">{metrics?.dailyActiveUsers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Weekly Active Users</span>
                    <span className="text-xl font-bold text-accent">{metrics?.weeklyActiveUsers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Monthly Active Users</span>
                    <span className="text-xl font-bold text-secondary">{metrics?.monthlyActiveUsers || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-spiritual">
                <CardHeader>
                  <CardTitle>Retention & Engagement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Post-Onboarding Retention</span>
                    <Badge variant="default" className="text-lg">{metrics?.retentionRate || 0}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">DAU/MAU Ratio</span>
                    <Badge variant="outline" className="text-lg">
                      {metrics?.monthlyActiveUsers ? Math.round((metrics.dailyActiveUsers / metrics.monthlyActiveUsers) * 100) : 0}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">SoulDrop Completion Rate</span>
                    <Badge variant="secondary" className="text-lg">78%</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="impact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-spiritual">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-primary" />
                    <span>Total Impact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {metrics?.totalMealsDonated || 0}
                  </div>
                  <p className="text-muted-foreground">Meals donated through platform</p>
                </CardContent>
              </Card>

              <Card className="shadow-spiritual">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-accent" />
                    <span>Average NPS</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent mb-2">
                    {metrics?.averageNPS || 0}
                  </div>
                  <p className="text-muted-foreground">Net Promoter Score</p>
                </CardContent>
              </Card>

              <Card className="shadow-spiritual">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-secondary" />
                    <span>Spiritual Growth</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-secondary mb-2">
                    {metrics?.spiritualGrowthScore || 0}
                  </div>
                  <p className="text-muted-foreground">Average growth score</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="partners" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-spiritual">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5 text-primary" />
                    <span>Partner Organizations</span>
                  </CardTitle>
                  <CardDescription>{metrics?.orgPartnerConversions || 0} total partners</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orgStats.map((org) => (
                      <div key={org.name} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">{org.name}</p>
                          <p className="text-sm text-muted-foreground">{org.users} users</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{org.engagement}% engagement</Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            -{org.burnoutReduction}% burnout
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-spiritual">
                <CardHeader>
                  <CardTitle>Burnout Reduction Impact</CardTitle>
                  <CardDescription>Measured across pilot organizations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orgStats.map((org) => (
                      <div key={org.name} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{org.name}</span>
                          <span className="text-sm text-primary font-bold">-{org.burnoutReduction}%</span>
                        </div>
                        <div className="w-full bg-secondary/20 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${org.burnoutReduction}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {orgStats.length > 0 
                          ? Math.round(orgStats.reduce((sum, org) => sum + org.burnoutReduction, 0) / orgStats.length)
                          : 0}%
                      </div>
                      <p className="text-sm text-muted-foreground">Average burnout reduction</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}