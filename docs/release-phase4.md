# Phase 4 release — commit plan (not executed)

Branch: `release/phase4` off `add3c73`. Never commit to `main` directly.

## Commit 1 — perf + i18n + SEO foundations
app/[locale]/layout.tsx, components/adsense.tsx, app/robots.ts, i18n/config.ts,
lib/dashboard-analytics.ts
(font preload, AdSense deferred, Baiduspider rules, canonical/locale fixes)

## Commit 2 — dashboard analytics + empty states
app/[locale]/dashboard/page.tsx, lib/dashboard-analytics.ts,
messages/parts/*/80-dashboard.json, messages/*.json
(removes the 27-vs-0 sample contradiction)

## Commit 3 — auth security core
lib/auth-guard.ts, lib/ratelimit.ts, app/api/auth/*, components/sign-up-form.tsx,
components/login-form.tsx, app/[locale]/admin/page.tsx,
app/[locale]/dashboard/reports/[id]/page.tsx

## Commit 4 — verification flow + handoff
app/auth/callback/route.ts, app/auth/confirm/route.ts, proxy.ts,
lib/verify-handoff.ts, app/[locale]/auth/{verify,verified,error,sign-up-success}/page.tsx,
components/{email-verify-panel,verified-panel,verify-success,code-input}.tsx,
components/verify-panel.tsx (deleted)

## Commit 5 — Turnstile
lib/turnstile.ts, components/turnstile.tsx

## Commit 6 — styling
app/i18n.css (verification animations, reduced-motion)

## Commit 7 — docs + template
docs/auth.md, docs/baidu.md, docs/email-templates/confirm-signup.html,
app/api/baidu-push/ (kept, submissions disabled)

## Before committing
- [ ] .env.local untouched and gitignored
- [ ] no key, token or secret in any diff (`git diff | grep -iE "secret|token|key"` review)
- [ ] messages parity: `node scripts/build-messages.mjs`
- [ ] tsc + eslint clean
