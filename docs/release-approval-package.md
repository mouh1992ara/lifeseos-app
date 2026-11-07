# Release approval package — Scenario B approved, execution withheld

**Awaiting the exact command `EXECUTE LIFESEOS PRODUCTION CUTOVER`.**
Nothing has been merged, deployed, or reconfigured.

## 1. What commit deploys

| | |
|---|---|
| Deploy | **`c995f1a`** |
| Code-equivalent to | `395f9c4` |
| Difference | one added file: `docs/production-release-395f9c4.md` (278 lines, no code) |

`git diff --stat 395f9c4..c995f1a` shows exactly one documentation file. So
`c995f1a` supersedes `395f9c4` in history but **not in behaviour** — either deploys
identical code. Deploy `c995f1a` so the deployed commit matches the reviewed HEAD.

Ancestry verified: `b88bc64` → … → `395f9c4` → `c995f1a`, all linear, no merges.
Fast-forward from `main` is therefore possible and clean.

## 2. Rollback deployment reference

| | |
|---|---|
| Deployment ID | `dpl_FQeXp7e9gTfhfTY8F8ymrKUrc4Cp` |
| URL | `lifeseos-ri5jj167i-lifeseos.vercel.app` |
| Commit | `b88bc649` — "test(analytics): guard the guards" |
| Branch / target | `main` / production |
| Created | 2026-11-07 06:11 UTC |
| State | READY |

This is the last known-good Production deployment currently serving
`www.lifeseos.com`.

## 3. Old environment values — one gap, needs you

I tried to read the current Production values directly from the Vercel API with
`decrypt=true`. Results:

| Variable | Readable by me? | Recoverable source |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | envelope only (`eyJ2IjoidjIi…`, 1096 chars) | **`.env.local`** → `https://ikjlgsbrsknjyfegjrdi.supabase.co` ✓ |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | envelope only | **`.env.local`** → `sb_publishable_aeMhSvO…` ✓ |
| `SUPABASE_SECRET_KEY` | **`sensitive`, null** | **none available to me** ✗ |
| `ADMIN_USER_ID` | **`sensitive`, null** | doc only: `9067570a-9e9c-4c35-90c8-dda9de6e82f6` (unverified as current) ⚠ |

So the honest answer to "are secure recovery values available" is: **two of four
are, and the two that matter most are not.**

`.env.local`'s `SUPABASE_SECRET_KEY` holds a 25-character `UPSTASH_…` placeholder —
not a Supabase key — so it is useless as a rollback value. Earlier in this
migration I nearly shipped that placeholder into the new project because of it.

**Required from you before I execute** — one minute in the OLD project dashboard:

1. OLD project → Settings → API → copy the `service_role` key.
2. Confirm the admin UUID is still `9067570a-9e9c-4c35-90c8-dda9de6e82f6`.

Store them somewhere outside this repo. Then a rollback can restore all four
variables without depending on Vercel's rollback alone.

If you would rather not handle the old key: that is a legitimate choice, but say
so explicitly, because it means a rollback could restore the old deployment
*without* a working service-role key — the site would render while analytics,
page visits and `/admin` silently failed.

## 4. Exact scope of the four Production changes

Current Vercel state, read from the project API:

| Key | id | targets | branch |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `SXURPoBAFrCxgZlg` | `production, preview` | — |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `oshE0EPT4i3MgYm7` | `production, preview` | — |
| `SUPABASE_SECRET_KEY` | `gd8ShfBadrEQcD9K` | `production, preview` | — |
| `ADMIN_USER_ID` | `zRSObNTDwwWHU6qc` | `production` | — |

The change, precisely:

```
NEXT_PUBLIC_SUPABASE_URL            → https://izmwdlyuthxgkijxiwmt.supabase.co
                                      target: production            (drop preview)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY→ <new sb_publishable_…>
                                      target: production            (drop preview)
SUPABASE_SECRET_KEY                 → <new service_role JWT eyJ…>
                                      target: production            (drop preview)
ADMIN_USER_ID                       → 4a1980c2-5024-42e5-87ac-9142fb4ae95a
                                      target: production            (already)
```

### Preview isolation is already in place, and better than I claimed earlier

Branch-scoped Preview entries already exist for all four:

| Key | gitBranch |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `phase5/tool-outcomes` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `phase5/tool-outcomes` |
| `SUPABASE_SECRET_KEY` | `phase5/tool-outcomes` |
| `ADMIN_USER_ID` | `phase5/tool-outcomes` |

Dropping `preview` from the three shared entries therefore isolates Production
**without breaking that branch** — it keeps its own overrides. Other branches
would lose Supabase config entirely, which is the desired fail-closed behaviour
rather than silently reading Production's database.

## 5. Pre-deployment evidence

| Check | Status |
|---|---|
| Release candidate & ancestry | ✓ `c995f1a`, linear from `b88bc64`, 17 commits |
| Repository clean | ✓ 0 modified files |
| Production build | ✓ passed with the new project's config |
| TypeScript | ✓ clean |
| ESLint | ✓ 0 errors (4 pre-existing warnings) |
| Tool-outcome tests | ✓ 71/71 |
| New project operational | ✓ 6 objects, RLS on all, 4 policies, indexes present |
| Auth + email verification | ✓ real iPhone confirmation, `email_confirmed_at` 13:54:48Z |
| Admin access verified | ✓ `/admin` renders against new DB, Total Users 1 |
| Non-admin blocked | ✓ anonymous → login; authenticated ordinary → `/dashboard` |
| Migrations intact | ✓ both present and applied; nothing re-run |
| Preview/Production scope | ✓ branch-scoped Preview values exist |
| Previous Production deployment | ✓ `dpl_FQeXp7e9gTfhfTY8F8ymrKUrc4Cp` / `b88bc649` |
| Old env values for rollback | ⚠ **2 of 4** — see §3 |
| Old project untouched | ✓ all four table endpoints still 200, `analytics_events` 404 |

### Current data in the new project

`seo_reports` 0 · `contact_messages` 0 · `tool_events` 0 · `page_visits` 26 ·
`analytics_events` 24 · **users 1** (the confirmed admin).

The 24 analytics and 26 page-visit rows are genuine traffic from testing, not
fixtures. No probe accounts remain.

## 6. Remaining blockers

| # | Blocker | Owner |
|---|---|---|
| 1 | Old `service_role` key + admin UUID not recorded for rollback | **you** (§3) |
| 2 | Explicit cutover command | **you** |

Nothing else. There is no unresolved technical defect.

## 7. User communication — prepared, not published

Draft, to go out with the cutover or shortly before:

> **We've upgraded our accounts system**
>
> LifeSeos has moved to a new authentication platform. Your previous account
> could not be carried over, so you'll need to **create your account again** with
> the same email address. Your saved SEO reports were stored in the previous
> system and are not available in the new one.
>
> Everything else — all 17 tools, the analyser, and the four languages — works
> exactly as before. We're sorry for the extra step.

Deliberately does not claim any account or data was migrated, because none was.

## 8. Assessment

**GO** on readiness — with one prerequisite outstanding.

The release candidate is clean, the new backend is proven end to end on real
hardware, admin access is verified against the live new database, and the exact
scope of the four changes is known down to Vercel entry IDs.

**NO-GO on execution** until you send `EXECUTE LIFESEOS PRODUCTION CUTOVER`,
and I would ask you to settle §3 first — not because the cutover is risky, but
because rollback should not depend on a key nobody can currently read.

When the command arrives I will revalidate the candidate, the target project ref,
the credentials and the rollback prerequisites, and **stop** if any of them is
not what this document says.