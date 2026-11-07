# Safari dashboard steps — new project `izmwdlyuthxgkijxiwmt`

Everything on this page is a dashboard action. Confirm the project reference in
the browser URL (`.../project/izmwdlyuthxgkijxiwmt`) before every change.
**If the URL shows `ikjlgsbrsknjyfegjrdi`, stop — that is Production.**

---

## 1. Site URL and Redirect URLs

**Authentication → URL Configuration**

### Site URL

```
https://www.lifeseos.com
```

Not `lifeseos.com` — that domain 301-redirects to `www`, and a redirect hop
during callback loses the `?code=` fragment. Not a preview URL either: an
expired preview deployment would send every unrouted confirmation to a dead page.

### Redirect URLs

Add these four, exactly, one per line:

```
https://www.lifeseos.com/auth/callback
https://www.lifeseos.com/auth/confirm
https://lifeseos-jdnmos61j-lifeseos.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

**Why not `https://lifeseos-*.vercel.app/**`?** You asked for no unverified
wildcards, and this project cannot honour one usefully anyway: preview
deployments get a **new hashed subdomain every deploy**, and none carries a
stable branch alias (checked — no deployment has an alias). A wildcard would
therefore authorise every future preview of every branch — including any that
later points at a different Supabase project — for the lifetime of the project.

Instead, the preview got a **stable alias** so it has one durable origin:

```bash
# one-time, ~5 seconds, done by me after you confirm
vercel alias set lifeseos-jdnmos61j-lifeseos.vercel.app lifeseos-phase5.vercel.app
```

Then add this fourth entry and drop the hashed one:

```
https://lifeseos-phase5.vercel.app/auth/callback
```

`NEXT_PUBLIC_SITE_URL` on the preview branch is already set to
`https://lifeseos-phase5.vercel.app` in anticipation. Until the alias exists,
use the hashed preview URL above — confirmations will work, they just move when
a new preview deploys.

### Cross-device confirmation

No setting enables this directly — it follows from the template in step 2.
Two things make it work:

1. The link is a URL the inbox can open on any device.
2. The verification is server-side (`/auth/confirm` + `verifyOtp`), so the
   opening device needs no local state.

The default PKCE flow does **not** work cross-device: its code verifier lives
in the browser that started sign-up, and opening the link elsewhere fails with
`code verifier not found`. That is why step 2 must point at the token-hash route.

---

## 2. Confirm signup email template

**Authentication → Email Templates → Confirm signup**

### Subject

```
Confirm your LifeSeos account
```

### Body (HTML)

```html
<h2>Confirm your email</h2>
<p>Follow this link to confirm your LifeSeos account:</p>
<p><a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email">Confirm my account</a></p>
<p>This link works on any device and expires in 24 hours.</p>
<p>If you did not create a LifeSeos account, you can ignore this email.</p>
```

### Why these exact parameters

`app/auth/confirm/route.ts` reads them by name:

| Parameter | Required | Behaviour |
|---|---|---|
| `token_hash` | yes | missing → redirect to `/auth/login?error=missing_token` |
| `type` | yes | must be `email` for signup confirmation |
| `next` | no | default `/dashboard`, sanitised by `safePath()` |

`next` is passed through `safePath()`, which rejects absolute and
protocol-relative values — so `next=https://evil.example` degrades to
`/dashboard` rather than becoming an open redirect.

### Preview versus Production

`{{ .RedirectTo }}` is the `emailRedirectTo` the app passed to `signUp`,
computed from the deployment's own origin. So a preview sign-up confirms back to
that preview and a production sign-up confirms to production, from one template.
Supabase substitutes Site URL only when the origin is missing from the Redirect
URL allow-list.

Three options, in order of preference:

| Option | Behaviour | When |
|---|---|---|
| **A. Accept it** | preview sign-ups confirm on Production, then sign in there | closest to real behaviour; fine while Production still points at the OLD project — **no**, see caveat |
| **B. Separate test project** | a throwaway project with Site URL = preview alias | cleanest preview testing, costs one project |
| **C. Temporary Site URL** | point Site URL at the preview alias during testing, restore before cutover | avoid — easy to forget and it breaks Production sign-ups |

**Important caveat on A:** right now Production still uses the **old** project,
so a confirmation landing on `www.lifeseos.com` is handled by the old project's
Auth and will not validate a token minted by the new one. Until cutover, preview
confirmation testing therefore needs **option B**, or manual approval of the
user in the dashboard:

**Authentication → Users → (the user) → ⋯ → Confirm email**

---

## 3. Email delivery

**Authentication → Emails / SMTP**

The built-in SMTP sender is rate-limited (a handful per hour) and intended for
testing only. Before any real traffic:

- Set custom SMTP (Resend, Postmark, SES…).
- Set **Sender name** and **Sender email** on a domain you control, with SPF and
  DKIM published, or confirmations land in spam.

Neither is needed to test with a single address, and neither is configured yet.

---

## 4. Settings to leave exactly as they are

| Setting | Value | Why |
|---|---|---|
| Enable Email provider | **on** | the only provider the app uses |
| Confirm email | **on** | required for Production; turning it off lets anyone register an address they do not own |
| Allow new users to sign up | **on** | signup is the entry point |
| Secure email change | **on** | stops an attacker re-pointing an account |
| JWT expiry | default (3600s) | the client refreshes; shortening it only adds churn |

---

## Checklist

- [ ] URL in Safari shows `izmwdlyuthxgkijxiwmt`
- [ ] Site URL = `https://www.lifeseos.com`
- [ ] Four redirect URLs added (hashed preview, or alias once created)
- [ ] Confirm signup template uses `token_hash` + `type=email`
- [ ] Confirm email is **on**
- [ ] One real sign-up completes end to end
- [ ] Old project `ikjlgsbrsknjyfegjrdi` never opened in a writable tab