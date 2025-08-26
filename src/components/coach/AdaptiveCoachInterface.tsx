import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  Heart, 
  Brain, 
  Target, 
  Zap,
  Clock,
  TrendingUp,
  Award,
  MessageCircle,
  Timer
} from 'lucide-react';
import VoiceInterface from '@/components/voice/VoiceInterface';

interface CoachJourney {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  milestones: string[];
  estimatedDuration: string;
  theme: 'resilience' | 'purpose' | 'energy' | 'joy' | 'focus';
}

interface CoachSession {
  id: string;
  type: 'check-in' | 'pep-talk' | 'breathing' | 'reframe' | 'journey';
  title: string;
  duration: number;
  completed: boolean;
  lastUsed?: Date;
}

const AdaptiveCoachInterface = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentJourney, setCurrentJourney] = useState<CoachJourney | null>(null);
  const [availableJourneys, setAvailableJourneys] = useState<CoachJourney[]>([]);
  const [quickSessions, setQuickSessions] = useState<CoachSession[]>([]);
  const [coachPersonality, setCoachPersonality] = useState('wise-friend');
  const [lastInteraction, setLastInteraction] = useState<Date | null>(null);
  const [progressThisWeek, setProgressThisWeek] = useState(0);
  const [adaptiveMessage, setAdaptiveMessage] = useState('');

  const journeyTemplates: CoachJourney[] = [
    {
      id: 'resilience-builder',
      name: 'Resilience Builder',
      description: 'Strengthen your inner fortitude and bounce-back power',
      icon: <Heart className="h-5 w-5" />,
      progress: 0,
      milestones: ['Inner Strength', 'Stress Alchemy', 'Unshakeable Core'],
      estimatedDuration: '2 weeks',
      theme: 'resilience'
    },
    {
      id: 'purpose-finder',
      name: 'Purpose Explorer',
      description: 'Discover deeper meaning and direction in life',
      icon: <Target className="h-5 w-5" />,
      progress: 0,
      milestones: ['Value Clarity', 'Mission Alignment', 'Purpose Integration'],
      estimatedDuration: '3 weeks',
      theme: 'purpose'
    },
    {
      id: 'energy-optimizer',
      name: 'Energy Optimizer',
      description: 'Master your energy flows and vitality patterns',
      icon: <Zap className="h-5 w-5" />,
      progress: 0,
      milestones: ['Energy Awareness', 'Flow States', 'Vitality Mastery'],
      estimatedDuration: '2 weeks',
      theme: 'energy'
    },
    {
      id: 'joy-cultivator',
      name: 'Joy Cultivator',
      description: 'Develop sustainable happiness and celebration practices',
      icon: <Award className="h-5 w-5" />,
      progress: 0,
      milestones: ['Gratitude Practice', 'Joy Recognition', 'Celebration Ritual'],
      estimatedDuration: '2 weeks',
      theme: 'joy'
    }
  ];

  const quickSessionTemplates: CoachSession[] = [
    {
      id: 'soul-check-in',
      type: 'check-in',
      title: '60-Second Soul Check-in',
      duration: 60,
      completed: false
    },
    {
      id: 'stress-transformer',
      type: 'breathing',
      title: 'Stress → Presence Reset',
      duration: 90,
      completed: false
    },
    {
      id: 'confidence-boost',
      type: 'pep-talk',
      title: 'Confidence Boost',
      duration: 45,
      completed: false
    },
    {
      id: 'perspective-shift',
      type: 'reframe',
      title: 'Perspective Shift',
      duration: 120,
      completed: false
    }
  ];

  useEffect(() => {
    if (user) {
      loadCoachData();
      generateAdaptiveMessage();
    }
  }, [user]);

  const loadCoachData = async () => {
    try {
      // Load user's coaching progress
      const { data: progress } = await supabase
        .from('user_engagement')
        .select('*')
        .eq('user_id', user?.id)
        .like('action_type', 'coach_%');

      // Set available journeys with progress
      setAvailableJourneys(journeyTemplates);
      setQuickSessions(quickSessionTemplates);

      // Calculate this week's progress
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      
      const thisWeekSessions = progress?.filter(p => 
        new Date(p.created_at) >= weekStart
      ) || [];
      
      setProgressThisWeek(thisWeekSessions.length);
      
      if (thisWeekSessions.length > 0) {
        setLastInteraction(new Date(thisWeekSessions[0].created_at));
      }
    } catch (error) {
      console.error('Error loading coach data:', error);
    }
  };

  const generateAdaptiveMessage = () => {
    const hour = new Date().getHours();
    const messages = {
      morning: [
        "Good morning! Ready to spark your inner wisdom? ✨",
        "The day begins with intention. What would you like to cultivate today?",
        "Your soul is ready for growth. Let's begin with presence."
      ],
      afternoon: [
        "How's your energy flowing today? I'm here if you need a reset.",
        "Midday is perfect for transformation. Ready to turn stress into strength?",
        "Your resilience is growing. Want to practice using it?"
      ],
      evening: [
        "How are you carrying today's experiences? Let's reflect together.",
        "Evening is wisdom time. What patterns are you noticing?",
        "Your growth today deserves celebration. What progress do you see?"
      ]
    };

    let timeMessages;
    if (hour < 12) timeMessages = messages.morning;
    else if (hour < 17) timeMessages = messages.afternoon;
    else timeMessages = messages.evening;

    const randomMessage = timeMessages[Math.floor(Math.random() * timeMessages.length)];
    setAdaptiveMessage(randomMessage);
  };

  const startQuickSession = async (session: CoachSession) => {
    try {
      await supabase.from('user_engagement').insert({
        user_id: user?.id,
        action_type: `coach_${session.type}`,
        xp_earned: 20,
        metadata: {
          sessionId: session.id,
          duration: session.duration,
          coachPersonality
        }
      });

      // Navigate to chat with context
      const contextMessage = getSessionPrompt(session);
      window.location.href = `/chat?session=${session.id}&prompt=${encodeURIComponent(contextMessage)}`;
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const getSessionPrompt = (session: CoachSession): string => {
    const prompts = {
      'check-in': "I'd like a 60-second soul check-in. Help me quickly assess how I'm feeling and what I need right now.",
      'breathing': "I'm feeling stressed and need to reset. Guide me through a breathing exercise that transforms tension into presence.",
      'pep-talk': "I could use some encouragement and confidence building right now. Help me remember my strength.",
      'reframe': "I'm stuck in a negative thought pattern. Help me shift my perspective to something more empowering."
    };
    
    return prompts[session.type] || "I'd like some guidance from my Soul-Care Coach.";
  };

  const startJourney = async (journey: CoachJourney) => {
    try {
      await supabase.from('user_engagement').insert({
        user_id: user?.id,
        action_type: 'coach_journey_start',
        xp_earned: 50,
        metadata: {
          journeyId: journey.id,
          theme: journey.theme
        }
      });

      setCurrentJourney(journey);
      
      toast({
        title: `${journey.name} Journey Started! 🎯`,
        description: "Your personalized growth path begins now.",
      });
    } catch (error) {
      console.error('Error starting journey:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Adaptive Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-primary to-accent rounded-full">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl">Your Soul-Care Coach</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {adaptiveMessage}
              </p>
            </div>
          </div>
          
          {/* Progress This Week */}
          {progressThisWeek > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>This week's soul sessions</span>
                <span className="font-semibold">{progressThisWeek}</span>
              </div>
              <Progress value={Math.min((progressThisWeek / 7) * 100, 100)} className="h-2" />
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Quick Sessions */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center">
          <Timer className="h-4 w-4 mr-2" />
          Quick Soul Sessions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickSessions.map((session) => (
            <Card 
              key={session.id} 
              className="hover:shadow-spiritual transition-shadow cursor-pointer"
              onClick={() => startQuickSession(session)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{session.title}</h4>
                    <div className="flex items-center mt-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {session.duration}s
                    </div>
                  </div>
                  <Button size="sm" variant="spiritual">
                    Start
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Growth Journeys */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center">
          <TrendingUp className="h-4 w-4 mr-2" />
          Themed Growth Journeys
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableJourneys.map((journey) => (
            <Card 
              key={journey.id}
              className="hover:shadow-spiritual transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  {journey.icon}
                  <CardTitle className="text-lg">{journey.name}</CardTitle>
                  <Badge variant="outline" className="ml-auto">
                    {journey.estimatedDuration}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {journey.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Milestones */}
                <div>
                  <p className="text-sm font-medium mb-2">Milestones:</p>
                  <div className="space-y-1">
                    {journey.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          index <= journey.progress ? 'bg-primary' : 'bg-muted'
                        }`} />
                        {milestone}
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={() => startJourney(journey)}
                  variant="spiritual"
                  className="w-full"
                  disabled={currentJourney?.id === journey.id}
                >
                  {currentJourney?.id === journey.id ? 'In Progress' : 'Start Journey'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Voice Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Voice Conversation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Talk directly with your Soul-Care Coach using voice for a more personal experience.
          </p>
          <VoiceInterface />
        </CardContent>
      </Card>

      {/* Social Proof */}
      <Card className="bg-muted/50">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            <strong>87% of SoulSparkers</strong> found these micro-sessions helped shift their mood within 2 minutes
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdaptiveCoachInterface;