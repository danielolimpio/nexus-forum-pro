
alter table public.posts drop constraint posts_author_id_fkey;
alter table public.posts add constraint posts_author_id_fkey foreign key (author_id) references public.profiles(id) on delete cascade;

alter table public.replies drop constraint replies_author_id_fkey;
alter table public.replies add constraint replies_author_id_fkey foreign key (author_id) references public.profiles(id) on delete cascade;
