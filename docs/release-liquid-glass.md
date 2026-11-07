# Liquid Glass release — branch, checks, deploy plan

Branch `design/liquid-glass`, 6 commits on top of production `3b790f4`.
Fast-forward merge, no merge commit, no conflicts expected.

## Commits

| SHA | Subject |
|---|---|
| `7aa2721` | feat(design): Liquid Glass system for navigation, menus and range control |
| `111551d` | feat(design): extend Liquid Glass across all shared controls |
| `2f6b8c9` | polish(glass): interaction states, calmer cards, lighter chip selection |
| `34d14ad` | feat(glass): bring the tool interfaces into the design system |
| `5e89b4e` | feat(glass): make the tool surfaces actually readable as glass |
| `d0738fa` | fix(a11y): raise tool placeholder contrast to WCAG AA |

Scope: 11 files, +1734 / -89. One component simplified (`tool-card.tsx` lost its
pointer-tilt handler), one layout wrapper added (`tools/layout.tsx`), everything else
is `app/liquid-glass.css`.

## Deploy

Environment prerequisites are already in place (set during the Phase 4 release):
`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `AUTH_VERIFY_SECRET`,
`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`. This release adds no variables.

The project is git-linked (`mouh1992ara/lifeseos-app`, production branch `main`), so a
push to `main` deploys production automatically. Merge and deploy are one action.

```bash
git checkout main
git merge --ff-only design/liquid-glass     # 6 commits
git log --oneline -7                         # expect d0738fa at the tip
git push origin main
vercel ls --environment production           # watch for READY
```

## Rollback

Current production: `lifeseos-h3pshw2i3-lifeseos.vercel.app` (`3b790f4`).

```bash
vercel rollback lifeseos-h3pshw2i3-lifeseos.vercel.app --yes
```

No schema change, no data migration, no auth change in this release — a rollback
cannot lose accounts or content.

## Post-deploy smoke

1. `https://www.lifeseos.com/tools` — cards have sheen, chips slide
2. One tool from each family: schema (cards + JSON), analyzer (submit), robots (output)
3. `/auth/sign-up` — Turnstile checkbox renders
4. `/dashboard` while signed out → login redirect
5. `/ar/tools/schema-markup-generator` — RTL mirrored, no horizontal scroll
6. Resize to 390px — nav rail, no overflow
