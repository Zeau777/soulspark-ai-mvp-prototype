-- Add likes count on soul_drops and maintain via triggers; ensure one like per user/content and allow users to unlike

-- 1) Add likes_count column
ALTER TABLE public.soul_drops
ADD COLUMN IF NOT EXISTS likes_count integer NOT NULL DEFAULT 0;

-- 2) Backfill likes_count from existing engagement data (if any)
UPDATE public.soul_drops sd
SET likes_count = COALESCE(ue.cnt, 0)
FROM (
  SELECT content_id, count(*)::int AS cnt
  FROM public.user_engagement
  WHERE action_type = 'souldrop_like' AND content_id IS NOT NULL
  GROUP BY content_id
) ue
WHERE sd.id = ue.content_id;

-- 3) Ensure a user can only like a SoulDrop once
CREATE UNIQUE INDEX IF NOT EXISTS unique_like_per_user_content
ON public.user_engagement (user_id, content_id)
WHERE action_type = 'souldrop_like';

-- 4) Trigger function to maintain likes_count
CREATE OR REPLACE FUNCTION public.update_souldrop_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF NEW.action_type = 'souldrop_like' AND NEW.content_id IS NOT NULL THEN
      UPDATE public.soul_drops
      SET likes_count = likes_count + 1, updated_at = now()
      WHERE id = NEW.content_id;
    END IF;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    IF OLD.action_type = 'souldrop_like' AND OLD.content_id IS NOT NULL THEN
      UPDATE public.soul_drops
      SET likes_count = GREATEST(likes_count - 1, 0), updated_at = now()
      WHERE id = OLD.content_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- 5) Triggers on user_engagement for insert/delete
DROP TRIGGER IF EXISTS trg_update_souldrop_likes_count_ins ON public.user_engagement;
CREATE TRIGGER trg_update_souldrop_likes_count_ins
AFTER INSERT ON public.user_engagement
FOR EACH ROW EXECUTE FUNCTION public.update_souldrop_likes_count();

DROP TRIGGER IF EXISTS trg_update_souldrop_likes_count_del ON public.user_engagement;
CREATE TRIGGER trg_update_souldrop_likes_count_del
AFTER DELETE ON public.user_engagement
FOR EACH ROW EXECUTE FUNCTION public.update_souldrop_likes_count();

-- 6) Allow users to delete their own engagement (to unlike)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_engagement' AND policyname = 'Users can delete their engagement data'
  ) THEN
    CREATE POLICY "Users can delete their engagement data"
    ON public.user_engagement
    FOR DELETE
    USING (user_id = auth.uid());
  END IF;
END$$;