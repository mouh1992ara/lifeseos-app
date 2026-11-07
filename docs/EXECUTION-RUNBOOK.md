# LifeSeos Production cutover — execution runbook

**STATUS: NOT AUTHORIZED. Nothing in this document may be executed until a
separate instruction arrives containing `EXECUTE LIFESEOS PRODUCTION CUTOVER`.**

This supersedes every earlier runbook draft. Where any other document disagrees
with the identifiers below, this one wins.

---

## Verified identifiers

Read from the Vercel and Supabase APIs, not from earlier prose.

| Item | Value |
|---|---|
| **Rollback deployment UID** | **`dpl_FQeXp7e9gTfhttY8F8ymrKUrc4Cp`** |
| Rollback commit | `b88bc649` — "test(analytics): guard the guards" |
| Rollback target | `production`, state `READY` |
| Rollback URL | `lifeseos-ri5jj167i-lifeseos.vercel.app` (SSO-gated; use the UID) |
| Approved release candidate | **`2287513`** |
| Docs-only HEAD | `bb2db7a` |
| Production today | `b88bc64` |
| Production domain | `https://www.lifeseos.com` |
| NEW project ref | `izmwdlyuthxgkijxiwmt` |
| OLD project ref | `ikjlgsbrsknjyfegjrdi` |
| NEW admin UUID | `4a1980c2-5024-42e5-87ac-9142fb4ae95a` |

> A previous draft carried a mistyped rollback UID (characters 16–19 transposed,
> `fT` for `tt`). It has been deleted from these documents rather than corrected
> in place, so it cannot be quoted by accident. **The UID above is the only one
> that appears anywhere now, and it is the only one to use.**

## Confirmed decisions

| Decision | State |
|---|---|
| Scenario B — fresh accounts | **APPROVED** |
| Existing account migration | **NOT REQUIRED** |
| Partial rollback risk | **EXPLICITLY ACCEPTED** |
| OLD Supabase project | must remain **untouched** |
| NEW confirmed administrator | must be **preserved** |

---

## Pre-flight gate — stop if any check fails

```
[ ] 1. Rollback UID re-read from the API and equal to dpl_FQeXp7e9gTfhttY8F8ymrKUrc4Cp
[ ] 2. Release commit verified; tree clean; main == origin/main
[ ] 3. git diff 2287513..<target> -- app lib components proxy.ts i18n messages package.json  → empty
[ ] 4. New project reachable; admin present, confirmed, sole user
[ ] 5. Contact fix present: supabaseAdmin imported in app/api/contact/route.ts
[ ] 6. www.lifeseos.com/auth/confirm honoured by the redirect allow-list
[ ] 7. Old project still untouched (four table endpoints answering as before)
[ ] 8. docs/emergency-recovery-partial.md present
[ ] 9. Deploy + rollback permission confirmed
[ ] 10. No material change since the reviewed readiness report
```

If any item is not what this document says, **stop and report**. Do not
improvise a substitute value.

---

## The four Production changes

| Variable | New value | Scope after |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://izmwdlyuthxgkijxiwmt.supabase.co` | `production` only |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | new `sb_publishable_…` | `production` only |
| `SUPABASE_SECRET_KEY` | new `service_role` **JWT** (`eyJ…`) | `production` only |
| `ADMIN_USER_ID` | `4a1980c2-5024-42e5-87ac-9142fb4ae95a` | `production` only |

Vercel entry IDs, for precision:

```
SXURPoBAFrCxgZlg   NEXT_PUBLIC_SUPABASE_URL             (production, preview → production)
oshE0EPT4i3MgYm7   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (production, preview → production)
gd8ShfBadrEQcD9K   SUPABASE_SECRET_KEY                  (production, preview → production)
zRSObNTDwwWHU6qc   ADMIN_USER_ID                        (production; value changes)
```

Branch-scoped Preview overrides for `phase5/tool-outcomes` already exist for all
four and must be **preserved** — that is what keeps the preview working while
unscoped previews fail closed instead of reading Production's database.

Unchanged: `NEXT_PUBLIC_SITE_URL`, `TURNSTILE_*`, `AUTH_VERIFY_SECRET`,
`UPSTASH_*`, `CRON_SECRET`, `GOOGLE_PAGESPEED_API_KEY`, `BAIDU_PUSH_TOKEN`.

