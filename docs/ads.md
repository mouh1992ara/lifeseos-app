# Adsterra advertising (temporary experiment)

Four Adsterra units are integrated behind a feature flag. This document is the
switch-on / switch-off procedure and the record of what was verified.

**Current state: DISABLED.** `NEXT_PUBLIC_ADSTERRA_ENABLED` is unset in every
environment, so no ad component renders and no request reaches any ad network.

---

## Switch it ON

```bash
# local
NEXT_PUBLIC_ADSTERRA_ENABLED=true npm run dev

# Vercel: add the variable to the Preview environment only while testing
vercel env add NEXT_PUBLIC_ADSTERRA_ENABLED preview
# value: true
```

Then redeploy — the flag is inlined at build time, so changing it has no effect
on an existing deployment.

## Switch it OFF (before any AdSense review)

```bash
# 1. flip the flag
vercel env rm NEXT_PUBLIC_ADSTERRA_ENABLED production
# or set it to: false

# 2. redeploy, so the bundle no longer contains the ad code paths
```

Two independent layers, both required for a clean removal:

| Layer | What it does |
|---|---|
| `NEXT_PUBLIC_ADSTERRA_ENABLED=false` | Every `<AdSlot>` returns `null`; no script element is ever created |
| `components/ads/ad-consent.tsx` | Shows the prompt and writes the cookie; delete the mount in `app/[locale]/layout.tsx` to remove it |

Because the ad components check the cookie **and** the flag, deleting either one
alone still leaves the site ad-free. That is deliberate — a single mistake should
not leak a request.

### Verify it is really off

```bash
# no ad markup in the HTML
curl -s https://www.lifeseos.com/blog/technical-seo-guide | grep -c bauval   # → 0
curl -s https://www.lifeseos.com/tools/http-status-checker | grep -c adsterra # → 0
```

In a browser: DevTools → Network → filter `bauval` → reload → **0 requests**.

---

## Units

| Unit | Size | Endpoint | Placement |
|---|---|---|---|
| `native` | 4:1, inherits font | `/21/7644cca…` | Blog articles, after section 2 |
| `inline` | 300×250 | `/22/ac8ee15…` | Blog articles, after the body |
| `leaderboard` | 728×90 | `/22/da73edd…` | Tool pages, desktop only |
| `mobile` | 320×50 | `/22/ad8fe2e…` | Tool pages, mobile only |

Per-page maximum is two placements: one native + one inline on articles, one
banner on tool pages (the component picks desktop or mobile, never both).

### Excluded, and why

`https://bauval.org/14/27a00f8f2ddbb0a31288dad6b6191a78` was supplied alongside
the four approved units. `/14/` is Adsterra's popunder / social-bar loader
family, both explicitly excluded from this experiment, so it is listed in
`EXCLUDED_UNITS` and never rendered. Do not wire it without an explicit
instruction — a popunder is exactly the creative that gets an AdSense application
rejected.

---

## The `atOptions` problem

Adsterra's banner loader is the same script for every unit — `bauval.org/22/{key}`
— and it reads a **global** `window.atOptions` when it executes. Two banners on
one page therefore overwrite each other's configuration and one renders the wrong
size, or the same creative twice.

Three rules in `adsterra-banner.tsx` follow from this:

1. `atOptions` is assigned immediately before its own loader is appended, never
   earlier.
2. Loaders are serialised through one promise chain, so they never run
   concurrently.
3. Each key's loader is inserted once per document (`loadedKeys`), so client
   navigation does not re-request the same slot and count a second impression.

The native banner uses a container-div protocol with no `atOptions`, so it is a
separate component rather than a branch — mixing the two in one global would be
precisely the collision above.

---

## Consent

No ad loads before an explicit choice. `AdConsent` asks once, stores
`ls_ads_consent=granted|denied` for 180 days, and the ad slots refuse to render
without `granted`.

This is a minimal prompt, not a certified CMP. It asks one question and records
one answer, which is proportionate for trialling one network. If advertising ever
becomes permanent and the audience includes the EU/UK, this needs replacing with a
real consent management platform.

---

## Verification log

Run against a local production build with the flag on, desktop 1440 and mobile 390.

| Check | Result |
|---|---|
| Flag off: ad slots in DOM | 0 |
| Flag off: ad-network requests | **0** |
| Flag off: consent prompt | not shown |
| Flag on: article slots | 2 (native + inline) |
| Flag on: tool page slots, desktop | 1 (728×90 only) |
| Flag on: tool page slots, mobile | 1 (320×50 only) |
| Excluded pages (`/about`, `/editorial`, `/privacy`, `/auth/login`) | 0 slots |
| Horizontal overflow, all viewports | 0 |
| Scripts requested | `bauval.org/21`, `bauval.org/22` |

### Ads do not render in the test environment

The loaders respond `200` with `content-type: application/javascript` and a
**0-byte body** on `localhost`. Direct requests from the shell return `403`.
Both are consistent with domain restriction: Adsterra serves creatives only to an
approved origin, and `localhost`/preview hostnames are not on that list.

This is **not** verified — it is inferred from the empty response and the 403 on
direct fetch. It cannot be confirmed without either deploying to the approved
domain or asking Adsterra support. Until an ad actually renders, treat the
integration as *installed but unproven*.

The components handle this honestly: when no creative arrives within 6–8 seconds
the slot collapses to a single "Advertisement unavailable" line instead of
reserving an empty box.