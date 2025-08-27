import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  MessageSquare, 
  Users, 
  Settings, 
  BarChart3, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Hash,
  Clock,
  Zap,
  Link2,
  Unlink
} from "lucide-react";

interface SlackConfig {
  id?: string;
  organization_id: string;
  workspace_id?: string;
  workspace_name?: string;
  bot_token?: string;
  is_connected: boolean;
  channels: string[];
  auto_souldrop_enabled: boolean;
  souldrop_time: string;
  checkin_reminder_enabled: boolean;
  checkin_reminder_time: string;
  welcome_message?: string;
  created_at?: string;
  updated_at?: string;
}

interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  member_count?: number;
}

interface SlackAnalytics {
  total_messages: number;
  unique_users: number;
  checkins_via_slack: number;
  souldrops_shared: number;
  engagement_rate: number;
}

interface SlackIntegrationProps {
  organizationId: string;
  organizationName: string;
}

export default function SlackIntegration({ organizationId, organizationName }: SlackIntegrationProps) {
  const [config, setConfig] = useState<SlackConfig>({
    organization_id: organizationId,
    is_connected: false,
    channels: [],
    auto_souldrop_enabled: true,
    souldrop_time: "09:00",
    checkin_reminder_enabled: true,
    checkin_reminder_time: "17:00",
    welcome_message: "Welcome to SoulSpark AI! 🌟 I'm here to support your well-being journey. Type 'checkin' to start or 'help' for more options."
  });
  
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [analytics, setAnalytics] = useState<SlackAnalytics>({
    total_messages: 0,
    unique_users: 0,
    checkins_via_slack: 0,
    souldrops_shared: 0,
    engagement_rate: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [testingBot, setTestingBot] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    loadSlackConfig();
  }, [organizationId]);

  const loadSlackConfig = async () => {
    try {
      // Load existing Slack configuration using edge function
      const { data, error } = await supabase.functions.invoke('slack-integration', {
        body: { 
          action: 'get_config',
          organization_id: organizationId
        }
      });

      if (error) throw error;
      
      if (data?.config) {
        setConfig(data.config);
        if (data.config.is_connected) {
          await loadChannels();
          await loadAnalytics();
        }
      }
    } catch (error) {
      console.error('Error loading Slack config:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChannels = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('slack-integration', {
        body: { 
          action: 'list_channels',
          organization_id: organizationId
        }
      });

      if (error) throw error;
      if (data?.channels) {
        setChannels(data.channels);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('slack-integration', {
        body: { 
          action: 'get_analytics',
          organization_id: organizationId
        }
      });

      if (error) throw error;
      if (data?.analytics) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const connectSlack = async () => {
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('slack-integration', {
        body: { 
          action: 'generate_oauth_url',
          organization_id: organizationId,
          organization_name: organizationName
        }
      });

      if (error) throw error;
      
      if (data?.oauth_url) {
        // Open Slack OAuth in new window
        window.open(data.oauth_url, 'slack-oauth', 'width=600,height=600');
        
        // Poll for connection status
        const pollConnection = setInterval(async () => {
          await loadSlackConfig();
          if (config.is_connected) {
            clearInterval(pollConnection);
            toast({
              title: "Slack Connected!",
              description: "Your workspace has been successfully connected to SoulSpark AI."
            });
          }
        }, 2000);

        // Stop polling after 2 minutes
        setTimeout(() => clearInterval(pollConnection), 120000);
      }
    } catch (error) {
      console.error('Error connecting Slack:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Slack. Please try again.",
        variant: "destructive"
      });
    } finally {
      setConnecting(false);
    }
  };

  const disconnectSlack = async () => {
    try {
      const { error } = await supabase.functions.invoke('slack-integration', {
        body: { 
          action: 'disconnect',
          organization_id: organizationId
        }
      });

      if (error) throw error;

      setConfig(prev => ({ ...prev, is_connected: false, workspace_id: undefined, workspace_name: undefined }));
      setChannels([]);
      setAnalytics({
        total_messages: 0,
        unique_users: 0,
        checkins_via_slack: 0,
        souldrops_shared: 0,
        engagement_rate: 0
      });

      toast({
        title: "Slack Disconnected",
        description: "Your workspace has been disconnected from SoulSpark AI."
      });
    } catch (error) {
      console.error('Error disconnecting Slack:', error);
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect from Slack. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateConfig = async (updates: Partial<SlackConfig>) => {
    try {
      const newConfig = { ...config, ...updates };
      
      const { data, error } = await supabase.functions.invoke('slack-integration', {
        body: { 
          action: 'update_config',
          organization_id: organizationId,
          config: newConfig
        }
      });

      if (error) throw error;

      setConfig(newConfig);
      
      toast({
        title: "Settings Updated",
        description: "Your Slack configuration has been saved."
      });
    } catch (error) {
      console.error('Error updating config:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update configuration. Please try again.",
        variant: "destructive"
      });
    }
  };

  const testBot = async () => {
    setTestingBot(true);
    try {
      const { data, error } = await supabase.functions.invoke('slack-integration', {
        body: { 
          action: 'test_bot',
          organization_id: organizationId
        }
      });

      if (error) throw error;

      toast({
        title: "Bot Test Successful",
        description: "The SoulSpark AI bot is working correctly in your workspace."
      });
    } catch (error) {
      console.error('Error testing bot:', error);
      toast({
        title: "Bot Test Failed",
        description: "The bot test failed. Please check your configuration.",
        variant: "destructive"
      });
    } finally {
      setTestingBot(false);
    }
  };

  const toggleChannel = (channelId: string) => {
    const newChannels = config.channels.includes(channelId)
      ? config.channels.filter(id => id !== channelId)
      : [...config.channels, channelId];
    
    updateConfig({ channels: newChannels });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Slack Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading Slack configuration...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Slack Integration
          {config.is_connected && <Badge variant="outline" className="text-green-600">Connected</Badge>}
        </CardTitle>
        <CardDescription>
          Connect SoulSpark AI to your Slack workspace for seamless team well-being support
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!config.is_connected ? (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Connect to Slack</h3>
              <p className="text-muted-foreground mt-1">
                Add the SoulSpark AI bot to your workspace to enable daily check-ins and SoulDrops in Slack
              </p>
            </div>
            <Button 
              onClick={connectSlack} 
              disabled={connecting}
              className="bg-[#4A154B] hover:bg-[#4A154B]/90 text-white"
            >
              {connecting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-2" />
                  Connect to Slack
                </>
              )}
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="channels">Channels</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Workspace</Label>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{config.workspace_name || 'Connected Workspace'}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={disconnectSlack}>
                      <Unlink className="h-4 w-4 mr-2" />
                      Disconnect
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Active Channels</Label>
                  <div className="p-3 border rounded-lg">
                    <div className="text-2xl font-bold">{config.channels.length}</div>
                    <div className="text-sm text-muted-foreground">channels configured</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Bot Status</h4>
                  <Button variant="outline" size="sm" onClick={testBot} disabled={testingBot}>
                    {testingBot ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    Test Bot
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">SoulDrops: Active</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Check-ins: Active</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="channels" className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Available Channels</h4>
                <Button variant="outline" size="sm" onClick={loadChannels}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
              
              <div className="space-y-2">
                {channels.map((channel) => (
                  <div key={channel.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{channel.name}</span>
                      {channel.is_private && <Badge variant="secondary">Private</Badge>}
                      {channel.member_count && (
                        <span className="text-sm text-muted-foreground">
                          {channel.member_count} members
                        </span>
                      )}
                    </div>
                    <Switch
                      checked={config.channels.includes(channel.id)}
                      onCheckedChange={() => toggleChannel(channel.id)}
                    />
                  </div>
                ))}
                
                {channels.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No channels found. Make sure the bot is added to channels you want to use.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Automated SoulDrops</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Daily SoulDrops</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically share inspirational content in configured channels
                      </p>
                    </div>
                    <Switch
                      checked={config.auto_souldrop_enabled}
                      onCheckedChange={(checked) => updateConfig({ auto_souldrop_enabled: checked })}
                    />
                  </div>
                  
                  {config.auto_souldrop_enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="souldrop-time">Daily Time</Label>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="souldrop-time"
                            type="time"
                            value={config.souldrop_time}
                            onChange={(e) => updateConfig({ souldrop_time: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Check-in Reminders</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Check-in Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Send gentle reminders for daily well-being check-ins
                      </p>
                    </div>
                    <Switch
                      checked={config.checkin_reminder_enabled}
                      onCheckedChange={(checked) => updateConfig({ checkin_reminder_enabled: checked })}
                    />
                  </div>
                  
                  {config.checkin_reminder_enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="checkin-time">Reminder Time</Label>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="checkin-time"
                            type="time"
                            value={config.checkin_reminder_time}
                            onChange={(e) => updateConfig({ checkin_reminder_time: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Welcome Message</h4>
                <div className="space-y-2">
                  <Label htmlFor="welcome-message">New User Welcome</Label>
                  <Textarea
                    id="welcome-message"
                    placeholder="Enter a welcome message for new users..."
                    value={config.welcome_message}
                    onChange={(e) => updateConfig({ welcome_message: e.target.value })}
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    This message will be sent to users when they first interact with the bot
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{analytics.total_messages}</div>
                    <div className="text-sm text-muted-foreground">Total Messages</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{analytics.unique_users}</div>
                    <div className="text-sm text-muted-foreground">Active Users</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{analytics.checkins_via_slack}</div>
                    <div className="text-sm text-muted-foreground">Slack Check-ins</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{analytics.souldrops_shared}</div>
                    <div className="text-sm text-muted-foreground">SoulDrops Shared</div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Engagement Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{analytics.engagement_rate}%</div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${analytics.engagement_rate}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Percentage of team members actively using SoulSpark AI in Slack
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}