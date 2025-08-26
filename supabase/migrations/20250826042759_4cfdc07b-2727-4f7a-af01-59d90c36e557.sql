-- Add policy to allow organization admins to view their own organization by admin_email
CREATE POLICY "Organization admins can view their own org by email" 
ON public.organizations 
FOR SELECT 
USING (admin_email = current_user_email());