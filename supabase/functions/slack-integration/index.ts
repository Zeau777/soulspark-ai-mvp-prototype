import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SlackOAuthResponse {
  ok: boolean;
  access_token?: string;
  team?: {
    id: string;
    name: string;
  };
  bot_user_id?: string;
  error?: string;
}

interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  num_members?: number;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { action, organization_id, code, state, organization_name } = await req.json();

    switch (action) {
      case 'generate_oauth_url':
        return handleGenerateOAuthUrl(organization_id, organization_name);
      
      case 'handle_oauth_callback':
        return handleOAuthCallback(supabase, code, state);
      
      case 'list_channels':
        return handleListChannels(supabase, organization_id);
      
      case 'test_bot':
        return handleTestBot(supabase, organization_id);
      
      case 'disconnect':
        return handleDisconnect(supabase, organization_id);
      
      case 'get_analytics':
        return handleGetAnalytics(supabase, organization_id);
      
      case 'send_message':
        return handleSendMessage(supabase, organization_id);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Slack integration error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function handleGenerateOAuthUrl(organizationId: string, organizationName: string) {
  const clientId = Deno.env.get('SLACK_CLIENT_ID');
  const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/slack-integration`;
  
  if (!clientId) {
    throw new Error('Slack client ID not configured');
  }

  const scopes = [
    'bot',
    'chat:write',
    'channels:read',
    'groups:read',
    'users:read',
    'users:read.email',
    'commands'
  ].join(',');

  const state = btoa(JSON.stringify({ organization_id: organizationId, organization_name: organizationName }));
  
  const oauthUrl = `https://slack.com/oauth/v2/authorize?` +
    `client_id=${clientId}&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `state=${encodeURIComponent(state)}`;

  return new Response(
    JSON.stringify({ oauth_url: oauthUrl }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleOAuthCallback(supabase: any, code: string, state: string) {
  const clientId = Deno.env.get('SLACK_CLIENT_ID');
  const clientSecret = Deno.env.get('SLACK_CLIENT_SECRET');
  const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/slack-integration`;

  if (!clientId || !clientSecret) {
    throw new Error('Slack credentials not configured');
  }

  const { organization_id, organization_name } = JSON.parse(atob(state));

  // Exchange code for access token
  const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const tokenData: SlackOAuthResponse = await tokenResponse.json();

  if (!tokenData.ok) {
    throw new Error(`Slack OAuth error: ${tokenData.error}`);
  }

  // Store the configuration in the database
  const { error } = await supabase
    .from('slack_configurations')
    .upsert({
      organization_id,
      workspace_id: tokenData.team?.id,
      workspace_name: tokenData.team?.name,
      bot_token: tokenData.access_token,
      bot_user_id: tokenData.bot_user_id,
      is_connected: true,
      channels: [],
      auto_souldrop_enabled: true,
      souldrop_time: '09:00',
      checkin_reminder_enabled: true,
      checkin_reminder_time: '17:00',
      welcome_message: 'Welcome to SoulSpark AI! 🌟 I\'m here to support your well-being journey. Type \'checkin\' to start or \'help\' for more options.',
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Database error:', error);
    throw new Error('Failed to save Slack configuration');
  }

  // Return a success page that closes the popup
  const successHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Slack Connected</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .success { color: #28a745; }
      </style>
    </head>
    <body>
      <h2 class="success">✅ Slack Successfully Connected!</h2>
      <p>You can now close this window and return to the admin dashboard.</p>
      <script>
        setTimeout(() => window.close(), 2000);
      </script>
    </body>
    </html>
  `;

  return new Response(successHtml, {
    headers: { ...corsHeaders, 'Content-Type': 'text/html' }
  });
}

async function handleListChannels(supabase: any, organizationId: string) {
  const { data: config } = await supabase
    .from('slack_configurations')
    .select('bot_token')
    .eq('organization_id', organizationId)
    .eq('is_connected', true)
    .single();

  if (!config?.bot_token) {
    throw new Error('Slack not connected for this organization');
  }

  // Get list of channels
  const channelsResponse = await fetch('https://slack.com/api/conversations.list', {
    headers: {
      'Authorization': `Bearer ${config.bot_token}`,
      'Content-Type': 'application/json',
    },
  });

  const channelsData = await channelsResponse.json();

  if (!channelsData.ok) {
    throw new Error(`Failed to fetch channels: ${channelsData.error}`);
  }

  const channels: SlackChannel[] = channelsData.channels.map((ch: any) => ({
    id: ch.id,
    name: ch.name,
    is_private: ch.is_private || false,
    num_members: ch.num_members
  }));

  return new Response(
    JSON.stringify({ channels }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleTestBot(supabase: any, organizationId: string) {
  const { data: config } = await supabase
    .from('slack_configurations')
    .select('bot_token, channels')
    .eq('organization_id', organizationId)
    .eq('is_connected', true)
    .single();

  if (!config?.bot_token) {
    throw new Error('Slack not connected for this organization');
  }

  // Test bot auth
  const authResponse = await fetch('https://slack.com/api/auth.test', {
    headers: {
      'Authorization': `Bearer ${config.bot_token}`,
      'Content-Type': 'application/json',
    },
  });

  const authData = await authResponse.json();

  if (!authData.ok) {
    throw new Error(`Bot authentication failed: ${authData.error}`);
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      bot_id: authData.bot_id,
      user_id: authData.user_id 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleDisconnect(supabase: any, organizationId: string) {
  const { error } = await supabase
    .from('slack_configurations')
    .update({
      is_connected: false,
      bot_token: null,
      workspace_id: null,
      workspace_name: null,
      updated_at: new Date().toISOString()
    })
    .eq('organization_id', organizationId);

  if (error) {
    throw new Error('Failed to disconnect Slack');
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleGetAnalytics(supabase: any, organizationId: string) {
  // In a real implementation, you would query actual Slack analytics
  // For now, return mock data
  const analytics = {
    total_messages: 1247,
    unique_users: 89,
    checkins_via_slack: 156,
    souldrops_shared: 89,
    engagement_rate: 73
  };

  return new Response(
    JSON.stringify({ analytics }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleSendMessage(supabase: any, organizationId: string) {
  const { data: config } = await supabase
    .from('slack_configurations')
    .select('bot_token, channels')
    .eq('organization_id', organizationId)
    .eq('is_connected', true)
    .single();

  if (!config?.bot_token || !config.channels?.length) {
    throw new Error('Slack not configured properly for this organization');
  }

  // Example: Send a SoulDrop to all configured channels
  const message = {
    text: "🌟 Daily SoulDrop: Remember that you are fearfully and wonderfully made. Take a moment today to appreciate the unique gifts you bring to the world.",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "🌟 *Daily SoulDrop*\n\nRemember that you are fearfully and wonderfully made. Take a moment today to appreciate the unique gifts you bring to the world."
        }
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Daily Check-in"
            },
            action_id: "daily_checkin",
            style: "primary"
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "More SoulDrops"
            },
            action_id: "more_souldrops"
          }
        ]
      }
    ]
  };

  const results = [];
  for (const channelId of config.channels) {
    try {
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.bot_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: channelId,
          ...message
        }),
      });

      const responseData = await response.json();
      results.push({ channel: channelId, success: responseData.ok, error: responseData.error });
    } catch (error) {
      results.push({ channel: channelId, success: false, error: error.message });
    }
  }

  return new Response(
    JSON.stringify({ results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}