-- Enable required extensions for scheduling HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Impact action mappings (what each action earns in meal credits)
CREATE TABLE IF NOT EXISTS public.impact_action_mappings (
  action_type TEXT PRIMARY KEY,
  credit NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'event', -- 'event' or 'minute'
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Keep updated_at fresh
CREATE TRIGGER update_impact_action_mappings_updated_at
BEFORE UPDATE ON public.impact_action_mappings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default mappings (idempotent)
INSERT INTO public.impact_action_mappings (action_type, credit, unit, notes)
VALUES
  ('souldrop_view', 0.02, 'event', 'SoulDrop viewed'),
  ('souldrop_like', 0.02, 'event', 'SoulDrop liked'),
  ('souldrop_save', 0.05, 'event', 'SoulDrop saved/shared'),
  ('daily_checkin', 0.10, 'event', 'Daily mood check-in'),
  ('coach_session_minute', 0.04, 'minute', 'Per minute of coach session'),
  ('community_post', 0.10, 'event', 'Community post'),
  ('community_support', 0.05, 'event', 'Supportive comment/react'),
  ('weekly_goal_completed', 0.50, 'event', 'Weekly goal completed'),
  ('streak_7_bonus', 1.00, 'event', '7-day streak bonus'),
  ('streak_30_bonus', 5.00, 'event', '30-day streak bonus'),
  ('invite_onboarded', 3.00, 'event', 'Invitee onboarded bonus')
ON CONFLICT (action_type) DO NOTHING;

-- Impact settings
CREATE TABLE IF NOT EXISTS public.impact_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner TEXT NOT NULL DEFAULT 'no_kid_hungry',
  donation_rate_cents_per_meal INTEGER NOT NULL DEFAULT 10, -- $0.10 per meal
  goal_meals_per_year INTEGER NOT NULL DEFAULT 1000000,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_impact_settings_updated_at
BEFORE UPDATE ON public.impact_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Ensure one settings row exists
INSERT INTO public.impact_settings (partner)
SELECT 'no_kid_hungry'
WHERE NOT EXISTS (SELECT 1 FROM public.impact_settings);

-- Credits ledger derived from engagement
CREATE TABLE IF NOT EXISTS public.impact_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  engagement_id UUID NULL,
  action_type TEXT NOT NULL,
  credits NUMERIC NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  batched_id UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_impact_credits_user_id ON public.impact_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_impact_credits_engagement_id ON public.impact_credits(engagement_id);
CREATE INDEX IF NOT EXISTS idx_impact_credits_created_at ON public.impact_credits(created_at);
CREATE INDEX IF NOT EXISTS idx_impact_credits_batched_id ON public.impact_credits(batched_id);

-- Batches for partner donations
CREATE TABLE IF NOT EXISTS public.impact_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_credits NUMERIC NOT NULL DEFAULT 0,
  total_meals INTEGER NOT NULL DEFAULT 0,
  total_amount_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  external_id TEXT NULL,
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uniq_partner_period UNIQUE (partner, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_impact_batches_status ON public.impact_batches(status);

CREATE TRIGGER update_impact_batches_updated_at
BEFORE UPDATE ON public.impact_batches
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Mark processed engagement events (service role will update this)
ALTER TABLE public.user_engagement
ADD COLUMN IF NOT EXISTS impact_processed_at TIMESTAMPTZ NULL;
CREATE INDEX IF NOT EXISTS idx_user_engagement_processed ON public.user_engagement(impact_processed_at);

-- Enable RLS
ALTER TABLE public.impact_action_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_batches ENABLE ROW LEVEL SECURITY;

-- Policies
-- Read-only access to mappings and settings for authenticated users (no writes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'impact_action_mappings' AND policyname = 'Mappings are viewable by authenticated users'
  ) THEN
    CREATE POLICY "Mappings are viewable by authenticated users"
    ON public.impact_action_mappings
    FOR SELECT TO authenticated
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'impact_settings' AND policyname = 'Settings are viewable by authenticated users'
  ) THEN
    CREATE POLICY "Settings are viewable by authenticated users"
    ON public.impact_settings
    FOR SELECT TO authenticated
    USING (true);
  END IF;
END$$;

-- Users can view their own credits
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'impact_credits' AND policyname = 'Users can view their own impact credits'
  ) THEN
    CREATE POLICY "Users can view their own impact credits"
    ON public.impact_credits
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());
  END IF;
END$$;

-- Org admins can view org impact credits using current_user_email()
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'impact_credits' AND policyname = 'Org admins can view impact credits for their org'
  ) THEN
    CREATE POLICY "Org admins can view impact credits for their org"
    ON public.impact_credits
    FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM public.profiles p
        JOIN public.organizations o ON o.id = p.organization_id
        WHERE p.user_id = impact_credits.user_id
          AND o.admin_email = public.current_user_email()
      )
    );
  END IF;
END$$;

-- Batches are viewable by authenticated users (aggregated only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'impact_batches' AND policyname = 'Batches are viewable by authenticated users'
  ) THEN
    CREATE POLICY "Batches are viewable by authenticated users"
    ON public.impact_batches
    FOR SELECT TO authenticated
    USING (true);
  END IF;
END$$;

-- Schedules: run credit processor every 15 minutes and donation batch monthly
-- Note: uses anon key for Authorization
select cron.schedule(
  'impact-credit-processor-15min',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://yhrqfmvnxpnhsciczeav.supabase.co/functions/v1/impact-credit-processor',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlocnFmbXZueHBuaHNjaWN6ZWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxODEzNDcsImV4cCI6MjA2OTc1NzM0N30.wFq07k3hRjdAhkSiriSovwNGiyCIYilvRCh8C__wMdA"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

select cron.schedule(
  'impact-donation-batch-monthly',
  '0 2 1 * *', -- 2am UTC on the 1st of each month
  $$
  select net.http_post(
    url := 'https://yhrqfmvnxpnhsciczeav.supabase.co/functions/v1/impact-donation-batch',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlocnFmbXZueHBuaHNjaWN6ZWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxODEzNDcsImV4cCI6MjA2OTc1NzM0N30.wFq07k3hRjdAhkSiriSovwNGiyCIYilvRCh8C__wMdA"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);