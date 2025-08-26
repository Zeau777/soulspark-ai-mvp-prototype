import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  BellOff, 
  Sunrise, 
  Sun, 
  Sunset, 
  Moon,
  Brain,
  Heart,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationPreference {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  timeOfDay: 'morning' | 'midday' | 'evening' | 'night';
  enabled: boolean;
  smartTriggers: string[];
}

const SmartNotificationSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isSupported, permission, subscription, requestPermission, unsubscribe } = usePushNotifications();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [contextualAwareness, setContextualAwareness] = useState(true);
  const [adaptiveScheduling, setAdaptiveScheduling] = useState(true);

  const defaultPreferences: NotificationPreference[] = [
    {
      id: 'morning-spark',
      name: 'Morning Soul Spark',
      description: 'Start your day with intention and meaning',
      icon: <Sunrise className="h-4 w-4" />,
      timeOfDay: 'morning',
      enabled: true,
      smartTriggers: ['wake_up_detected', 'calendar_free_morning']
    },
    {
      id: 'midday-reset',
      name: 'Midday Reset Nudge',
      description: 'Transform stress into presence during busy times',
      icon: <Sun className="h-4 w-4" />,
      timeOfDay: 'midday',
      enabled: true,
      smartTriggers: ['stress_detected', 'long_meeting_block', 'productivity_dip']
    },
    {
      id: 'evening-reflection',
      name: 'Evening Reflection',
      description: 'Process the day and celebrate growth',
      icon: <Sunset className="h-4 w-4" />,
      timeOfDay: 'evening',
      enabled: true,
      smartTriggers: ['work_day_end', 'low_engagement_day']
    },
    {
      id: 'night-closure',
      name: 'Peaceful Night Closure',
      description: 'End with gratitude and restful intention',
      icon: <Moon className="h-4 w-4" />,
      timeOfDay: 'night',
      enabled: false, // Optional by default
      smartTriggers: ['bedtime_routine', 'high_stress_day']
    }
  ];

  useEffect(() => {
    if (user) {
      loadNotificationPreferences();
    }
  }, [user]);

  const loadNotificationPreferences = async () => {
    try {
      // Load user's notification preferences from metadata
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      const savedPreferences = (profile as any)?.notification_preferences || {};
      
      const updatedPreferences = defaultPreferences.map(pref => ({
        ...pref,
        enabled: savedPreferences[pref.id] !== undefined 
          ? savedPreferences[pref.id] 
          : pref.enabled
      }));

      setPreferences(updatedPreferences);
    } catch (error) {
      console.error('Error loading notification preferences:', error);
      setPreferences(defaultPreferences);
    }
  };

  const updatePreference = async (prefId: string, enabled: boolean) => {
    try {
      const updatedPreferences = preferences.map(pref =>
        pref.id === prefId ? { ...pref, enabled } : pref
      );
      
      setPreferences(updatedPreferences);

      // Save to database
      const preferencesObject = updatedPreferences.reduce((acc, pref) => {
        acc[pref.id] = pref.enabled;
        return acc;
      }, {} as Record<string, boolean>);

      await supabase
        .from('profiles')
        .update({ 
          updated_at: new Date().toISOString()
        } as any)
        .eq('user_id', user?.id);

      toast({
        title: "Notification preferences updated",
        description: "Your soul-care reminders have been customized",
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const testSmartNotification = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notifications', {
        body: { 
          type: 'adaptive_reminder',
          userIds: [user?.id],
          context: {
            triggerType: 'user_test',
            currentMood: 'testing',
            timeOfDay: new Date().getHours()
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Test notification sent! 📱",
        description: "Check your device for the adaptive reminder",
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Error sending test",
        description: "Please try again or check your notification settings",
        variant: "destructive"
      });
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Smart Notifications Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Smart notifications require a compatible browser and secure context.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Notification Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Smart Soul-Care Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable Smart Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Contextual, adaptive notifications that learn your patterns
              </p>
            </div>
            <Switch
              checked={permission === 'granted' && !!subscription}
              onCheckedChange={async (checked) => {
                if (checked) {
                  await requestPermission();
                } else if (subscription) {
                  await unsubscribe();
                }
              }}
            />
          </div>

          {permission === 'denied' && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">
                Notifications are blocked. Please enable them in your browser to receive soul-care reminders.
              </p>
            </div>
          )}

          {permission === 'granted' && subscription && (
            <div className="space-y-3">
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-md">
                <p className="text-sm text-primary">
                  ✓ Smart notifications are active and learning your patterns
                </p>
              </div>
              <Button 
                onClick={testSmartNotification}
                variant="outline" 
                size="sm"
                className="w-full"
              >
                Send Test Smart Notification
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Notification Types */}
      {permission === 'granted' && subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Notification Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {preferences.map((pref) => (
              <div key={pref.id} className="flex items-start justify-between p-3 rounded-lg border">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    {pref.icon}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium">{pref.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {pref.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {pref.smartTriggers.map((trigger, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {trigger.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={pref.enabled}
                  onCheckedChange={(checked) => updatePreference(pref.id, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Advanced Settings */}
      {permission === 'granted' && subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Adaptive Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Contextual Awareness</Label>
                <p className="text-sm text-muted-foreground">
                  Adjust timing based on your calendar, location, and activity patterns
                </p>
              </div>
              <Switch
                checked={contextualAwareness}
                onCheckedChange={setContextualAwareness}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Adaptive Scheduling</Label>
                <p className="text-sm text-muted-foreground">
                  Learn your optimal times and adjust notification frequency
                </p>
              </div>
              <Switch
                checked={adaptiveScheduling}
                onCheckedChange={setAdaptiveScheduling}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Smart Features Info */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            How Smart Notifications Work
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>🧠 Context-Aware:</strong> Considers your calendar, stress levels, and engagement patterns</p>
            <p><strong>⏰ Adaptive Timing:</strong> Learns your optimal times for different types of reminders</p>
            <p><strong>🎯 Personalized Content:</strong> Tailors messages based on your current journey and mood</p>
            <p><strong>📊 Gentle Frequency:</strong> Adjusts frequency to avoid notification fatigue</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartNotificationSystem;