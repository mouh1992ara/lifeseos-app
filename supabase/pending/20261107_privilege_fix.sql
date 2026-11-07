-- ============================================================================
-- PENDING: privilege fix from commit cca2b86
-- ----------------------------------------------------------------------------
-- Run this in the SQL Editor of project izmwdlyuthxgkijxiwmt.
-- Confirm the project reference in the dashboard URL before running.
--
-- Why it is needed: the two migrations already applied created the tables, RLS
-- and policies correctly, but policies do not imply privileges. Postgres checks
-- table GRANTs first, so `authenticated` currently gets
--
--     42501  permission denied for table seo_reports
--
-- before any policy is even consulted. This grants the minimum DML and leaves
-- RLS to decide which rows are visible.
--
-- Safe to re-run. Grants are idempotent; REVOKEs on already-empty grants are
-- no-ops. Nothing here drops, deletes or rewrites data.
-- ============================================================================

begin;

-- The API roles must be able to resolve objects in the schema at all.
grant usage on schema public to anon, authenticated;

-- The only table the browser may touch. Four grants, paired with the four
-- existing policies on seo_reports; the row scope comes from
-- `auth.uid() = user_id` inside those policies, not from the grant.
grant select, insert, update, delete on public.seo_reports to authenticated;

grant usage, select on all sequences in schema public to authenticated;

-- Service-role-only tables: explicitly denied to the browser roles. This is what
-- makes "not readable from the browser" true at the privilege layer, not only
-- at the policy layer.
revoke all on public.tool_events      from anon, authenticated;
revoke all on public.page_visits      from anon, authenticated;
revoke all on public.contact_messages from anon, authenticated;
revoke all on public.analytics_events from anon, authenticated;
revoke all on public.analytics_daily  from anon, authenticated;

commit;

-- ----------------------------------------------------------------------------
-- Verification — run after the block above
-- ----------------------------------------------------------------------------

-- 1. privileges actually granted (expect seo_reports / authenticated only)
select table_name, grantee,
       string_agg(privilege_type, ',' order by privilege_type) as privileges
  from information_schema.table_privileges
 where table_schema = 'public'
   and grantee in ('anon', 'authenticated')
 group by table_name, grantee
 order by table_name, grantee;

-- 2. RLS on every table; any row here is a finding
select relname
  from pg_class
 where relnamespace = 'public'::regnamespace
   and relkind = 'r'
   and not relrowsecurity;

-- 3. policies: expect exactly 4, all on seo_reports, all {authenticated}
select tablename, policyname, cmd, roles
  from pg_policies
 where schemaname = 'public'
 order by tablename, policyname;

-- 4. the idempotency index the analytics client depends on
select indexname
  from pg_indexes
 where tablename = 'analytics_events'
 order by indexname;