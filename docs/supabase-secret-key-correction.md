# Secret keys — correcting an earlier wrong conclusion

## What I got wrong

I previously reported that `sb_secret_…` "does not work" on this project and that
`SUPABASE_SECRET_KEY` **must** be the legacy `service_role` JWT. **That was
wrong**, and the cause was mine:

The Management API (`GET /v1/projects/<ref>/api-keys`) returns the secret key
**masked**:

```
sb_secret_L72yy··························     (41 chars, tail is literal dots)
```

I copied that masked string into a test file and used it as a credential. Of
course it returned `401 Invalid API key` — the last 26 characters were bullets.
Every conclusion drawn from that test was invalid.

## Corrected findings

| Credential | REST | Auth admin | Notes |
|---|---|---|---|
| `sb_publishable_…` | 200, RLS-scoped | no | correct for the browser |
| `service_role` **JWT** (`eyJ…`) | **200** | **works** | verified today with real reads/writes |
| `sb_secret_…` **real value** | untested | untested | I do not have the real value |

Both header shapes work with the JWT:

```
apikey: <JWT>              + Authorization: Bearer <JWT>    → 200
apikey: <publishable>      + Authorization: Bearer <JWT>    → 200   (the shape supabase-js uses)
```

## What the app appears to do

`lib/supabase/admin.ts` initialises `@supabase/supabase-js` with the URL and
`SUPABASE_SECRET_KEY` as the second argument. supabase-js sends that value as
`apikey` **and** as `Authorization: Bearer`, which is exactly the shape that
works. So:

- With the **JWT**, everything works — this is the currently verified state.
- With a **real** `sb_secret_…`, it should also work: supabase-js supports
  new-style secret keys in that same position.

I have **not** verified the second claim, because the real `sb_secret` value was
never available to me. I am not going to assert it works.

## Recommendation

**Use the `service_role` JWT for `SUPABASE_SECRET_KEY` at cutover.** It is the
only form verified end to end against this project today (service-role CRUD 9/9,
analytics writes, Auth admin user operations). Switching to a new-style secret
key is a separate, testable change that should not be bundled into a cutover.

## Secure temporary workaround

If you want to test the `sb_secret_…` path before deciding:

1. Supabase dashboard → project `izmwdlyuthxgkijxiwmt` → Settings → API Keys.
2. **Reveal** and copy the secret key (it is only shown in full at creation on
   some plans — otherwise rotate it and copy the new one).
3. Put it in a local file that is gitignored, never in chat:

```bash
cd /Users/mouhssinearamchi/WorkBuddy/2026-11-03-14-14-15/lifeseos/lifeseos-app
printf 'SUPABASE_SECRET_KEY=%s\n' 'sb_secret_REAL_VALUE' >> .env.local
```

4. Tell me it is set and I will run the same probe matrix against it and report
   which shape works — without printing the value.

**Rotation note:** rotating the secret key invalidates the old one. Since the
current JWT works and nothing is in Production on the new project yet, rotation
is currently harmless. After cutover it would break running deployments until
the variable is updated, so do it before, not after.

## Standing hazard (unchanged)

`SUPABASE_SECRET_KEY` on Vercel is scoped **`Production, Preview`** together, and
so are `NEXT_PUBLIC_SUPABASE_URL` and the publishable key. Every Preview
deployment therefore inherits Production's Supabase project. The isolated
preview avoids this only because it uses branch-scoped overrides.

Before cutover, split them:

- `Production` → old project (until cutover), then new
- `Preview` → remove the shared entries; rely on branch-scoped values, or move
  previews to a dedicated test project