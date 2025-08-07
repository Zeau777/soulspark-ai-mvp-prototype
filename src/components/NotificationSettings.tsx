import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Bell, BellOff } from 'lucide-react';

const NotificationSettings = () => {
  const { isSupported, permission, subscription, requestPermission, unsubscribe } = usePushNotifications();
  const { user } = useAuth();

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are not supported in your browser
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get gentle reminders for check-ins throughout the day
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Daily Check-in Reminders</Label>
            <p className="text-sm text-muted-foreground">
              Morning, afternoon, and evening reminders to check in with your soul
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
              Notifications are blocked. Please enable them in your browser settings to receive reminders.
            </p>
          </div>
        )}

        {permission === 'default' && (
          <Button 
            onClick={requestPermission}
            variant="outline" 
            className="w-full"
          >
            Enable Push Notifications
          </Button>
        )}

        {permission === 'granted' && subscription && (
          <div className="space-y-3">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-md">
              <p className="text-sm text-primary">
                ✓ You'll receive gentle reminders 3 times a day to check in with your soul
              </p>
            </div>
            <Button 
              onClick={async () => {
                try {
                  const { data, error } = await supabase.functions.invoke('send-push-notifications', {
                    body: { type: 'check_in', userIds: [user?.id] }
                  });
                  if (error) throw error;
                  console.log('Test notification sent:', data);
                } catch (error) {
                  console.error('Error sending test notification:', error);
                }
              }}
              variant="outline" 
              size="sm"
              className="w-full"
            >
              Send Test Notification
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;