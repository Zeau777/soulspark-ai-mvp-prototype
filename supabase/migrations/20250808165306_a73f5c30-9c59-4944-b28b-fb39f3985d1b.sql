-- Add updated_at to soul_drops and maintain it via trigger
-- Safe function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'soul_drops'
      AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.soul_drops
      ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;
END $$;

-- Recreate trigger
DROP TRIGGER IF EXISTS update_soul_drops_updated_at ON public.soul_drops;
CREATE TRIGGER update_soul_drops_updated_at
BEFORE UPDATE ON public.soul_drops
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();