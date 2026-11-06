# External blockers — what cannot be fixed in code

Four items live outside the repository. Each has a workaround that does **not** require
restoring dashboard access, listed from least to most invasive.

## 1. Supabase redirect allow-list — blocks confirmation emails

**Symptom:** the confirmation email opens `https://www.lifeseos.com/` instead of the
verification screen. `emailRedirectTo` is only honoured when it matches an entry in
**Redirect URLs**; otherwise Supabase silently substitutes **Site URL**.

**Fixed in code (already shipped):**
- `proxy.ts` forwards `?code=` / `?token_hash=` arriving on any non-auth path to
  `/auth/callback`, so a Site-URL fallback still attempts a real confirmation.
- The branded template uses `{{ .SiteURL }}/auth/confirm?token_hash=…`, which is
  host-independent — it only depends on **Site URL**, not on the allow-list.

**Still required, in order of preference:**

1. **Email templates only (works without allow-list changes).** Set the template to the
   one in `docs/email-templates/confirm-signup.html`. It does not use
   `emailRedirectTo` at all, so the allow-list stops mattering for confirmation.
2. **Site URL correctness.** Without dashboard access you cannot read it, but you can
   prove it: click a confirmation link and observe which host opens. If it is
   `www.lifeseos.com`, Site URL is correct and item 1 alone fixes the flow. If it is a
   preview host, the preview is being treated as Site URL for that link.
3. **Regain dashboard access.** The project is alive (GoTrue v2.197.0). Recovery paths:
   - sign in at `supabase.com/dashboard` with any account that was ever a member of the
     organization — membership is per account, not per browser;
   - if the project was created under a GitHub/Google identity, use that provider;
   - `supabase.com/dashboard/account/security` → check for a second email on the account;
   - an org owner can re-invite you: **Organization → Team**.

   Losing the dashboard does **not** mean the project was deleted. Auth responds 200 and
   `mailer_autoconfirm` is readable as `false`, so the project exists and is enforcing
   confirmation.

## 2. Custom SMTP — blocks reliable delivery

Currently Supabase's built-in mailer: a handful of messages per hour, shared
reputation, frequently filtered. Nothing in code can change this.

Needs dashboard access: **Project Settings → Auth → SMTP Settings**, plus SPF, DKIM and
DMARC on the sending domain. Without it, expect slow or spam-foldered verification
emails under any real signup volume.

**Not verified:** no end-to-end delivery test has been run, so no claim is made about
whether mail currently arrives reliably.

## 3. Turnstile hostname allow-list — blocks the widget on previews

The keys are configured and the server-side secret is proven valid (a dummy token
returns `invalid-input-response`, not `invalid-input-secret`).

Each preview gets a new hostname, so the widget config needs
`lifeseos-*.vercel.app` alongside `www.lifeseos.com`. If the plan rejects wildcards, add
the exact host of the preview being tested.

**Fallback that needs no dashboard:** set `TURNSTILE_REQUIRED=0` on that environment.
Registration then runs on the per-IP rate limit only. That is an explicit, visible
downgrade — never a silent one.

## 4. Baidu push — blocked externally, already handled

`400 token invalid` with an empty body means the site/token pair is rejected before
content is read. Code matches the documented `site=` format after three independently
sourced tokens failed identically. A support ticket is open. Automatic submission stays
disabled; `docs/baidu.md` has the runbook and the empty-body pre-flight test.

---

## What is fully independent of all four

Everything else in this release: auth guards, ticket handoff, rate limits, captcha
verification logic, dashboard analytics, all 17 tools, four locales, SEO and performance
work. None of it needs dashboard access to run correctly.
