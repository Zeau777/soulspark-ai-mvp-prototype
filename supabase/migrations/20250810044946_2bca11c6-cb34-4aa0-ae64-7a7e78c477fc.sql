-- Recreate extensions in the extensions schema (drop then create)
CREATE SCHEMA IF NOT EXISTS extensions;

-- Drop existing extensions if present (will remove jobs; we'll re-create schedules)
DO $$
BEGIN
  BEGIN
    DROP EXTENSION IF EXISTS pg_cron;
  EXCEPTION WHEN OTHERS THEN
    -- ignore
    NULL;
  END;
  BEGIN
    DROP EXTENSION IF EXISTS pg_net;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END$$;

-- Create in extensions schema
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Recreate schedules
select cron.schedule(
  'impact-credit-processor-15min',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://yhrqfmvnxpnhsciczeav.supabase.co/functions/v1/impact-credit-processor',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlocnFmbXZueHBuaHNjaWN6ZWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxODEzNDcsImV4cCI6MjA2OTc1NzM0N30.wFq07k3hRjdAhkSiriSovwNGiyCIYilvRCh8C__wMdA"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

select cron.schedule(
  'impact-donation-batch-monthly',
  '0 2 1 * *',
  $$
  select net.http_post(
    url := 'https://yhrqfmvnxpnhsciczeav.supabase.co/functions/v1/impact-donation-batch',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlocnFmbXZueHBuaHNjaWN6ZWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxODEzNDcsImV4cCI6MjA2OTc1NzM0N30.wFq07k3hRjdAhkSiriSovwNGiyCIYilvRCh8C__wMdA"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);