# Analytics foundation

What it measures, what it refuses to measure, and how to read it.

## 1. Architecture

```
browser                      server (Vercel)                 Supabase
─────────                    ───────────────                 ────────
PageVisitTracker ──POST──▶ /api/analytics        ──┐
  (page_view)                · locale from path     │
                             · device from UA       ├─▶ analytics_events
Tool clients ─────POST──▶ /api/tool-events         │      (service role only)
  (legacy tool_name)         · validates vocabulary│
                             · dedupes on event_id  │
                                                       └─▶ analytics_daily (view)
                                                            │
                                                     /admin (ADMIN_USER_ID)
```

Three properties do the real work:

**Closed vocabulary.** `event_name`, `locale`, `device`, `outcome` and `error_code`
are Postgres `CHECK` constraints *and* runtime allow-lists. A client sending
`device: "toaster"` has it discarded, not stored.

**Server-derived dimensions.** Locale comes from the request path, device from the
User-Agent, duration from a server timer. The browser is not asked for any of them,
because the browser is the untrusted part.

**Database-level idempotency.** A unique index on `event_id` plus
`upsert(..., ignoreDuplicates: true)`. A retry, a double click, or React's
development double-invoke collides and changes nothing. Deduplication is not a
client promise.

## 2. Event catalogue

| Event | When | Key fields |
|---|---|---|
| `page_view` | Any route render | locale, device, path, session_key |
| `tool_start` | Request accepted | tool_key, locale, device |
| `tool_success` | Result produced | tool_key, duration_ms |
| `tool_error` | Rejected or upstream failed | tool_key, error_code, duration_ms |
| `signup_view` | Signup page shown | locale, device |
| `signup_submit` | Form posted | locale |
| `signup_success` | Account created | locale |
| `verify_success` | Email confirmed | locale |
| `signin_success` | Login completed | locale |
| `report_saved` | Analysis persisted | tool_key |

`error_code` is a category, never a message. Raw upstream text can contain the
hostname a user submitted, which would quietly turn this table into a log of
private URLs.

## 3. What is deliberately not collected

| Not stored | Why |
|---|---|
| IP addresses | Vercel sees them; we have no question that needs them |
| Submitted URLs / tool inputs | They are the user's work, not our metric |
| Emails, names, passwords, tokens | Out of scope for analytics entirely |
| Full referrer URLs | A normalised path only; referrers can carry query strings |
| Device fingerprints | `device` is a 3-value UA bucket, combinable with nothing |

`session_key` is a random UUID in a first-party, httpOnly, SameSite=Lax cookie,
30-day lifetime, rotated on sign-out. It answers "same browser came back?" and
nothing else. It is not derived from any device property, so it cannot be
reverse-engineered into a fingerprint.

**Returning-user caveat:** anonymous returners are identified by that cookie. A
user who clears cookies, uses a private window, or switches devices looks new. This
is a floor on returning usage, not a precise count — it must never be reported as
"unique users".

## 4. RLS and privacy review

`analytics_events` has RLS **enabled with zero policies**.

That is the strongest default Postgres offers: every role except `service_role` is
denied by default, in both directions. Consequences:

- The publishable (anon) key cannot read the table even if fully compromised.
- A signed-in user cannot read *their own* rows — and cannot read anyone else's.
- Only the server, holding `SUPABASE_SECRET_KEY`, can read or write.

`analytics_daily` is a plain view, not `security definer`, so it runs with the
caller's privileges and inherits the same denial.

**Admin visibility** stays where it already was: `/admin` compares the session user
to `ADMIN_USER_ID` and reads through the server-only client. No new access path is
introduced.

**Verified from outside:** anon requests to `tool_events`, `page_visits` and
`seo_reports` return `content-range: */0` — RLS denies them. The same posture
applies to the new table by construction.

## 5. Deployment order

The application and the migration are independent, in both directions.

| State | Behaviour |
|---|---|
| Code deployed, migration **not** applied | Inserts hit `42P01` (undefined table), are caught, and the request returns 204. Nothing breaks, nothing is stored. Legacy `tool_events` writes continue. |
| Migration applied, old code still running | New columns are nullable with no default, so existing inserts are byte-compatible. New columns read NULL. |
| Both applied | Full event stream. |

This is why the code can ship before the schema — and why rolling the migration
back under the new code is safe.

## 6. Dashboard specification

One screen inside `/admin`, four bands, each answering one question. No
cherry-picked highlights; the point is to see what is actually happening.

**Band 1 — Volume (last 7 / 28 / 90 days)**
- Page views per day, split by device (mobile / tablet / desktop)
- Sessions per day (distinct `session_key`)
- Language mix: en / ar / fr / zh share of page views

**Band 2 — Tool health**
- Table: tool_key × (starts, successes, errors, success rate, p95 duration)
- Sort by error rate descending by default — the useful answer is "what is
  broken", not "what is popular"
- Error breakdown by `error_code`, so `RATE_LIMITED` is legible as friction
  rather than failure

**Band 3 — Funnel**
- Views of each step: signup_view → signup_submit → signup_success → verify_success
- Drop-off percentage per step, and the count, so a small base is obvious
- Deliberately **not** a single "conversion rate": with a small denominator that
  number invites over-reading

**Band 4 — Return behaviour**
- Distribution of sessions per `session_key` (1, 2–5, 6–20, 20+)
- Labelled "browser" not "user", for the cookie caveat above

**Rules the dashboard must follow**
1. Empty state, never a zero. No data is visibly different from no activity.
2. Show the date range in the header at all times.
3. Anything under 20 events renders with an explicit "low sample" note.
4. No fabricated comparison arrows against a previous period that has no data.

## 7. Reading the numbers honestly

- **Success rate per tool** is the ratio of `tool_success` to
  (`tool_success` + `tool_error`). A tool nobody uses shows nothing, not 100%.
- **p95 duration** is per tool, not global. A global p95 is dominated by whichever
  tool was busiest.
- **Funnel steps** count distinct sessions per minute-derived event, so a reload
  does not create a step.
- Historical rows written before this release have NULL locale and device. They
  must display as "unknown" — never backfilled with guesses.
