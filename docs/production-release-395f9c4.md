# Production release — prepared, at the approval gate

**No cutover performed.** Production commit `b88bc64`, Production env unchanged,
old Supabase project untouched.

---

## 1. Release candidate

| | |
|---|---|
| Commit | **`395f9c4`** |
| Branch | `phase5/tool-outcomes` |
| Base | `main` @ `b88bc64` (ancestor → fast-forward, 17 commits) |
| Status | clean tree, pushed to origin branch only |

Release-gate results (this round, not repeated from earlier audits):

```
npm run build     ✓ compiled, TypeScript passed, all routes emitted
tsc --noEmit      ✓ clean
eslint            ✓ 0 errors, 4 pre-existing exhaustive-deps warnings
tool-outcome test ✓ 71 passed, 0 failed
```

---

## 2. Administrator access — VERIFIED END TO END

Not inferred from code. A real session was established for the admin account and
`/admin` was loaded against the new database.

| Check | Result |
|---|---|
| Account confirmed | `email_confirmed_at 2026-11-07T13:54:48Z` |
| Belongs to new project | yes, only user in `izmwdlyuthxgkijxiwmt` |
| UUID matches config | `4a1980c2-5024-42e5-87ac-9142fb4ae95a` |
| Admin reaches `/admin` | **200, renders "LifeSeos Admin"** |
| Dashboard data | Total Users **1**, real account listed, status Confirmed |
| Anonymous on `/admin` | 307 → `/auth/login?next=%2Fadmin` |
| Ordinary authenticated user on `/admin` | 307 → **`/dashboard`** |
| Other admins granted | none |

The rendered dashboard proves the service-role client works against the new
project on the read path — it queried users, reports, messages and analytics and
showed zeroes rather than an error.

---

## 3. Environment variables — exact diff

Vercel → Settings → Environment Variables → **Production**. Values redacted;
they never enter Git.

| Variable | Current | Replace with |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ikjlgsbrsknjyfegjrdi.supabase.co` | `https://izmwdlyuthxgkijxiwmt.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | old `sb_publishable_…` | new `sb_publishable_…` |
| `SUPABASE_SECRET_KEY` | old `service_role` JWT | **new `service_role` JWT (`eyJ…`)** |
| `ADMIN_USER_ID` | `9067570a-9e9c-4c35-90c8-dda9de6e82f6` | `4a1980c2-5024-42e5-87ac-9142fb4ae95a` |

Unchanged: `NEXT_PUBLIC_SITE_URL`, `TURNSTILE_SECRET_KEY`,
`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `AUTH_VERIFY_SECRET`, `UPSTASH_REDIS_REST_URL`,
`UPSTASH_REDIS_REST_TOKEN`, `CRON_SECRET`, `GOOGLE_PAGESPEED_API_KEY`,
`BAIDU_PUSH_TOKEN`.

**`SUPABASE_SECRET_KEY` must be the JWT.** A wrong value fails silently — the
routes catch insert errors, so the app looks healthy and stores nothing.

### Scopes — the isolation problem, and what to do

Current:

```
NEXT_PUBLIC_SUPABASE_URL              Production, Preview
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  Production, Preview
SUPABASE_SECRET_KEY                   Production, Preview
```

Every preview that isn't branch-scoped inherits **Production's** database. Only
`phase5/tool-outcomes` overrides them.

Recommended at cutover: **untick Preview** on those three, leaving Production
only. Previews then need their own branch-scoped values, which the phase5 branch
already has.

---

## 4. Authentication and email — already proven

Nothing re-run. Status:

| Item | State |
|---|---|
| Resend SMTP, `no-reply@send.lifeseos.com` | configured on new project (your confirmation) |
| Cross-device confirmation | **PASSED on iPhone**, account confirmed 13:54:48Z |
| Token-hash route | verified with real 56-char tokens; replay rejected |
| Redirect allow-list | `https://www.lifeseos.com/auth/confirm` — **keep, it is `kept` not substituted** |
| Turnstile | enforced; `NODE_ENV=production` makes it required — leave alone |
| Safe redirects | `//evil`, absolute and scheme-injection all rejected |

The production redirect was verified as *honoured* (not replaced by Site URL) by
generating a link with `redirect_to=https://www.lifeseos.com/auth/confirm` and
reading back the effective value.

---

## 5. Database — no migrations re-run

Both migrations are present in the repo and already applied:

```
supabase/migrations/20261101_base_schema.sql
supabase/migrations/20261107_analytics_foundation.sql
```

Live state: six objects, RLS on every table, four policies all on `seo_reports`
scoped `auth.uid() = user_id`, unique `event_id` index, service-role privileges
verified with read-back writes, `analytics_events` holding 24 genuine events and
`page_visits` 26.

`seo_reports` 0 rows — the admin has not saved a report yet. That is expected,
not a defect; the write path was proven earlier (`201` from a browser, row read
back with correct owner).

---

