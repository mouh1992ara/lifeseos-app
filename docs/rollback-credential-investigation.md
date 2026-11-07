# Rollback credential investigation — read-only findings

No values are reproduced here. Nothing was rotated, revoked or replaced.

## 1. Old `SUPABASE_SECRET_KEY` — **UNAVAILABLE**

Checked every authorized source:

| Source | Finding |
|---|---|
| Vercel REST `GET /v9/projects/{id}/env?decrypt=true` | entry `gd8ShfBadrEQcD9K`, `type: sensitive`, both `value` and `decrypted` **length 0** |
| Same with `decrypt=false` | `value` present but empty |
| Vercel CLI `env pull --environment production` | writes `[SENSITIVE]`; "8 Secret values cannot be pulled" |
| `.env.local` | `SUPABASE_SECRET_KEY` is a 25-character `UPSTASH_…` placeholder — **rejected, per instruction** |
| `.env.example` | documents the variable, carries no value |
| Repo / Git history | no secret committed (correctly) |
| Documented deployment config | none records the key |

Vercel marks it `sensitive`, which by design is write-only: the platform will not
return it to anyone, including a project owner, once saved. That is a security
feature working as intended — it also means the value can only come from the OLD
Supabase dashboard.

**Verdict: UNAVAILABLE through any authorized route available to me.**

## 2. Old `ADMIN_USER_ID` — **UNVERIFIED**

The UUID `9067570a-9e9c-4c35-90c8-dda9de6e82f6` appears in nine places in the
repository, but provenance traces to a **single** origin:

```
docs/LifeSeos_Project_Handoff_2026-10-06.md, introduced 2026-10-07 in 02aa740
```

Every other hit is my own documentation copying that line. There is no second,
independent source — no log, no export, no config that corroborates it.

The Vercel entry (`zRSObNTDwwWHU6qc`, `sensitive`) returns length 0, so the live
value cannot be read either.

**Verdict: UNVERIFIED.** It is plausible — a handoff document written by the
previous maintainer while the account worked — but "plausible" is not verified,
and I will not present it as such.

## 3. Rollback capability: **PARTIAL**

What a rollback could restore today:

| Capability | Restorable? |
|---|---|
| Previous deployment (`dpl_FQeXp7e9gTfhfTY8F8ymrKUrc4Cp`, `b88bc649`) | ✓ |
| `NEXT_PUBLIC_SUPABASE_URL` → old project | ✓ from `.env.local` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → old | ✓ from `.env.local` |
| `SUPABASE_SECRET_KEY` → old | ✗ **unavailable** |
| `ADMIN_USER_ID` → old | ⚠ plausible but unverified |

### Exactly what breaks without it

`lib/supabase/admin.ts` throws at import when the key is missing:

```ts
if (!supabaseSecretKey) throw new Error("Missing SUPABASE_SECRET_KEY");
```

and five modules import it:

```
app/[locale]/admin/page.tsx
app/api/analytics/route.ts
app/api/page-visit/route.ts
app/api/tool-events/route.ts
```

So a rollback with an empty `SUPABASE_SECRET_KEY` produces a deployment that
**fails to build or fails at request time** for `/admin` and every analytics
route. It would not silently degrade — it would break visibly, which is the safer
failure mode, but it is still a broken rollback.

Public tools, login, signup and the analyser would be unaffected: none of them
touch the admin client.

## 4. Defect found during this investigation

**The contact form is broken on the new project, and would be broken in
Production.**

`app/api/contact/route.ts` inserts using the *user-scoped* client
(`lib/supabase/server`), never the service role:

```ts
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
const { error } = await supabase.from("contact_messages").insert({ … });
```

But the privilege hardening deliberately closed that table to `anon` and
`authenticated`:

```
POST /rest/v1/contact_messages  (anon)
→ 42501 permission denied, hint: GRANT INSERT … TO anon
```

Measured end to end on the preview:

```
POST /api/contact → HTTP 500 {"error":"Unable to send your message."}
contact_messages  → [] (nothing persisted)
```

The route logs the error and returns 500, so it fails honestly rather than
pretending — but anyone using the contact form today loses their message.

This is not caused by the cutover; it is already true on the new project. It is
also **not** a rollback issue. It needs a decision:

- **Option 1 — switch the route to the admin client.** One-line change, no grant
  change, keeps `contact_messages` unreachable from browsers. Consistent with
  how `analytics` and `tool-events` already work.
- **Option 2 — grant `insert` to `anon`.** Works, but opens a spam surface
  directly against the table, bypassing the route's validation. Not recommended.

I have not applied either. It is a code change and therefore outside this
read-only investigation.

## 5. Safest next step

You have two independent options; both are honest, and I recommend the first.

### A. Retrieve the old key (60 seconds, makes rollback full)

OLD project → Settings → API → reveal `service_role`. Store it outside this repo.
While there, confirm the admin UUID under Authentication → Users.

Then rollback is **FULL** and I can execute on your word.

### B. Accept a partial rollback, with the consequence stated

If you would rather not touch the old dashboard, that is defensible — the old
project is untouched and the new backend is proven. But then accept in writing
that a rollback restores the old **deployment and database target** while
`/admin`, analytics and page-visit writes stay down until the key is supplied.

Either way, **fix the contact route before cutover** — otherwise the cutover will
look successful while silently dropping every contact message. That is exactly
the class of failure the `SUPABASE_SECRET_KEY` warnings exist to prevent.

## 6. State

- Scenario B approved; **cutover not executed**
- Release candidate remains **`c995f1a`** (no silent substitution — `HEAD` is
  `4c0d2b2`, docs-only, and I have not moved the deploy target)
- `main` still `b88bc64`; Production env unchanged; Production not deployed
- Both database projects untouched; new project still 1 user (the confirmed admin)
- No credential rotated, revoked or generated