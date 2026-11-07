# Production cutover readiness — verified state

## PASSED: real cross-device email confirmation

Confirmed on hardware, not simulated: iPhone, real Turnstile challenge, real
Resend delivery, token-hash link, authenticated dashboard.

Verified independently in the new project:

```
email            aramchi24@gmail.com
id               4a1980c2-5024-42e5-87ac-9142fb4ae95a
created_at       2026-11-07T12:34:56Z
confirmation_sent 2026-11-07T13:54:07Z
email_confirmed_at 2026-11-07T13:54:48Z
last_sign_in_at  2026-11-07T13:54:48Z
provider         email
CONFIRMED:       true
```

Note the timeline: the account was created at 12:34 by the broken-link attempt and
stayed unconfirmed for 80 minutes until the fixed template delivered a working
link. That is the same account, later confirmed — the earlier failure and this
success are two halves of one reproduction.

Preview reachability, unauthenticated:

| Path | Result |
|---|---|
| `/` | 200 |
| `/auth/login` | 200 |
| `/auth/confirm?token_hash=bogus` | 307 → `/auth/error?error=…` |
| `/en/dashboard` | 307 → login (not signed in) |

The Vercel SSO wall that caused the earlier 404 is no longer in the path.

---

## ADMIN_USER_ID transition

`/admin` compares the signed-in user's id to `ADMIN_USER_ID` exactly:

```ts
if (!adminUserId || user.id !== adminUserId) redirect("/dashboard");
```

| | Value |
|---|---|
| Production today (old project) | `9067570a-9e9c-4c35-90c8-dda9de6e82f6` |
| New project, real account | `4a1980c2-5024-42e5-87ac-9142fb4ae95a` |

These differ, so **`ADMIN_USER_ID` must change at cutover** or `/admin` silently
redirects to the dashboard — no error, no log, just a lockout that looks like a
permissions bug.

Verify after the change, in production, signed in as that account:

```
[ ] /admin renders
[ ] a second, non-admin account is redirected to /dashboard
[ ] the user list, report counts and analytics panels all load
   (they read through the service role — this also proves the new secret key)
```

If `/admin` redirects, the cause is the id mismatch, in that order: wrong value →
whitespace in the variable → the variable not applied to the deployment.

---

## Safe cleanup — and what I removed

There was no bulk-delete logic in the application. `app/[locale]/admin/page.tsx`
calls `auth.admin.listUsers()` for **counting only**; nothing deletes users
anywhere in `app/` or `lib/`.

The dangerous code was mine, in ad-hoc shell loops. I have replaced it with
`scripts/cleanup-test-users.py`, which makes the mistake unexpressible:

- deletes only addresses ending in `@mailinator.com`, `@invalid.test`,
  `@example.com`, `lifeseos-test.invalid`
- hard-codes `aramchi24@gmail.com` as protected, checked before the domain rule
- refuses to run without `--confirm`
- skips anything created in the last 24 hours, so a fresh real signup cannot be
  swept up by a cleanup run
- prints the plan first and deletes nothing if the list is empty

Dry run against the live project:

```
total users: 1
protected present: ['aramchi24@gmail.com']
eligible for deletion: 0
nothing to do
```

The real account and its data are untouched. It currently owns no reports, since
no analyser run has been saved on it yet.

---

## Cutover risks that remain

### 1. Existing users in the OLD project — still unmeasured

This is the only hard blocker, unchanged. The old project's row counts are zero,
but `auth.users` has never been counted, and the handoff doc records an admin
account `9067570a-…` that demonstrably worked.

Whatever the number, a cutover means:

- every old account stops being able to sign in, because `auth.users` does not
  transfer between projects;
- the old admin's UUID does not exist in the new project.

`select count(*) from auth.users;` in the old project's SQL editor settles it. It
is one read-only query.

### 2. Concurrent writes

The two projects are independent. Change the environment variables **before**
deploying, never the reverse — a build that starts before the change and finishes
after will serve a mix.

### 3. The shared Preview variables

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and
`SUPABASE_SECRET_KEY` are scoped `Production, Preview` **together**. Every preview
that is not branch-scoped currently inherits Production's database. Unchanged, and
still worth fixing before more previews are shared with anyone.

### 4. Session invalidation

Every currently signed-in user is signed out at cutover, because their JWT was
issued by the old project. This is unavoidable and should be announced alongside
any account change.

### 5. Turnstile and email

Both verified working on the preview. Production carries its own
`TURNSTILE_SECRET_KEY` and `AUTH_VERIFY_SECRET`, which are not affected by a
Supabase swap. SMTP is configured on the **new project**, so confirmations keep
flowing after cutover with no Vercel change.

---

## Rollback

```
vercel rollback <previous-production-deployment-url> --yes
```

plus restoring the four variables. Accounts created on the new project during the
window are not deleted; they simply become unreachable until you switch back.

Keep the old Supabase project alive and read-only for at least 30 days. Do not
delete it at cutover.

---

## Post-cutover verification — reads data back, never trusts a 200

```
[ ] sign up with a fresh address on www.lifeseos.com
[ ] confirmation email arrives (sender no-reply@send.lifeseos.com)
[ ] link opens on a DIFFERENT device → /auth/verified → /dashboard, signed in
[ ] run the SEO analyser on https://example.com
[ ] reload the dashboard — the report is still listed
[ ] open the report — its grade and score render from report_data
[ ] sign out, sign in again
[ ] /admin works for 4a1980c2-…, redirects for a normal account
[ ] password reset completes end to end
[ ] `analytics_events` has rows with UUID event_ids for this run
[ ] no 42501 / PGRST301 / "Invalid API key" in Vercel function logs
[ ] `page_visits` gains a row for the visit (proves the service-role write path)
```

The last three are the ones that catch a wrong secret key: the UI would look
perfect while nothing persisted.

---

## Decisions only you can make

1. **Old project user count** — run the query. This decides Scenario A vs B.
2. **Scenario** — preserve accounts (needs the old project's service key and an
   `auth.users` + `auth.identities` import) or accept fresh accounts.
3. **Announcement** — whether existing users are told they must re-register.
4. **Preview protection** — the preview is currently publicly reachable. Restore
   Vercel Authentication after testing if that was not intended to stay open.
5. **Cutover window** — every signed-in user is logged out; pick a quiet hour.
6. **Final approval** — nothing below happens without it.