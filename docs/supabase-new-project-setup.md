# New Supabase project — reproducible setup

Two files, in this order:

```
supabase/migrations/20261101_base_schema.sql        # tables, RLS, indexes, trigger
supabase/migrations/20261107_analytics_foundation.sql  # analytics_events + legacy widening
```

Both are **additive and idempotent**: every object is created with
`if not exists`, every policy is dropped-and-recreated, and no live statement
drops a table or column. Re-running either file is safe. Nothing copies data, so
a new project starts genuinely empty — no historical rows are migrated, because
the old project has none (all four tables returned `count = 0`).

## Target

| | |
|---|---|
| New project ref | `izmwdyuthxgkjixiwmt` |
| Old production ref (read-only, never touched) | `ikjlgsbrsknjyfegjrdi` |

## Apply, with the CLI (preferred)

```bash
supabase login                                   # browser flow, no secrets in chat
supabase link --project-ref izmwdyuthxgkjixiwmt  # confirm the ref the CLI resolved
supabase db push --dry-run                       # shows the exact statements
supabase db push                                 # apply
```

`db push` only ever applies files under `supabase/migrations/`. It cannot reach
the old project unless you link to it — check the ref printed by `supabase link`
and by `supabase status` before pushing.

## Apply, without the CLI

Supabase Dashboard → the **new** project → SQL Editor → paste each file in order
→ Run. Both files are single transactions' worth of DDL; if the first fails, the
second has not run yet.

## Verify

```sql
-- 1. tables exist
select table_name from information_schema.tables
 where table_schema = 'public'
 order by 1;
-- expect: analytics_events, analytics_daily (view), contact_messages,
--         page_visits, seo_reports, tool_events

-- 2. RLS is on everywhere and no table is accidentally world-readable
select relname, relrowsecurity
  from pg_class
 where relnamespace = 'public'::regnamespace
   and relkind = 'r'
 order by 1;
-- expect relrowsecurity = true for every row

-- 3. the policies that should exist, and only those
select tablename, policyname, cmd, roles
  from pg_policies
 where schemaname = 'public'
 order by 1, 2;
-- expect exactly 4 rows, all on seo_reports, all `{authenticated}`.
-- analytics_events / tool_events / page_visits / contact_messages: zero
-- policies is correct — service role bypasses RLS.

-- 4. the idempotency index the client relies on
select indexname from pg_indexes
 where tablename = 'analytics_events'
 order by 1;
-- expect analytics_events_event_id_key among them
```

## Backend configuration that SQL cannot do

These are project settings, not schema. Without them the app deploys but
sign-up email confirmation lands on the wrong page.

**Authentication → URL Configuration**

```
Site URL:            https://<new-project-preview-domain>
Redirect URLs:       http://localhost:3000/**
                     https://*.vercel.app/**
                     https://www.lifeseos.com/**
```

The app builds `emailRedirectTo` from **its own request origin**
(`app/api/auth/sign-up/route.ts`), so any origin a deployment runs on must be in
the allow-list. When it is not, Supabase silently falls back to Site URL and the
confirmation link lands on `/` — the failure `proxy.ts` has a rescue path for,
which treats the symptom, not the cause.

**Authentication → Providers → Email**

Email confirmation on for Production. For a Preview project, either turn it off
(then no email is sent at all) or keep it on and add the preview origins above.

**Authentication → Email Templates**

The confirmation template must point at `/auth/confirm?token_hash=…&type=email`,
which is the route that exists (`app/auth/confirm/route.ts`). A template using
`{{ .ConfirmationURL }}` against a different path will 404.

## Environment variables

Set on the **new** Vercel Preview environment only — never on Production:

| Variable | Source |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | project settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | project settings → API → publishable key |
| `SUPABASE_SECRET_KEY` | project settings → API → secret key |
| `NEXT_PUBLIC_SITE_URL` | the preview origin |

`SUPABASE_SECRET_KEY` is server-only. It must never be prefixed
`NEXT_PUBLIC_` and never committed. Rotate it if it is ever pasted anywhere
public.

## Rollback

Every object created here is new, so rollback is deletion of only those:

```sql
begin;
  drop view  if exists public.analytics_daily;
  drop table if exists public.analytics_events;
  drop table if exists public.contact_messages;
  drop table if exists public.page_visits;
  drop table if exists public.tool_events;
  drop table if exists public.seo_reports;
  drop function if exists public.set_updated_at() cascade;
commit;
```

Dropping `seo_reports` discards the reports users created *on that project*.
On a brand-new project that is nothing. Do not run this against the old project.