-- Aniverse Supabase schema
-- Run this in Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  username text not null,
  password_hash text not null default '',
  provider text not null check (provider in ('local', 'google', 'discord', 'facebook', 'github')),
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

create table if not exists public.app_communities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  category text not null default 'General',
  banner_url text not null default '',
  icon_url text not null default '',
  owner_id uuid not null references public.app_users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.app_community_members (
  community_id uuid not null references public.app_communities(id) on delete cascade,
  user_id uuid not null references public.app_users(id) on delete cascade,
  role text not null check (role in ('member', 'mod', 'admin')) default 'member',
  joined_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

create table if not exists public.app_wiki_entries (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  body text not null,
  tags text[] not null default '{}',
  status text not null check (status in ('draft', 'published', 'flagged', 'archived')) default 'draft',
  mal_anime_id integer,
  mal_anime_title text not null default '',
  cover_image_url text not null default '',
  extra_image_urls text[] not null default '{}',
  author_id uuid not null references public.app_users(id) on delete cascade,
  community_id uuid references public.app_communities(id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  revision integer not null default 1
);

alter table public.app_wiki_entries add column if not exists mal_anime_id integer;
alter table public.app_wiki_entries add column if not exists mal_anime_title text not null default '';
alter table public.app_wiki_entries add column if not exists cover_image_url text not null default '';
alter table public.app_wiki_entries add column if not exists extra_image_urls text[] not null default '{}';
alter table public.app_wiki_entries add column if not exists community_id uuid references public.app_communities(id) on delete set null;

create table if not exists public.app_wiki_comments (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.app_wiki_entries(id) on delete cascade,
  parent_comment_id uuid references public.app_wiki_comments(id) on delete cascade,
  body text not null,
  author_id uuid not null references public.app_users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.app_wiki_comments add column if not exists parent_comment_id uuid references public.app_wiki_comments(id) on delete cascade;

create table if not exists public.app_threads (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references public.app_communities(id) on delete cascade,
  wiki_reference_id uuid references public.app_wiki_entries(id) on delete cascade,
  title text not null,
  body text not null,
  image_urls text[] not null default '{}',
  author_id uuid not null references public.app_users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.app_threads add column if not exists community_id uuid references public.app_communities(id) on delete cascade;
alter table public.app_threads add column if not exists wiki_reference_id uuid references public.app_wiki_entries(id) on delete cascade;
alter table public.app_threads add column if not exists image_urls text[] not null default '{}';

create table if not exists public.app_comments (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.app_threads(id) on delete cascade,
  parent_comment_id uuid references public.app_comments(id) on delete cascade,
  body text not null,
  author_id uuid not null references public.app_users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.app_comments add column if not exists parent_comment_id uuid references public.app_comments(id) on delete cascade;

create table if not exists public.app_thread_votes (
  thread_id uuid not null references public.app_threads(id) on delete cascade,
  user_id uuid not null references public.app_users(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (thread_id, user_id)
);

create table if not exists public.app_thread_saves (
  thread_id uuid not null references public.app_threads(id) on delete cascade,
  user_id uuid not null references public.app_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (thread_id, user_id)
);

create table if not exists public.app_thread_views (
  thread_id uuid not null references public.app_threads(id) on delete cascade,
  user_id uuid not null references public.app_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (thread_id, user_id)
);

create table if not exists public.app_reports (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('thread', 'comment', 'wiki', 'community')),
  target_id text not null,
  reason text not null,
  reporter_id uuid not null references public.app_users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_sessions_user on public.app_sessions(user_id);
create index if not exists idx_watchlist_user on public.app_watchlist(user_id);
create index if not exists idx_communities_owner on public.app_communities(owner_id);
create index if not exists idx_community_members_user on public.app_community_members(user_id);
create index if not exists idx_wiki_author on public.app_wiki_entries(author_id);
create index if not exists idx_wiki_community on public.app_wiki_entries(community_id);
create index if not exists idx_wiki_comments_entry on public.app_wiki_comments(entry_id);
create index if not exists idx_wiki_comments_author on public.app_wiki_comments(author_id);
create index if not exists idx_wiki_comments_parent on public.app_wiki_comments(parent_comment_id);
create index if not exists idx_threads_author on public.app_threads(author_id);
create index if not exists idx_threads_community on public.app_threads(community_id);
create index if not exists idx_threads_wiki on public.app_threads(wiki_reference_id);
create index if not exists idx_comments_thread on public.app_comments(thread_id);
create index if not exists idx_comments_author on public.app_comments(author_id);
create index if not exists idx_comments_parent on public.app_comments(parent_comment_id);
create index if not exists idx_thread_votes_thread on public.app_thread_votes(thread_id);
create index if not exists idx_thread_votes_user on public.app_thread_votes(user_id);
create index if not exists idx_thread_saves_thread on public.app_thread_saves(thread_id);
create index if not exists idx_thread_saves_user on public.app_thread_saves(user_id);
create index if not exists idx_thread_views_thread on public.app_thread_views(thread_id);
create index if not exists idx_thread_views_user on public.app_thread_views(user_id);
create index if not exists idx_reports_reporter on public.app_reports(reporter_id);

alter table public.app_users enable row level security;
alter table public.app_sessions enable row level security;
alter table public.app_watchlist enable row level security;
alter table public.app_communities enable row level security;
alter table public.app_community_members enable row level security;
alter table public.app_wiki_entries enable row level security;
alter table public.app_wiki_comments enable row level security;
alter table public.app_threads enable row level security;
alter table public.app_comments enable row level security;
alter table public.app_thread_votes enable row level security;
alter table public.app_thread_saves enable row level security;
alter table public.app_thread_views enable row level security;
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
  if not exists (select 1 from pg_policies where tablename = 'app_communities' and policyname = 'allow_all_communities') then
    create policy allow_all_communities on public.app_communities for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'app_community_members' and policyname = 'allow_all_community_members') then
    create policy allow_all_community_members on public.app_community_members for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'app_wiki_entries' and policyname = 'allow_all_wiki') then
    create policy allow_all_wiki on public.app_wiki_entries for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'app_wiki_comments' and policyname = 'allow_all_wiki_comments') then
    create policy allow_all_wiki_comments on public.app_wiki_comments for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'app_threads' and policyname = 'allow_all_threads') then
    create policy allow_all_threads on public.app_threads for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'app_comments' and policyname = 'allow_all_comments') then
    create policy allow_all_comments on public.app_comments for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'app_thread_votes' and policyname = 'allow_all_thread_votes') then
    create policy allow_all_thread_votes on public.app_thread_votes for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'app_thread_saves' and policyname = 'allow_all_thread_saves') then
    create policy allow_all_thread_saves on public.app_thread_saves for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'app_thread_views' and policyname = 'allow_all_thread_views') then
    create policy allow_all_thread_views on public.app_thread_views for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'app_reports' and policyname = 'allow_all_reports') then
    create policy allow_all_reports on public.app_reports for all using (true) with check (true);
  end if;
end $$;
