# Production release candidate — `29dd6ec`

Preparation only. **No cutover has been performed or authorised.**

## Release candidate

| | |
|---|---|
| Branch | `phase5/tool-outcomes` |
| Commit | **`29dd6ec`** |
| Base | `main` @ `b88bc64` |
| Relationship | `main` is an **ancestor** → cutover is a fast-forward, 17 commits |
| Production today | `b88bc64` (unchanged) |

Nothing pushed to `main`, nothing deployed to Production.

### What the candidate contains

| Area | Change |
|---|---|
| Tool outcomes | `lib/use-tool-outcome.ts`, `lib/event-id.ts`; every instrumented tool emits `tool_use` then `tool_success`/`tool_error` |
| Analytics | `lib/analytics.ts` beacon wiring, 11-name vocabulary enforced by a CHECK constraint |
| Confirmation | token-hash `/auth/confirm`, `.RedirectTo`-based template, locale via user metadata |
| Auth fixes | query-free `emailRedirectTo` to satisfy the allow-list; `proxy.ts` routes `token_hash` to the confirm route |
| UI | Liquid Glass surfaces untouched |

### Build and checks

```
npm run build            ✓ compiled, TypeScript passed, all routes emitted
npx tsc --noEmit         ✓ no errors
npx eslint               ✓ 0 errors, 4 warnings (exhaustive-deps, pre-existing)
tests/tool-outcome       ✓ 71 passed, 0 failed
```

**Build note worth knowing:** the build fails with `Missing SUPABASE_SECRET_KEY`
if that variable is absent, because `app/[locale]/admin/page.tsx` imports the
service-role client at module scope. It is not a deployment blocker — Vercel
supplies it — but a local build needs it set. Building with the **new** project's
key is how this candidate was verified.

### Languages and routes, checked live

| Route | Result |
|---|---|
| `/` | 200, `lang="en" dir="ltr"` |
| `/ar` | 200, `lang="ar" dir="rtl"` |
| `/fr` | 200, `lang="fr" dir="ltr"` |
| `/zh` | 200, `lang="zh-Hans" dir="ltr"` |
| `/en` | 307 → `/` (correct: English is the unprefixed default) |
| `/en/tools/seo-analyzer` | 307 → `/tools/seo-analyzer` |
| `/ar/tools/seo-analyzer` | 200, RTL |
| `/auth/confirm` | 307 → `/auth/error` (reaches the route) |
| `/en/dashboard` unauthenticated | 307 → `/auth/login` |

---

## Production environment-variable diff

Vercel → Settings → Environment Variables → **Production**. Secrets are redacted;
values never enter Git.

| Variable | Current | Replace with | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ikjlgsbrsknjyfegjrdi.supabase.co` | `https://izmwdlyuthxgkijxiwmt.supabase.co` | public |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | old `sb_publishable_…` | new `sb_publishable_…` | public |
| `SUPABASE_SECRET_KEY` | old `service_role` JWT | **new `service_role` JWT** | server-only; never `NEXT_PUBLIC_` |
| `ADMIN_USER_ID` | `9067570a-9e9c-4c35-90c8-dda9de6e82f6` | **`4a1980c2-5024-42e5-87ac-9142fb4ae95a`** | see below |

