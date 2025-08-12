-- Secure partnership_leads: restrict SELECT to organization admins only
-- Keep INSERT open for public lead capture

-- Ensure RLS is enabled (idempotent)
ALTER TABLE public.partnership_leads ENABLE ROW LEVEL SECURITY;

-- Remove overly permissive SELECT policy
DROP POLICY IF EXISTS "Admins can view all partnership leads" ON public.partnership_leads;

-- Create strict SELECT policy for org admins
CREATE POLICY "Only org admins can view partnership leads"
ON public.partnership_leads
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.organizations o
    WHERE o.admin_email = public.current_user_email()
  )
);