### Why the order is not negotiable

`NEXT_PUBLIC_*` are **inlined at build time**. Build before changing them and the
browser bundle keeps the old project URL and publishable key: the site would look
healthy while talking to the old database. So:

```
variables → verify → build → deploy → verify the deployed values
```

---

## Sequence

### 1. Record
Capture the serving deployment (`dpl_FQeXp7e9gTfhttY8F8ymrKUrc4Cp`) and its
effective configuration before touching anything.

### 2. Preserve rollback values
- recoverable: old URL and old publishable key (`.env.local`)
- **not recoverable: old `service_role` key** — accepted
- old admin UUID: documented but unverified

### 3. Apply the four variables, Production scope only
Remove `preview` from the three shared entries; leave branch overrides intact.

### 4. Fast-forward the release
```
git checkout main
git merge --ff-only bb2db7a      # or 2287513; code is identical
git push origin main
```
Expected: fast-forward, no merge commit. `b88bc64` is an ancestor.

### 5. Build and deploy
One fresh Production build, after the variables. No build may span the change.

### 6. Verify the deployed configuration
Without printing secrets:
```
[ ] deployed commit == the one pushed
[ ] page source / client bundle references izmwdlyuthxgkijxiwmt
[ ] /admin loads for 4a1980c2-…; a normal account is redirected
[ ] no 42501 / PGRST301 / "Invalid API key" in logs
```
The bundle check is the one that catches a build that ran too early.

### 7. Functional verification
```
[ ] home 200; /ar /fr /zh render, ar RTL
[ ] signup → confirmation email → link on another device → /dashboard
[ ] analyser run → report persists across reload
[ ] analytics_events gains rows with UUID event_ids
[ ] page_visits gains a row
[ ] /api/contact returns 200 and the row persists
[ ] password reset completes
[ ] Turnstile still gates signup
[ ] old project receives no new writes
```

That last line matters most: if the old project keeps receiving writes, something
still points at it.

---

## Rollback — PARTIAL, stated honestly

**Do not describe this as a full rollback.** The old `service_role` key is
unavailable; Vercel stores it write-only and no authorized route returns it.

### Order

```
1. Stop changes. Decide roll-forward vs rollback (see below).
2. vercel rollback dpl_FQeXp7e9gTfhttY8F8ymrKUrc4Cp --yes
   — or redeploy b88bc649 if the CLI cannot resolve the UID
3. Restore runtime variables:  SUPABASE_SECRET_KEY (unavailable), ADMIN_USER_ID
4. Verify the effective configuration of the deployment actually serving
```

`NEXT_PUBLIC_*` come back correct from the old bundle — they were baked when it
was built. `SUPABASE_SECRET_KEY` and `ADMIN_USER_ID` are read at runtime and must
be restored separately. **Neither half alone is sufficient.**

### What a rollback costs

| Capability | After rollback |
|---|---|
| Public site, 17 tools, analyser | works |
| Signup, login, sessions, dashboard, saved reports | works |
| `/admin` | **down** — no secret key |
| `/api/analytics`, `/api/page-visit`, `/api/tool-events` | **down** |
| Contact form | **down** |
| Accounts created on the new project | unreachable until you switch back; not deleted |

### Prefer roll-forward

Under Scenario B a rollback also strands every account created since cutover.
For anything short of an auth or security failure, fixing forward on the new
backend is the lower-risk move — it is the backend with verified service-role
access, working analytics and a working contact form.

### Never, to make an outage go away

- do not grant `INSERT` to `anon`
- do not move the secret into a `NEXT_PUBLIC_` variable
- do not disable Turnstile or RLS

---

## Post-cutover

```
[ ] old project preserved, read-only, not deleted
[ ] new admin can still sign in
[ ] new project receives genuine writes (analytics, page visits, contact)
[ ] watch auth failures and function errors for 24h
[ ] user communication about re-registration published if applicable
[ ] no legacy data deleted
```

---

## Hold

Execution requires a separate instruction containing exactly:

```
EXECUTE LIFESEOS PRODUCTION CUTOVER
```

Until then: no merge, no deploy, no variable change, no database switch, no
announcement, no account deletion. Production remains `b88bc64` on the old
project.