Unchanged: `NEXT_PUBLIC_SITE_URL`, `TURNSTILE_SECRET_KEY`,
`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `AUTH_VERIFY_SECRET`, `UPSTASH_REDIS_REST_URL`,
`UPSTASH_REDIS_REST_TOKEN`, `CRON_SECRET`, `GOOGLE_PAGESPEED_API_KEY`,
`BAIDU_PUSH_TOKEN`.

**`SUPABASE_SECRET_KEY` must be the `service_role` JWT** (`eyJ…`), which is the
form verified end to end against this project. A wrong value here fails silently:
the routes catch insert errors, so the app looks healthy and stores nothing.

### Preview/Production isolation — currently imperfect

Measured on the Vercel project:

```
NEXT_PUBLIC_SUPABASE_URL            Production, Preview
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY Production, Preview
SUPABASE_SECRET_KEY                 Production, Preview
```

Any preview that is not branch-scoped inherits **Production's** database. Only
`phase5/tool-outcomes` overrides them. Two options before cutover:

1. Remove Preview from those three shared variables, leaving Production only, and
   give previews their own branch-scoped values — clean isolation, some setup.
2. Leave as-is and rely on branch scoping — works, but a new branch silently
   points at Production.

Recommendation: option 1, at cutover.

---

## Admin access

```ts
if (!adminUserId || user.id !== adminUserId) redirect("/dashboard");
```

| | |
|---|---|
| Current | `9067570a-9e9c-4c35-90c8-dda9de6e82f6` (old project) |
| Required after cutover | `4a1980c2-5024-42e5-87ac-9142fb4ae95a` |

This is exact-match with no fallback: a stale value produces a redirect to
`/dashboard`, with no error and no log entry. It is indistinguishable from a
permissions bug, which is why it belongs on the smoke-test list explicitly.

The new account is confirmed and can sign in — verified in the new project
(`email_confirmed_at 2026-11-07T13:54:48Z`, `last_sign_in_at` same second).

---

## The two scenarios

### A — preserve existing users

Requires the old project's `service_role` key, which is currently unobtainable
from this machine (Management API 403; Vercel marks it `[SENSITIVE]`;
`.env.local` holds a placeholder).

Mechanics that matter:

- `encrypted_password` is bcrypt and **transfers**; users keep their passwords.
- `auth.identities` **must** come too, or the account exists but cannot log in.
- `id` is a UUID with no default — carrying it preserves every `user_id` FK, and
  means `ADMIN_USER_ID` needs **no change**.
- MFA enrolments do not transfer; those users re-enrol.
- Do not import `sessions`/`refresh_tokens`; everyone signs in once.

### B — fresh accounts

Needs only your approval. Consequences:

| | |
|---|---|
| Passwords | lost — everyone re-registers |
| Sessions | all invalid |
| Admin access | `ADMIN_USER_ID` **must** change to the new UUID |
| Report data | the old tables are empty (counted twice), so nothing is lost |
| User experience | silent lockout unless you tell them |

I am not treating "application tables are empty" as "no users exist". The old
project has at least one real account — `9067570a-…`, recorded in the handoff doc
and evidenced by `ADMIN_USER_ID` having been set. `auth.users` has never been
counted.

### How to decide

Old project → SQL Editor, read-only:

```sql
select count(*) as total,
       count(*) filter (where email_confirmed_at is not null) as confirmed,
       min(created_at)::date as first, max(created_at)::date as last
  from auth.users;
