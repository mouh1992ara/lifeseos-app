-- ============================================================================
-- LifeSeos — base schema
-- ----------------------------------------------------------------------------
-- The four tables the application actually reads and writes, plus the policies
-- that make each one safe. Derived from the code, not from memory:
--
--   seo_reports      dashboard list, report detail, admin count
--   tool_events      legacy usage log, admin count + last 8
--   page_visits      anonymous country counter, admin count + last 8
--   contact_messages contact form, admin count
--
-- DESIGN RULES
--
--  1. IDEMPOTENT. Everything is `if not exists`, so this file can be applied to
--     an empty new project, re-run after a partial failure, or run against a
--     project that already has some of these objects. It never drops anything.
--
--  2. NO HISTORICAL DATA IS ASSUMED. Nothing here copies rows from anywhere.
--     A fresh project starts genuinely empty.
--
--  3. RLS ON, DENY BY DEFAULT. Every table has RLS enabled. Policies grant the
--     minimum: an authenticated user reads and writes only their own rows, and
--     the public (anon) role can insert the two write-only streams but never
--     read them back.
--
--  4. SERVICE ROLE ONLY WHERE IT MUST BE. `contact_messages` and `tool_events`
--     are written by server routes that already use the service-role key; the
--     browser never needs them. No policy grants anon access to a table it
--     could exfiltrate.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. Shared helper
-- ---------------------------------------------------------------------------

-- Keep `updated_at` honest without trusting the client. One function, reused,
-- so a table added later cannot forget the rule.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. seo_reports — a saved audit, owned by the user who ran it
-- ---------------------------------------------------------------------------

create table if not exists public.seo_reports (
  id          uuid primary key default gen_random_uuid(),

  -- `on delete cascade`: deleting an account removes their reports. These rows
  -- contain the URLs a person chose to analyse, so keeping them after the
  -- account is gone would be retaining personal data with no owner.
  user_id     uuid not null references auth.users (id) on delete cascade,

  -- The analysed URL. Stored because the dashboard shows it back to its owner;
  -- it is not copied into the analytics stream.
  url         text not null,

  score       integer not null default 0
                check (score >= 0 and score <= 100),
  grade       text,
  status      text,

  -- The full report payload, read by the detail page as `report_data`.
  report_data jsonb not null default '{}'::jsonb,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- The dashboard lists "my reports, newest first" — one composite index serves
-- both the filter and the sort.
create index if not exists seo_reports_user_created_idx
  on public.seo_reports (user_id, created_at desc);

alter table public.seo_reports enable row level security;

-- A signed-in user may see and manage only their own reports. `auth.uid()` is
-- read from the JWT the server verified, never from a client field.
drop policy if exists seo_reports_select_own on public.seo_reports;
create policy seo_reports_select_own on public.seo_reports
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists seo_reports_insert_own on public.seo_reports;
create policy seo_reports_insert_own on public.seo_reports
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists seo_reports_update_own on public.seo_reports;
create policy seo_reports_update_own on public.seo_reports
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists seo_reports_delete_own on public.seo_reports;
create policy seo_reports_delete_own on public.seo_reports
  for delete to authenticated
  using (auth.uid() = user_id);

drop trigger if exists seo_reports_set_updated_at on public.seo_reports;
create trigger seo_reports_set_updated_at
  before update on public.seo_reports
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. tool_events — legacy usage log
-- ---------------------------------------------------------------------------
-- Superseded by `analytics_events` (see the analytics migration), but still
-- written so the admin screen keeps working during the transition. Rows are
-- anonymous usage facts: no URL, no input, no email.

create table if not exists public.tool_events (
  id          uuid primary key default gen_random_uuid(),
  tool_name   text not null,
  user_id     uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists tool_events_created_idx
  on public.tool_events (created_at desc);

alter table public.tool_events enable row level security;

-- No policy at all, deliberately. Every write goes through
-- /api/tool-events with the service-role key, which bypasses RLS. With RLS on
-- and zero policies, the browser can neither read nor forge usage even with a
-- publishable key in hand. The admin screen also reads via the service role.

-- ---------------------------------------------------------------------------
-- 3. page_visits — anonymous country counter
-- ---------------------------------------------------------------------------
-- Country granularity only. No IP, no device id, no referrer, no path history
-- beyond the pathname. This is the least data that still answers "where do
-- visitors come from".

create table if not exists public.page_visits (
  id           uuid primary key default gen_random_uuid(),
  country_code text,
  country_name text,
  path         text,
  created_at   timestamptz not null default now()
);

create index if not exists page_visits_created_idx
  on public.page_visits (created_at desc);

alter table public.page_visits enable row level security;

-- Same posture as tool_events: written by a service-role route, never readable
-- from the browser.

-- ---------------------------------------------------------------------------
-- 4. contact_messages — inbound contact form
-- ---------------------------------------------------------------------------
-- Contains personal data (name, email, free text). RLS on with NO policy: the
-- only reader is /admin through the service role. A user must not be able to
-- list other people's messages, and the sender does not need to read their own
-- back — the confirmation is by email.

create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  subject     text,
  message     text not null,
  user_id     uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists contact_messages_created_idx
  on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

-- No storage buckets are created: the application references none, and an
-- unused public bucket is only a place for someone else to put bytes.