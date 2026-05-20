-- ============================================================
--  PhotoFly — Supabase SQL Schema  (idempotent, safe to re-run)
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ── Drop everything first so re-runs are clean ───────────────────────────────
drop table if exists public.search_logs cascade;
drop table if exists public.photos      cascade;
drop table if exists public.events      cascade;
drop table if exists public.users       cascade;

drop function if exists public.set_updated_at()                    cascade;
drop function if exists public.increment_event_counter(uuid, text) cascade;
drop function if exists public.hash_password(text)                 cascade;
drop function if exists public.check_password(text, text)          cascade;

-- ── 1. users ─────────────────────────────────────────────────────────────────
create table public.users (
  id            uuid        primary key default gen_random_uuid(),
  name          text        not null,
  email         text        not null unique,
  password_hash text        not null,
  role          text        not null default 'user'
                              check (role in ('user','photographer','admin')),
  avatar        text,
  banned        boolean     not null default false,
  plan          text        not null default 'free'
                              check (plan in ('free','pro','studio')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index users_email_idx on public.users (email);

-- ── 2. events ────────────────────────────────────────────────────────────────
create table public.events (
  id                   uuid        primary key default gen_random_uuid(),
  name                 text        not null,
  date                 date        not null,
  code                 text        not null unique,
  photographer_id      uuid        not null references public.users(id) on delete cascade,
  description          text,
  cover_image          text,
  photo_count          integer     not null default 0,
  search_count         integer     not null default 0,
  download_count       integer     not null default 0,
  is_active            boolean     not null default true,
  drive_folder_url     text,
  drive_folder_id      text,
  drive_folder_name    text,
  drive_synced_at      timestamptz,
  album_enabled        boolean     not null default true,
  album_title          text,
  album_subtitle       text,
  album_theme          text        not null default 'rose'
                         check (album_theme in ('rose','gold','midnight')),
  album_cover_photo_id uuid,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index events_photographer_idx on public.events (photographer_id);
create index events_code_idx         on public.events (code);

-- ── 3. photos ────────────────────────────────────────────────────────────────
create table public.photos (
  id                   uuid        primary key default gen_random_uuid(),
  event_id             uuid        not null references public.events(id) on delete cascade,
  url                  text        not null,
  thumbnail_url        text,
  name                 text,
  cloudinary_public_id text,                        -- e.g. "photofly/events/EVENT_CODE/abc123"
  faces_count          integer     not null default 0,
  tags                 text[]      not null default '{}',
  indexed              boolean     not null default false,
  saved_at             timestamptz not null default now(),
  created_at           timestamptz not null default now()
);

-- Migration: add cloudinary_public_id if upgrading an existing DB
-- alter table public.photos add column if not exists cloudinary_public_id text;

create index photos_event_idx   on public.photos (event_id);
create index photos_indexed_idx on public.photos (event_id, indexed);

-- ── 4. search_logs ───────────────────────────────────────────────────────────
create table public.search_logs (
  id          uuid        primary key default gen_random_uuid(),
  event_id    uuid        not null references public.events(id) on delete cascade,
  user_id     uuid        references public.users(id) on delete set null,
  selfie_url  text,
  match_count integer     not null default 0,
  ip_address  text,
  created_at  timestamptz not null default now()
);

create index search_logs_event_idx on public.search_logs (event_id);

-- ── 5. updated_at trigger ────────────────────────────────────────────────────
create function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger events_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- ── 6. Increment event counters ──────────────────────────────────────────────
create function public.increment_event_counter(
  p_event_id uuid,
  p_field    text
)
returns void language plpgsql security definer as $$
begin
  if p_field = 'photo_count' then
    update public.events set photo_count    = photo_count    + 1 where id = p_event_id;
  elsif p_field = 'search_count' then
    update public.events set search_count   = search_count   + 1 where id = p_event_id;
  elsif p_field = 'download_count' then
    update public.events set download_count = download_count + 1 where id = p_event_id;
  end if;
end;
$$;

-- Batch increment used by the upload API
create function public.increment_photo_count(
  p_event_id uuid,
  p_amount   integer default 1
)
returns void language plpgsql security definer as $$
begin
  update public.events
  set photo_count = photo_count + p_amount
  where id = p_event_id;
end;
$$;

-- ── 7. Password helpers ───────────────────────────────────────────────────────

create function public.hash_password(p_password text)
returns text language sql security definer as $$
  select crypt(p_password, gen_salt('bf', 10));
$$;

create function public.check_password(p_email text, p_password text)
returns table (
  id     uuid,
  name   text,
  email  text,
  role   text,
  plan   text,
  banned boolean
) language sql security definer as $$
  select id, name, email, role, plan, banned
  from   public.users
  where  email         = lower(trim(p_email))
    and  password_hash = crypt(p_password, password_hash);
$$;

-- ── 8. Row Level Security ─────────────────────────────────────────────────────
alter table public.users       enable row level security;
alter table public.events      enable row level security;
alter table public.photos      enable row level security;
alter table public.search_logs enable row level security;

-- Service role bypasses RLS automatically.
-- These permissive policies cover any anon/authenticated access if needed.
create policy "allow_all_users"       on public.users       for all using (true) with check (true);
create policy "allow_all_events"      on public.events      for all using (true) with check (true);
create policy "allow_all_photos"      on public.photos      for all using (true) with check (true);
create policy "allow_all_search_logs" on public.search_logs for all using (true) with check (true);

-- ── 9. Seed demo data ─────────────────────────────────────────────────────────

insert into public.users (id, name, email, password_hash, role, plan) values
  (
    '00000000-0000-0000-0000-000000000001',
    'Alex Johnson',
    'photographer@demo.com',
    crypt('demo1234', gen_salt('bf', 10)),
    'photographer',
    'free'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Sarah Williams',
    'admin@demo.com',
    crypt('demo1234', gen_salt('bf', 10)),
    'admin',
    'free'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Mike Chen',
    'user@demo.com',
    crypt('demo1234', gen_salt('bf', 10)),
    'user',
    'free'
  )
on conflict (email) do nothing;

