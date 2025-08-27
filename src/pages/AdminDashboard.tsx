import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
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
  Download,
  UserPlus,
  UserMinus,
  Mail,
  X,
  MessageSquare,
  Copy,
  Plus
} from 'lucide-react';
import SlackIntegration from '@/components/partner-admin/SlackIntegration';

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

interface GroupData {
  group: string;
  members: number;
  active: number;
  checkins: number;
  meals: number;
}

interface Cohort {
  id: string;
  name: string;
  members: number;
  invites: number;
  status: string;
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

  // Mock groups data (in production, this would come from database)
  const [groupsData] = useState<GroupData[]>([
    { group: "Marketing", members: 45, active: 89, checkins: 34, meals: 156 },
    { group: "Engineering", members: 67, active: 93, checkins: 52, meals: 231 },
    { group: "Sales", members: 28, active: 82, checkins: 19, meals: 87 },
    { group: "Support", members: 23, active: 95, checkins: 21, meals: 98 }
  ]);

  // Cohort management state
  const [cohorts, setCohorts] = useState<Cohort[]>([
    { id: "1", name: "Q1 Wellness Challenge", members: 45, invites: 8, status: "Active" },
    { id: "2", name: "Leadership Development", members: 23, invites: 2, status: "Active" },
    { id: "3", name: "New Employee Onboarding", members: 12, invites: 15, status: "Recruiting" }
  ]);
  const [showCreateCohort, setShowCreateCohort] = useState(false);
  const [newCohortName, setNewCohortName] = useState('');

  // Content upload form state
  const [contentForm, setContentForm] = useState({
    title: '',
    content: '',
    contentType: 'souldrop',
    targetMoods: [] as string[],
    targetRoles: [] as string[]
  });

  // User management state
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'student' | 'employee' | 'athlete'>('student');

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

