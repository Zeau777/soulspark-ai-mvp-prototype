-- Fix RLS recursion on circle_memberships causing community data load failures
-- See Postgres logs: "infinite recursion detected in policy for relation \"circle_memberships\""

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Users can view memberships in their circles" ON public.circle_memberships;

-- Create a safe, non-recursive SELECT policy that still supports
-- subqueries like "SELECT circle_id FROM circle_memberships WHERE user_id = auth.uid()"
CREATE POLICY "Users can view their own memberships"
ON public.circle_memberships
FOR SELECT
USING (user_id = auth.uid());