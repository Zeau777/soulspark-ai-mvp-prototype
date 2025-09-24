import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOrgAdmin } from "@/hooks/useOrgAdmin";
import { MessageSquare, Settings, BarChart3, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface DiscordConfig {
  is_connected: boolean;
  auto_souldrop_enabled: boolean;
  souldrop_time: string;
  checkin_reminder_enabled: boolean;
  checkin_reminder_time: string;
  channels: string[];
  welcome_message: string | null;
  guild_name?: string;
  bot_user_id?: string;
}

interface DiscordChannel {
  id: string;
  name: string;
  type: number;
}

interface DiscordAnalytics {
  totalInteractions: number;
  dailyActive: number;
  weeklyActive: number;
  monthlyActive: number;
  topChannels: Array<{ name: string; interactions: number }>;
}

export function DiscordIntegration() {
  const { organization } = useOrgAdmin();
  const { toast } = useToast();
  const [config, setConfig] = useState<DiscordConfig>({
    is_connected: false,
    auto_souldrop_enabled: true,
    souldrop_time: '09:00',
    checkin_reminder_enabled: true,
    checkin_reminder_time: '17:00',
    channels: [],
    welcome_message: null,
  });
  const [channels, setChannels] = useState<DiscordChannel[]>([]);
  const [analytics, setAnalytics] = useState<DiscordAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [testingBot, setTestingBot] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (organization?.id) {
      loadConfig();
      if (config.is_connected) {
        loadChannels();
        loadAnalytics();
      }
    }
  }, [organization?.id]);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('discord-integration', {
        body: { 
          action: 'getConfig',
          organizationId: organization?.id 
        }
      });

      if (error) throw error;
      setConfig(data);
    } catch (error) {
      console.error('Error loading Discord config:', error);
      toast({
        title: "Error",
        description: "Failed to load Discord configuration",
        variant: "destructive",
      });
    }
  };

  const loadChannels = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('discord-integration', {
        body: { 
          action: 'listChannels',
          organizationId: organization?.id 
        }
      });

      if (error) throw error;
      setChannels(data.channels || []);
    } catch (error) {
      console.error('Error loading Discord channels:', error);
      toast({
        title: "Error",
        description: "Failed to load Discord channels",
        variant: "destructive",
      });
    }
  };

  const loadAnalytics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('discord-integration', {
        body: { 
          action: 'getAnalytics',
          organizationId: organization?.id 
        }
      });

      if (error) throw error;
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading Discord analytics:', error);
    }
  };

  const handleConnect = async () => {
    if (!organization) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('discord-integration', {
        body: { 
          action: 'generateOAuthUrl',
          organizationId: organization.id,
          organizationName: organization.name
        }
      });

      if (error) throw error;
      
      // Open Discord OAuth in a new window
      const popup = window.open(data.authUrl, 'discord-auth', 'width=500,height=600');
      
      // Poll for popup closure
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          // Reload config after successful connection
          setTimeout(() => {
            loadConfig();
            setLoading(false);
          }, 2000);
        }
      }, 1000);
    } catch (error) {
      console.error('Error connecting to Discord:', error);
      toast({
        title: "Error",
        description: "Failed to connect to Discord",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('discord-integration', {
        body: { 
          action: 'disconnect',
          organizationId: organization?.id 
        }
      });

      if (error) throw error;

      setConfig(prev => ({ ...prev, is_connected: false }));
      setChannels([]);
      setAnalytics(null);
      
      toast({
        title: "Success",
        description: "Discord has been disconnected",
      });
    } catch (error) {
      console.error('Error disconnecting Discord:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect Discord",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleTestBot = async () => {
    setTestingBot(true);
    try {
      const { data, error } = await supabase.functions.invoke('discord-integration', {
        body: { 
          action: 'testBot',
          organizationId: organization?.id 
        }
      });

      if (error) throw error;

      toast({
        title: "Bot Test Successful",
        description: `Connected as ${data.bot.username}#${data.bot.discriminator}`,
      });
    } catch (error) {
      console.error('Error testing bot:', error);
      toast({
        title: "Bot Test Failed",
        description: "The Discord bot is not properly configured",
        variant: "destructive",
      });
    }
    setTestingBot(false);
  };

  const handleSendTestMessage = async () => {
    setSendingMessage(true);
    try {
      const { data, error } = await supabase.functions.invoke('discord-integration', {
        body: { 
          action: 'sendMessage',
          organizationId: organization?.id 
        }
      });

      if (error) throw error;

      const successCount = data.results.filter((r: any) => r.success).length;
      const totalCount = data.results.length;

      toast({
        title: "Message Sent",
        description: `Successfully sent to ${successCount}/${totalCount} channels`,
      });
    } catch (error) {
      console.error('Error sending test message:', error);
      toast({
        title: "Error",
        description: "Failed to send test message",
        variant: "destructive",
      });
    }
    setSendingMessage(false);
  };

  const updateConfig = async (updates: Partial<DiscordConfig>) => {
    try {
      const { error } = await supabase.functions.invoke('discord-integration', {
        body: { 
          action: 'updateConfig',
          organizationId: organization?.id,
          config: updates
        }
      });

      if (error) throw error;

      setConfig(prev => ({ ...prev, ...updates }));
      
      toast({
        title: "Settings Updated",
        description: "Discord configuration has been saved",
      });
    } catch (error) {
      console.error('Error updating config:', error);
      toast({
        title: "Error",
        description: "Failed to update Discord settings",
        variant: "destructive",
      });
    }
  };

  const toggleChannel = (channelId: string) => {
    const newChannels = config.channels.includes(channelId)
      ? config.channels.filter(id => id !== channelId)
      : [...config.channels, channelId];
    
    updateConfig({ channels: newChannels });
  };

  if (!organization) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You need to be an organization admin to manage Discord integration.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Discord Integration
          </CardTitle>
          <CardDescription>
            Connect your Discord server to automatically share SoulDrops and reminders with your community.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {config.is_connected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                  {config.guild_name && (
                    <span className="text-sm text-muted-foreground">
                      to {config.guild_name}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestBot}
                    disabled={testingBot}
                  >
                    {testingBot ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Test Bot"
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDisconnect}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Disconnect"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Discord is not connected. Click the button below to connect your Discord server.
                </AlertDescription>
              </Alert>
              <Button onClick={handleConnect} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <MessageSquare className="h-4 w-4 mr-2" />
                )}
                Connect Discord
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {config.is_connected && (
        <>
          {/* Channel Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Channel Configuration
              </CardTitle>
              <CardDescription>
                Select which channels should receive automated messages from SoulSpark.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {channels.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {channels.map((channel) => (
                      <div key={channel.id} className="flex items-center space-x-2">
                        <Switch
                          id={channel.id}
                          checked={config.channels.includes(channel.id)}
                          onCheckedChange={() => toggleChannel(channel.id)}
                        />
                        <Label htmlFor={channel.id} className="flex-1">
                          #{channel.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No channels found. Make sure the bot has access to your Discord server.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Automation Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
              <CardDescription>
                Configure when and how SoulSpark interacts with your Discord community.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Daily SoulDrops</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically send inspirational content
                  </p>
                </div>
                <Switch
                  checked={config.auto_souldrop_enabled}
                  onCheckedChange={(checked) => 
                    updateConfig({ auto_souldrop_enabled: checked })
                  }
                />
              </div>

              {config.auto_souldrop_enabled && (
                <div className="ml-4 space-y-2">
                  <Label htmlFor="souldrop-time">SoulDrop Time</Label>
                  <Input
                    id="souldrop-time"
                    type="time"
                    value={config.souldrop_time}
                    onChange={(e) => updateConfig({ souldrop_time: e.target.value })}
                    className="w-32"
                  />
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Check-in Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Send daily well-being check-in reminders
                  </p>
                </div>
                <Switch
                  checked={config.checkin_reminder_enabled}
                  onCheckedChange={(checked) => 
                    updateConfig({ checkin_reminder_enabled: checked })
                  }
                />
              </div>

              {config.checkin_reminder_enabled && (
                <div className="ml-4 space-y-2">
                  <Label htmlFor="checkin-time">Reminder Time</Label>
                  <Input
                    id="checkin-time"
                    type="time"
                    value={config.checkin_reminder_time}
                    onChange={(e) => updateConfig({ checkin_reminder_time: e.target.value })}
                    className="w-32"
                  />
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="welcome-message">Welcome Message</Label>
                <Textarea
                  id="welcome-message"
                  placeholder="Enter a custom welcome message for new Discord members..."
                  value={config.welcome_message || ''}
                  onChange={(e) => updateConfig({ welcome_message: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Test Message */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Test Integration
              </CardTitle>
              <CardDescription>
                Send a test SoulDrop to your configured channels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleSendTestMessage} 
                disabled={sendingMessage || config.channels.length === 0}
              >
                {sendingMessage ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Test Message
              </Button>
              {config.channels.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Please select at least one channel to send test messages.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Analytics */}
          {analytics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Discord Analytics
                </CardTitle>
                <CardDescription>
                  Engagement metrics from your Discord community.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{analytics.totalInteractions}</p>
                    <p className="text-sm text-muted-foreground">Total Interactions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{analytics.dailyActive}</p>
                    <p className="text-sm text-muted-foreground">Daily Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{analytics.weeklyActive}</p>
                    <p className="text-sm text-muted-foreground">Weekly Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{analytics.monthlyActive}</p>
                    <p className="text-sm text-muted-foreground">Monthly Active</p>
                  </div>
                </div>

                {analytics.topChannels.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Top Channels</h4>
                    <div className="space-y-2">
                      {analytics.topChannels.map((channel, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{channel.name}</span>
                          <Badge variant="secondary">{channel.interactions} interactions</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}