  const handleAddUser = async () => {
    if (!newUserEmail || !organization) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    // Check seat limits
    if (organization.current_seats >= organization.max_seats) {
      toast({
        title: "Seat limit reached",
        description: `Your ${organization.pricing_plan} plan allows up to ${organization.max_seats} seats. Please upgrade your plan to add more users.`,
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if user exists by looking for an existing profile first
      const { data: existingProfileByEmail } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', newUserEmail) // This is a placeholder - we'll improve this
        .maybeSingle();

      // For now, we'll simulate finding the user by creating a simple method
      // In production, you'd want to improve this user lookup logic
      const existingUser = { 
        id: newUserEmail, // Placeholder ID 
        email: newUserEmail,
        user_metadata: { full_name: null }
      };
      
      if (!newUserEmail.includes('@')) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address",
          variant: "destructive"
        });
        return;
      }

      // Check if user already has a profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', existingUser.id)
        .maybeSingle();

      if (existingProfile?.organization_id) {
        toast({
          title: "User already assigned",
          description: "This user is already part of an organization",
          variant: "destructive"
        });
        return;
      }

      // Update or create profile with organization
      if (existingProfile) {
        await supabase
          .from('profiles')
          .update({
            organization_id: organization.id,
            role: newUserRole as any
          })
          .eq('user_id', existingUser.id);
      } else {
        await supabase
          .from('profiles')
          .insert({
            user_id: existingUser.id,
            organization_id: organization.id,
            role: newUserRole as any,
            display_name: existingUser.user_metadata?.full_name || existingUser.email || ''
          });
      }

      // Update organization seat count
      await supabase
        .from('organizations')
        .update({ current_seats: organization.current_seats + 1 })
        .eq('id', organization.id);

      toast({
        title: "User added successfully!",
        description: `${newUserEmail} has been added to your organization`
      });

      // Reset form and refresh data
      setNewUserEmail('');
      setNewUserRole('student');
      setShowAddUser(false);
      await fetchDashboardData(organization.id);
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "Failed to add user",
        description: "An error occurred while adding the user",
        variant: "destructive"
      });
    }
  };

  const handleRemoveUser = async (userId: string, userDisplayName: string) => {
    if (!organization) return;

    try {
      await supabase
        .from('profiles')
        .update({ organization_id: null, role: null })
        .eq('user_id', userId);

      // Update organization seat count
      await supabase
        .from('organizations')
        .update({ current_seats: Math.max(0, organization.current_seats - 1) })
        .eq('id', organization.id);

      toast({
        title: "User removed successfully!",
        description: `${userDisplayName} has been removed from your organization`
      });

      await fetchDashboardData(organization.id);
    } catch (error) {
      console.error('Error removing user:', error);
      toast({
        title: "Failed to remove user",
        description: "An error occurred while removing the user",
        variant: "destructive"
      });
    }
  };

  const handleCreateCohort = () => {
    if (!newCohortName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a cohort name",
        variant: "destructive"
      });
      return;
    }

    const newCohort: Cohort = {
      id: Date.now().toString(),
      name: newCohortName,
      members: 0,
      invites: 0,
      status: "Recruiting"
    };

    setCohorts([...cohorts, newCohort]);
    setNewCohortName('');
    setShowCreateCohort(false);

    toast({
      title: "Cohort created successfully!",
      description: `${newCohortName} has been created`
    });
  };

  const copyInviteLink = (cohortName: string) => {
    const inviteLink = `${window.location.origin}/invite/${organization?.code}/${cohortName.replace(/\s+/g, '-').toLowerCase()}`;
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Invite link copied!",
      description: "Share this link with potential members"
    });
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
        {/* Plan Info */}
        <Card className="shadow-spiritual border-accent/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Current Plan: {organization?.pricing_plan?.charAt(0).toUpperCase() + organization?.pricing_plan?.slice(1)}</CardTitle>
                <CardDescription>
                  {organization?.current_seats || 0} of {organization?.max_seats || 0} seats used
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Seat Usage</div>
                <div className="text-2xl font-bold">
                  {Math.round(((organization?.current_seats || 0) / (organization?.max_seats || 1)) * 100)}%
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(((organization?.current_seats || 0) / (organization?.max_seats || 1)) * 100, 100)}%` 
                }}
              />
            </div>
            {organization?.current_seats >= organization?.max_seats && (
              <div className="text-sm text-destructive">
                ⚠️ You've reached your seat limit. Consider upgrading your plan to add more users.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
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

        {/* Impact Engine - No Kid Hungry */}
        <Card className="shadow-spiritual">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" /> Impact Engine — No Kid Hungry
            </CardTitle>
            <CardDescription>Progress to 1,000,000 meals this year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-semibold text-foreground">{(stats?.totalMealsDonated || 0).toLocaleString()} meals YTD</div>
                <p className="text-sm text-muted-foreground">Goal: 1,000,000</p>
              </div>
              <div className="text-sm text-muted-foreground">{Math.min(100, Math.round(((stats?.totalMealsDonated || 0)/1000000)*100))}%</div>
            </div>
            <div className="mt-3 h-3 w-full rounded-full bg-muted">
              <div
                className="h-3 rounded-full bg-primary"
                style={{ width: `${Math.min(100, Math.round(((stats?.totalMealsDonated || 0)/1000000)*100))}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Live organization impact data</p>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="slack">
              <MessageSquare className="h-4 w-4 mr-1" />
              Slack
            </TabsTrigger>
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

          <TabsContent value="groups" className="space-y-6">
            <Card className="shadow-spiritual">
              <CardHeader>
                <CardTitle>Overview by Groups</CardTitle>
                <CardDescription>Performance metrics across different groups</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Group</TableHead>
                      <TableHead className="text-right">Members</TableHead>
                      <TableHead className="text-right">Active %</TableHead>
                      <TableHead className="text-right">Check-ins (today)</TableHead>
                      <TableHead className="text-right">Meals Donated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupsData.map((group) => (
                      <TableRow key={group.group}>
                        <TableCell className="font-medium">{group.group}</TableCell>
                        <TableCell className="text-right">{group.members}</TableCell>
                        <TableCell className="text-right">{group.active}%</TableCell>
                        <TableCell className="text-right">{group.checkins}</TableCell>
                        <TableCell className="text-right">{group.meals}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cohorts" className="space-y-6">
            <Card className="shadow-spiritual">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Cohort Management</CardTitle>
                    <CardDescription>Organize users into focused groups</CardDescription>
                  </div>
                  <Button 
                    onClick={() => setShowCreateCohort(true)}
                    className="flex items-center space-x-2"
                    variant="spiritual"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Cohort</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showCreateCohort && (
                  <Card className="mb-6 border-2 border-primary/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Create New Cohort</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowCreateCohort(false);
                            setNewCohortName('');
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cohortName">Cohort Name</Label>
                        <Input
                          id="cohortName"
                          placeholder="e.g., Q2 Wellness Challenge"
                          value={newCohortName}
                          onChange={(e) => setNewCohortName(e.target.value)}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          onClick={handleCreateCohort}
                          disabled={!newCohortName.trim()}
                          className="flex items-center space-x-2"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Create Cohort</span>
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setShowCreateCohort(false);
                            setNewCohortName('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cohort</TableHead>
                      <TableHead className="text-right">Members</TableHead>
                      <TableHead className="text-right">Active Invites</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cohorts.map((cohort) => (
                      <TableRow key={cohort.id}>
                        <TableCell className="font-medium">{cohort.name}</TableCell>
                        <TableCell className="text-right">{cohort.members}</TableCell>
                        <TableCell className="text-right">{cohort.invites}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={cohort.status === 'Active' ? 'default' : 'secondary'}>
                            {cohort.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex space-x-1 justify-end">
                            <Button variant="outline" size="sm">
                              Manage
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => copyInviteLink(cohort.name)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="shadow-spiritual">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Organization Members</CardTitle>
                    <CardDescription>
                      {users.length} total members
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => setShowAddUser(true)}
                    className="flex items-center space-x-2"
                    variant="spiritual"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Add User</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAddUser && (
                  <Card className="mb-6 border-2 border-primary/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Add New User</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowAddUser(false);
                            setNewUserEmail('');
                            setNewUserRole('student');
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="userEmail">Email Address</Label>
                          <Input
                            id="userEmail"
                            type="email"
                            placeholder="user@example.com"
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="userRole">Role</Label>
                          <Select value={newUserRole} onValueChange={(value) => setNewUserRole(value as 'student' | 'employee' | 'athlete')}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="employee">Employee</SelectItem>
                              <SelectItem value="athlete">Athlete</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          onClick={handleAddUser}
                          disabled={!newUserEmail}
                          className="flex items-center space-x-2"
                        >
                          <Mail className="h-4 w-4" />
                          <span>Add User</span>
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setShowAddUser(false);
                            setNewUserEmail('');
                            setNewUserRole('student');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <div className="space-y-4">
                  {users.length > 0 ? users.map((user) => (
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
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">{user.total_xp} XP</p>
                          <p className="text-sm text-muted-foreground">
                            Since {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveUser(user.id, user.display_name)}
                          className="text-destructive hover:text-destructive"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No users in your organization yet</p>
                      <p className="text-sm text-muted-foreground">Add users to get started</p>
                    </div>
                  )}
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

          <TabsContent value="slack" className="space-y-6">
            {organization && (
              <SlackIntegration 
                organizationId={organization.id} 
                organizationName={organization.name} 
              />
            )}
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