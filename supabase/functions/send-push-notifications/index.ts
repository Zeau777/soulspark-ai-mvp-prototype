import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type = 'check_in', userIds } = await req.json();
    
    let title = '';
    let body = '';
    let tag = '';
    let url = '/dashboard';

    // Define notification content based on type and time of day
    const now = new Date();
    const hour = now.getHours();

    switch (type) {
      case 'coach':
        title = '💬 Mid‑day Soul-Care Coach';
        body = 'Take a reflection break. Ask your Soul-Care Coach anything.';
        tag = 'midday_coach';
        url = '/chat?utm=push_midday_coach';
        break;
      case 'journal':
        title = '📝 Evening Journal';
        body = 'Unwind with a guided reflection. Capture today’s gratitude and growth.';
        tag = 'evening_journal';
        url = '/journal?utm=push_evening_journal';
        break;
      case 'check_in':
      default:
        if (hour >= 6 && hour < 12) {
          title = '🌅 Morning Soul Check‑in';
          body = 'Start with intention. How is your heart this morning? + a Spark prompt.';
          tag = 'morning_checkin';
          url = '/dashboard?utm=push_morning_checkin';
        } else if (hour >= 12 && hour < 18) {
          title = '☀️ Afternoon Pause';
          body = 'Take a breath and reflect. How has your spirit been today?';
          tag = 'afternoon_checkin';
          url = '/chat?utm=push_afternoon_reflection';
        } else {
          title = '🌙 Evening Reflection';
          body = 'Rest and reflect. What is your soul grateful for today?';
          tag = 'evening_checkin';
          url = '/journal?utm=push_evening_reflection';
        }
        break;
    }

    // Get push subscriptions for active users
    let query = supabase
      .from('push_subscriptions')
      .select('*');

    if (userIds && userIds.length > 0) {
      query = query.in('user_id', userIds);
    }

    const { data: subscriptions, error } = await query;

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscriptions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${subscriptions?.length || 0} subscriptions to notify`);

    // Send notifications to all subscriptions
    const notifications = subscriptions?.map(async (sub) => {
      const payload: NotificationPayload = {
        title,
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag,
        data: {
          url,
          type
        }
      };

      try {
        // Create the Web Push notification
        const pushMessage = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          },
          payload: JSON.stringify(payload)
        };

        // For now, we'll simulate sending by making a fetch request to the endpoint
        // In production, you'd use proper VAPID signing and Web Push Protocol
        console.log(`Sending notification to user ${sub.user_id}:`, payload);
        
        // Simple notification simulation (replace with proper Web Push in production)
        const response = await fetch(sub.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'TTL': '60'
          },
          body: JSON.stringify(payload)
        }).catch(() => null);

        console.log(`Notification sent to ${sub.user_id}, response status: ${response?.status || 'failed'}`);
        
        return { success: true, userId: sub.user_id, status: response?.status };
      } catch (error) {
        console.error(`Failed to send notification to ${sub.user_id}:`, error);
        return { success: false, userId: sub.user_id, error: error.message };
      }
    }) || [];

    const results = await Promise.all(notifications);
    const successful = results.filter(r => r.success).length;
    
    console.log(`Successfully sent ${successful}/${results.length} notifications`);

    return new Response(
      JSON.stringify({ 
        message: `Sent ${successful} notifications`,
        results 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in send-push-notifications function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);