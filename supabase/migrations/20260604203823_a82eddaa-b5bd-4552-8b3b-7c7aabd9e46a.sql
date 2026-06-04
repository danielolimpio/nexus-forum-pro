
-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  cover_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles read" on public.profiles for select using (true);
create policy "profiles insert self" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles update self" on public.profiles for update to authenticated using (auth.uid() = id);

-- GROUPS
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  category text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select on public.groups to anon, authenticated;
grant insert on public.groups to authenticated;
grant update, delete on public.groups to authenticated;
grant all on public.groups to service_role;
alter table public.groups enable row level security;
create policy "groups read" on public.groups for select using (true);
create policy "groups insert auth" on public.groups for insert to authenticated with check (auth.uid() = created_by);
create policy "groups update owner" on public.groups for update to authenticated using (auth.uid() = created_by);
create policy "groups delete owner" on public.groups for delete to authenticated using (auth.uid() = created_by);

-- POSTS (perguntas)
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  keyword text unique not null,
  created_at timestamptz not null default now()
);
create index posts_group_idx on public.posts(group_id);
create index posts_author_idx on public.posts(author_id);
grant select on public.posts to anon, authenticated;
grant insert, update, delete on public.posts to authenticated;
grant all on public.posts to service_role;
alter table public.posts enable row level security;
create policy "posts read" on public.posts for select using (true);
create policy "posts insert auth" on public.posts for insert to authenticated with check (auth.uid() = author_id);
create policy "posts update owner" on public.posts for update to authenticated using (auth.uid() = author_id);
create policy "posts delete owner" on public.posts for delete to authenticated using (auth.uid() = author_id);

-- REPLIES (escadinha)
create table public.replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  parent_id uuid references public.replies(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  depth int not null default 0 check (depth between 0 and 5),
  created_at timestamptz not null default now()
);
create index replies_post_idx on public.replies(post_id);
create index replies_parent_idx on public.replies(parent_id);
grant select on public.replies to anon, authenticated;
grant insert, update, delete on public.replies to authenticated;
grant all on public.replies to service_role;
alter table public.replies enable row level security;
create policy "replies read" on public.replies for select using (true);
create policy "replies insert auth" on public.replies for insert to authenticated with check (auth.uid() = author_id);
create policy "replies update owner" on public.replies for update to authenticated using (auth.uid() = author_id);
create policy "replies delete owner" on public.replies for delete to authenticated using (auth.uid() = author_id);

-- VOTES
create table public.votes (
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('post','reply')),
  target_id uuid not null,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (user_id, target_type, target_id)
);
grant select on public.votes to anon, authenticated;
grant insert, update, delete on public.votes to authenticated;
grant all on public.votes to service_role;
alter table public.votes enable row level security;
create policy "votes read" on public.votes for select using (true);
create policy "votes write self" on public.votes for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare base text; candidate text; n int := 0;
begin
  base := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)), '[^a-z0-9_]+', '', 'g'));
  if base = '' or base is null then base := 'user'; end if;
  candidate := base;
  while exists(select 1 from public.profiles where username = candidate) loop
    n := n + 1; candidate := base || n::text;
  end loop;
  insert into public.profiles (id, username, display_name, avatar_url)
  values (new.id, candidate, coalesce(new.raw_user_meta_data->>'display_name', candidate), new.raw_user_meta_data->>'avatar_url');
  return new;
end; $$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- seed categories as groups (lightweight)
insert into public.groups (slug, name, description, category) values
  ('tecnologia-geral','Tecnologia','Discussões sobre tecnologia','tecnologia'),
  ('negocios-geral','Negócios','Discussões sobre negócios e estratégia','negocios'),
  ('direito-geral','Direito','Discussões jurídicas','direito'),
  ('engenharia-geral','Engenharia','Discussões de engenharia','engenharia'),
  ('ciencia-geral','Ciência','Discussões científicas','ciencia'),
  ('educacao-geral','Educação','Discussões sobre educação','educacao')
on conflict (slug) do nothing;
