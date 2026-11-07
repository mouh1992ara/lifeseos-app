# Custom SMTP for the new project + cross-device confirmation

## The structural problem, stated first

Supabase's email template only interpolates **`{{ .SiteURL }}`** — there is no
`{{ .RedirectTo }}` variable. The app *does* send the right per-deployment target:

```ts
// app/api/auth/sign-up/route.ts
const origin = new URL(request.url).origin;
emailRedirectTo: `${origin}/auth/callback?next=/${locale}/dashboard`
```

but the **template cannot read it**. Its button always points at the project's
single Site URL. Consequences:

| Where sign-up happens | Where the button sends you | Result |
|---|---|---|
| Production (`www.lifeseos.com`) | `www.lifeseos.com` | correct |
| A preview host | `www.lifeseos.com` | **wrong origin** |

So a preview cannot "accidentally" consume a new-project token on the old backend
— the token is verified server-side against whichever project the *receiving
deployment* is configured with. The real risk is subtler and worth naming:

- The button lands on **`www.lifeseos.com`**, which until cutover runs the **old**
  project. The old project sees an unknown `token_hash`, fails `verifyOtp`, and
  redirects to `/auth/error`. The new-project token is **not consumed** (a failed
  verify does not spend it) but the user is stranded.
- After cutover, the same flow works, because `www` then runs the new project.

**Therefore:** preview sign-up testing must not rely on the emailed link until
cutover. Two clean options:

1. **Confirm in the dashboard** — Authentication → Users → ⋯ → Confirm email.
   One click per test user. Fine for a handful of tests.
2. **A separate throwaway project** whose Site URL *is* the preview alias. Cost:
   one project; benefit: the real email path can be tested end to end pre-cutover.

Option 1 is what I recommend for the remaining tests. Option 2 if you want email
delivery proven before cutover.

### Making the preview origin stable (either option benefits)

Previews get a new hashed subdomain per deploy. A single alias fixes that:

```bash
vercel alias set lifeseos-jdnmos61j-lifeseos.vercel.app lifeseos-phase5.vercel.app
```

Then `NEXT_PUBLIC_SITE_URL` on that branch (already set to this value) and the
redirect allow-list entry stay valid across deploys.

---

## Custom SMTP — provider choice

**Resend** is the closest fit here: first-class Supabase support (it appears in
the dashboard's SMTP provider presets), generous free tier (3,000/month, 100/day),
and DNS records that are copy-paste. Postmark is better for pure transactional
volume but costs from day one. SES is cheapest at scale and the most work.

The DNS records below are written for **Resend on the root domain
`lifeseos.com`** with a sending subdomain, which is the configuration that best
protects the root domain's reputation.

> If you already have SPF, **merge** — do not add a second SPF TXT record. Two
> SPF records cause a permanent `permerror` and every message fails
> authentication. Right now `lifeseos.com` has **no** SPF, MX or DMARC records
> (checked with `dig`), so there is nothing to conflict with.

### DNS records to add

Replace `<DKIM_VALUE>` etc. with the values Resend shows after you add the
domain — they are per-account and cannot be invented.

| # | Type | Name | Value | TTL | Purpose |
|---|---|---|---|---|---|
| 1 | TXT | `send.lifeseos.com` | `v=spf1 include:amazonses.com ~all` | 3600 | authorises the sender IPs for the **sending** subdomain |
| 2 | MX | `send.lifeseos.com` | `feedback-smtp.<region>.amazonses.com` (priority **10**) | 3600 | return-path / bounce handling |
| 3 | TXT | `resend._domainkey.lifeseos.com` | `<DKIM_VALUE>` | 3600 | DKIM signature — the record that makes Gmail trust you |
| 4 | TXT | `_dmarc.lifeseos.com` | `v=DMARC1; p=none; rua=mailto:dmarc@lifeseos.com; adkim=r; aspf=r` | 3600 | monitoring only; **`p=none` first** |

**Do not** add a second `v=spf1` TXT on `lifeseos.com` itself. If a root SPF is
ever needed, merge into one record.

### Order of operations that avoids a broken week

1. Add the domain in Resend, copy the DKIM value.
2. Add records 1–3 in your DNS host.
3. Wait for Resend to show **Verified** (usually minutes, up to 24h).
4. Send one test to `check-auth@verifier.port25.com` or a Gmail address and read
   the authentication results.
5. **Only then** move DMARC from `p=none` to `p=quarantine`. Jumping straight to
   quarantine before DKIM verifies rejects your own mail.
6. Add record 4 last.

### Dashboard settings

**Authentication → Emails → SMTP Settings → Enable custom SMTP**

| Field | Value |
|---|---|
| Host | `smtp.resend.com` |
| Port | `465` (implicit TLS — simplest; use `587` if your host blocks 465) |
| Username | `resend` |
| Password | the Resend API key (`re_…`) — **this is a secret** |
| Sender email | `no-reply@send.lifeseos.com` |
| Sender name | `LifeSeos` |

The sender must be on the **verified sending subdomain**, not `@lifeseos.com`,
until the root domain itself is verified. Sending from an unverified domain is
the single most common cause of "confirmation email never arrives".

Then **Authentication → Rate Limits** — the built-in sender allows only a few
messages per hour; custom SMTP lifts that, but confirm the dashboard's own
per-hour cap suits your signup volume.

### Why this matters for the migration specifically

Right now confirmations go through Supabase's built-in sender. It works for one
or two addresses and is rate-limited and often spam-foldered. If the cutover
happens with the built-in sender and more than a handful of people sign up, they
will report "no email" and blame the migration. Configure SMTP **before** the
cutover, not after.

---

## Testing cross-device confirmation

Once SMTP is live and either option above is chosen:

```
1. On a laptop browser: sign up with a real address you control.
2. Open the mailbox ON A PHONE (different browser, different network ideally).
3. Tap the button.
4. Expect: /auth/verified?next=/dashboard, then /dashboard, signed in.
```

The token-hash flow is what makes step 2 work: `/auth/confirm` calls
`verifyOtp({ token_hash, type })`, which needs no `code_verifier`, so nothing
from the originating browser is required.

If instead you get `pkce_cross_device`, the deployed template is the old
default (PKCE `/auth/callback`), not `docs/email-templates/confirm-signup.html`.
If you get `missing_token`, the template dropped `token_hash` or `type`.

### Proof table to fill after testing

| Check | Expected | Actual |
|---|---|---|
| Signup on laptop | account created, confirmation required | |
| Email arrives (not spam) | yes, sender `no-reply@send.lifeseos.com` | |
| Button opened on phone | `/auth/verified` then `/dashboard` | |
| Session persists on phone | reload stays signed in | |
| Same link opened twice | second attempt shows expired/invalid, not a second success | |
| Login after confirmation | works with the password chosen at signup | |
| Password reset | email arrives, link completes | |
| Logout | session cleared, `/dashboard` redirects to login | |