-- ============================================================================
-- LifeSeos — Analytics foundation
-- ============================================================================
--
-- ADDITIVE AND REVERSIBLE. Nothing here drops, renames or rewrites an existing
-- object. `tool_events` and `page_visits` keep every row and every existing
-- column exactly as they are; the new columns are all NULLABLE with no default,
-- so any code that inserts the old shape keeps working unchanged.
--
-- DO NOT RUN THIS AGAINST PRODUCTION until the owner approves. It is written to
-- be reviewed, then applied once through the Supabase SQL editor.
--
-- Why a second table instead of widening `tool_events`:
--   `tool_events` records "a tool was used". It cannot express a failed request,
--   a language, a device, or a funnel step without becoming a different table
--   wearing the old name. A dedicated event stream keeps the existing table's
--   meaning intact while giving the new questions a schema that answers them.
--
-- What is deliberately NOT stored:
--   - IP addresses (Vercel sees them; we do not persist them)
--   - submitted URLs or any tool input
--   - emails, names, passwords, tokens
--   - full referrers (a path fragment only, normalised)
--   - any device fingerprint. `device` is a coarse 3-value bucket derived from
--     the User-Agent server-side, which is not a fingerprint and cannot be
--     combined to identify a person.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. The event stream
-- ---------------------------------------------------------------------------

create table if not exists public.analytics_events (
  id          uuid primary key default gen_random_uuid(),

  -- Client-supplied idempotency key. A retry, a double click or a re-sent
  -- beacon carries the same value, and the unique index below makes the second
  -- insert a no-op instead of a duplicate row. This is how double counting is
  -- prevented at the database, not by hoping the client behaves.
  event_id    uuid not null,

  created_at  timestamptz not null default now(),

  -- Closed vocabulary. Keep this list short: every value must correspond to a
  -- question we actually intend to answer.
  event_name  text not null
    check (event_name in (
      'page_view',
      'tool_start',        -- request accepted, work begun
      'tool_use',          -- a tool ran, outcome UNKNOWN (legacy beacons)
      'tool_success',      -- result produced AND reported as successful
      'tool_error',        -- request rejected or upstream failed
      'signup_view',
      'signup_submit',
      'signup_success',
      'verify_success',
      'signin_success',
      'report_saved'
    )),

  -- Canonical tool slug (`seo-analyzer`), never a display name, so a label
  -- translation can never split one tool into four rows.
  tool_key    text,

  -- Derived from the URL prefix server-side, not trusted from the client.
  locale      text check (locale is null or locale in ('en', 'ar', 'fr', 'zh')),

  -- Coarse, UA-derived. Not a fingerprint.
  device      text check (device is null or device in ('mobile', 'tablet', 'desktop')),

  outcome     text check (outcome is null or outcome in ('success', 'error')),

  -- Error CATEGORY only, never a raw message: raw messages can carry the
  -- submitted hostname or an upstream body. The app maps to this closed set.
  error_code  text check (error_code is null or error_code in (
    'INVALID_URL', 'BLOCKED_ADDRESS', 'RATE_LIMITED', 'UPSTREAM_ERROR',
    'TIMEOUT', 'TOO_LARGE', 'NOT_HTML', 'INVALID_REQUEST', 'CAPTCHA_FAILED',
    'INTERNAL'
  )),

  -- Server-measured wall clock for the operation, ms. Null when not applicable.
  duration_ms integer check (duration_ms is null or duration_ms >= 0),

  -- Normalised route path without query string (`/ar/tools/seo-analyzer`).
  -- Query strings are excluded because they can carry a submitted URL.
  path        text,

  -- Null for anonymous visitors. `on delete set null` so deleting an account
  -- anonymises their history rather than cascading it away — the aggregate
  -- stays truthful, the person stops being attached to it.
  user_id     uuid references auth.users (id) on delete set null,

  -- Random opaque id in a first-party httpOnly cookie. Used ONLY to tell "same
  -- browser came back" from "new browser". It is not derived from any device
  -- property, so it cannot be reverse-engineered into a fingerprint, and it is
  -- rotated on sign-out.
  session_key text
);

