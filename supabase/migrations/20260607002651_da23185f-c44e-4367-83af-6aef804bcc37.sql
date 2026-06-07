UPDATE public.groups SET name = btrim(split_part(name, ' · u/', 1)) WHERE name LIKE '% · u/%';

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'groups_created_by_profiles_fkey' AND table_name = 'groups'
  ) THEN
    ALTER TABLE public.groups
      ADD CONSTRAINT groups_created_by_profiles_fkey
      FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;