# Service-role verification — new project `izmwdlyuthxgkijxiwmt`

Run after applying `20261107_privilege_fix_2_service_role.sql`. Every check reads
the row back after writing, so a `200` alone never counts as proof.

## Current status — verified live

| Check | Result |
|---|---|
| `service_role` SELECT on all 5 tables | **200** |
| `tool_events` insert + read-back content | **persisted, content correct** |
| `page_visits` insert + read-back | **persisted (country_code ZZ)** |
| `contact_messages` insert + read-back | **persisted (subject matched)** |
| `analytics_events` insert, all fields | **event_name / outcome / duration_ms / locale correct** |
| duplicate `event_id` | **409 rejected by unique index** |
| `Prefer: resolution=ignore-duplicates` | **exactly 1 row remains** |
| bogus `event_name` | **400 rejected by CHECK constraint** |
| UPDATE persists | **200, value changed** |
| DELETE | **204** |
| RLS enabled on every table | **yes** |
| anonymous / authenticated on service-only tables | **42501 denied** |
| residual rows after cleanup | **0 in all five tables, 0 users** |

## End-to-end, through the real application

A branch-scoped Preview deployment (`phase5/tool-outcomes`) was pointed at the
new project and a real beacon was posted to `/api/tool-events`:

```
POST /api/tool-events  → 200 {"ok":true}
analytics_events       → [{"event_name":"tool_use","tool_key":"page-speed",
                           "created_at":"2026-11-07T09:49:39Z"}]
```

That is the whole path working: browser client → Next.js route → service role →
Postgres. The probe row was deleted afterwards.

## Reproduce

```bash
# service key from the new project (Settings → API → service_role)
U=https://izmwdlyuthxgkijxiwmt.supabase.co
S=<service_role key>

# write and read back
curl -s -X POST "$U/rest/v1/analytics_events" \
  -H "apikey: $S" -H "Authorization: Bearer $S" \
  -H "content-type: application/json" -H "Prefer: return=representation" \
  -d '{"event_id":"'$(uuidgen | tr A-Z a-z)'","event_name":"tool_success","tool_key":"page-speed"}'
```

## Keys that work, and one that does not

| Key | REST | Auth admin |
|---|---|---|
| `service_role` **JWT** (legacy, `eyJ…`) | **works** | **works** |
| `sb_secret_…` (new-style secret) | 401 Invalid API key | 401 |
| `sb_publishable_…` | works, RLS-scoped | no |

So `SUPABASE_SECRET_KEY` must be the **JWT**, not the `sb_secret_…` string, or
every server route fails with 401 and — because they swallow errors — the app
looks fine and stores nothing.

## Two environment problems found

1. **`.env.local` has the wrong value in `SUPABASE_SECRET_KEY`.** It contains a
   25-character `UPSTASH_…` placeholder, not a Supabase key. Local runs have
   never been able to write.
2. **`SUPABASE_SECRET_KEY`, `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are set on Vercel for
   `Production, Preview` together.** Any Preview deployment currently inherits
   Production's Supabase project. The isolated preview avoids this with
   branch-scoped variables, but the shared entries remain a standing hazard for
   every other Preview.