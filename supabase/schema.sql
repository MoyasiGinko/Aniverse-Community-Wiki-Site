-- Aniverse Supabase schema
-- Run this in Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  username text not null,
  password_hash text not null default '',
  provider text not null check (provider in ('local', 'google', 'discord')),
  role text not null check (role in ('user', 'mod', 'admin')) default 'user',
  bio text not null default '',
  avatar_url text not null default '',
  joined_at timestamptz not null default now()
);

create table if not exists public.app_sessions (
  token text primary key,
  user_id uuid not null references public.app_users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.app_watchlist (
  user_id uuid not null references public.app_users(id) on delete cascade,
  anime_id text not null,
  title text not null,
  image_url text not null default '',
  added_at timestamptz not null default now(),
  primary key (user_id, anime_id)
);

create table if not exists public.app_wiki_entries (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  body text not null,
  tags text[] not null default '{}',
  status text not null check (status in ('draft', 'published', 'flagged', 'archived')) default 'draft',
  author_id uuid not null references public.app_users(id) on delete cascade,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  revision integer not null default 1
);

create table if not exists public.app_threads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  author_id uuid not null references public.app_users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.app_comments (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.app_threads(id) on delete cascade,
  body text not null,
  author_id uuid not null references public.app_users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.app_reports (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('thread', 'comment', 'wiki')),
  target_id text not null,
  reason text not null,
  reporter_id uuid not null references public.app_users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_sessions_user on public.app_sessions(user_id);
create index if not exists idx_watchlist_user on public.app_watchlist(user_id);
create index if not exists idx_wiki_author on public.app_wiki_entries(author_id);
create index if not exists idx_threads_author on public.app_threads(author_id);
create index if not exists idx_comments_thread on public.app_comments(thread_id);
create index if not exists idx_comments_author on public.app_comments(author_id);
create index if not exists idx_reports_reporter on public.app_reports(reporter_id);

alter table public.app_users enable row level security;
alter table public.app_sessions enable row level security;
alter table public.app_watchlist enable row level security;
alter table public.app_wiki_entries enable row level security;
alter table public.app_threads enable row level security;
alter table public.app_comments enable row level security;
alter table public.app_reports enable row level security;

-- Temporary permissive policies for app-owned API routes using publishable key.
-- Tighten these for production once Supabase Auth JWT flow is adopted.
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'app_users' and policyname = 'allow_all_users') then
    create policy allow_all_users on public.app_users for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'app_sessions' and policyname = 'allow_all_sessions') then
    create policy allow_all_sessions on public.app_sessions for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'app_watchlist' and policyname = 'allow_all_watchlist') then
    create policy allow_all_watchlist on public.app_watchlist for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'app_wiki_entries' and policyname = 'allow_all_wiki') then
    create policy allow_all_wiki on public.app_wiki_entries for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'app_threads' and policyname = 'allow_all_threads') then
    create policy allow_all_threads on public.app_threads for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'app_comments' and policyname = 'allow_all_comments') then
    create policy allow_all_comments on public.app_comments for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'app_reports' and policyname = 'allow_all_reports') then
    create policy allow_all_reports on public.app_reports for all using (true) with check (true);
  end if;
end $$;
