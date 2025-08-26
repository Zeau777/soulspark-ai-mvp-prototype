import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Sunrise, 
  Sun, 
  Sunset, 
  Moon, 
  Flame, 
  Target, 
  Heart,
  Award,
  Sparkles,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HabitStage {
  id: string;
  name: string;
  icon: React.ReactNode;
  timeOfDay: 'morning' | 'midday' | 'evening' | 'night';
  completed: boolean;
  streak: number;
  lastCompleted?: Date;
}

interface SoulMilestone {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  unlockedAt?: Date;
}

const HabitLoopFramework = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [habitStages, setHabitStages] = useState<HabitStage[]>([]);
  const [soulMilestones, setSoulMilestones] = useState<SoulMilestone[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [todayStreak, setTodayStreak] = useState(0);
  const [identity, setIdentity] = useState('');

  const defaultHabitStages: HabitStage[] = [
    {
      id: 'morning-spark',
      name: 'Morning Spark',
      icon: <Sunrise className="h-5 w-5" />,
      timeOfDay: 'morning',
      completed: false,
      streak: 0
    },
    {
      id: 'midday-reset',
      name: 'Midday Reset',
      icon: <Sun className="h-5 w-5" />,
      timeOfDay: 'midday',
      completed: false,
      streak: 0
    },
    {
      id: 'evening-reflection',
      name: 'Evening Reflection',
      icon: <Sunset className="h-5 w-5" />,
      timeOfDay: 'evening',
      completed: false,
      streak: 0
    },
    {
      id: 'night-closure',
      name: 'Night Closure',
      icon: <Moon className="h-5 w-5" />,
      timeOfDay: 'night',
      completed: false,
      streak: 0
    }
  ];

  const defaultSoulMilestones: SoulMilestone[] = [
    {
      id: 'spark-igniter',
      name: 'Spark Igniter',
      description: 'Completed your first morning spark',
      icon: <Flame className="h-5 w-5" />,
      unlocked: false
    },
    {
      id: 'energy-alchemist',
      name: 'Energy Alchemist',
      description: 'Transformed stress into presence 3 times',
      icon: <Target className="h-5 w-5" />,
      unlocked: false
    },
    {
      id: 'soul-gardener',
      name: 'Soul Gardener',
      description: 'Maintained a 7-day streak',
      icon: <Heart className="h-5 w-5" />,
      unlocked: false
    },
    {
      id: 'wisdom-keeper',
      name: 'Wisdom Keeper',
      description: 'Completed 30 reflections',
      icon: <Award className="h-5 w-5" />,
      unlocked: false
    }
  ];

  useEffect(() => {
    if (user) {
      loadHabitData();
      checkTodayProgress();
    }
  }, [user]);

  const loadHabitData = async () => {
    try {
      // Load user's habit data from engagement table
      const { data: engagement } = await supabase
        .from('user_engagement')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

      const updatedStages = defaultHabitStages.map(stage => {
        const todayCompletion = engagement?.find(e => 
          e.metadata && 
          typeof e.metadata === 'object' &&
          e.metadata !== null &&
          (e.metadata as any).habitStage === stage.id &&
          new Date(e.created_at).toDateString() === new Date().toDateString()
        );
        
        return {
          ...stage,
          completed: !!todayCompletion,
          lastCompleted: todayCompletion ? new Date(todayCompletion.created_at) : undefined
        };
      });

      setHabitStages(updatedStages);
      setSoulMilestones(defaultSoulMilestones);
    } catch (error) {
      console.error('Error loading habit data:', error);
    }
  };

  const checkTodayProgress = async () => {
    const completedToday = habitStages.filter(stage => stage.completed).length;
    setOverallProgress((completedToday / habitStages.length) * 100);
    setTodayStreak(completedToday);

    // Update identity based on progress
    if (completedToday === 4) {
      setIdentity('I am a complete SoulSparker.');
    } else if (completedToday >= 2) {
      setIdentity('I am becoming a SoulSparker.');
    } else if (completedToday >= 1) {
      setIdentity('I am sparking my journey.');
    } else {
      setIdentity('Ready to spark your soul?');
    }
  };

  const completeHabitStage = async (stageId: string) => {
    try {
      // Record the completion in user_engagement
      await supabase.from('user_engagement').insert({
        user_id: user?.id,
        action_type: 'habit_completion',
        xp_earned: 25,
        metadata: {
          habitStage: stageId,
          timeOfDay: new Date().getHours()
        }
      });

      // Update local state
      setHabitStages(prev => prev.map(stage => 
        stage.id === stageId 
          ? { ...stage, completed: true, lastCompleted: new Date() }
          : stage
      ));

      toast({
        title: "Habit Stage Completed! ✨",
        description: "Your soul spark grows stronger with each ritual.",
      });

      // Check for milestone unlocks
      checkMilestoneUnlocks(stageId);
      checkTodayProgress();
    } catch (error) {
      console.error('Error completing habit stage:', error);
    }
  };

  const checkMilestoneUnlocks = async (completedStageId: string) => {
    // Check if any milestones should be unlocked
    // This is a simplified version - in reality, you'd check against actual data
    if (completedStageId === 'morning-spark') {
      setSoulMilestones(prev => prev.map(milestone => 
        milestone.id === 'spark-igniter' 
          ? { ...milestone, unlocked: true, unlockedAt: new Date() }
          : milestone
      ));
    }
  };

  return (
    <div className="space-y-6">
      {/* Identity & Progress Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Sparkles className="h-8 w-8 text-primary mr-2" />
            <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {identity}
            </CardTitle>
          </div>
          <div className="space-y-2">
            <Progress value={overallProgress} className="h-3" />
            <p className="text-sm text-muted-foreground">
              Today's SoulSpark Loop: {todayStreak}/4 completed
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Habit Stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {habitStages.map((stage) => (
          <Card 
            key={stage.id} 
            className={`transition-all duration-300 ${
              stage.completed 
                ? 'bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30' 
                : 'hover:shadow-spiritual'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {stage.icon}
                  <CardTitle className="text-lg">{stage.name}</CardTitle>
                </div>
                {stage.completed && (
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    Complete ✓
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  {stage.timeOfDay === 'morning' && "Begin your day with intention and meaning"}
                  {stage.timeOfDay === 'midday' && "Transform stress into presence and energy"}
                  {stage.timeOfDay === 'evening' && "Reflect on growth and celebrate progress"}
                  {stage.timeOfDay === 'night' && "Close with gratitude and peaceful rest"}
                </div>
                
                {stage.lastCompleted && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    Completed at {stage.lastCompleted.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                )}

                {!stage.completed && (
                  <Button 
                    onClick={() => completeHabitStage(stage.id)}
                    variant="spiritual"
                    size="sm"
                    className="w-full"
                  >
                    Complete {stage.name}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Soul Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Soul Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {soulMilestones.map((milestone) => (
              <div 
                key={milestone.id}
                className={`p-4 rounded-lg border transition-all ${
                  milestone.unlocked
                    ? 'bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30'
                    : 'bg-muted/50 border-muted'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    milestone.unlocked 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {milestone.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${
                      milestone.unlocked ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {milestone.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {milestone.description}
                    </p>
                    {milestone.unlockedAt && (
                      <p className="text-xs text-primary mt-1">
                        Unlocked {milestone.unlockedAt.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HabitLoopFramework;