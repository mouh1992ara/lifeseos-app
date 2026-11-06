# Authentication, verification and abuse protection

Scope: sign-up → email verification → dashboard, plus the abuse controls in
front of them. Written to be read while looking at the Supabase dashboard.

## 1. What the app enforces (no dashboard access needed)

These hold regardless of project settings, because they are in code:

| Check | Where |
|---|---|
| A session without `email_confirmed_at` cannot open `/dashboard`, `/dashboard/reports/*`, `/admin` | `lib/auth-guard.ts` → `requireVerifiedUser()` |
| Sign-up never navigates to the dashboard; it always lands on the verification screen | `components/sign-up-form.tsx` |
| Sign-up traffic goes through our route, not straight to Supabase | `app/api/auth/sign-up/route.ts` |
| Password login with an unconfirmed address is signed out and redirected to verify | `components/login-form.tsx` |
| `/auth/verified` (the success animation) bounces back unless the server sees a confirmed address | `app/[locale]/auth/verified/page.tsx` |
| Resend is capped per IP **and** has a 60 s UI cooldown | `app/api/auth/resend/route.ts` |
| Code attempts are capped per IP | `app/api/auth/verify-code/route.ts` |
| Confirm links are exchanged server-side (PKCE or token_hash); `next` is restricted to local paths | `app/auth/callback/route.ts`, `app/auth/confirm/route.ts` |

Verified against the live project on 2026-11-06: `GET /auth/v1/settings`
returns `mailer_autoconfirm = false`, `disable_signup = false`. Email
confirmation is therefore **on** server-side. The gap was that the app never
read the confirmed flag — it only checked that a user object existed.

## 2. Required Supabase settings

Dashboard → Authentication.

1. **Providers → Email → Confirm email: ON.** Without it Supabase issues a
   session at sign-up and every gate above just bounces the user back to
   `/auth/verify` forever.
2. **URL Configuration**
   - Site URL: `https://www.lifeseos.com`
   - Redirect allow list, one per line:
     ```
     https://www.lifeseos.com/auth/callback
     https://www.lifeseos.com/auth/confirm
     https://*-lifeseos.vercel.app/auth/callback
     http://localhost:3000/auth/callback
     ```
     The wildcard entry is what makes Preview deployments work; without it the
     confirmation link falls back to the Site URL and the preview session is
     never created.
3. **Email OTP length** is 6 by default. If you change it, set
   `NEXT_PUBLIC_EMAIL_OTP_LENGTH` to match — the UI reads it instead of
   hard-coding six.

## 2b. Why a confirmed link can land on the homepage (2026-11-06)

A real registration on a Preview confirmed the account but the email button opened
`https://www.lifeseos.com/` instead of the preview's `/auth/verified`.

Cause, in two independent parts:

1. **Redirect allow-list.** `emailRedirectTo` was
   `https://<preview-host>/auth/callback?next=/en/dashboard`. Supabase only honours
   `emailRedirectTo` when it matches a **Redirect URL** entry; otherwise it silently
   substitutes **Site URL** (`https://www.lifeseos.com`) and says nothing. Production
   then renders the homepage, which ignored `?code=`.
2. **PKCE is origin- and device-bound.** Even with the allow-list fixed, the
   `code` exchange needs the `code_verifier` cookie written in the browser that signed
   up. Confirming from a phone — a different browser — cannot present it, so the
   exchange fails. This is why the default template is fragile for email.

Fixes now in code:

- `proxy.ts` forwards any request arriving on a non-auth path with `?code=` or
  `?token_hash=` to `/auth/callback`, so a Site-URL fallback degrades into a real
  attempt instead of a dead homepage.
- `/auth/error` distinguishes `pkce_cross_device` from expired/invalid and tells the
  user to confirm on the original device or request a fresh link.
- The template below removes the dependency on PKCE entirely.

**External settings still required** (dashboard):

- Site URL: `https://www.lifeseos.com`
- Redirect URLs: the production callback **and** each preview host you test on, e.g.
  `https://lifeseos-*.vercel.app/auth/callback`
