import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Scheduled notification check running...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date();
    const hour = now.getHours();
    
    // Define notification times
    const notificationTimes = [
      { hour: 8, name: 'morning' },    // 8 AM
      { hour: 14, name: 'afternoon' }, // 2 PM  
      { hour: 20, name: 'evening' }    // 8 PM
    ];

    // Check if current time matches any notification time
    const shouldSendNotification = notificationTimes.some(time => time.hour === hour);

    if (!shouldSendNotification) {
      return new Response(
        JSON.stringify({ message: 'Not a scheduled notification time' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all users with push subscriptions who haven't checked in today
    const today = new Date().toISOString().split('T')[0];
    
    const { data: usersToNotify, error } = await supabase
      .from('push_subscriptions')
      .select(`
        user_id,
        profiles!inner(display_name)
      `)
      .not('user_id', 'in', `(
        SELECT DISTINCT user_id 
        FROM check_ins 
        WHERE created_at::date = '${today}'
      )`);

    if (error) {
      console.error('Error fetching users:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch users' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!usersToNotify || usersToNotify.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users to notify' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Trigger the push notification function with type per time of day
    const type = hour === 8 ? 'check_in' : hour === 14 ? 'coach' : 'journal';
    const { data: notificationResult, error: notificationError } = await supabase.functions.invoke(
      'send-push-notifications',
      {
        body: {
          type,
          userIds: usersToNotify.map(u => u.user_id)
        }
      }
    );

    if (notificationError) {
      console.error('Error sending notifications:', notificationError);
      return new Response(
        JSON.stringify({ error: 'Failed to send notifications' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sent notifications to ${usersToNotify.length} users`);

    return new Response(
      JSON.stringify({ 
        message: `Notifications sent to ${usersToNotify.length} users`,
        result: notificationResult 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in schedule-notifications function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);