## 6. Existing users — the mandatory gate, still open

`auth.users` in `ikjlgsbrsknjyfegjrdi` has **never been counted**. I cannot:
Management API 403, Vercel marks the secret `[SENSITIVE]`, `.env.local` holds a
placeholder.

**A recorded decision is required before cutover.**

### Scenario A — preserve users

- `encrypted_password` is bcrypt and transfers → passwords keep working.
- `auth.identities` is mandatory; without it accounts exist but cannot log in.
- UUIDs carry over → `ADMIN_USER_ID` needs **no change**.
- MFA enrolments do not transfer; those users re-enrol.
- Do not import `sessions`/`refresh_tokens`.

### Scenario B — fresh accounts

- Passwords lost; everyone re-registers.
- All sessions invalid, including the admin's current one.
- `ADMIN_USER_ID` **must** change (this release assumes B).
- App tables are empty (counted twice), so no report data is lost.
- Silent lockout unless users are told.

Run this to decide:

```sql
select count(*) as total,
       count(*) filter (where email_confirmed_at is not null) as confirmed,
       min(created_at)::date as first,
       max(created_at)::date as last
  from auth.users;
```

---

## 7. Deployment procedure

### Pre-flight

```
[ ] old project: auth.users counted; Scenario A or B recorded
[ ] old project: recent backup exists
[ ] Scenario A only: export auth.users + auth.identities (never to Git)
[ ] note current Production deployment URL for rollback
[ ] announcement drafted if B and there are users
```

### Execute — variables first, deploy second

Order is not cosmetic: a build that starts before the change and finishes after
serves a mix of both databases.

```
1. set the four Production variables
2. confirm all four saved, no trailing whitespace
3. git checkout main && git merge --ff-only phase5/tool-outcomes
4. git push origin main
5. wait for the Production build to reach READY
6. verify the deployed values (below)
```

### Verify the deployed configuration, not the dashboard

```
[ ] Production / returns 200 and serves the new deployment
[ ] sign up with a fresh address → confirmation email arrives
[ ] link opens on a DIFFERENT device → /auth/verified → /dashboard
[ ] dashboard shows the report after reload (proves the DB write)
[ ] /admin loads for 4a1980c2-…; a normal account is redirected
[ ] password reset completes
[ ] analytics_events gains rows with UUID event_ids
[ ] page_visits gains a row
[ ] /ar /fr /zh render, RTL where expected
[ ] Turnstile still gates signup
[ ] logs: no 42501, PGRST301, "Invalid API key"
[ ] old project: no new rows after the switch
```

The last line matters most: if the old project keeps receiving writes, something
still points at it.

**Cutover is not atomic.** Two projects cannot be synchronised. Keep the window
to a couple of minutes; maintenance mode if traffic matters.

---

## 8. Rollback — two independent halves

```
A) application
   vercel rollback <previous-production-url> --yes

B) environment
   restore the four variables to their old values
```

**Rollback restores neither automatically.** Reverting a deployment does not
revert variables, and neither reverts data.

Consequences to state plainly before starting:

- accounts created on the new project stay there; unreachable after rollback, not deleted;
- reports created after the switch live in the new project and will not appear;
- users who registered on the new project cannot sign in on the old one.

Keep the old project alive and read-only for ≥30 days. Do not delete it at cutover.

---

## 9. Security state

- **No bulk delete in the app.** `/admin` calls `listUsers()` for counting only.
- `scripts/cleanup-test-users.py` deletes only explicit test domains, hard-codes
  `aramchi24@gmail.com` as protected, refuses to run without `--confirm`, and
  skips accounts under 24 h old. Used for this session's cleanup: it isolated the
  one probe address and left the real account alone.
- New project now holds **exactly one user** — the confirmed admin.
- Preview protection: project-level SSO is on; the public exception was a
  per-alias override, now removed. The branch alias
  `lifeseos-app-git-phase5-tool-outcomes-lifeseos.vercel.app` is SSO-protected.
- Turnstile, RLS and auth guards untouched.

---

## 10. Remaining manual actions

1. `select count(*) from auth.users;` in the **old** project — one read-only query.
2. Choose **A** or **B** and record it.
3. If A: provide the old project's `service_role` key, or run the export yourself.
4. Approve the cutover window (everyone is logged out).
5. Tick the four Production variables, then give the merge instruction.

## Recommendation

**NO-GO until 1–2 are answered.** Everything else is prepared, tested and
reversible: release candidate clean, admin access proven against the live new
database, auth flow proven on real hardware, analytics persisting, rollback
documented with its limits.

The only thing standing between here and a completed migration is a decision about
people, and I am not going to make it for you.

---

### Note on a mistake from earlier in this session

While cleaning up probe users I once looped over the entire user list rather than
filtering to my own test addresses, and put `aramchi24@gmail.com` one line from
deletion. It survived. That is why the cleanup script now exists and why the
filter is by domain, not by "everything except me".