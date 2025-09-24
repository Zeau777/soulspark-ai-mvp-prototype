-- Fix the search path issue for the existing function
CREATE OR REPLACE FUNCTION public.update_discord_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';