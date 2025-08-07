-- Check if push_subscriptions table has proper structure
DO $$ 
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'push_subscriptions' AND column_name = 'created_at') THEN
        ALTER TABLE push_subscriptions ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'push_subscriptions' AND column_name = 'updated_at') THEN
        ALTER TABLE push_subscriptions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
    
    -- Add index for user_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'push_subscriptions' AND indexname = 'idx_push_subscriptions_user_id') THEN
        CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
    END IF;
    
    -- Add unique constraint on user_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'push_subscriptions' AND constraint_name = 'push_subscriptions_user_id_key') THEN
        ALTER TABLE push_subscriptions ADD CONSTRAINT push_subscriptions_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- Create a function to clean up old/invalid subscriptions
CREATE OR REPLACE FUNCTION cleanup_push_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Remove subscriptions older than 30 days without activity
    DELETE FROM push_subscriptions 
    WHERE updated_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Create a test function to manually trigger notifications for a user
CREATE OR REPLACE FUNCTION test_user_notification(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This function can be called to test notifications for a specific user
    -- The actual notification sending happens in the edge function
    INSERT INTO user_engagement (user_id, action_type, xp_earned)
    VALUES (p_user_id, 'notification_test', 0);
END;
$$;