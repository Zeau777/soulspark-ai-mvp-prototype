import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  Heart, 
  Calendar,
  Upload,
  BarChart3,
  Settings,
  Download
} from 'lucide-react';

interface OrgStats {
  totalUsers: number;
  dailyCheckIns: number;
  weeklyEngagement: number;
  totalMealsDonated: number;
  averageStreak: number;
  topMoods: Array<{ mood: string; count: number }>;
}

interface User {
  id: string;
  display_name: string;
  role: string;
  current_streak: number;
  total_xp: number;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<OrgStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [organization, setOrganization] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Content upload form state
  const [contentForm, setContentForm] = useState({
    title: '',
    content: '',
    contentType: 'souldrop',
    targetMoods: [] as string[],
    targetRoles: [] as string[]
  });

  useEffect(() => {
    if (user) {
      checkAdminAccess();
    }
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) return;

    try {
      // Check if user is an organization admin
      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('admin_email', user.email)
        .single();

      if (orgData) {
        setOrganization(orgData);
        setIsAdmin(true);
        await fetchDashboardData(orgData.id);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async (organizationId: string) => {
    try {
      // Fetch organization users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, display_name, role, current_streak, total_xp, created_at')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (usersData) {
        setUsers(usersData);
      }

      // Calculate stats
      const totalUsers = usersData?.length || 0;
      const totalXP = usersData?.reduce((sum, user) => sum + (user.total_xp || 0), 0) || 0;
      const totalMealsDonated = Math.floor(totalXP / 20); // 20 XP = 1 meal
      const averageStreak = totalUsers > 0 
        ? (usersData?.reduce((sum, user) => sum + (user.current_streak || 0), 0) || 0) / totalUsers
        : 0;

      // Fetch recent check-ins for engagement stats
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: checkInsData } = await supabase
        .from('check_ins')
        .select('mood, user_id, created_at')
        .in('user_id', usersData?.map(u => u.id) || [])
        .gte('created_at', sevenDaysAgo);

      const dailyCheckIns = checkInsData?.filter(c => 
        new Date(c.created_at) >= new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length || 0;

      const weeklyEngagement = checkInsData?.length || 0;

      // Calculate top moods
      const moodCounts: Record<string, number> = {};
      checkInsData?.forEach(checkIn => {
        moodCounts[checkIn.mood] = (moodCounts[checkIn.mood] || 0) + 1;
      });

      const topMoods = Object.entries(moodCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([mood, count]) => ({ mood, count }));

      setStats({
        totalUsers,
        dailyCheckIns,
        weeklyEngagement,
        totalMealsDonated,
        averageStreak: Math.round(averageStreak * 10) / 10,
        topMoods
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleContentUpload = async () => {
    if (!user || !organization || !contentForm.title || !contentForm.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await supabase
        .from('soul_drops')
        .insert({
          title: contentForm.title,
          content: contentForm.content,
          content_type: contentForm.contentType as any,
          target_moods: contentForm.targetMoods.length > 0 ? contentForm.targetMoods as any : null,
          target_roles: contentForm.targetRoles.length > 0 ? contentForm.targetRoles as any : null,
          created_by: user.id,
          is_active: true
        });

      toast({
        title: "Content uploaded successfully!",
        description: "Your soul content is now available to organization members."
      });

      // Reset form
      setContentForm({
        title: '',
        content: '',
        contentType: 'souldrop',
        targetMoods: [],
        targetRoles: []
      });
    } catch (error) {
      console.error('Error uploading content:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload content. Please try again.",
        variant: "destructive"
      });
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <Settings className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <p className="mt-4 text-muted-foreground">Loading admin dashboard...</p>
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
              You need admin privileges to access this dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">{organization?.name}</p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => navigate('/analytics')}
              >
                Platform Analytics
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                Back to App
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-spiritual">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active organization members
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-spiritual">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Check-ins</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats?.dailyCheckIns || 0}</div>
              <p className="text-xs text-muted-foreground">
                Today's participation
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-spiritual">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Engagement</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{stats?.weeklyEngagement || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total interactions this week
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-spiritual">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impact Generated</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats?.totalMealsDonated || 0}</div>
              <p className="text-xs text-muted-foreground">
                Meals donated through engagement
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Top Moods */}
            <Card className="shadow-spiritual">
              <CardHeader>
                <CardTitle>Emotional Pulse</CardTitle>
                <CardDescription>Most common moods this week</CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.topMoods && stats.topMoods.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topMoods.map(({ mood, count }) => (
                      <div key={mood} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{getMoodEmoji(mood)}</span>
                          <span className="capitalize">{mood}</span>
                        </div>
                        <Badge variant="outline">{count} check-ins</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No mood data available yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Average Streak */}
            <Card className="shadow-spiritual">
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {stats?.averageStreak || 0} days
                  </div>
                  <p className="text-muted-foreground">Average user streak</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="shadow-spiritual">
              <CardHeader>
                <CardTitle>Organization Members</CardTitle>
                <CardDescription>
                  {users.length} total members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{user.display_name}</p>
                        <div className="flex space-x-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {user.role}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {user.current_streak} day streak
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{user.total_xp} XP</p>
                        <p className="text-sm text-muted-foreground">
                          Since {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card className="shadow-spiritual">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-primary" />
                  <CardTitle>Upload Soul Content</CardTitle>
                </div>
                <CardDescription>
                  Create inspirational content for your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter content title"
                      value={contentForm.title}
                      onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contentType">Content Type</Label>
                    <Select
                      value={contentForm.contentType}
                      onValueChange={(value) => setContentForm({ ...contentForm, contentType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="souldrop">SoulDrop</SelectItem>
                        <SelectItem value="prayer">Prayer</SelectItem>
                        <SelectItem value="meditation">Meditation</SelectItem>
                        <SelectItem value="devotional">Devotional</SelectItem>
                        <SelectItem value="affirmation">Affirmation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your inspirational content here..."
                    value={contentForm.content}
                    onChange={(e) => setContentForm({ ...contentForm, content: e.target.value })}
                    rows={6}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Moods (Optional)</Label>
                    <div className="flex flex-wrap gap-2">
                      {['anxious', 'peaceful', 'lost', 'tired', 'joyful', 'stressed', 'hopeful', 'overwhelmed', 'grateful', 'restless'].map((mood) => (
                        <Badge
                          key={mood}
                          variant={contentForm.targetMoods.includes(mood) ? "default" : "outline"}
                          className="cursor-pointer text-xs"
                          onClick={() => {
                            const moods = contentForm.targetMoods.includes(mood)
                              ? contentForm.targetMoods.filter(m => m !== mood)
                              : [...contentForm.targetMoods, mood];
                            setContentForm({ ...contentForm, targetMoods: moods });
                          }}
                        >
                          {mood}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Target Roles (Optional)</Label>
                    <div className="flex flex-wrap gap-2">
                      {['student', 'employee', 'athlete'].map((role) => (
                        <Badge
                          key={role}
                          variant={contentForm.targetRoles.includes(role) ? "default" : "outline"}
                          className="cursor-pointer text-xs"
                          onClick={() => {
                            const roles = contentForm.targetRoles.includes(role)
                              ? contentForm.targetRoles.filter(r => r !== role)
                              : [...contentForm.targetRoles, role];
                            setContentForm({ ...contentForm, targetRoles: roles });
                          }}
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={handleContentUpload}
                  className="w-full"
                  variant="spiritual"
                  disabled={!contentForm.title || !contentForm.content}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Content
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="shadow-spiritual">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <CardTitle>Analytics & Reports</CardTitle>
                </div>
                <CardDescription>
                  Export detailed analytics for your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2">
                    <Download className="h-6 w-6" />
                    <span>User Engagement Report</span>
                    <span className="text-xs text-muted-foreground">
                      Daily check-ins, streaks, and XP data
                    </span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2">
                    <Download className="h-6 w-6" />
                    <span>Mood Trends Report</span>
                    <span className="text-xs text-muted-foreground">
                      Emotional wellness insights
                    </span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2">
                    <Download className="h-6 w-6" />
                    <span>Impact Summary</span>
                    <span className="text-xs text-muted-foreground">
                      Meals donated and community impact
                    </span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2">
                    <Download className="h-6 w-6" />
                    <span>Full Analytics</span>
                    <span className="text-xs text-muted-foreground">
                      Complete organization report
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}