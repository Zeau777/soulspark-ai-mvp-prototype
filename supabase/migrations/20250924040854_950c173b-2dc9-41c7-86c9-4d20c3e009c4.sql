-- Create Discord configurations table
CREATE TABLE public.discord_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  is_connected BOOLEAN NOT NULL DEFAULT false,
  auto_souldrop_enabled BOOLEAN NOT NULL DEFAULT true,
  souldrop_time TIME WITHOUT TIME ZONE NOT NULL DEFAULT '09:00:00'::time without time zone,
  checkin_reminder_enabled BOOLEAN NOT NULL DEFAULT true,
  checkin_reminder_time TIME WITHOUT TIME ZONE NOT NULL DEFAULT '17:00:00'::time without time zone,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  welcome_message TEXT,
  guild_id TEXT,
  guild_name TEXT,
  bot_token TEXT,
  bot_user_id TEXT,
  channels TEXT[] DEFAULT '{}'::text[]
);

-- Create Discord interactions table
CREATE TABLE public.discord_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  discord_user_id TEXT NOT NULL,
  discord_channel_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL,
  content TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.discord_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discord_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for discord_configurations
CREATE POLICY "Organization admins can manage their discord config" 
ON public.discord_configurations 
FOR ALL 
USING (organization_id IN (
  SELECT o.id FROM organizations o 
  WHERE o.admin_email = current_user_email()
));

-- Create RLS policies for discord_interactions
CREATE POLICY "Organization admins can view their discord interactions" 
ON public.discord_interactions 
FOR SELECT 
USING (organization_id IN (
  SELECT o.id FROM organizations o 
  WHERE o.admin_email = current_user_email()
));

CREATE POLICY "System can insert discord interactions" 
ON public.discord_interactions 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for updated_at on discord_configurations
CREATE OR REPLACE FUNCTION public.update_discord_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_discord_configurations_updated_at
  BEFORE UPDATE ON public.discord_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_discord_configurations_updated_at();