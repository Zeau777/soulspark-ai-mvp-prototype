-- Move extensions to the dedicated 'extensions' schema to satisfy security linter
CREATE SCHEMA IF NOT EXISTS extensions;
DO $$
BEGIN
  BEGIN
    ALTER EXTENSION pg_net SET SCHEMA extensions;
  EXCEPTION WHEN undefined_object THEN
    -- Install in extensions schema if not present
    CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
  END;

  BEGIN
    ALTER EXTENSION pg_cron SET SCHEMA extensions;
  EXCEPTION WHEN undefined_object THEN
    CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
  END;
END$$;