- Email template: replace "Confirm signup" with
  `docs/email-templates/confirm-signup.html`. It links to
  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard`,
  which uses `verifyOtp` and therefore works on any device.

No SMTP setting is claimed here: whether these emails arrive reliably depends on the
SMTP configuration, which was not inspected.

## 2c. The success handoff — and what "single-use" actually means

`/auth/verified` must animate only for a confirmation that just happened, not for a
bookmark that happens to be recent.

**A signed, time-limited ticket is not single-use.** HMAC proves origin, expiry proves
age, and neither proves the ticket has not already been spent. Two requests arriving
together both pass verification before either response clears the cookie, and a copied
cookie keeps working until it expires. Saying otherwise would be wrong.

So the flow has two layers:

| Layer | Mechanism | Guarantees |
|---|---|---|
| Authenticity | HMAC-SHA256 over `{u, n, t}`, bound to the user id, 120 s TTL | Not forgeable, not transferable to another account, not usable after expiry |
| One-time use | `Redis SET lifeseos:verify-used:<nonce> NX EX 120` | Exactly one caller wins; concurrent duplicates and replays are rejected |

`consumeHandoff()` (in `lib/verify-handoff.ts`) is the only function the success page
calls, and it performs both layers:

- `consumed` → render the animation (this request won the NX race)
- `replayed` → dashboard (valid ticket, already spent)
- `invalid` → dashboard (bad signature, expired, wrong user, missing)
- `unverifiable` → dashboard. Redis is not configured, so atomicity cannot be
  guaranteed. The page refuses rather than showing an animation it cannot justify.

Flow:

1. `/auth/callback` (PKCE `code`) **or** `/auth/confirm` (`token_hash`) verifies with
   Supabase, then mints a ticket **only if `email_confirmed_at` is set**.
2. Both routes call the same `attachHandoff()` helper, so they cannot drift.
3. Cookie: `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` when the request is https
   (checked via scheme *or* `x-forwarded-proto`), `Max-Age=120`.
4. `/auth/verified` requires session + confirmed + `consumed`.
5. `proxy.ts` also clears the cookie when the page is served — belt-and-braces on top
   of the atomic spend, not the mechanism that makes it one-time.

Signing key: `AUTH_VERIFY_SECRET` (≥16 chars) else `SUPABASE_SECRET_KEY`. Neither →
no ticket is minted and the page redirects to the dashboard.

Measured (simulated NX, 20 concurrent requests with the same ticket): 1 consumed,
19 rejected; a distinct ticket for the same user still accepted; replay of a spent
ticket rejected.

## 3. Verification: link by default, code when enabled

Supabase's stock "Confirm signup" template sends a **link**. That is the mode
the app ships in: `/auth/verify` shows the animated "check your inbox" screen,
polls `getUser()` every 6 s, and switches to the success animation the moment
the address is confirmed in another tab.

A numeric code needs a template change, and the app will not fake one:

1. Authentication → Email Templates → **Confirm signup**, add the token:
   ```html
   <p>Your LifeSeos code: <strong>{{ .Token }}</strong></p>
   <p>Or open: <a href="{{ .ConfirmationURL }}">Verify email</a></p>
   ```
2. Set `NEXT_PUBLIC_EMAIL_OTP_ENABLED=1` in Vercel (Preview + Production) and
   redeploy.

Only then does `components/code-input.tsx` render — it posts to
`/api/auth/verify-code`, which calls `supabase.auth.verifyOtp`. There is no
local token comparison anywhere. Leave the flag unset and the OTP UI never
mounts.

## 4. Turnstile

| Variable | Where it comes from |
|---|---|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare dashboard → Turnstile → your widget |
| `TURNSTILE_SECRET_KEY` | same widget → "Secret key" |

Create the widget with hostnames `www.lifeseos.com` and `*.vercel.app`.

Behaviour — **fail closed in production**:

| Situation | Development | Production |
|---|---|---|
| No secret configured | `skipped`, rate limit only | **`503 captcha_unconfigured`** — registration refused |
| Secret set, Cloudflare unreachable | `skipped` | **`503 captcha_unavailable`** — refused |
| Token missing/rejected | `400 captcha_failed` | `400 captcha_failed` |

A registration endpoint that silently drops its only bot control is worse than
one that is visibly down, so the production default is refusal. `TURNSTILE_REQUIRED=0`
opts a specific environment out; that is an explicit, auditable decision, never a
default. `TURNSTILE_REQUIRED=1` forces it on in development.

The form asks `GET /api/auth/sign-up` on mount and disables itself with a plain
explanation when the server reports `captcha: "unconfigured"` or `"widget-missing"`,
so nobody fills in a form that cannot succeed.

**Consequence to be aware of:** with a secret unset, production registration is
closed. If that is not the intended launch state, set both Turnstile keys (or set
`TURNSTILE_REQUIRED=0` deliberately) before shipping.

## 5. Email delivery (the part that cannot be fixed in code)

Supabase's built-in SMTP is rate-limited to a handful of messages per hour and
is not suitable for production. Confirm in the dashboard:

1. **Project Settings → Auth → SMTP Settings** — a custom SMTP host is set.
2. Sender domain authenticated at the provider: SPF, DKIM, DMARC all passing.
   Quick check after sending one real message:
   ```bash
   dig +short TXT lifeseos.com | grep -i spf
   dig +short TXT resend._domainkey.lifeseos.com
   dig +short TXT _dmarc.lifeseos.com
   ```
3. **Authentication → Rate Limits** — email sends per hour raised above the
   default if you expect a launch spike.

I could not verify any of this from the repository: SMTP settings are not
reachable with the publishable key, and claiming otherwise would be a guess.
**No end-to-end delivery test has been run** — doing so needs an inbox you
control plus the flag above.

## 6. Existing accounts

- Accounts that already have `email_confirmed_at` keep working untouched.
- Accounts created while auto-confirm was on also have that field set — they are
  not affected either.
- Accounts with a null confirmed flag will now be sent to `/auth/verify` instead
  of the dashboard. They are not deleted, their password is untouched, and one
  click on "Resend email" restores access. This is the intended behaviour, but
  it is a visible change for that subset — worth an announcement if the user
  base is already active.
- No migration is required and none should be run: changing confirmation status
  in bulk is destructive and unnecessary here.

## 7. What still needs a decision

| Item | Blocked on |
|---|---|
| Turnstile keys | Cloudflare account access — **production refuses sign-up until these exist** |
| Custom SMTP + SPF/DKIM/DMARC | Domain/DNS access and an email provider |
| `mailer_autoconfirm` re-check | Confirming item 2.1 in the dashboard |
| Verification email templates in fr/ar/zh | Supabase supports one template per language only via separate projects; templates will stay English unless that changes |
