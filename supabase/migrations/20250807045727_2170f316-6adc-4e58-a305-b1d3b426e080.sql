-- Create a test organization with admin access
INSERT INTO public.organizations (name, code, admin_email, type, settings)
VALUES (
  'SoulSpark AI Test Organization',
  'SOULSPARK-TEST',
  'kingpeter@mysoulsparkai.com',
  'corporate',
  '{"features": ["analytics", "admin_dashboard", "custom_content"]}'::jsonb
);