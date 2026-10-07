# LifeSeos Project Handoff
Date: 2026-10-06

## Purpose
This file preserves the current state of the LifeSeos project so work can continue safely in a new ChatGPT conversation.

## Project
- Name: LifeSeos
- Live site: https://www.lifeseos.com
- Local path: ~/Desktop/lifeseos-app
- GitHub: https://github.com/mouh1992ara/lifeseos-app.git
- Branch: main
- Hosting: Vercel

## User workflow preferences
- Explain in Arabic.
- Code and Terminal commands in English.
- Prefer complete copy-paste files for substantial edits.
- Work one step at a time.
- Validate with `npx tsc --noEmit`.
- Use targeted `git add`; never use `git add .`.
- Preserve the current design unless explicitly asked to change it.

## Important project structure
app/
  api/
    analyze/route.ts
    contact/route.ts
    http-status/route.ts
    seo-page-analyzer/route.ts
    indexnow/route.ts
    indexnow-auto/route.ts
    tool-events/route.ts
    page-speed/route.ts
  admin/page.tsx
  auth/
  dashboard/
  contact/
  about/page.tsx
  privacy/page.tsx
  terms/page.tsx
  tools/
    page.tsx
    seo-analyzer/page.tsx
    meta-tag-generator/page.tsx
    xml-sitemap-generator/page.tsx
    robots-txt-generator/page.tsx
    keyword-density-checker/page.tsx
    http-status-checker/page.tsx
    seo-page-analyzer/page.tsx
    page-speed/page.tsx
    content-analyzer/page.tsx
  icon.png
  globals.css
  layout.tsx
  not-found.tsx
  opengraph-image.png
  page.tsx
  robots.ts
  sitemap.ts

components/
  admin/live-visitors.tsx
  live-presence.tsx
  logo.tsx
  share-tool.tsx
  site-footer.tsx
  site-header.tsx

lib/supabase/
  client.ts
  server.ts
  admin.ts

public/
  lifeseos-logo.png
  f328cb0c80a05063563e062b3288b368.txt

vercel.json

Do not commit old backup:
app/tools/http-status-checker/page.tsx~

## Authentication / Supabase
- Signup/login/logout works.
- Dashboard works and saves SEO reports.
- `seo_reports` exists with RLS.
- `contact_messages` works.
- `tool_events` records tool usage.
- Admin user ID: 9067570a-9e9c-4c35-90c8-dda9de6e82f6
- Relevant env vars:
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  NEXT_PUBLIC_SITE_URL=https://www.lifeseos.com
  UPSTASH_REDIS_REST_URL
  UPSTASH_REDIS_REST_TOKEN
  CRON_SECRET
  SUPABASE_SECRET_KEY
  ADMIN_USER_ID
  GOOGLE_PAGESPEED_API_KEY

## Admin
- `/admin` is protected.
- unauthenticated -> `/auth/login`
- non-admin -> `/dashboard`
- Shows users, SEO reports, tool uses, messages, today/7-day/month stats, confirmations, tool activity/performance, recent activity, live visitors.
- Admin timezone: Asia/Shanghai.
- Live visitors use Supabase Realtime Presence.
- Production live visitor tracking works.

## Domain / SEO
- Live domain: https://www.lifeseos.com
- root redirects to www.
- Google Search Console sitemap works.
- Important pages indexed.
- IndexNow works.
- IndexNow key: f328cb0c80a05063563e062b3288b368
- Vercel cron for auto IndexNow: `0 6 * * *`

## Tools currently implemented
1. SEO Analyzer
2. SEO Page Analyzer
3. Meta Tag Generator
4. Robots.txt Generator
5. Keyword Density Checker
6. HTTP Status Checker
7. XML Sitemap Generator
8. Page Speed Analyzer
9. Content Analyzer

All are working and tracked.

## Homepage
Recent improvements:
- Trust section with icons:
  - Free tools
  - Instant analysis
  - No credit card
  - Privacy friendly
- Icons use lucide-react: Gift, Zap, CreditCard, ShieldCheck
- Tool cards use 3 columns on desktop.
- Spacing under “Everything you need for SEO” improved with `mb-10`.
- User confirmed local and production design look good.

