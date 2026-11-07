# Auth configuration — new project `izmwdlyuthxgkijxiwmt`

Manual dashboard steps. Nothing here is automated, and nothing here touches
Production.

## Why these values

`app/api/auth/sign-up/route.ts` builds the confirmation target from **its own
request origin**:

```ts
const origin = new URL(request.url).origin;
emailRedirectTo: `${origin}/auth/callback?next=/${locale}/dashboard`
```

So each origin the app runs on must be allowed, or Supabase silently falls back
to Site URL — the link lands on `/`, the page renders the homepage, and the
confirmation appears to vanish. `proxy.ts` has a rescue path for that symptom,
but the cause is the allow-list.

## Authentication → URL Configuration

**Site URL**

```
https://www.lifeseos.com
```

Set it to the canonical domain, not a preview. A preview URL here would make
every unrouted confirmation land on a deployment that may expire.

**Redirect URLs** — add all three, one per line:

```
https://www.lifeseos.com/**
https://lifeseos-*.vercel.app/**
http://localhost:3000/**
```

The wildcard covers every preview deployment hash. Without it, sign-up on a
preview will confirm to `www.lifeseos.com` instead of back to the preview — the
account still works, but the tester lands on the wrong origin.

## Authentication → Providers → Email

| Setting | Value | Why |
|---|---|---|
| Enable Email provider | on | the only provider the app uses |
| Confirm email | **on for Production**, off for Preview testing | with it on, every test sign-up needs a real inbox |
| Secure email change | on | unchanged default |
| Minimum password length | 8 | matches the client-side check |

For preview testing without an inbox, turn **Confirm email** off on a dedicated
test project. Do not disable it on the project that will serve Production.

## Authentication → Email Templates → Confirm signup

The app has two handlers and they expect different parameters:

| Route | Expects | Use when |
|---|---|---|
| `/auth/callback` | `?code=…&next=…` | PKCE flow, the default for `@supabase/ssr` |
| `/auth/confirm` | `?token_hash=…&type=email&next=…` | token-hash flow used by the email template |

Because `signUp` is called server-side with `emailRedirectTo` pointing at
`/auth/callback`, the template's default `{{ .ConfirmationURL }}` is the correct
value — it carries `token_hash` and `type` to `/auth/confirm` only if you have
customised it to. Leave the template on the Supabase default unless you are
deliberately switching flows; a hand-edited template pointing at the wrong path
is a 404 that looks like a broken account.

If you do customise it, the target is:

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard
```

## Cross-device confirmation

A confirmation link opened on a different device than the one that signed up
must still work. That requires:

1. **The link must be a URL, not a code** — it is, via `emailRedirectTo`.
2. **The PKCE verifier must not be required.** PKCE stores a code verifier in
   the browser that started the flow; opening the link elsewhere has no verifier
   and fails with `code verifier not found`.
3. Therefore the email template must use the **token-hash** flow
   (`/auth/confirm`), which verifies server-side with no browser state.

`app/auth/confirm/route.ts` already implements exactly this
(`verifyOtp({ token_hash, type })`), so cross-device confirmation works as long
as the template points there. This is the one setting where the default and the
desired behaviour differ — worth checking explicitly.

## What is not configured here

- **Turnstile** — `app/api/auth/sign-up` verifies a captcha before calling
  Supabase. Its site/secret keys are Vercel env vars, not Supabase settings. If
  they are absent on a preview, sign-up returns 400 before reaching the database.
- **Rate limits** — `lib/ratelimit.ts` uses Upstash. Absent on a preview, the
  limiter no-ops rather than blocking.
- **`ADMIN_USER_ID`** — `/admin` compares the signed-in user to this value. On a
  new project the first user's id must be set here, or `/admin` stays closed.

## Preview readiness checklist

- [ ] privilege fix applied (`supabase/pending/20261107_privilege_fix.sql`)
- [ ] Site URL + three Redirect URLs saved
- [ ] Confirm-email decision made for the preview
- [ ] email template points at the token-hash route for cross-device
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://izmwdlyuthxgkijxiwmt.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = publishable key of the new project
- [ ] `SUPABASE_SECRET_KEY` = secret key of the new project (Preview scope only)
- [ ] `NEXT_PUBLIC_SITE_URL` = the preview origin
- [ ] `ADMIN_USER_ID` set after the first sign-up
- [ ] Vercel **Production** variables untouched