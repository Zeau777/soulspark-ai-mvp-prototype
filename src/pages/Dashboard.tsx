import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { speakText } from '@/utils/tts';
import { 
  Flame, 
  MessageSquare, 
  Heart, 
  Target, 
  Calendar,
  Star,
  Gift,
  TrendingUp,
  User,
  Users,
  Sparkles,
  Volume2,
  Loader2,
  LogOut
} from 'lucide-react';
import QuickFeedback from "@/components/feedback/QuickFeedback";
import FeedbackModal from "@/components/feedback/FeedbackModal";
import HabitLoopFramework from "@/components/habits/HabitLoopFramework";
import SmartNotificationSystem from "@/components/notifications/SmartNotificationSystem";

interface Profile {
  id: string;
  display_name: string;
  current_streak: number;
  total_xp: number;
  meals_donated: number;
  onboarding_completed: boolean;
}

interface SoulDrop {
  id: string;
  title: string;
  content: string;
  content_type: string;
}

interface CheckIn {
  id: string;
  mood: string;
  created_at: string;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [soulDrop, setSoulDrop] = useState<SoulDrop | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
const navigate = useNavigate();
const [likedToday, setLikedToday] = useState(false);
const [speaking, setSpeaking] = useState(false);
const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
const [activeTab, setActiveTab] = useState<'overview' | 'habits' | 'notifications'>('overview');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      
      // Request notification permission on dashboard load
      if ('Notification' in window && Notification.permission === 'default') {
        setTimeout(() => {
          toast({
            title: "Stay connected with your soul",
            description: "Enable notifications to get gentle daily check-in reminders. You can always change this in settings.",
            action: (
              <Button 
                size="sm" 
                onClick={() => {
                  if ('Notification' in window) {
                    Notification.requestPermission();
                  }
                }}
              >
                Enable
              </Button>
            ),
          });
        }, 3000);
      }
    }
  }, [user]);

  const fetchDashboardData = async () => {
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

      // Fetch daily soul drop
      const { data: soulDropData } = await supabase
        .rpc('get_daily_soul_drop', { p_user_id: user.id });

      if (soulDropData && soulDropData.length > 0) {
        setSoulDrop(soulDropData[0]);
      }

      // Fetch recent check-ins
      const { data: checkInsData } = await supabase
        .from('check_ins')
        .select('id, mood, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (checkInsData) {
        setRecentCheckIns(checkInsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Listen and Like for Today's SoulDrop
  useEffect(() => {
    const refreshLikeToday = async () => {
      if (!soulDrop) return;
      const { data } = await supabase
        .from('user_engagement')
        .select('content_id')
        .eq('action_type', 'souldrop_like')
        .eq('content_id', soulDrop.id);
      setLikedToday(!!data && data.length > 0);
    };
    if (user && soulDrop?.id) {
      refreshLikeToday();
    }
  }, [user?.id, soulDrop?.id]);

  const toggleLikeToday = async () => {
    if (!user || !soulDrop) return;
    const isLiked = likedToday;
    setLikedToday(!isLiked);
    if (isLiked) {
      const { error } = await supabase
        .from('user_engagement')
        .delete()
        .eq('action_type', 'souldrop_like')
        .eq('content_id', soulDrop.id);
      if (error) {
        setLikedToday(true);
        toast({ title: 'Could not unlike', description: error.message, variant: 'destructive' });
      }
    } else {
      const { error } = await supabase.from('user_engagement').insert({
        user_id: user.id,
        action_type: 'souldrop_like',
        content_id: soulDrop.id,
        metadata: { source: 'dashboard', content_type: soulDrop.content_type },
      });
      if (error) {
        setLikedToday(false);
        toast({ title: 'Could not like', description: error.message, variant: 'destructive' });
      }
    }
  };

  const handleListenToday = async () => {
    if (!soulDrop) return;
    try {
      setSpeaking(true);
      await speakText(`${soulDrop.title}. ${soulDrop.content}`);
    } catch (e: any) {
      toast({ title: 'Playback failed', description: e?.message || 'Could not play audio', variant: 'destructive' });
    } finally {
      setSpeaking(false);
    }
  };

  const handleCheckIn = async (mood: string) => {
    if (!user) return;

    try {
      await supabase
        .from('check_ins')
        .insert({
          user_id: user.id,
          mood: mood as any,
          type: 'daily'
        });

      await supabase.rpc('update_user_engagement', {
        p_user_id: user.id,
        p_action_type: 'daily_checkin',
        p_xp_earned: 20
      });

      toast({
        title: "Check-in recorded! 🙏",
        description: "+20 XP earned. Your soul journey continues."
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error recording check-in:', error);
      toast({
        title: "Error",
        description: "Failed to record check-in. Please try again.",
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
          <Flame className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <p className="mt-4 text-muted-foreground">Loading your soul dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile?.onboarding_completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Complete Your Soul Profile</CardTitle>
            <CardDescription>
              Finish setting up your personalized experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              variant="spiritual"
              onClick={() => navigate('/onboarding')}
            >
              Complete Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-full">
              <Flame className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">SoulSpark AI</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {profile?.display_name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/chat')} className="p-2 md:px-3">
              <MessageSquare className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Soul Coach</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')} className="p-2 md:px-3">
              <User className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Profile</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut} className="p-2 md:px-3">
              <LogOut className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('overview')}
            className="flex-1"
          >
            Overview
          </Button>
          <Button
            variant={activeTab === 'habits' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('habits')}
            className="flex-1"
          >
            SoulSpark Loop
          </Button>
          <Button
            variant={activeTab === 'notifications' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('notifications')}
            className="flex-1"
          >
            Smart Reminders
          </Button>
        </div>
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-spiritual">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Soul Streak</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {profile?.current_streak || 0} 🔥
              </div>
              <p className="text-xs text-muted-foreground">
                Days in a row
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-spiritual">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Soul XP</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {profile?.total_xp || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Experience points
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-spiritual">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impact</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">
                {profile?.meals_donated || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Meals donated
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Daily SoulDrop */}
        {soulDrop && (
          <Card className="shadow-spiritual">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-primary" />
                <CardTitle>Today's SoulDrop</CardTitle>
                <Badge variant="outline">{soulDrop.content_type}</Badge>
              </div>
              <CardDescription>{soulDrop.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed mb-4">
                {soulDrop.content}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={handleListenToday} disabled={speaking}>
                  {speaking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Volume2 className="mr-2 h-4 w-4" />}
                  Listen
                </Button>
                <Button variant="secondary" size="sm" onClick={toggleLikeToday}>
                  <Heart className="mr-2 h-4 w-4" /> {likedToday ? 'Liked' : 'Like'}
                </Button>
                <Button variant="outline" size="sm">
                  Save to Fuel Moments
                </Button>
              </div>
              
              {/* SoulDrop Feedback */}
              <QuickFeedback
                featureType="souldrop"
                contentId={soulDrop.id}
                onDetailedFeedback={() => setFeedbackModalOpen(true)}
              />
            </CardContent>
          </Card>
        )}

        {/* Quick Check-in */}
        <Card className="shadow-spiritual">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Pulse Check-In</CardTitle>
            </div>
            <CardDescription>How's your soul today?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
              {['peaceful', 'joyful', 'grateful', 'anxious', 'overwhelmed'].map((mood) => (
                <Button
                  key={mood}
                  variant="outline"
                  onClick={() => handleCheckIn(mood)}
                  className="flex flex-col space-y-1 h-auto py-3"
                >
                  <span className="text-xl">{getMoodEmoji(mood)}</span>
                  <span className="text-xs capitalize">{mood}</span>
                </Button>
              ))}
            </div>
            
            {/* Recent Check-ins */}
            {recentCheckIns.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Recent Check-ins</h4>
                <div className="flex space-x-2">
                  {recentCheckIns.slice(0, 5).map((checkIn) => (
                    <Badge key={checkIn.id} variant="outline" className="text-xs">
                      {getMoodEmoji(checkIn.mood)} {checkIn.mood}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-spiritual cursor-pointer hover:shadow-glow transition-all" 
                onClick={() => navigate('/chat')}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle>Talk to Your Soul Coach</CardTitle>
              </div>
              <CardDescription>
                Get personalized guidance, prayer support, or just someone to listen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="spiritual" className="w-full">
                Start Conversation
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-spiritual">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle>Weekly Goals</CardTitle>
              </div>
              <CardDescription>Track your spiritual growth journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Daily check-ins</span>
                  <span>4/7</span>
                </div>
                <Progress value={57} />
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Goals
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-spiritual cursor-pointer hover:shadow-glow transition-all"
                onClick={() => navigate('/for-you')}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>For You Feed</CardTitle>
              </div>
              <CardDescription>
                Endless personalized SoulDrops curated for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="spiritual" className="w-full">
                Open Feed
              </Button>
            </CardContent>
          </Card>
        </div>
            </>
          )}

          {activeTab === 'habits' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Your SoulSpark Loop</h2>
                <p className="text-muted-foreground">
                  Build lasting habits that transform moments into meaning
                </p>
              </div>
              <HabitLoopFramework />
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Smart Soul-Care Reminders</h2>
                <p className="text-muted-foreground">
                  Contextual notifications that adapt to your rhythm and needs
                </p>
              </div>
              <SmartNotificationSystem />
            </div>
          )}
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        featureType="souldrop"
        contentId={soulDrop?.id}
        onFeedbackSubmitted={() => {}}
      />

      {/* Fixed bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1"
            onClick={() => navigate('/dashboard')}
          >
            <Flame className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1"
            onClick={() => navigate('/for-you')}
          >
            <Sparkles className="h-5 w-5" />
            <span className="text-xs">For You</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1"
            onClick={() => navigate('/chat')}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs">Chat</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1"
            onClick={() => navigate('/community')}
          >
            <Users className="h-5 w-5" />
            <span className="text-xs">Community</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1"
            onClick={() => navigate('/profile')}
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>
    </div>
  );
}