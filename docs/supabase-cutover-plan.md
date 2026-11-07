# Production cutover — plan, risks, rollback

**Status: NO-GO.** One gate is unresolved and it is not a code problem.

---

## The unresolved gate: existing Auth users

| Question | Answer | Evidence |
|---|---|---|
| Rows in the old app tables? | **0** | `seo_reports`, `tool_events`, `page_visits`, `contact_messages` all returned `count = 0` on 2026-11-07 |
| Auth users in the old project? | **unknown, and demonstrably not zero** | see below |
| Can I count them? | **no** | `.env.local`'s `SUPABASE_SECRET_KEY` holds a 25-char `UPSTASH_…` placeholder; Vercel marks the real one `[SENSITIVE]` and refuses to export it |

### Evidence that accounts exist

`docs/LifeSeos_Project_Handoff_2026-10-06.md` records:

```
- Admin user ID: 9067570a-9e9c-4c35-90c8-dda9de6e82f6
- Dashboard works and saves SEO reports.
```

A production admin account with that UUID exists in `ikjlgsbrsknjyfegjrdi`.
`ADMIN_USER_ID` is set in Vercel Production (a Secret), which only makes sense
if the account it names is real. `/admin` cannot function otherwise.

Existence of *other* accounts cannot be probed: the project has
anti-enumeration on, so `signup` and `recover` return identical `200`s for real
and fake addresses.

### What a cutover loses, precisely

Switching `NEXT_PUBLIC_SUPABASE_URL` to the new project means:

1. **`9067570a-…` and any other existing accounts can no longer sign in.**
   Passwords live in the old project's `auth.users`; the new project has its own
   `auth.users`, currently empty. "Invalid login credentials" for every existing user.
2. **`/admin` locks out.** `ADMIN_USER_ID` names a UUID that will not exist in
   the new project. Even after that user re-registers, the new UUID will differ,
   so `ADMIN_USER_ID` must be updated to the new value or `/admin` stays closed.
3. **Saved reports are not at risk** — the old tables are empty, verified twice.
4. **Nothing silently "migrates".** There is no automatic transfer of accounts
   between Supabase projects.

### The three honest options

| Option | What users experience | Effort | Recommendation |
|---|---|---|---|
| **A. Re-register** | every existing user signs up again; old password stops working | zero | fine **only if the real user count is small** (e.g. just the admin) |
| **B. Migrate `auth.users`** | passwords keep working, because bcrypt hashes are portable | medium; needs the old project's service key and a script | correct if there are real users |
| **C. Stay on the old project** | no disruption | zero | if the new project is only for isolation/testing |

### Migration of auth users — how B would work, and its constraints

Supabase's documented path is `auth.users` export + `auth.identities`, imported
with `auth.admin.createUser` (preserving `encrypted_password`) or a direct
`insert into auth.users`. Constraints that matter here:

- **bcrypt hashes carry over**; users keep their passwords. This is the reason
  B is viable at all.
- `auth.identities` must be exported too, or email login fails even though the
  user row exists.
- Reversible-encrypted MFA secrets and `confirmation_token`s do not transfer
  meaningfully; MFA users would need to re-enrol.
- **Requires the old project's service key**, which is currently unobtainable.

**A number is all that is needed to choose.** Run this in the OLD project's SQL
Editor (read-only):

```sql
select count(*) as auth_users,
       count(*) filter (where email_confirmed_at is not null) as confirmed,
       min(created_at)::date as first_signup,
       max(created_at)::date as last_signup
  from auth.users;
```

If it returns `1`, option A is correct and the cutover is trivial. If it returns
more, option B is the responsible path.

---

## Cutover plan (only after the gate clears)

### Pre-flight

1. New project: Site URL, redirect URLs, confirm-signup template applied
   (`docs/supabase-safari-dashboard-steps.md`).
2. New project: one real sign-up → confirmation → dashboard → saved report
   round-trip, **on the preview**.
