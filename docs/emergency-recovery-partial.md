# Emergency recovery procedure — partial rollback

The OLD `service_role` key is **unavailable** (Vercel stores it write-only; see
`docs/rollback-credential-investigation.md`). This procedure is therefore
**PARTIAL**, not full, and says exactly which capability is lost at each step.

Do not describe this as a complete rollback. It is a controlled retreat that
restores most of the site and keeps authentication working.

## What is and is not restorable

| Capability | Restorable | Notes |
|---|---|---|
| Public website, all 17 tools, analyser | **yes** | no privileged client involved |
| Signup, login, logout, sessions | **yes** | cookie-scoped client + publishable key |
| Dashboard and saved reports | **yes** | RLS-scoped user client |
| Email confirmation | **yes** | auth endpoints only |
| `/admin` | **no** | imports `lib/supabase/admin.ts`, which throws without the key |
| `/api/analytics` | **no** | same |
| `/api/page-visit` | **no** | same |
| `/api/tool-events` | **no** | same |
| Contact messages | **no** | route now needs the service-role client |
| Data written to the NEW project | **stays there** | not reachable from the old project |

The failure is loud, not silent: `lib/supabase/admin.ts` throws
`Missing SUPABASE_SECRET_KEY` at import, so affected routes error rather than
pretending to work. That is the safer behaviour, and it is why this is a
degraded state rather than a corrupt one.

---

## Decision point

Before touching anything, answer: **is the problem in the app, the environment, or
the database?**

| Symptom | Likely cause | Go to |
|---|---|---|
| Whole site 500s, all routes | bad build or wrong URL | §1 |
| Site fine, logins fail | wrong publishable key or wrong project | §1 |
| Site fine, logins fine, admin/analytics/contact fail | missing or wrong secret key | §2 |
| Some users missing | they were never in the new project (Scenario B) | §3 |

Do not roll back for a single non-critical route until §2 has been tried — a
one-variable fix beats a full retreat.

---

## §1. Restore the previous deployment and variables

```
1. vercel rollback dpl_FQeXp7e9gTfhttY8F8ymrKUrc4Cp --yes
   (or redeploy commit b88bc649)

2. Restore the OLD values:
     NEXT_PUBLIC_SUPABASE_URL              https://ikjlgsbrsknjyfegjrdi.supabase.co
     NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  the old sb_publishable_aeMhSvO… value
     ADMIN_USER_ID                         9067570a-9e9c-4c35-90c8-dda9de6e82f6  (unverified)
     SUPABASE_SECRET_KEY                   UNAVAILABLE — see §2
```

**A Vercel rollback restores neither variables nor data.** Both halves must be
done. And because the secret key cannot be restored, a plain rollback lands in the
degraded state described above unless §2 is resolved.

Steps 1 and 2 alone give you: working public site, working auth, working
dashboard — and broken admin, analytics, page visits and contact.

## §2. Restore privileged functionality

Two ways, in order of preference.

### 2a. Recover the real key (restores everything)

OLD project → Settings → API → `service_role`. Paste into the Production
`SUPABASE_SECRET_KEY`, redeploy. `/admin`, analytics, page visits and contact come
back with no data movement.

### 2b. If the key cannot be recovered (accept degraded mode)

Then the honest options are:

- **Point Production back at the NEW project** but keep the new secret key. The
  site works fully; the only casualty is that pre-cutover accounts do not exist.
  This is usually better than a half-broken old deployment.
- **Run degraded**: public site and auth work; admin, analytics, page visits and
  contact are offline. Acceptable for minutes, not days.

Do not "fix" this by granting `INSERT` to `anon`, or by putting the secret in a
`NEXT_PUBLIC_` variable. Both convert an outage into a security incident.

## §3. Accounts that do not exist after rollback

Scenario B means no accounts were migrated. After a rollback:

- accounts created on the NEW project (including the new admin
  `4a1980c2-…`) do not exist in the OLD project;
- those users cannot sign in until you switch back to the new project;
- nothing is deleted — the accounts remain in the new project.

Do not merge or synchronise users between projects. If someone must be helped
immediately, create their account manually on whichever project is live and tell
them to reset their password.

## §4. Data written during the cutover window

Reports, analytics events, page visits and contact messages created after the
switch live in the NEW project. A rollback does not move them and they will not
appear. Keep the new project intact so they can be exported later if needed.

## §5. Verify recovery

```
[ ] www.lifeseos.com returns 200
[ ] /ar /fr /zh render
[ ] signup works; confirmation email arrives
[ ] login, logout, session persists
[ ] a tool runs and a report saves, then survives reload
[ ] /admin: reachable if §2a done, otherwise documents the failure honestly
[ ] /api/contact: 200 and row persists if §2a done
[ ] logs: no 42501 / PGRST301 / Invalid API key beyond the known degraded routes
```

## §6. Stop conditions

Stop and report rather than improvise if:

- the secret key cannot be restored **and** traffic requires admin or analytics;
- the old project shows unexpected writes while Production points at the new one
  (indicates split traffic — find what is still pointed at it before proceeding);
- a rollback would require deleting or merging user accounts.

---

## Recommendation

The degraded state is survivable because it fails loudly. But the clean fix is
sixty seconds of dashboard work before cutover: retrieve the old `service_role`
key and store it outside this repository. Then this document becomes a full
rollback and the degraded column stops applying.
