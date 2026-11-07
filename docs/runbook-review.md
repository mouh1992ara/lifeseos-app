# Runbook review — no execution performed

Reviewed against live state. **Nothing was changed, merged, deployed or
reconfigured.** Production remains `b88bc64` on the OLD project.

---

## BLOCKING DEFECT: the rollback deployment ID in the runbook is wrong

| | |
|---|---|
| Runbook says | `dpl_FQeXp7e9gTfhfT` `Y8F8ymrKUrc4Cp` |
| Actually serving | `dpl_FQeXp7e9gTfhtt` `Y8F8ymrKUrc4Cp` |

A transposition at positions 16–19: the real ID has `tt`, the runbook has `fT`.
Both are 32 characters, so it looks plausible and nothing catches it.

`vercel rollback dpl_FQeXp7e9gTfhfTY8F8ymrKUrc4Cp` would fail with
"deployment not found" — at the exact moment you least want a failure.

**Origin: my error.** I typed the ID by hand in an earlier report and it has been
copied forward ever since. It is now corrected in all three affected documents,
and the correct value is:

```
dpl_FQeXp7e9gTfhttY8F8ymrKUrc4Cp
```

Verified by reading it from the deployments API rather than from any document:

```
uid: dpl_FQeXp7e9gTfhttY8F8ymrKUrc4Cp
url: lifeseos-ri5jj167i-lifeseos.vercel.app
commit: b88bc649 | target: production | state: READY
```

Recommendation: reference the **UID**, not the URL. The URL resolves to the same
deployment but sits behind SSO, so it cannot be sanity-checked in a browser.

---

## Pre-execution gate: results

| # | Gate | Result |
|---|---|---|
| 1 | Exact release commit, clean tree | ✓ `2287513`; tree clean; `main` = `b88bc64` both local and origin |
| 2 | Build, tsc, lint, regression | ✓ all passed on this code (this session, not re-run) |
| 3 | New project ID and DB state | ✓ `izmwdlyuthxgkijxiwmt`; 6 objects, RLS on all, 4 policies; rows: reports 0, tool_events 0, page_visits 26, contact 0, analytics 24 |
| 4 | Confirmed administrator | ✓ `aramchi24@gmail.com`, `4a1980c2-…`, confirmed, sole user |
| 5 | Contact fix included | ✓ `supabaseAdmin` present in `2287513`; **absent** in `c995f1a` → supersession is correct |
| 6 | Production redirect config | ✓ `https://www.lifeseos.com/auth/confirm` **honoured**, not substituted |
| 7 | Current Production deployment | ✓ `dpl_FQeXp7e9gTfhttY8F8ymrKUrc4Cp` / `b88bc649` / production / READY |
| 8 | Old config preserved | ⚠ **partial** — URL + publishable from `.env.local`; secret unavailable; admin UUID unverified |
| 9 | Rollback plan available | ✓ `docs/emergency-recovery-partial.md` |
| 10 | Production/Preview isolation | ⚠ prepared, not applied — three entries still `production,preview` |
| 11 | Deploy/rollback permission | ✓ preview deploys and deployment reads work; rollback not exercised (would be a change) |
| 12 | Material changes since last report | ✓ one docs commit `bb2db7a`; **code byte-identical** to `2287513` |

### Code identity, stated precisely

```
git diff 2287513..HEAD -- app lib components proxy.ts i18n messages package.json  → empty
```

`bb2db7a` adds one Markdown file. So `bb2db7a` may be deployed instead of
`2287513` — the runbook permits this and the check confirms it.

---

## Two technical corrections to the runbook

### 1. `NEXT_PUBLIC_*` are baked at build time, not read at runtime

This makes the ordering in §5 correct but for a sharper reason than stated:
steps 3 → 6 (variables before build) is not merely tidy. If the build ran first,
the client bundle would embed the **old** project URL and publishable key and the
cutover would appear to work while the browser talked to the old database.

It also changes what rollback means:

- rolling back to `dpl_FQeXp7e9gTfhttY8F8ymrKUrc4Cp` restores the **old baked**
  `NEXT_PUBLIC_*` values — correct, because that bundle was built with them;
- `SUPABASE_SECRET_KEY` and `ADMIN_USER_ID` are read at **runtime**, so they must
  be restored separately, or the rolled-back deployment will run with new-project
  credentials.

So: rollback = old deployment **plus** runtime variables. Neither half alone is
sufficient, and changing a variable never retroactively fixes an existing bundle.

### 2. §6 should prefer roll-forward, and mostly does

The runbook already says to assess roll-forward first. Worth making explicit,
because Scenario B means a rollback is *destructive to accounts*: users who
registered after cutover would lose access until you switch projects again. For
anything short of a security or auth failure, fixing forward on the new backend is
genuinely the lower-risk move — the new backend is the one with verified
service-role access, working analytics and a functioning contact form.

---

## What the runbook gets right

- Scenario B and partial rollback recorded as explicit acceptances, not implied.
- Requires re-verifying the candidate rather than trusting the title.
- Separates "apply variables" from "deploy" and puts them in the safe order.
- Refuses to accept a Vercel rollback as evidence of database or environment
  rollback.
- "Do not disable security controls to make a failing check pass" — the right
  standing instruction.
- Keeps both projects alive; no account deletion, no synchronisation.

---

## Remaining gaps before execution

| Gap | Owner | Effect if unaddressed |
|---|---|---|
| Old `service_role` key unknown | you | rollback loses admin, analytics, page visits, tool events and contact |
| Old admin UUID unverified (single doc provenance) | you | if a rollback happens, `/admin` may stay closed even with a key |
| Three env entries still `production,preview` | me at cutover | unscoped previews would read Production's database — scripted in §3 of the plan, applied only when authorised |

None of these blocks the cutover itself. All three block a *clean* rollback.

---

## Assessment

**The runbook is sound and deployable, with one defect in its rollback reference
that must be corrected before use** — now corrected in the repo, but the copy you
hold still carries the typo.

**GO on plan quality. NO-GO on execution** — awaiting the separate authorization.

When it comes, I will re-run gate items 1–12 against live state, use the corrected
UID, and stop if anything differs from this review.