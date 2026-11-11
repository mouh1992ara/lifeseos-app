# Production cutover executed — 2026-11-07

Authorized by explicit instruction. Executed against `docs/EXECUTION-RUNBOOK.md`.

## Deployment

| | |
|---|---|
| Deployed commit | **`bb2db7a`** |
| Deployment UID | **`dpl_GZVdLib74o4uyKy3NSD7ErqHwFju`** |
| Target | production, `READY` |
| Domain | `https://www.lifeseos.com` — 200 |
| Supabase project | **`izmwdlyuthxgkijxiwmt`** (new) |
| Previous deployment | `dpl_FQeXp7e9gTfhttY8F8ymrKUrc4Cp` (`b88bc649`), preserved |

Fast-forward: `b88bc64 → bb2db7a`, no merge commit. `2287513` verified identical
in code and config before the push.

## Environment changes applied

| Variable | Scope after |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | production only (preview removed) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | production only (preview removed) |
| `SUPABASE_SECRET_KEY` | production only (preview removed) |
| `ADMIN_USER_ID` | `4a1980c2-5024-42e5-87ac-9142fb4ae95a` |

Branch-scoped Preview overrides for `phase5/tool-outcomes` preserved. Unrelated
variables untouched. Applied **before** the build, so the bundle embedded the new
project.

### The decisive check

The deployed bundle contains `izmwdlyuthxgkijxiwmt` and **zero** occurrences of
`ikjlgsbrsknjyfegjrdi` across all 11 scripts on `/auth/login`. That is what
distinguishes a real cutover from one that merely looks successful.

## Verification

| Area | Result |
|---|---|
| Home, `/ar`, `/fr`, `/zh` | 200; `ar` RTL, `zh-Hans` |
| `/tools/seo-analyzer` | 200 |
| Token-hash confirm on domain | 307 → `/en/auth/verified?next=/dashboard`, session cookie set |
| Dashboard with session | 200 |
| Dashboard anonymous | 307 → `/auth/login` |
| `/admin` as admin | **200, "LifeSeos Admin", Total Users renders** |
| `/admin` as ordinary user | 307 → **`/dashboard`** |
| `/admin` anonymous | 307 → `/auth/login` |
| Analyser API | 200, `score 52, grade D` |
| Report insert (user token) | **201**, owner bound to that user |
| Cross-user read | admin sees **`[]`** while the row exists — RLS holds |
| Contact form | 200 **and row persisted** |
| Tool event beacon | 200, `tool_use` persisted with valid UUID v4 |
| Page visits | persisted |
| Turnstile | `captchaRequired: true` — still gating signup |
| Production logs | no `42501`, no `PGRST301`, no `Invalid API key` |
| OLD project | all four tables still 0 rows; no `analytics_events` table; untouched |

Cleanup: temporary verification account deleted (its report cascaded), probe
contact row and probe page visit removed. Final new-project state: **1 user**
(the confirmed admin), reports 0, contact 0, `page_visits` 32, `analytics_events`
29 — the latter two being genuine traffic.

## Not verified — stated plainly

1. **A real signup through the Turnstile widget on production.** Turnstile is
   confirmed still required and the endpoint responds, but completing the
   challenge needs an interactive browser. Auth was proven with a real
   `verifyOtp` token through the same route instead.
2. **Live Resend delivery on the production domain.** The redirect
   `https://www.lifeseos.com/auth/confirm` was confirmed honoured by the allow-list
   before cutover, and the confirm route works on the domain, but no email was
   sent and received post-cutover.
3. **All 17 tools exercised individually.** The analyser was exercised end to end;
   the rest share the same instrumentation and route, and the beacon was verified.

These are the three things a person with a phone and an inbox should confirm. They
are gaps in *evidence*, not known defects.

## State

- `main` = `bb2db7a`, deployed, serving production
- OLD project intact, read-only, not deleted
- Rollback available but **PARTIAL** — the old `service_role` key remains
  unavailable, so a rollback would restore the site and auth while leaving
  `/admin`, analytics, page visits, tool events and contact down
- No account deleted or migrated
- Security controls unchanged: Turnstile required, RLS on every table,
  service-role key server-only