```

`0` or `1` → B is trivial. More → A is the responsible choice.

---

## Runbook

### 0. Pre-flight (T-1 day)

```
[ ] release candidate 29dd6ec reviewed
[ ] old project: auth.users counted; scenario chosen and approved
[ ] new project: 1 confirmed account, 0 probe users
[ ] new project: Site URL, redirect URLs, template, SMTP all verified
[ ] rollback target recorded: current Production deployment
[ ] announcement drafted (sessions drop, and whether users re-register)
```

### 1. Backups before any change

```
[ ] old project → Database → Backups → confirm a recent backup exists
[ ] export auth.users + auth.identities if Scenario A (never to Git)
[ ] note current Production deployment URL and its env var values
```

### 2. Environment variables first, deploy second

Order matters: a build that starts before the change and finishes after serves a
mix of both databases.

```
[ ] change the four Production variables
[ ] confirm all four saved, no trailing whitespace
[ ] then merge: git checkout main && git merge --ff-only phase5/tool-outcomes
[ ] git push origin main
[ ] wait for the build to reach READY
```

### 3. Cutover is not atomic — accept a short window

Two Supabase projects cannot be synchronised. Between the variable change and the
first request served by the new build, the deployment is in a defined state but a
user mid-signup may land on either side. Mitigation: change variables, deploy
immediately, and keep the window under a couple of minutes. Maintenance mode if
traffic matters.

### 4. Smoke tests — each reads data back

```
[ ] sign up with a fresh address on www.lifeseos.com
[ ] confirmation email arrives, sender no-reply@send.lifeseos.com
[ ] link opens on a DIFFERENT device → /auth/verified → /dashboard signed in
[ ] run the analyser on https://example.com
[ ] reload the dashboard → the report is listed
[ ] open the report → grade and score render from report_data
[ ] sign out, sign in again
[ ] /admin loads for 4a1980c2-…; a normal account is redirected
[ ] password reset completes
[ ] analytics_events has rows with UUID event_ids for this run
[ ] page_visits gained a row (proves the service-role write path)
[ ] /ar /fr /zh render and are RTL-correct where expected
[ ] Turnstile still gates signup
```

The analytics and page_visits lines are the ones that catch a wrong secret key.

### 5. Monitor

```
[ ] Vercel function logs: no 42501, PGRST301, "Invalid API key"
[ ] new project: auth users growing, not flat
[ ] new project: analytics_events receiving rows
[ ] old project: no new rows after the switch (confirms no split traffic)
```

The last line is the one people forget: if the old project keeps receiving writes,
something is still pointed at it.

### 6. Rollback

```
vercel rollback <previous-production-url> --yes
```

then restore the four variables to their old values.

**Reverting the deployment does not restore environment variables, and does not
move data back.** Consequences to state plainly:

- accounts created on the new project stay there; they become unreachable on
  rollback but are not deleted;
- reports created after the switch are in the new project and will not appear;
- users who signed up on the new project cannot sign in on the old one.

Keep the old project alive and read-only for at least 30 days. Do not delete it.

---

## Security review

**No bulk-delete path exists in the application.** `app/[locale]/admin/page.tsx`
calls `auth.admin.listUsers()` for counting only; grep across `app/` and `lib/`
finds no `deleteUser` or destructive call.

`scripts/cleanup-test-users.py` replaces the ad-hoc loops that twice iterated over
every user. It:

- deletes only `@mailinator.com`, `@invalid.test`, `@example.com`,
  `lifeseos-test.invalid`;
- hard-codes `aramchi24@gmail.com` as protected, checked before the domain rule;
- refuses to run without `--confirm`;
- skips accounts younger than 24 h, so a fresh real signup cannot be caught;
- prints the plan and deletes nothing if the list is empty.

Dry run against live state: `total users: 1 · protected present:
['aramchi24@gmail.com'] · eligible: 0`.

**Preview protection — RESTORED.** The project setting was never the problem:
`ssoProtection` has been `all_except_custom_domains` throughout. The exception was
a per-alias override on `lifeseos-phase5.vercel.app`:

```
protectionBypass: { '*': { scope: 'alias-protection-override', … } }
```

That flag made one hostname public while every other preview answered 302 →
`vercel.com/sso-api`. Measured across three hosts to be sure it was the alias and
not the project.

Removed by deleting the alias (the API exposes no field to clear the override).

| Host | Before | After |
|---|---|---|
| `lifeseos-phase5.vercel.app` | 200, public | **404 — alias deleted** |
| `lifeseos-iwsjbb723-…vercel.app` | 302 → SSO | 302 → SSO |
| `lifeseos-app-git-phase5-tool-outcomes-…vercel.app` | 302 → SSO | 302 → SSO |

The branch alias is the one to use from now on: it is git-linked, has no
override, and now points at `6a8f493`. Sign in to Vercel to view it, or pass the
protection bypass header.

Production was never touched: `www.lifeseos.com` still returns 200 and still runs
the old project.

**Unchanged and must stay so:** Turnstile enforced (`NODE_ENV=production` makes it
required), RLS on every table, service-only grants on the four internal tables.

---

## Remaining blockers

1. **`auth.users` count in the old project.** One read-only query. Everything else
   is decided by it.
2. **Scenario approval** — A or B.
3. **Decision on announcement** — whether existing users are told.
4. **Preview protection** — restore or accept as public.
5. **Shared Preview variables** — fix isolation at cutover or accept the risk.

## Recommendation

**NO-GO until (1) and (2) are answered.** Everything on the engineering side is
built, tested and reversible. The release candidate is clean, the build passes,
the auth flow is proven on real hardware, and the runbook is written.

What remains is a decision about people: whether existing accounts are migrated or
asked to register again. I will not make that call, and I will not perform the
cutover without your explicit approval.