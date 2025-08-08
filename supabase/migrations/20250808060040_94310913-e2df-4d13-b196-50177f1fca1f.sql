-- Create helper to safely access current user's email without direct policy references to auth.users
CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$;

-- Update policies to use the helper instead of selecting from auth.users directly

-- Organizations: admins can update their org (based on admin_email)
DROP POLICY IF EXISTS "Organization admins can update their org" ON public.organizations;
CREATE POLICY "Organization admins can update their org"
ON public.organizations
FOR UPDATE
USING (admin_email = public.current_user_email());

-- Soul drops: org admins can manage soul drops
DROP POLICY IF EXISTS "Org admins can manage soul drops" ON public.soul_drops;
CREATE POLICY "Org admins can manage soul drops"
ON public.soul_drops
FOR ALL
USING (
  organization_id IN (
    SELECT o.id FROM public.organizations o
    WHERE o.admin_email = public.current_user_email()
  )
)
WITH CHECK (
  organization_id IN (
    SELECT o.id FROM public.organizations o
    WHERE o.admin_email = public.current_user_email()
  )
);
