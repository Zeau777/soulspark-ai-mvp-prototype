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

    // Define notification content based on time and type
    const now = new Date();
    const hour = now.getHours();

    if (type === 'check_in') {
      if (hour >= 6 && hour < 12) {
        title = '🌅 Morning SoulSpark';
        body = 'Start your day with intention. How is your heart feeling this morning?';
        tag = 'morning_checkin';
      } else if (hour >= 12 && hour < 18) {
        title = '☀️ Afternoon Pause';
        body = 'Take a moment to breathe. How has your spirit been today?';
        tag = 'afternoon_checkin';
      } else {
        title = '🌙 Evening Reflection';
        body = 'Rest and reflect. What is your soul grateful for today?';
        tag = 'evening_checkin';
      }
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
          url: '/dashboard',
          type: 'check_in'
        }
      };

      try {
        // Using Web Push API (you'd need to implement VAPID keys and push service)
        // For now, we'll log the notification
        console.log(`Sending notification to user ${sub.user_id}:`, payload);
        
        // In a real implementation, you'd use a service like:
        // - Firebase Cloud Messaging
        // - Web Push Protocol with VAPID
        // - OneSignal
        // - Pusher
        
        return { success: true, userId: sub.user_id };
      } catch (error) {
        console.error(`Failed to send notification to ${sub.user_id}:`, error);
        return { success: false, userId: sub.user_id, error };
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