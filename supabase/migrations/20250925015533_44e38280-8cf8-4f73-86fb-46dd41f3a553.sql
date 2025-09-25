-- Create admin_users table for your team members
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  permissions JSONB DEFAULT '{"can_create_orgs": true, "can_manage_payments": true, "can_view_analytics": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admin users can view their own record
CREATE POLICY "Admin users can view their own record"
ON public.admin_users
FOR SELECT
USING (user_id = auth.uid());

-- Create admin_organization_actions table to track admin actions
CREATE TABLE public.admin_organization_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL REFERENCES public.admin_users(user_id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'created', 'payment_processed', 'plan_changed', 'activated', 'deactivated'
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_organization_actions ENABLE ROW LEVEL SECURITY;

-- Admin users can view and create actions
CREATE POLICY "Admin users can manage organization actions"
ON public.admin_organization_actions
FOR ALL
USING (admin_user_id IN (SELECT user_id FROM public.admin_users WHERE user_id = auth.uid()));

-- Add payment tracking to organizations
ALTER TABLE public.organizations 
ADD COLUMN payment_status TEXT DEFAULT 'pending',
ADD COLUMN payment_method TEXT,
ADD COLUMN payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN billing_contact_email TEXT,
ADD COLUMN billing_contact_name TEXT,
ADD COLUMN annual_contract_value INTEGER, -- in cents
ADD COLUMN contract_start_date DATE,
ADD COLUMN contract_end_date DATE,
ADD COLUMN managed_by_admin UUID REFERENCES public.admin_users(user_id);

-- Function to create organization by admin
CREATE OR REPLACE FUNCTION public.admin_create_organization(
  p_name TEXT,
  p_type TEXT,
  p_admin_email TEXT,
  p_pricing_plan TEXT,
  p_max_seats INTEGER,
  p_billing_contact_name TEXT DEFAULT NULL,
  p_billing_contact_email TEXT DEFAULT NULL,
  p_annual_contract_value INTEGER DEFAULT NULL,
  p_contract_start_date DATE DEFAULT NULL,
  p_contract_end_date DATE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_org_code TEXT;
  v_admin_user_id UUID;
BEGIN
  -- Check if caller is admin
  SELECT user_id INTO v_admin_user_id 
  FROM public.admin_users 
  WHERE user_id = auth.uid();
  
  IF v_admin_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Only admin users can create organizations';
  END IF;
  
  -- Generate unique organization code
  v_org_code := UPPER(LEFT(p_name, 3)) || '-' || TO_CHAR(EXTRACT(EPOCH FROM NOW())::INTEGER, 'FM999999');
  
  -- Create organization
  INSERT INTO public.organizations (
    name, 
    type, 
    admin_email, 
    code, 
    pricing_plan, 
    max_seats,
    billing_contact_name,
    billing_contact_email,
    annual_contract_value,
    contract_start_date,
    contract_end_date,
    managed_by_admin,
    payment_status
  ) VALUES (
    p_name,
    p_type,
    p_admin_email,
    v_org_code,
    p_pricing_plan,
    p_max_seats,
    p_billing_contact_name,
    p_billing_contact_email,
    p_annual_contract_value,
    p_contract_start_date,
    p_contract_end_date,
    v_admin_user_id,
    'pending'
  ) RETURNING id INTO v_org_id;
  
  -- Log the action
  INSERT INTO public.admin_organization_actions (
    admin_user_id,
    organization_id,
    action_type,
    details
  ) VALUES (
    v_admin_user_id,
    v_org_id,
    'created',
    jsonb_build_object(
      'pricing_plan', p_pricing_plan,
      'max_seats', p_max_seats,
      'type', p_type
    )
  );
  
  RETURN v_org_id;
END;
$$;

-- Function to process payment for organization
CREATE OR REPLACE FUNCTION public.admin_process_payment(
  p_organization_id UUID,
  p_payment_method TEXT,
  p_payment_amount INTEGER,
  p_payment_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_user_id UUID;
BEGIN
  -- Check if caller is admin
  SELECT user_id INTO v_admin_user_id 
  FROM public.admin_users 
  WHERE user_id = auth.uid();
  
  IF v_admin_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Only admin users can process payments';
  END IF;
  
  -- Update organization payment status
  UPDATE public.organizations 
  SET 
    payment_status = 'paid',
    payment_method = p_payment_method,
    payment_date = NOW(),
    updated_at = NOW()
  WHERE id = p_organization_id;
  
  -- Log the action
  INSERT INTO public.admin_organization_actions (
    admin_user_id,
    organization_id,
    action_type,
    details
  ) VALUES (
    v_admin_user_id,
    p_organization_id,
    'payment_processed',
    jsonb_build_object(
      'payment_method', p_payment_method,
      'amount_cents', p_payment_amount,
      'notes', p_payment_notes
    )
  );
  
  RETURN TRUE;
END;
$$;

-- Function to get admin dashboard data
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_data()
RETURNS TABLE(
  total_organizations BIGINT,
  pending_payments BIGINT,
  active_organizations BIGINT,
  total_revenue_cents BIGINT,
  recent_actions JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_user_id UUID;
BEGIN
  -- Check if caller is admin
  SELECT user_id INTO v_admin_user_id 
  FROM public.admin_users 
  WHERE user_id = auth.uid();
  
  IF v_admin_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Only admin users can access dashboard data';
  END IF;
  
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.organizations)::BIGINT,
    (SELECT COUNT(*) FROM public.organizations WHERE payment_status = 'pending')::BIGINT,
    (SELECT COUNT(*) FROM public.organizations WHERE payment_status = 'paid')::BIGINT,
    (SELECT COALESCE(SUM(annual_contract_value), 0) FROM public.organizations WHERE payment_status = 'paid')::BIGINT,
    (SELECT jsonb_agg(
      jsonb_build_object(
        'id', a.id,
        'action_type', a.action_type,
        'organization_name', o.name,
        'created_at', a.created_at,
        'details', a.details
      ) ORDER BY a.created_at DESC
    ) FROM public.admin_organization_actions a
    JOIN public.organizations o ON a.organization_id = o.id
    LIMIT 10) AS recent_actions;
END;
$$;