# Phase 4 release — branch, commits, deployment checklist

Branch: `release/phase4` (7 commits on top of `add3c73`). Not pushed, not merged.

## Commits

| # | SHA | Subject |
|---|---|---|
| 1 | `7542c41` | perf(seo): defer AdSense, preload Arabic font, tighten canonicals and robots |
| 2 | `d6dacfc` | fix(dashboard): stop showing fabricated KPIs next to real ones |
| 3 | `fb3c1fd` | feat(auth): enforce email confirmation server-side; close an open redirect |
| 4 | `049f7cb` | feat(verify): confirmation flow that survives a phone, and a real one-time handoff |
| 5 | `368c004` | feat(captcha): verify Turnstile server-side and fail closed in production |
| 6 | `409d2bf` | feat(verify): premium success animation with reduced-motion support |
| 7 | `33b7f50` | docs(i18n): four-locale auth strings, runbooks and the branded email template |

Totals: 50 files changed, 3735 insertions(+), 563 deletions(-).

## Before production

### Must do (blocks a correct launch)

- [ ] **Supabase → Authentication → Email Templates → Confirm signup**: paste
      `docs/email-templates/confirm-signup.html`. This is the item that fixes
      confirmation on a phone, because it uses `token_hash` and needs no PKCE cookie.
- [ ] **Supabase → URL Configuration**: Site URL `https://www.lifeseos.com`;
      Redirect URLs add `https://www.lifeseos.com/auth/callback`,
      `https://www.lifeseos.com/auth/confirm`, and `https://lifeseos-*.vercel.app/auth/callback`.
- [ ] **Cloudflare Turnstile**: hostnames `www.lifeseos.com` and `lifeseos-*.vercel.app`.
- [ ] **Vercel Production env**: confirm `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and
      `TURNSTILE_SECRET_KEY` exist for Production, not only Preview. Without the
      secret, production sign-up returns 503 by design.

### Should do

- [ ] Custom SMTP + SPF/DKIM/DMARC (see `docs/external-blockers.md`).
- [ ] Raise Supabase email rate limit above the default before any launch spike.
- [ ] Optional: set `AUTH_VERIFY_SECRET`; otherwise the ticket is signed with
      `SUPABASE_SECRET_KEY`, which works but couples two concerns.

### Verify after deploy

- [ ] Register with a real address → confirmation email arrives.
- [ ] Open the link **on a phone** → success animation, then dashboard.
- [ ] Open the same link again → dashboard, no animation (replay rejected).
- [ ] Sign in as an unconfirmed account → redirected to `/auth/verify`, no dashboard.
- [ ] `/dashboard` while signed out → login.
- [ ] Arabic `/ar` → RTL layout intact.
- [ ] One tool from each category → works.

## Rollback

`git checkout main && git reset --hard add3c73` is unnecessary — production still runs
`add3c73`. If the release misbehaves, redeploy the previous production deployment from
the Vercel dashboard; no data migration is involved and no users are altered.
