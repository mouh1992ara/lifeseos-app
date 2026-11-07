-- ============================================================================
-- CORRECTION to the privilege fix — service_role was left with no access
-- ----------------------------------------------------------------------------
-- Run in the SQL Editor of project izmwdlyuthxgkijxiwmt.
-- Safe to re-run. Additive only; nothing is dropped or deleted.
--
-- What went wrong with the first pass
-- ----------------------------------
-- The previous file ended with
--
--     revoke all on public.analytics_events from anon, authenticated;
--
-- but the intent was only to close those two browser roles. The blanket form
-- used there also stripped `service_role`, because neither Supabase's default
-- privileges nor the tables' owner grants cover a table created by raw DDL.
-- Verified against the live project afterwards:
--
--     tool_events       GET 403  INSERT 403
--     page_visits       GET 403  INSERT 403
--     contact_messages  GET 403  INSERT 403
--     analytics_events  GET 403  INSERT 403
--     seo_reports       GET 403  INSERT 403     (service_role)
--
-- Every server route writes with the service key, so analytics, page views,
-- the contact form and the legacy tool log would all have failed silently in
-- production: the routes catch insert errors and carry on by design.
--
-- This grants service_role exactly what the routes use, and re-closes anon and
-- authenticated on the four service-only tables.
-- ============================================================================

begin;

-- ---- service_role: the server routes' own identity -------------------------
-- Full DML on the tables those routes read and write, and nothing more.
grant usage on schema public to service_role;

grant select, insert, update, delete on public.seo_reports      to service_role;
grant select, insert, update, delete on public.tool_events      to service_role;
grant select, insert, update, delete on public.page_visits      to service_role;
grant select, insert, update, delete on public.contact_messages to service_role;
grant select, insert, update, delete on public.analytics_events to service_role;
grant select                        on public.analytics_daily   to service_role;

grant usage, select on all sequences in schema public to service_role;

-- ---- browser roles: unchanged from the intended posture --------------------
-- seo_reports is the only table an authenticated user may touch, and RLS
-- decides which rows. anon gets nothing at all.
grant select, insert, update, delete on public.seo_reports to authenticated;
revoke all on public.seo_reports from anon;

-- Service-only tables: no privilege for either browser role. Combined with RLS
-- enabled and no policy, this is what makes them unreachable from the client.
revoke all on public.tool_events      from anon, authenticated;
revoke all on public.page_visits      from anon, authenticated;
revoke all on public.contact_messages from anon, authenticated;
revoke all on public.analytics_events from anon, authenticated;
revoke all on public.analytics_daily  from anon, authenticated;

commit;

-- ============================================================================
-- Verification — run after the block above
-- ============================================================================

-- 1. who can do what (expect service_role on all five tables, authenticated on
--    seo_reports only, anon on nothing)
select table_name, grantee,
       string_agg(privilege_type, ',' order by privilege_type) as privileges
  from information_schema.table_privileges
 where table_schema = 'public'
   and grantee in ('anon', 'authenticated', 'service_role')
 group by table_name, grantee
 order by table_name, grantee;

-- 2. RLS still on everywhere (any row returned here is a finding)
select relname
  from pg_class
 where relnamespace = 'public'::regnamespace
   and relkind = 'r'
   and not relrowsecurity;

-- 3. policies unchanged: expect exactly 4, all seo_reports, all {authenticated}
select tablename, policyname, cmd, roles
  from pg_policies
 where schemaname = 'public'
 order by tablename, policyname;

-- 4. the idempotency index the analytics client depends on
select indexname
  from pg_indexes
 where tablename = 'analytics_events'
 order by indexname;