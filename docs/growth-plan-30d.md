# 30-day organic growth plan

Scoped to what this site can actually win: 17 working tools with unique output,
four languages, and a small authority base. No mass-produced pages.

## The honest starting position

We cannot measure current organic performance: the PageSpeed key is IP-restricted
and Search Console is not connected. Every recommendation below is therefore a
stated hypothesis with a named measurement — not a forecast. Do not treat any of it
as validated until the analytics migration is live and Search Console is linked.

The one structural advantage worth exploiting: **a tool page can satisfy a query
directly**. Someone searching "what is a good keyword density" can get an answer
*and* run it, on the same page. A blog post cannot. That is the only durable edge
over established competitors, so the plan leans on it everywhere.

---

## Five high-intent FAQ opportunities

Each pairs a question with a tool that already answers it. The FAQ goes on the
**tool page**, not on a separate blog post — that keeps the answer and the action
in one place and avoids competing with ourselves in the index.

| # | Tool page | Question to answer | Why this one |
|---|---|---|---|
| 1 | `/tools/keyword-density-checker` | "What is a good keyword density in 2026?" | High volume, low specificity, and every competing answer gives a number without a way to check your own |
| 2 | `/tools/http-status-checker` | "301 vs 302 vs 307 — which should I use for SEO?" | Genuine confusion, existing page already covers redirects, strong intent to act |
| 3 | `/tools/schema-markup-generator` | "Which schema types actually produce rich results?" | Most schema guidance lists 30 types; honest answer is ~8 support rich results |
| 4 | `/tools/robots-txt-generator` | "Why is Google ignoring my robots.txt?" | Real failure mode (crawl blocked by a stray `Disallow: /`), and the tool is the diagnostic |
| 5 | `/tools/page-speed` | "Why is my LCP slow even though my page loads fast?" | Technical, high-intent, and we can demonstrate the measurement in the same session |

**Format per FAQ:** question as the H2, 60–90 word direct answer in the first
paragraph (the part Google may lift), then the mechanism, then a two-line CTA into
the tool, then 2–3 genuine follow-ups. Include `FAQPage` structured data.

---

## Three original tutorial outlines

Each uses real tool output as its primary asset. No tutorial should exist that
could have been written without running the tool — that is the test for whether it
earns its place.

### 1. "We analysed 100 pages. Here is what actually broke." (~1,800 words)
- Method stated up front: which tools, what sample, what "broken" means
- Findings ranked by frequency, each with the tool output that proves it
- The distribution, not just the average — "median title length 52 chars, but 12%
  were truncated" is more useful than "titles should be ~60 characters"
- Each finding links to the tool that detects it
- **Why it can rank:** original data. Nobody else has our sample.

### 2. "The four SEO fixes that need no developer" (~1,400 words)
- Deliberately non-obvious: which issues a non-technical owner can actually fix
- Each section: symptom → how to confirm with a tool → exact change → how to verify
- Screenshots of before/after from the actual tools
- **Why it can rank:** intent is "fix it myself", which is our user

### 3. "Multilingual SEO for small sites: hreflang without the mess" (~1,500 words)
- We run four locales ourselves — this is first-hand, not theoretical
- The `x-default` mistake, the self-referencing canonical rule, and why
  machine-translated metadata gets ignored
- Worked example using lifeseos.com's own structure, linked to the tools
- **Why it can rank:** a genuine experience claim that most generic posts cannot make

---

## Internal linking opportunities

The gap is not missing links — it is that links are generic ("related tools").
Each link should carry the *next step* the user needs.

| From | To | Anchor as a next step |
|---|---|---|
| SEO Analyzer result | Meta Tag Generator | "Generate the missing meta description" shown *when* one is absent |
| SEO Analyzer result | Robots.txt Generator | "Your robots blocks this page" → fix it |
| Page Speed | SEO Analyzer | "Performance is one input — run the full audit" |
| Schema Generator | SERP Snippet Preview | "See how this markup renders" |
| Keyword Density | Content Analyzer | "Body-level readability, not just keywords" |
| HTTP Status Checker | Robots.txt Generator | "Check whether this path is even crawlable" |
| YouTube Title Generator | YouTube Title Analyzer | "Score the title you just generated" |
| Any tool | Dashboard | only when signed in, positioned as "save this analysis" |

Two rule changes that matter more than adding links:
1. **Conditional links.** Show the meta-tag link only when the analyzer actually
   found a missing description. A link that is always present is wallpaper.
2. **Descriptive anchors**, not "Click here" or "Learn more".

---

## 30-day measurement plan

Assumes the analytics migration is approved and applied on day 1. If it is not,
only the qualitative checks run, and the plan should be treated as paused — the
whole point is measuring rather than assuming.

### Week 1 — instrument, do not publish
- [ ] Apply migration; confirm `analytics_events` receives `page_view` rows
- [ ] Link Search Console and Bing Webmaster Tools; confirm sitemap fetch
- [ ] Capture baseline: page views by tool, by device, by locale
- [ ] Record current indexed-page count per search engine
- **Gate:** do not publish anything until baseline is captured. Without a
  before-number, week 4 is unreadable.

### Week 2 — the five FAQs
- Publish all five, one per tool page, with `FAQPage` markup
- Submit the five URLs for re-indexing
- Track: impressions and CTR for the five target queries
- **Success signal:** the pages appear for the question, not just the tool name

### Week 3 — tutorials 1 and 2
- Publish with real tool output and internal links in place
- Track: time on page, scroll depth proxy, click-through to the tool
- **Success signal:** a meaningful share of readers run a tool

### Week 4 — tutorial 3, review, and one optimisation
- Publish tutorial 3
- Review all four weeks against the day-1 baseline
- Pick the single FAQ outperforming its baseline and deepen it
- **Success signal:** ≥1 query where the FAQ page is the landing page and the
  user then runs the tool

### What "success" means here

Not traffic volume. Three specific signals:
1. Tool pages start appearing for **question-shaped queries**, not only tool names
2. Some non-trivial share of organic visitors reach a tool page from content
3. At least one tool shows a measurable organic→tool-run conversion

If none of those appear by day 30, the content thesis is wrong and should be
revisited before writing more — not scaled up.

### Explicitly not doing

- No location pages ("SEO tool in {city}")
- No "best {competitor} alternative" pages
- No AI-generated article dumps without editorial review
- No keyword-density padding. The competition on these terms is already
  low-quality; adding more of it does not win.
