-- Add pricing plan fields to organizations table
ALTER TABLE public.organizations 
ADD COLUMN pricing_plan TEXT DEFAULT 'starter' CHECK (pricing_plan IN ('starter', 'growth', 'enterprise', 'college', 'sports')),
ADD COLUMN max_seats INTEGER DEFAULT 250,
ADD COLUMN current_seats INTEGER DEFAULT 0;