## Share this tool feature
Reusable component:
`components/share-tool.tsx`

Buttons:
- X
- LinkedIn
- Facebook
- Copy link

Uses `window.location.href`.

Successfully added to:
- SEO Analyzer
- SEO Page Analyzer
- Meta Tag Generator
- Robots.txt Generator
- Keyword Density Checker
- HTTP Status Checker
- XML Sitemap Generator
- Page Speed Analyzer
- Content Analyzer

Facebook production test correctly showed:
- LifeSeos preview image
- LIFESEOS.COM
- page title such as “Meta Tag Generator | LifeSeos”

LinkedIn production test correctly opened the login/share flow.

For SEO Analyzer, ShareTool is wrapped in `print:hidden`.

Recent files modified for sharing:
- app/tools/content-analyzer/page.tsx
- app/tools/http-status-checker/page.tsx
- app/tools/keyword-density-checker/page.tsx
- app/tools/meta-tag-generator/page.tsx
- app/tools/page-speed/page.tsx
- app/tools/robots-txt-generator/page.tsx
- app/tools/seo-analyzer/page.tsx
- app/tools/seo-page-analyzer/page.tsx
- app/tools/xml-sitemap-generator/page.tsx
- components/share-tool.tsx

Suggested commit:
`Add social sharing to SEO tools`

## Root metadata
`app/layout.tsx` contains global metadata.
- metadataBase = NEXT_PUBLIC_SITE_URL or https://www.lifeseos.com
- default title: LifeSeos - Free SEO Tools for Smarter Growth
- template: %s | LifeSeos
- global OG image: /opengraph-image.png
- Twitter image: /twitter-image.png
- robots index/follow enabled
- GoogleBot large image preview enabled
- layout renders LivePresence, SiteHeader, children, SiteFooter

## Current work: unique Social Preview images
Goal: give each tool its own social preview instead of the generic image.

First test:
Meta Tag Generator

Created:
`app/tools/meta-tag-generator/layout.tsx`

It passed:
`npx tsc --noEmit`

That nested layout references:
`/social/meta-tag-generator.png`

Expected filesystem path:
`public/social/meta-tag-generator.png`

Expected size:
1200 x 630

IMPORTANT:
The `public/social/` folder and `meta-tag-generator.png` image have NOT yet been created.
The user looked inside `public` and correctly found that the social image does not exist yet.

Immediate next step:
1. Create `public/social/`
2. Create `meta-tag-generator.png` at 1200x630
3. Use LifeSeos dark navy style with logo and blue/purple/emerald gradient accents
4. Main text: `Meta Tag Generator`
5. Supporting text: `Create SEO-friendly titles and descriptions`
6. Brand: `LifeSeos`
7. Verify visually
8. Run `npx tsc --noEmit`
9. `git status`
10. Targeted add:
    `git add app/tools/meta-tag-generator/layout.tsx`
    `git add public/social/meta-tag-generator.png`
11. Commit/push
12. Test Facebook/LinkedIn preview on production

## Future SEO growth plan
Priority:
1. Unique Social Preview cards for tools
2. SEO Guides / Blog
3. Stronger tool landing-page content
4. Structured data where appropriate
5. Internal linking between guides and tools
6. Social distribution

Potential guide topics:
- How to check HTTP status codes
- What is keyword density
- How to create robots.txt
- How to create an XML sitemap
- How to improve page speed
- Meta title and description best practices
- Technical SEO checklist
- How to analyze a webpage for SEO

## Git rules
Always:
`git status`
`npx tsc --noEmit`

Use targeted:
`git add <specific file>`

Never:
`git add .`

Push:
`git push origin main`

Vercel deploys from main.

## Known browser issue
A previous hydration warning was caused by a Chrome extension injecting:
`data-contai-hover-setup="true"`
Incognito removed the issue.
It was not an app bug.

## Branding
Logo:
`public/lifeseos-logo.png`

Brand:
LifeSeos

Subtitle:
SEO tools for smarter growth

## Continue from here
Next action:
Create the first 1200x630 unique Social Preview image for Meta Tag Generator and place it at:
`public/social/meta-tag-generator.png`
