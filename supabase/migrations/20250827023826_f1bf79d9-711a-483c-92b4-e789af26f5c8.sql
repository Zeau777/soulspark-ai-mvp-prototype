-- Create slack_configurations table for partner organizations
CREATE TABLE IF NOT EXISTS public.slack_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  workspace_id TEXT,
  workspace_name TEXT,
  bot_token TEXT,
  bot_user_id TEXT,
  is_connected BOOLEAN NOT NULL DEFAULT false,
  channels TEXT[] DEFAULT '{}',
  auto_souldrop_enabled BOOLEAN NOT NULL DEFAULT true,
  souldrop_time TIME NOT NULL DEFAULT '09:00',
  checkin_reminder_enabled BOOLEAN NOT NULL DEFAULT true,
  checkin_reminder_time TIME NOT NULL DEFAULT '17:00',
  welcome_message TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id)
);

-- Enable Row Level Security
ALTER TABLE public.slack_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies for slack_configurations
CREATE POLICY "Organization admins can manage their slack config" 
ON public.slack_configurations 
FOR ALL 
USING (organization_id IN (
  SELECT o.id 
  FROM organizations o 
  WHERE o.admin_email = current_user_email()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_slack_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_slack_configurations_updated_at
  BEFORE UPDATE ON public.slack_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_slack_configurations_updated_at();

-- Create table for tracking Slack interactions and analytics
CREATE TABLE IF NOT EXISTS public.slack_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  slack_user_id TEXT NOT NULL,
  slack_channel_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL, -- 'checkin', 'souldrop_view', 'command', 'message'
  content TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for slack_interactions
ALTER TABLE public.slack_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for slack_interactions
CREATE POLICY "Organization admins can view their slack interactions" 
ON public.slack_interactions 
FOR SELECT 
USING (organization_id IN (
  SELECT o.id 
  FROM organizations o 
  WHERE o.admin_email = current_user_email()
));

CREATE POLICY "System can insert slack interactions" 
ON public.slack_interactions 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_slack_configurations_organization_id ON public.slack_configurations(organization_id);
CREATE INDEX idx_slack_interactions_organization_id ON public.slack_interactions(organization_id);
CREATE INDEX idx_slack_interactions_created_at ON public.slack_interactions(created_at);
CREATE INDEX idx_slack_interactions_type ON public.slack_interactions(interaction_type);