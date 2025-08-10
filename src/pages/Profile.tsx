import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import NotificationSettings from '@/components/NotificationSettings';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Star, 
  Gift, 
  Settings,
  Heart,
  TrendingUp,
  Award
} from 'lucide-react';

interface ProfileData {
  id: string;
  display_name: string;
  current_streak: number;
  total_xp: number;
  meals_donated: number;
  role: string;
  faith_background: string;
  personality_style: string;
  created_at: string;
}

interface SoulProfile {
  emotional_state: string;
  personal_goals: string[];
  check_in_keywords: string[];
  preferences: any;
}

interface CheckIn {
  id: string;
  mood: string;
  created_at: string;
  type: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [soulProfile, setSoulProfile] = useState<SoulProfile | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview'|'journey'|'insights'|'settings'>('overview');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('enablePush') === '1') {
      setActiveTab('settings');
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch soul profile
      const { data: soulProfileData } = await supabase
        .from('soul_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (soulProfileData) {
        setSoulProfile(soulProfileData);
      }

      // Fetch recent check-ins
      const { data: checkInsData } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(7);

      if (checkInsData) {
        setRecentCheckIns(checkInsData);
      }

      // Fetch weekly engagement stats
      const { data: engagementData } = await supabase
        .from('user_engagement')
        .select('action_type, xp_earned, created_at')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (engagementData) {
        setWeeklyStats(engagementData);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
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

  const calculateMoodTrends = () => {
    const moodCounts: Record<string, number> = {};
    recentCheckIns.forEach(checkIn => {
      moodCounts[checkIn.mood] = (moodCounts[checkIn.mood] || 0) + 1;
    });
    
    return Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
  };

  const getStrengthLevel = (xp: number) => {
    if (xp >= 1000) return { level: 'Soul Warrior', color: 'text-purple-600', progress: 100 };
    if (xp >= 500) return { level: 'Spirit Guide', color: 'text-blue-600', progress: (xp - 500) / 5 };
    if (xp >= 200) return { level: 'Faith Seeker', color: 'text-green-600', progress: (xp - 200) / 3 };
    if (xp >= 50) return { level: 'Soul Spark', color: 'text-orange-600', progress: (xp - 50) / 1.5 };
    return { level: 'Beginning Soul', color: 'text-gray-600', progress: xp * 2 };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <p className="mt-4 text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const strengthLevel = getStrengthLevel(profile?.total_xp || 0);
  const moodTrends = calculateMoodTrends();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold">Your Soul Profile</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
        {/* Profile Header */}
        <Card className="shadow-spiritual">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">{profile?.display_name}</CardTitle>
            <CardDescription className="flex items-center justify-center space-x-2">
              <Badge variant="outline" className="capitalize">
                {profile?.role}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {profile?.faith_background?.replace('_', ' ')}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary flex items-center justify-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  {profile?.current_streak || 0}
                </div>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent flex items-center justify-center">
                  <Star className="h-5 w-5 mr-2" />
                  {profile?.total_xp || 0}
                </div>
                <p className="text-sm text-muted-foreground">Soul XP</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary flex items-center justify-center">
                  <Gift className="h-5 w-5 mr-2" />
                  {profile?.meals_donated || 0}
                </div>
                <p className="text-sm text-muted-foreground">Meals Donated</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'overview'|'journey'|'insights'|'settings')} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="journey">Journey</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Strength Level */}
            <Card className="shadow-spiritual">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-primary" />
                  <CardTitle>Spiritual Strength Level</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={strengthLevel.color}>
                      {strengthLevel.level}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {profile?.total_xp} XP
                    </span>
                  </div>
                  <Progress value={Math.min(strengthLevel.progress, 100)} />
                  <p className="text-sm text-muted-foreground">
                    Keep engaging with your spiritual practices to grow stronger!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Mood Trends */}
            <Card className="shadow-spiritual">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-primary" />
                  <CardTitle>Recent Mood Patterns</CardTitle>
                </div>
                <CardDescription>Your emotional journey this week</CardDescription>
              </CardHeader>
              <CardContent>
                {moodTrends.length > 0 ? (
                  <div className="space-y-3">
                    {moodTrends.map(([mood, count]) => (
                      <div key={mood} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{getMoodEmoji(mood)}</span>
                          <span className="capitalize">{mood}</span>
                        </div>
                        <Badge variant="outline">
                          {count} time{count > 1 ? 's' : ''}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Start checking in daily to see your mood patterns
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="journey" className="space-y-6">
            {/* Personal Goals */}
            {soulProfile?.personal_goals && (
              <Card className="shadow-spiritual">
                <CardHeader>
                  <CardTitle>Your Personal Goals</CardTitle>
                  <CardDescription>What you're working towards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {soulProfile.personal_goals.map((goal) => (
                      <Badge key={goal} variant="outline">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Check-in Keywords */}
            {soulProfile?.check_in_keywords && (
              <Card className="shadow-spiritual">
                <CardHeader>
                  <CardTitle>Your Check-in Keywords</CardTitle>
                  <CardDescription>Words that resonate with you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {soulProfile.check_in_keywords.map((keyword) => (
                      <Badge key={keyword} variant="outline">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* Weekly Activity */}
            <Card className="shadow-spiritual">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle>This Week's Activity</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {weeklyStats.length > 0 ? (
                  <div className="space-y-3">
                    {weeklyStats.slice(0, 5).map((stat, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm capitalize">
                          {stat.action_type.replace('_', ' ')}
                        </span>
                        <Badge variant="outline">
                          +{stat.xp_earned} XP
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No activity this week. Start your soul journey today!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Check-in History */}
            <Card className="shadow-spiritual">
              <CardHeader>
                <CardTitle>Recent Check-ins</CardTitle>
              </CardHeader>
              <CardContent>
                {recentCheckIns.length > 0 ? (
                  <div className="space-y-2">
                    {recentCheckIns.map((checkIn) => (
                      <div key={checkIn.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getMoodEmoji(checkIn.mood)}</span>
                          <span className="capitalize">{checkIn.mood}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {new Date(checkIn.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No check-ins yet. Start tracking your emotional journey!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {/* Notification Settings */}
            <NotificationSettings />

            <Card className="shadow-spiritual">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <CardTitle>Account Settings</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Profile Information</h4>
                  <p className="text-sm text-muted-foreground">
                    Name: {profile?.display_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Email: {user?.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Member since: {new Date(profile?.created_at || '').toLocaleDateString()}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="w-full">
                    Retake SoulScan Quiz
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={signOut}
                  >
                    Sign Out
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