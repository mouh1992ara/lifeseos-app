# Preview verification — 2026-11-07

Deployment `dpl_HdRv5m2FJMm75bWNx9DsH2NDuJgw`
`https://lifeseos-cp9fsb0lz-lifeseos.vercel.app`
commit **`1ca2ce3`** · branch `phase5/tool-outcomes` · state READY

Confirmed to run the new project by writing through it and reading the row back,
not by the URL responding:

```
POST /api/tool-events → {"ok":true}
analytics_events      → {"event_name":"tool_use","tool_key":"page-speed"}
```

## What was actually tested

### Token-hash confirmation — PASS, with a real token

A genuine 56-character `hashed_token` was minted with `admin.generate_link`, and
the deployed route was driven in a real browser at exactly the URL the template
renders:

```
/auth/confirm?next=/en/dashboard&from=signup&token_hash=<real>&type=email
```

| Check | Result |
|---|---|
| Lands on `/dashboard` | **yes** |
| Session cookie written (`sb-*-auth-token`) | **yes** |
| `email_confirmed_at` set server-side | **`2026-11-07T12:20:34Z`** |
| Token replay | **rejected** → `/auth/error?error=Email link is invalid or has expired` |
| Invalid token | rejected, same error |
| Missing token | `/auth/error?error=missing_token` |

That is the deployed code path end to end. **It does not prove Resend delivery**
— no email was involved (see Gaps).

### Authentication — PASS

| Check | Result |
|---|---|
| Login | `/auth/login` → `/dashboard` |
| Dashboard authenticated | yes |
| Session persistence across reload | yes |
| Logout | `/dashboard` afterwards → `/auth/login?next=%2Fdashboard` |
| Password reset request accepted | `POST /auth/v1/recover` → 200 (email not read) |
| Protected route when anonymous | redirects to login |

### Redirect safety — 6/6 PASS, no offsite navigation

| Attempt | Result |
|---|---|
| `next=https://evil.example` on confirm | stays on origin |
| `next=//evil.example` on confirm | stays on origin |
| `next=https://evil.example` on login | stays on origin |
| `next=//evil.example` on login | stays on origin |

### Dashboard, reports, analytics — PASS

| Check | Result |
|---|---|
| Save a real report from the browser | `POST /rest/v1/seo_reports` → **201** |
| Row in database | `https://example.com`, score **52**, owner `7ce2340c…` |
| Report visible in dashboard after reload | yes |
| `tool_use` / `tool_success` persisted | yes, both `seo-analyzer`, `locale=en` |
| All `event_id` valid UUID v4 and distinct | yes |

### RLS isolation — PASS

A second authenticated user with a real JWT:

| Query | Result |
|---|---|
| `select * from seo_reports` | **`[]`** |
| `select * where user_id = <first user>` | **`[]`** |

Anonymous reads of every table: `42501 permission denied`.

## Cleanup

Test user deleted (cascaded their report). Final state: **0 rows in all five
tables, 0 auth users.**

## Gaps — not tested, not claimed

1. **Resend delivery — NOW VERIFIED** (2026-11-07, 13:54Z). A real signup on an
   iPhone completed Turnstile, received the Resend email, opened the token-hash
   link on that device, and reached the authenticated dashboard. Account
   `aramchi24@gmail.com`, `email_confirmed_at` `2026-11-07T13:54:48Z`. This closes
   the gap; the note below records what was true when it was written.
2. **Turnstile could not be completed headlessly.** The widget is a managed
   challenge; a real browser reached `{"captchaRequired":true,"captcha":"ready"}`
   but the challenge never resolved. Captcha was **not** disabled or mocked.
3. **SMTP settings unreadable.** Management API returns 403 for this project
   with the token on this machine, so "custom SMTP is enabled" and "sender is
   no-reply@send.lifeseos.com" are **your statement, not something I verified**.
4. **Template content unverified.** I cannot read the saved dashboard template.
   The route tolerates either form, but only the saved template decides what
   users receive.

## Two defects found in my own earlier work

- I claimed Supabase templates lack `{{ .RedirectTo }}`. Wrong; the docs
  document it. Fixed in `1ca2ce3` and all three docs.
- I claimed `sb_secret_…` was rejected by the project. Also wrong — the value
  tested was the Management API's masked display (`sb_secret_L72yy···`).
  Corrected in `docs/supabase-secret-key-correction.md`.