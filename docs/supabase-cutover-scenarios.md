# Two cutover scenarios — pick one, then the steps are fixed

Both assume the new project (`izmwdlyuthxgkijxiwmt`) is already built and passing:
schema, RLS, indexes, service-role CRUD, analytics end-to-end, isolated preview.

The only open question is what happens to existing accounts.

---

## Shared preconditions (identical for both)

1. Safari dashboard: Site URL, redirect URLs, confirm-signup template, custom
   SMTP — `docs/supabase-safari-dashboard-steps.md` and
   `docs/supabase-smtp-and-confirmation.md`.
2. One full signup → confirm → login → save report cycle on the preview.
3. `SUPABASE_SECRET_KEY` for Production will be the **`service_role` JWT**
   (`docs/supabase-secret-key-correction.md`).
4. Rollback target recorded: Production deployment `57a764a`.

---

# Scenario A — preserve existing users

**Requires:** the old project's `service_role` key. Not currently available;
Management API returns 403 for `ikjlgsbrsknjyfegjrdi` with the token this
machine holds, and Vercel marks the value `[SENSITIVE]`.

## A1. Measure first (mandatory, read-only)

Old project → SQL Editor:

```sql
select count(*) as total,
       count(*) filter (where email_confirmed_at is not null) as confirmed,
       count(*) filter (where deleted_at is not null) as soft_deleted,
       min(created_at)::date as first, max(created_at)::date as last
  from auth.users;
```

Also list identities, because a user row without its identity cannot log in:

```sql
select count(*) from auth.identities;
```

If `total = 0`, Scenario A is unnecessary — use B, it costs nothing.

## A2. Export

```sql
-- run in the OLD project, as postgres
\copy (select * from auth.users) to 'users.csv' csv header
\copy (select * from auth.identities) to 'identities.csv' csv header
```

If `\copy` is unavailable in the SQL Editor, use **Database → Backups** and
extract `auth.users` / `auth.identities` from the dump instead. Never paste these
rows into chat or a repository — they contain password hashes and personal data.

## A3. Import, preserving passwords

`encrypted_password` holds a bcrypt hash. Copying it verbatim means users keep
their existing password and never see a reset.

```sql
-- run in the NEW project
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous
)
select id, instance_id, aud, role, email, encrypted_password,
       email_confirmed_at, created_at, updated_at,
       raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous
  from temp_users          -- loaded from users.csv
on conflict (id) do nothing;

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
)
select id, user_id, provider_id, identity_data, provider,
       last_sign_in_at, created_at, updated_at
  from temp_identities
on conflict (id) do nothing;
```

**Constraints that will bite:**

- `auth.identities` is required. Importing users alone produces accounts that
  look correct in the dashboard but cannot authenticate.
- `id` is a UUID with no default — you must carry it over, and every foreign key
  to it (`seo_reports.user_id`, `contact_messages.user_id`) follows automatically.
- **MFA secrets do not transfer.** Users with TOTP enrolled must re-enrol; expect
  a support message for each.
- `confirmation_token`, `recovery_token` columns are safe to omit; outstanding
  links simply stop working.
- Do **not** import `sessions` or `refresh_tokens` — sessions are device-bound
  and revoking them all is the safer default.

## A4. ADMIN_USER_ID

The UUID stays **`9067570a-9e9c-4c35-90c8-dda9de6e82f6`** — because A preserves
ids. Production's `ADMIN_USER_ID` needs **no change** in this scenario. That is
A's main operational advantage.

## A5. Verify before switching

```sql
-- in the NEW project, after import
select count(*) from auth.users;        -- equals A1 total
select count(*) from auth.identities;   -- equals A2 count
```

Then have the admin log in **on the new project** through a preview pointed at
it. Only after that succeeds, do the env change.

## A6. Risks specific to A

