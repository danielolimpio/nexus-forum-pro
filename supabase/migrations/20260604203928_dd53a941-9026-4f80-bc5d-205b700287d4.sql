
create policy "avatars read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars upload own" on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "avatars update own" on storage.objects for update to authenticated using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "avatars delete own" on storage.objects for delete to authenticated using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "covers read" on storage.objects for select using (bucket_id = 'covers');
create policy "covers upload own" on storage.objects for insert to authenticated with check (bucket_id = 'covers' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "covers update own" on storage.objects for update to authenticated using (bucket_id = 'covers' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "covers delete own" on storage.objects for delete to authenticated using (bucket_id = 'covers' and auth.uid()::text = (storage.foldername(name))[1]);
