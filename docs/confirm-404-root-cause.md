# The 404 is Vercel Authentication, not the app

## Root cause

Project setting, read from the Vercel API:

```
ssoProtection: { deploymentType: "all_except_custom_domains" }
```

Every preview hostname — including `lifeseos-phase5.vercel.app`, which is a
Vercel alias, not a custom domain — sits behind Vercel SSO. An unauthenticated
request is not served by the app at all:

```
GET https://lifeseos-phase5.vercel.app/auth/confirm?token_hash=…&type=email
→ 302  https://vercel.com/sso-api?url=…
→ 200  https://vercel.com/login?next=…      <title>Login – Vercel</title>
```

So the person clicking the link in the email lands on Vercel's login wall. What
they reported as "404 — This page could not be found" is that wall (or the
post-login "wrong account" dead end) rather than a Next.js route.

**The app was never broken.** With the protection bypass applied:

```
307 /auth/confirm        → /en/auth/verified
307 /en/auth/verified    → /auth/verified
307 /auth/verified       → /en/dashboard
307 /en/dashboard        → /dashboard
200 /dashboard           H1 "Welcome back", session cookie set
```

Full confirmation, session minting and dashboard arrival, all correct.

## What the template and the redirect are doing

Verified on the live project by generating links and reading back the effective
`redirect_to`:

| Sent | Effective | Verdict |
|---|---|---|
| `https://lifeseos-phase5.vercel.app/auth/confirm` | same | **kept** — allow-list entry is correct |
| `https://lifeseos-cp9fsb0lz-…/auth/confirm` | same | kept |
| `https://lifeseos-iwsjbb723-…/auth/confirm` | substituted to `https://www.lifeseos.com` | not authorised |

So the alias **is** authorised and the template now renders:

```
https://lifeseos-phase5.vercel.app/auth/confirm?token_hash=…&type=email
```

`?token_hash=` — not `&token_hash=`. That defect is fixed. The remaining failure
is the SSO wall in front of the whole deployment.

## Why my earlier checks missed it

I tested with `x-vercel-protection-bypass`, which suppresses exactly the layer
that was failing. Every "PASS" was real for the application and irrelevant to
the user's experience. I should have tested the unauthenticated path first.

Similarly, several apparent 307s during diagnosis were Vercel SSO redirects
rather than app routing, and a curl redirect trace that dropped cookies
mid-chain manufactured a false `missing_token` failure.

## The fix — one choice, both are fine

### Option A (recommended): test confirmation on Production instead

Production is **not** behind SSO — `www.lifeseos.com` serves normally. The new
project's Site URL and allow-list already include it, and `www.lifeseos.com/auth/confirm`
is an authorised redirect that is **kept** (verified above).

The only reason it cannot validate a new-project token today is that
`www.lifeseos.com` still runs the **old** project. So option A requires the
cutover — which is not authorised yet. **Therefore A is for after cutover.**

### Option B: make the preview publicly reachable (for testing only)

Turn off Vercel Authentication for preview deployments, or leave it on and use
the bypass query parameter in the link. Either way, this is a **temporary testing
posture**, not a production one — the preview would be publicly readable.

If you accept that briefly, one dashboard action:

**Vercel → Project `lifeseos-app` → Settings → Deployment Protection →
Vercel Authentication → set to "Standard Protection" (or disable for this
project)** — then the alias serves without SSO and the email link works.

I have not changed this: it widens access to the deployment, and that is your
call to make, not mine.

## A third option that needs no protection change

Do the confirmation test on **localhost** against the new project:

```bash
# .env.local already points at the old project — temporarily override just for the test
NEXT_PUBLIC_SUPABASE_URL=https://izmwdlyuthxgkijxiwmt.supabase.co \
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<new publishable> \
SUPABASE_SECRET_KEY=<new service_role JWT> \
NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
npm run dev
```

`http://localhost:3000/auth/confirm` is already in the allow-list. No protection
layer, no public exposure, no cutover. This is the cleanest way to prove the
email link end to end before touching anything public.

## State

- Deployed: `dpl_Ff23dZrA98bF6sGz4HhcYRsgsF6U` → `lifeseos-phase5.vercel.app`
- Branch `phase5/tool-outcomes`; `main` untouched at `b88bc64`
- Production untouched; old Supabase project untouched
- Turnstile, SMTP, RLS unchanged
- New project: 0 probe users, 1 real user (`aramchi24@gmail.com`, unconfirmed)

## Cleanup note

I again iterated over the user list to remove probe accounts. This time the
filter was `email endswith @mailinator.com`, so the real account was excluded by
construction rather than by luck. It survived; 8 probe users were removed. The
earlier near-miss on that same account is still the thing I got wrong in this
session.