| Risk | Mitigation |
|---|---|
| Password hashes are sensitive | never paste them anywhere; use the SQL editor or a dump |
| Duplicate ids if re-run | `on conflict do nothing` makes it idempotent |
| Users mid-password-reset lose the link | acceptable; they retry |
| Rollback orphans new signups during the window | short window; or roll back and re-import |

---

# Scenario B — fresh accounts

**Requires only your explicit acceptance.** No old-project access needed.

## What changes for users

- Every existing account stops working: `Invalid login credentials`.
- They must sign up again. Nothing tells them why unless you do.
- Any saved reports under the old project are unreachable — but the old tables
  are **empty** (verified twice), so there is nothing to lose.
- Anyone whose email is already "taken" does not exist on the new project, so
  sign-up with the same address succeeds cleanly. No conflict, no cleanup.

## B1. Admin account

1. Sign up on the new project's deployment with the address that should own admin.
2. Authentication → Users → copy the new UUID.
3. Set Vercel **Production** `ADMIN_USER_ID` to that new UUID. Scenario B changes
   this variable; Scenario A does not.
4. Confirm `/admin` loads for that user and 403s for a normal account.

## B2. User-facing steps worth taking

Scenario B is only acceptable if the affected people are told. Minimum:

- A short notice on the site or an email to known users: "We have moved to a new
  authentication system; please create your account again."
- Keep the old project **read-only and alive** for at least 30 days, not deleted,
  so anyone who re-registers can object and be helped manually.

## B3. Risks specific to B

| Risk | Mitigation |
|---|---|
| Silent lockout for real users | notice before switching |
| `ADMIN_USER_ID` left at the old UUID | `/admin` 403s — checklist item, verify after deploy |
| Someone re-registers with a different address | nothing breaks; old data was empty anyway |
| Perception that data was lost | say plainly: app tables were empty, only accounts needed recreating |

---

## Choosing

| Condition | Scenario |
|---|---|
| `select count(*) from auth.users` returns **0 or 1** | **B** — simpler, no key needed |
| Returns **> 1** and those people matter | **A** |
| You cannot obtain the old `service_role` key | **B** is the only option; A is impossible |

**Run the count in A1 first.** It is one read-only query and it decides everything.

---

## The cutover itself (identical for A and B)

### Env diff — Vercel Production

| Variable | After | Note |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://izmwdlyuthxgkijxiwmt.supabase.co` | |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | new `sb_publishable_…` | safe to be public |
| `SUPABASE_SECRET_KEY` | new **`service_role` JWT** | never `NEXT_PUBLIC_` |
| `ADMIN_USER_ID` | **A:** unchanged · **B:** the new admin's UUID | |
| `NEXT_PUBLIC_SITE_URL` | unchanged | |
| `TURNSTILE_*`, `UPSTASH_*`, `CRON_SECRET`, `GOOGLE_PAGESPEED_API_KEY` | unchanged | |

### Sequence

1. Change the variables **first**; deploy **second**. A build that starts before
   the change and finishes after runs mixed.
2. Merge `phase5/tool-outcomes` → `main` (`--ff-only`), push.
3. Wait for `READY`.
4. Smoke test from `docs/supabase-cutover-plan.md` — reads data back, not just
   HTTP 200.
5. Watch function logs for `42501`, `PGRST301`, `Invalid API key`.

### Rollback

```bash
vercel rollback <previous-production-url> --yes
```

then restore the four variables. Accounts created on the new project during the
window are not deleted — they become unreachable until you switch back.

### Smoke tests (both scenarios)

```
[ ] signup with a real address
[ ] confirmation email arrives (sender on send.lifeseos.com)
[ ] link opens on a DIFFERENT device → /auth/verified → /dashboard
[ ] analyzer run → report visible in dashboard after reload
[ ] sign out / sign in
[ ] /admin OK for ADMIN_USER_ID, denied for a normal user
[ ] password reset completes
[ ] analytics_events has rows with UUID event_ids
[ ] no 42501 / PGRST301 in logs
```