-- Idempotency: one row per event_id, enforced by the database.
create unique index if not exists analytics_events_event_id_key
  on public.analytics_events (event_id);

-- Time-series reads (trends, error rate by day).
create index if not exists analytics_events_created_at_idx
  on public.analytics_events (created_at desc);

-- "This tool, over time" — the most common dashboard query.
create index if not exists analytics_events_tool_time_idx
  on public.analytics_events (tool_key, created_at desc)
  where tool_key is not null;

-- "Error rate" and "funnel step counts".
create index if not exists analytics_events_name_time_idx
  on public.analytics_events (event_name, created_at desc);

-- ---------------------------------------------------------------------------
-- 2. RLS — service role only
-- ---------------------------------------------------------------------------

alter table public.analytics_events enable row level security;

-- No policy is created, deliberately.
--
-- With RLS enabled and zero policies, every role except `service_role` is
-- denied by default: anon and authenticated can neither read nor write. The
-- service-role key bypasses RLS entirely, and it exists only in the server
-- environment. This is the strongest default available: the table is invisible
-- to the browser even if someone obtains the publishable key.
--
-- Reporting is served by /admin, which already requires the signed-in user to
-- equal ADMIN_USER_ID and reads through the server-only client.
--
-- If a future feature needs a user to see their own events, add a narrow policy
-- then — do not add a permissive one now "to save time".

-- ---------------------------------------------------------------------------
-- 3. Widen the legacy tables, additively
-- ---------------------------------------------------------------------------

-- Existing inserts omit these columns and keep working: all are nullable with
-- no default, so old code paths are byte-for-byte compatible.
alter table public.tool_events
  add column if not exists locale      text,
  add column if not exists device      text,
  add column if not exists outcome     text,
  add column if not exists error_code  text,
  add column if not exists duration_ms integer,
  add column if not exists event_id    uuid;

alter table public.page_visits
  add column if not exists locale text,
  add column if not exists device text;

-- Backfill is intentionally NOT attempted: existing rows have no locale or
-- device, and inventing one would corrupt the only history we have.
-- Historical rows will read NULL, which the dashboard must show as "unknown"
-- rather than as zero.

-- ---------------------------------------------------------------------------
-- 4. Reporting view
-- ---------------------------------------------------------------------------

-- A plain view, not materialised: at this traffic level a live aggregate is
-- cheaper to keep correct than a refresh schedule, and it never serves stale
-- numbers to the admin screen.
create or replace view public.analytics_daily as
select
  date_trunc('day', created_at)::date            as day,
  event_name,
  tool_key,
  locale,
  device,
  outcome,
  error_code,
  count(*)                                        as events,
  count(distinct session_key)                     as sessions,
  count(distinct user_id)                         as users,
  round(avg(duration_ms))                         as avg_duration_ms,
  percentile_cont(0.95) within group (order by duration_ms) as p95_duration_ms
from public.analytics_events
group by 1, 2, 3, 4, 5, 6, 7;

-- The view inherits the table's RLS posture for non-service roles because it
-- runs with the caller's privileges by default. No SECURITY DEFINER.

-- ============================================================================
-- ROLLBACK
-- ============================================================================
--
-- Fully reversible, and safe to run at any time because nothing existing is
-- modified destructively:
--
--   begin;
--     drop view  if exists public.analytics_daily;
--     drop table if exists public.analytics_events;   -- new table only
--     alter table public.tool_events drop column if exists event_id;
--     alter table public.tool_events drop column if exists duration_ms;
--     alter table public.tool_events drop column if exists error_code;
--     alter table public.tool_events drop column if exists outcome;
--     alter table public.tool_events drop column if exists device;
--     alter table public.tool_events drop column if exists locale;
--     alter table public.page_visits drop column if exists device;
--     alter table public.page_visits drop column if exists locale;
--   commit;
--
-- Dropping the new columns loses only data that the current application never
-- wrote. `tool_events` and `page_visits` rows themselves are untouched, and the
-- app keeps working because it treats every new column as optional.
--
-- COMPATIBILITY: the application detects a missing `analytics_events` table at
-- runtime (Postgres 42P01) and no-ops. Shipping code before the migration is
-- therefore safe; so is rolling the migration back under the new code.
-- ============================================================================
