
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE public.groups DROP CONSTRAINT IF EXISTS groups_slug_key;
CREATE UNIQUE INDEX IF NOT EXISTS groups_slug_active_unique
  ON public.groups (slug)
  WHERE deleted_at IS NULL;

CREATE OR REPLACE FUNCTION public.purge_expired_groups()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.groups
   WHERE deleted_at IS NOT NULL
     AND deleted_at < now() - interval '7 days';
$$;

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
DO $$
BEGIN
  PERFORM cron.unschedule('purge_expired_groups');
EXCEPTION WHEN OTHERS THEN NULL;
END$$;
SELECT cron.schedule('purge_expired_groups', '0 3 * * *', $$SELECT public.purge_expired_groups();$$);
