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
  slug text not null default '',
  is_highlighted boolean not null default false,
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
alter table public.app_threads add column if not exists slug text not null default '';
alter table public.app_threads add column if not exists is_highlighted boolean not null default false;

create table if not exists public.app_comments (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.app_threads(id) on delete cascade,
  parent_comment_id uuid references public.app_comments(id) on delete cascade,
  body text not null,
  author_id uuid not null references public.app_users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.app_comments add column if not exists parent_comment_id uuid references public.app_comments(id) on delete cascade;

create table if not exists public.app_comment_votes (
  comment_id uuid not null references public.app_comments(id) on delete cascade,
  user_id uuid not null references public.app_users(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

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

create table if not exists public.app_thread_view_events (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.app_threads(id) on delete cascade,
  user_id uuid references public.app_users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.app_thread_shares (
  thread_id uuid not null references public.app_threads(id) on delete cascade,
  user_id uuid not null references public.app_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (thread_id, user_id)
);

create table if not exists public.app_thread_share_events (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.app_threads(id) on delete cascade,
  user_id uuid references public.app_users(id) on delete set null,
  created_at timestamptz not null default now()
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
create index if not exists idx_threads_slug on public.app_threads(slug);
create index if not exists idx_threads_community on public.app_threads(community_id);
create index if not exists idx_threads_wiki on public.app_threads(wiki_reference_id);
create index if not exists idx_threads_highlighted on public.app_threads(community_id, is_highlighted);
create index if not exists idx_comments_thread on public.app_comments(thread_id);
create index if not exists idx_comments_author on public.app_comments(author_id);
create index if not exists idx_comments_parent on public.app_comments(parent_comment_id);
create index if not exists idx_comment_votes_comment on public.app_comment_votes(comment_id);
create index if not exists idx_comment_votes_user on public.app_comment_votes(user_id);
create index if not exists idx_thread_votes_thread on public.app_thread_votes(thread_id);
create index if not exists idx_thread_votes_user on public.app_thread_votes(user_id);
create index if not exists idx_thread_saves_thread on public.app_thread_saves(thread_id);
create index if not exists idx_thread_saves_user on public.app_thread_saves(user_id);
create index if not exists idx_thread_views_thread on public.app_thread_views(thread_id);
create index if not exists idx_thread_views_user on public.app_thread_views(user_id);
create index if not exists idx_thread_view_events_thread on public.app_thread_view_events(thread_id);
create index if not exists idx_thread_view_events_user on public.app_thread_view_events(user_id);
create index if not exists idx_thread_shares_thread on public.app_thread_shares(thread_id);
create index if not exists idx_thread_shares_user on public.app_thread_shares(user_id);
create index if not exists idx_thread_share_events_thread on public.app_thread_share_events(thread_id);
create index if not exists idx_thread_share_events_user on public.app_thread_share_events(user_id);
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
alter table public.app_comment_votes enable row level security;
alter table public.app_thread_votes enable row level security;
alter table public.app_thread_saves enable row level security;
alter table public.app_thread_views enable row level security;
alter table public.app_thread_view_events enable row level security;
alter table public.app_thread_shares enable row level security;
alter table public.app_thread_share_events enable row level security;
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
  if not exists (select 1 from pg_policies where tablename = 'app_comment_votes' and policyname = 'allow_all_comment_votes') then
    create policy allow_all_comment_votes on public.app_comment_votes for all using (true) with check (true);
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
  if not exists (select 1 from pg_policies where tablename = 'app_thread_view_events' and policyname = 'allow_all_thread_view_events') then
    create policy allow_all_thread_view_events on public.app_thread_view_events for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'app_thread_shares' and policyname = 'allow_all_thread_shares') then
    create policy allow_all_thread_shares on public.app_thread_shares for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'app_thread_share_events' and policyname = 'allow_all_thread_share_events') then
    create policy allow_all_thread_share_events on public.app_thread_share_events for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'app_reports' and policyname = 'allow_all_reports') then
    create policy allow_all_reports on public.app_reports for all using (true) with check (true);
  end if;
end $$;

-- Automated User Synchronization trigger from auth.users to public.app_users
create or replace function public.handle_new_user()
returns trigger as $$
declare
  username_val text;
  provider_val text;
  avatar_url_val text;
begin
  -- Extract username from metadata or name or email
  username_val := coalesce(
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );
  
  -- Clean up username (letters, numbers, _, -, .) to match validation rules
  username_val := substring(regexp_replace(username_val, '[^a-zA-Z0-9_.-]', '', 'g') from 1 for 24);
  if length(username_val) < 3 then
    username_val := username_val || '_user';
  end if;

  -- Extract provider
  provider_val := coalesce(new.raw_app_meta_data->>'provider', 'local');
  if provider_val = 'email' then
    provider_val := 'local';
  end if;

  -- Extract avatar URL
  avatar_url_val := coalesce(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture',
    ''
  );

  insert into public.app_users (id, email, username, password_hash, provider, role, bio, avatar_url, joined_at)
  values (
    new.id,
    new.email,
    username_val,
    '',
    provider_val,
    'user',
    '',
    avatar_url_val,
    new.created_at
  )
  on conflict (id) do update
  set email = excluded.email,
      username = coalesce(public.app_users.username, excluded.username),
      avatar_url = coalesce(nullif(public.app_users.avatar_url, ''), excluded.avatar_url);
  
  return new;
end;
$$ language plpgsql security definer;

-- Recreate trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Secure RLS Policies for production use
alter table public.app_users enable row level security;
drop policy if exists allow_all_users on public.app_users;
create policy select_public_users on public.app_users for select using (true);
create policy insert_own_user on public.app_users for insert with check (auth.uid() = id);
create policy update_own_user on public.app_users for update using (auth.uid() = id) with check (auth.uid() = id);

alter table public.app_watchlist enable row level security;
drop policy if exists allow_all_watchlist on public.app_watchlist;
create policy select_own_watchlist on public.app_watchlist for select using (auth.uid() = user_id);
create policy insert_own_watchlist on public.app_watchlist for insert with check (auth.uid() = user_id);
create policy delete_own_watchlist on public.app_watchlist for delete using (auth.uid() = user_id);

