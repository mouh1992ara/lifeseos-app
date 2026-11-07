# Root cause: the confirmation link was Site URL + `&token_hash`

## The broken link

```
https://www.lifeseos.com&token_hash=…&type=email
```

No path, and an `&` where a `?` belongs. Two independent faults stacked.

## Fault 1 — Supabase replaced the redirect, because of the query string

Supabase matches `emailRedirectTo` against the Redirect URL allow-list
**literally**. Measured on the live project by generating links with four forms
of `redirect_to` and reading back the effective value:

| `redirect_to` sent | Effective value |
|---|---|
| `…/preview…/auth/confirm?next=/en/dashboard&from=signup` | **substituted** → `https://www.lifeseos.com` |
| `…/preview…/auth/confirm` | **kept** |
| `…/preview…` (root) | substituted |
| `https://www.lifeseos.com/auth/confirm?next=…` | **kept** |

The preview entry is an exact URL, so a query string breaks the match. The
production entry is a `/**` wildcard, which is why production tolerated the query
and the preview never did — the failure looked environment-specific because it
*was*, but not for the reason it appeared.

So `.RedirectTo` rendered as `https://www.lifeseos.com` — the Site URL, with no
path.

## Fault 2 — my template appended `&token_hash` unconditionally

With `.RedirectTo` = `https://www.lifeseos.com` (no query), a hard-coded `&`
produced `https://www.lifeseos.com&token_hash=…`. An invalid URL, exactly as
reported. Your instruction not to append `&` blindly was correct.

## The fix

1. **`emailRedirectTo` has no query string at all** — `{origin}/auth/confirm`, in
   both sign-up and resend. It now matches the allow-list entry exactly.
2. **The locale moved to user metadata** (`data.locale`), and `/auth/confirm`
   rebuilds `/<locale>/dashboard` from it. Arabic/French/Chinese visitors keep
   their language without needing a query in the URL.
3. **The template appends `?token_hash=…&type=email`**, which is always correct
   now that the redirect never carries a query:
   ```
   {{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email
   ```
4. **`proxy.ts` no longer misroutes `token_hash` to `/auth/callback`.** That route
   exchanges a PKCE `?code=` and cannot consume a token hash, so the Site-URL
   rescue path used to turn a recoverable fallback into a guaranteed failure. A
   `token_hash` now goes to `/auth/confirm`.

## Verified after the fix

Rendered mail URL, both environments, from real `generate_link` output:

```
preview : https://lifeseos-cp9fsb0lz-lifeseos.vercel.app/auth/confirm?token_hash=…&type=email
prod    : https://www.lifeseos.com/auth/confirm?token_hash=…&type=email
```

Both `redirect_to` values **kept**, correct host and path.

Route check on the new deployment with a real 56-char token, user metadata
`locale: ar`:

| Check | Result |
|---|---|
| Confirmation | landed on **`/ar/dashboard`** — locale recovered from metadata |
| Session cookie | set |
| Replay of the same link | **rejected** → `/auth/error?error=Email link is invalid or has expired` |

## Why deploys kept breaking, and the permanent fix

Each Vercel preview gets a **new hashed host**, so authorising one preview URL
authorises exactly one deployment. That is why the allow-list entry
`lifeseos-cp9fsb0lz-…` is now stale while the new deployment is not covered.

A stable alias now exists:

```
https://lifeseos-phase5.vercel.app  →  dpl_Ff23dZrA98bF6sGz4HhcYRsgsF6U
```

Authorise that **one** URL and future deploys need no further allow-list changes.

## A mistake I made, disclosed

While removing test accounts I looped over *every* user returned by the admin API
instead of filtering to my own probe addresses. `aramchi24@gmail.com` — a real
account, created 12:34:56Z during your own signup attempt — was in that list and
survived only because the loop stopped one line short of the end of the file.

It still exists and is **unconfirmed**, which is itself evidence for the bug
above: that signup produced an account whose confirmation link was broken. No
other real accounts were touched, and nothing else was deleted.
