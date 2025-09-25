import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DiscordOAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  guild?: {
    id: string;
    name: string;
  };
}

interface DiscordChannel {
  id: string;
  name: string;
  type: number;
  guild_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, organizationId, organizationName, code, state, config } = await req.json();

    console.log('Discord integration action:', action, 'for org:', organizationId);

    switch (action) {
      case 'generateOAuthUrl':
        return handleGenerateOAuthUrl(organizationId, organizationName);
      
      case 'oauthCallback':
        return handleOAuthCallback(supabase, code, state);
      
      case 'listChannels':
        return handleListChannels(supabase, organizationId);
      
      case 'testBot':
        return handleTestBot(supabase, organizationId);
      
      case 'getConfig':
        return handleGetConfig(supabase, organizationId);
      
      case 'updateConfig':
        return handleUpdateConfig(supabase, organizationId, config);
      
      case 'disconnect':
        return handleDisconnect(supabase, organizationId);
      
      case 'getAnalytics':
        return handleGetAnalytics(supabase, organizationId);
      
      case 'sendMessage':
        return handleSendMessage(supabase, organizationId);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Discord integration error:', error);
    return new Response(
      JSON.stringify({ error: (error instanceof Error) ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function handleGenerateOAuthUrl(organizationId: string, organizationName: string) {
  const clientId = Deno.env.get('DISCORD_CLIENT_ID');
  const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/discord-integration`;
  
  const params = new URLSearchParams({
    client_id: clientId!,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'bot guilds',
    permissions: '2048', // Send Messages permission
    state: `${organizationId}:${organizationName}`,
    guild_id: '', // Let user select guild
  });

  const authUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`;

  return new Response(
    JSON.stringify({ authUrl }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function handleOAuthCallback(supabase: any, code: string, state: string) {
  try {
    const [organizationId, organizationName] = state.split(':');
    const clientId = Deno.env.get('DISCORD_CLIENT_ID');
    const clientSecret = Deno.env.get('DISCORD_CLIENT_SECRET');
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/discord-integration`;

    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Discord OAuth failed: ${tokenResponse.statusText}`);
    }

    const tokenData: DiscordOAuthResponse = await tokenResponse.json();

    // Get bot information
    const botResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        'Authorization': `Bot ${Deno.env.get('DISCORD_BOT_TOKEN')}`,
      },
    });

    const botData = await botResponse.json();

    // Get guild information if available
    let guildData = null;
    if (tokenData.guild) {
      guildData = tokenData.guild;
    }

    // Store configuration in database
    const { error } = await supabase
      .from('discord_configurations')
      .upsert({
        organization_id: organizationId,
        is_connected: true,
        guild_id: guildData?.id || null,
        guild_name: guildData?.name || null,
        bot_token: Deno.env.get('DISCORD_BOT_TOKEN'),
        bot_user_id: botData.id,
        settings: {
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          scope: tokenData.scope,
        },
      });

    if (error) {
      throw error;
    }

    // Return success HTML page
    const successHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Discord Connected Successfully</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .success { color: #5865F2; }
          </style>
        </head>
        <body>
          <h1 class="success">Discord Connected Successfully!</h1>
          <p>Your Discord integration has been set up for ${organizationName}.</p>
          <p>You can now close this window and return to your dashboard.</p>
          <script>
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
      </html>
    `;

    return new Response(successHtml, {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('Discord OAuth callback error:', error);
    
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Discord Connection Failed</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: #ed4245; }
          </style>
        </head>
        <body>
          <h1 class="error">Discord Connection Failed</h1>
          <p>There was an error connecting your Discord integration.</p>
          <p>Error: ${error instanceof Error ? error.message : String(error)}</p>
          <p>Please try again or contact support.</p>
        </body>
      </html>
    `;

    return new Response(errorHtml, {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/html' }
    });
  }
}

async function handleListChannels(supabase: any, organizationId: string) {
  try {
    const { data: config } = await supabase
      .from('discord_configurations')
      .select('bot_token, guild_id')
      .eq('organization_id', organizationId)
      .single();

    if (!config?.bot_token || !config?.guild_id) {
      throw new Error('Discord not properly configured');
    }

    const response = await fetch(`https://discord.com/api/guilds/${config.guild_id}/channels`, {
      headers: {
        'Authorization': `Bot ${config.bot_token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch channels: ${response.statusText}`);
    }

    const channels: DiscordChannel[] = await response.json();
    
    // Filter for text channels only (type 0)
    const textChannels = channels.filter(channel => channel.type === 0);

    return new Response(
      JSON.stringify({ channels: textChannels }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('List channels error:', error);
    return new Response(
      JSON.stringify({ error: (error instanceof Error) ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleTestBot(supabase: any, organizationId: string) {
  try {
    const { data: config } = await supabase
      .from('discord_configurations')
      .select('bot_token')
      .eq('organization_id', organizationId)
      .single();

    if (!config?.bot_token) {
      throw new Error('Discord bot not configured');
    }

    const response = await fetch('https://discord.com/api/users/@me', {
      headers: {
        'Authorization': `Bot ${config.bot_token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Bot test failed: ${response.statusText}`);
    }

    const botData = await response.json();

    return new Response(
      JSON.stringify({ 
        success: true, 
        bot: { 
          id: botData.id, 
          username: botData.username,
          discriminator: botData.discriminator 
        } 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Test bot error:', error);
    return new Response(
      JSON.stringify({ error: (error instanceof Error) ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleGetConfig(supabase: any, organizationId: string) {
  try {
    const { data: config } = await supabase
      .from('discord_configurations')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (!config) {
      // Return default configuration
      return new Response(
        JSON.stringify({
          is_connected: false,
          auto_souldrop_enabled: true,
          souldrop_time: '09:00:00',
          checkin_reminder_enabled: true,
          checkin_reminder_time: '17:00:00',
          channels: [],
          welcome_message: null,
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Remove sensitive data before sending
    const { bot_token, settings, ...safeConfig } = config;

    return new Response(
      JSON.stringify(safeConfig),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Get config error:', error);
    return new Response(
      JSON.stringify({ error: (error instanceof Error) ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleUpdateConfig(supabase: any, organizationId: string, config: any) {
  try {
    const { error } = await supabase
      .from('discord_configurations')
      .update(config)
      .eq('organization_id', organizationId);

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Update config error:', error);
    return new Response(
      JSON.stringify({ error: (error instanceof Error) ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleDisconnect(supabase: any, organizationId: string) {
  try {
    const { error } = await supabase
      .from('discord_configurations')
      .update({
        is_connected: false,
        bot_token: null,
        settings: {},
      })
      .eq('organization_id', organizationId);

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Disconnect error:', error);
    return new Response(
      JSON.stringify({ error: (error instanceof Error) ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleGetAnalytics(supabase: any, organizationId: string) {
  // Return mock analytics data for now
  const analytics = {
    totalInteractions: 42,
    dailyActive: 15,
    weeklyActive: 28,
    monthlyActive: 35,
    topChannels: [
      { name: '#general', interactions: 25 },
      { name: '#wellness', interactions: 12 },
      { name: '#support', interactions: 5 },
    ],
  };

  return new Response(
    JSON.stringify(analytics),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function handleSendMessage(supabase: any, organizationId: string) {
  try {
    const { data: config } = await supabase
      .from('discord_configurations')
      .select('bot_token, channels')
      .eq('organization_id', organizationId)
      .single();

    if (!config?.bot_token || !config?.channels?.length) {
      throw new Error('Discord not properly configured or no channels selected');
    }

    const message = {
      embeds: [{
        title: "🌟 Daily SoulDrop",
        description: "Take a moment today to reflect on what brings you peace and purpose.",
        color: 0x5865F2,
        footer: {
          text: "SoulSpark AI • Daily Inspiration"
        },
        timestamp: new Date().toISOString()
      }],
      components: [{
        type: 1,
        components: [{
          type: 2,
          style: 1,
          label: "Reflect",
          custom_id: "reflect_button",
          emoji: { name: "🤔" }
        }, {
          type: 2,
          style: 3,
          label: "Share",
          custom_id: "share_button",
          emoji: { name: "💬" }
        }]
      }]
    };

    const results = [];
    for (const channelId of config.channels) {
      try {
        const response = await fetch(`https://discord.com/api/channels/${channelId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bot ${config.bot_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });

        if (response.ok) {
          results.push({ channelId, success: true });
        } else {
          results.push({ channelId, success: false, error: response.statusText });
        }
      } catch (error) {
        results.push({ channelId, success: false, error: (error instanceof Error) ? error.message : String(error) });
      }
    }

    return new Response(
      JSON.stringify({ results }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Send message error:', error);
    return new Response(
      JSON.stringify({ error: (error instanceof Error) ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}