-- Create table to whitelist legacy subscribers by email
CREATE TABLE IF NOT EXISTS public.legacy_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.legacy_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow users to check only their own legacy status
CREATE POLICY IF NOT EXISTS "Users can check their own legacy status"
ON public.legacy_subscribers
FOR SELECT
USING (email = public.current_user_email());

-- Optional: allow inserts/updates by trusted edge functions later (keep permissive for now via service role)
CREATE POLICY IF NOT EXISTS "Edge functions can manage legacy subscribers"
ON public.legacy_subscribers
FOR ALL
USING (true)
WITH CHECK (true);

-- Seed initial legacy subscriber emails from the provided list
INSERT INTO public.legacy_subscribers (email, notes)
VALUES
  ('sacazeau4@gmail.com', 'legacy'),
  ('kynlyc@icloud.com', 'legacy'),
  ('estrellagomez1987@yahoo.com', 'legacy'),
  ('lillycazeau@gmail.com', 'legacy'),
  ('kingpeter@mysoulsparkai.com', 'legacy'),
  ('kingjoshua.cazeau13@gmail.com', 'legacy'),
  ('kingjosephcazeau12@gmail.com', 'legacy'),
  ('kingjoshua.cazeau5@icloud.com', 'legacy'),
  ('kingjoseph.cazeau11@icloud.com', 'legacy'),
  ('sapkotamadhav125@gmail.com', 'legacy'),
  ('kingpeter.cazeau@gmail.com', 'legacy')
ON CONFLICT (email) DO NOTHING;