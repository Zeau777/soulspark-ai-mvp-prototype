-- Create partnership_leads table to store lead magnet submissions
CREATE TABLE public.partnership_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization_name TEXT,
  role TEXT,
  partnership_type TEXT NOT NULL, -- 'colleges', 'companies', 'sports_teams'
  wants_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.partnership_leads ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view all partnership leads
CREATE POLICY "Admins can view all partnership leads" 
ON public.partnership_leads 
FOR SELECT 
USING (true); -- This allows reading for now, you can restrict later

-- Create policy for inserting leads (public access for lead magnets)
CREATE POLICY "Anyone can submit partnership leads" 
ON public.partnership_leads 
FOR INSERT 
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_partnership_leads_email ON public.partnership_leads(email);
CREATE INDEX idx_partnership_leads_type ON public.partnership_leads(partnership_type);
CREATE INDEX idx_partnership_leads_created_at ON public.partnership_leads(created_at DESC);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_partnership_leads_updated_at
BEFORE UPDATE ON public.partnership_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();