3. `ADMIN_USER_ID` for the new project known (the new admin's UUID).
4. Rollback target recorded: current Production deployment `57a764a`.

### Environment change — the exact diff

Vercel → Settings → Environment Variables → **Production**:

| Variable | Now | After |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ikjlgsbrsknjyfegjrdi.supabase.co` | `https://izmwdlyuthxgkijxiwmt.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | old publishable | new publishable (`sb_publishable_…`) |
| `SUPABASE_SECRET_KEY` | old **JWT** `eyJ…` | new **JWT** `eyJ…` — **not** `sb_secret_…` |
| `ADMIN_USER_ID` | `9067570a-…` | the new admin's UUID |
| `NEXT_PUBLIC_SITE_URL` | `https://www.lifeseos.com` | unchanged |
| `TURNSTILE_*`, `UPSTASH_*`, `CRON_SECRET`, `GOOGLE_PAGESPEED_API_KEY`, `BAIDU_PUSH_TOKEN` | — | unchanged |

**`SUPABASE_SECRET_KEY` must be the JWT.** Verified against the live project:
`sb_secret_…` returns `401 Invalid API key` on both REST and Auth admin, while
the `service_role` JWT works. Set it wrong and every server route fails — and
because they swallow errors, the app looks healthy while storing nothing.

### Preventing concurrent writes to two databases

The two projects are independent; nothing is synchronised. The risk is a split
brain: some instances on the old project, some on the new.

- **Do not** deploy and change env vars separately — a build that starts before
  the variable change but finishes after will run mixed. Change variables
  **first**, then trigger one deploy, and let it finish before smoke testing.
- Accept a short read-only window instead of a partially-wrong one: put the site
  in maintenance for the ~2 minutes of the switch if traffic matters.
- **Never** run both projects' writes concurrently to "compare" — `seo_reports`
  and `auth.users` would diverge silently and permanently.

### Sequence

1. Announce maintenance (optional but advised).
2. Set the four Production variables.
3. `git checkout main && git merge --ff-only phase5/tool-outcomes && git push`.
4. Wait for the Production build to be `READY`.
5. Smoke test (below) before removing maintenance.

### Smoke tests — the ones that prove it works

Beyond a `200` on the homepage:

```
[ ] sign up with a real address on www.lifeseos.com
[ ] confirmation email arrives; link opens on a DIFFERENT device
[ ] it lands on /dashboard, not /
[ ] run the SEO analyzer on https://example.com  → report appears in dashboard
[ ] the report survives a page reload (proves the DB write, not just UI state)
[ ] sign out, sign in again
[ ] /admin reachable as the new ADMIN_USER_ID, denied for a normal user
[ ] password reset completes
[ ] new project analytics_events has rows whose event_id are UUIDs
[ ] no 42501 / PGRST301 in Vercel function logs
```

A route returning 200 proves nothing about writes. Every one of those lines
reads data back.

### Rollback

Immediate, no data loss in the new project, no schema change to undo:

```bash
vercel rollback <previous-production-deployment-url> --yes
```

then restore the four variables to their old values. Accounts created on the new
project during the window remain there and are simply unreachable until you
switch back — they are not deleted.

**Rollback does not recover accounts that signed up on the new project and then
need to exist on the old one.** If that is unacceptable during the test window,
do the switch outside business hours.

---

## GO / NO-GO

| Gate | Status |
|---|---|
| New schema, RLS, indexes | **PASS** |
| Service-role CRUD with read-back | **PASS** (9/9) |
| Analytics end-to-end through the app | **PASS** |
| Phase 5 outcome instrument | **PASS** (87/87 browser assertions) |
| Isolated preview on new project | **PASS** |
| Auth Site URL / redirects / template | **NOT DONE** — dashboard access blocked |
| Signup → confirm → login on preview | **NOT DONE** — depends on the above |
| Existing auth users accounted for | **UNKNOWN** — blocking |

**NO-GO.** Two blockers, both requiring you: the dashboard settings, and one
number (the old project's user count).