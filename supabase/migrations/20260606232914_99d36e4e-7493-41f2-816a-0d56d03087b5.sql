
-- Add missing columns referenced by application code
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS image_url text;

-- Storage RLS policies for avatars, covers, groups buckets
-- Public read; authenticated users may write only into their own folder (userId/...)

DO $$
DECLARE b text;
BEGIN
  FOREACH b IN ARRAY ARRAY['avatars','covers','groups'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', b || ' public read');
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', b || ' owner insert');
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', b || ' owner update');
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', b || ' owner delete');
  END LOOP;
END $$;

CREATE POLICY "avatars public read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');
CREATE POLICY "avatars owner insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars owner update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars owner delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "covers public read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'covers');
CREATE POLICY "covers owner insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "covers owner update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "covers owner delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "groups public read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'groups');
CREATE POLICY "groups owner insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'groups' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "groups owner update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'groups' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "groups owner delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'groups' AND auth.uid()::text = (storage.foldername(name))[1]);
