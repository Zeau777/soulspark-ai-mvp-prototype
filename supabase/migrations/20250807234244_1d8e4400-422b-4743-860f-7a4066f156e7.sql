-- Fix function search path security issues
CREATE OR REPLACE FUNCTION cleanup_push_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Remove subscriptions older than 30 days without activity
    DELETE FROM push_subscriptions 
    WHERE updated_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Fix test function search path
CREATE OR REPLACE FUNCTION test_user_notification(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- This function can be called to test notifications for a specific user
    -- The actual notification sending happens in the edge function
    INSERT INTO user_engagement (user_id, action_type, xp_earned)
    VALUES (p_user_id, 'notification_test', 0);
END;
$$;