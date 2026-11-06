# Baidu (百度) integration runbook

Scope: `https://www.lifeseos.com` — the only canonical host. `https://lifeseos.com`
answers 308 → `https://www.lifeseos.com/`, so it cannot pass a per-domain
ownership check without a DNS record (see §1).

## 1. Ownership / 站点验证

| Property | Status | Evidence |
|---|---|---|
| `https://www.lifeseos.com/` | verified | `<meta name="baidu-site-verification" content="codeva-GvjC1XoP41">` is rendered on every page (`app/[locale]/layout.tsx`) |
| `https://lifeseos.com/` (apex) | not verified | the apex returns 308 before any HTML is served, so Baidu never sees the meta tag |

Options for the apex, in order of least disruption:

1. **Leave it unverified and delete the property** — recommended, since the apex
   never serves content; keeping only the www property avoids duplicate-property
   reports in 资源平台.
2. **DNS TXT record** (requires DNS access — needs owner approval):
   - Baidu shows a value of the form `baidu-site-verification=<code>` in
     `ziyuan.baidu.com → 用户中心 → 站点管理 → 添加站点 → HTML标签验证 / CNAME验证`.
   - Add a `TXT` record on the apex (`@`) with exactly that value, then click
     验证 in the console. No other DNS record has to change.
3. HTML file upload — not usable while the apex redirects.

`NEXT_PUBLIC_BAIDU_VERIFY` overrides the meta-tag code without a code change.

## 2. robots.txt

`app/robots.ts` emits:

- an explicit `Baiduspider` block (allow `/`) so the crawler cannot be blocked
  by a future edit to the wildcard rule;
- disallow for `/dashboard`, `/auth`, `/admin`, `/api` and their locale variants;
- `Sitemap: https://www.lifeseos.com/sitemap.xml`.

Verify after any change:

```bash
curl -s https://www.lifeseos.com/robots.txt
curl -s -A "Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)" \
  -o /dev/null -w "%{http_code}\n" https://www.lifeseos.com/zh/tools
```

## 3. URL submission (普通收录 API)

`POST /api/baidu-push` forwards our own URLs to Baidu. It is token-gated and only
accepts URLs on the configured host, so it can never act as an open proxy.

Set in Vercel (Production + Preview), never in git:

```
BAIDU_PUSH_TOKEN=<token from ziyuan.baidu.com → 普通收录 → API 提交>
BAIDU_SITE=<optional override; only if the registered domain differs>
```

**The `site=` parameter is the bare registered domain — no scheme.**
Baidu's 平台工具使用手册 (搜索学堂, 《平台工具使用手册》§2 普通收录) uses
`site=www.example.com` / `site=www.58.com` in all four language examples, and
community reports consistently show that `site=https://…` is answered with
`{"error":400,"message":"site init fail"}`. Fix: drop the `https://`.

This matters because the console's own **接口调用地址** line displays
`http://data.zz.baidu.com/urls?site=https://<domain>&token=…`. That displayed
string is *not* accepted by the API — it is a long-standing inconsistency in the
console. Copy the token, not the whole example URL.

`BAIDU_SITE` changes only the `site=` query parameter; the route strips any
scheme, so both `lifeseos.com` and `https://lifeseos.com` end up as
`lifeseos.com`. Default comes from `NEXT_PUBLIC_SITE_URL` → `www.lifeseos.com`.
The URL allowlist stays pinned to the canonical host, so a wrong value there can
never turn the endpoint into a submitter for third-party URLs.

Check configuration:

```bash
curl -s https://www.lifeseos.com/api/baidu-push
# {"configured":true,"site":"https://www.lifeseos.com",
#  "submitSite":"www.lifeseos.com",
#  "endpoint":"http://data.zz.baidu.com/urls","maxUrlsPerRequest":50}
```

`submitSite` is the literal value sent upstream — compare it with the registered
domain in the console before submitting.

### Error responses

Baidu's documented table (same handbook page), which is what to trust over
second-hand blogs:

| Status | `message` | Meaning |
|---|---|---|
| 400 | `site error` | Site not verified in 资源平台. Verified URL, protocol and `www` must all match. |
| 400 | `empty content` | POST body empty. |
| 400 | `only 2000 urls are allowed once` | Batch too large. |
| 400 | `over quota` | Daily quota exhausted. |
| 401 | `token is not valid` | Token wrong — i.e. does not match 资源平台 for that site. |
| 404 | `not found` | Wrong接口地址 (often a stray space). |
| 500 | `internal error, please try later` | Transient. |

**Two responses we actually received are not in that table**, both HTTP 400:
`token invalid` and `site init fail`. They come from a newer validation layer
ahead of the documented one, so they must not be read as "token wrong" or
"property not initialised" respectively — `site init fail` is specifically the
scheme-in-`site` signature. Diagnose empirically (see §3.1) rather than by
analogy with the table.

### 3.1 Empty-body probe: a free pre-flight check

`empty content` is rejected before any URL is processed, so a probe with an empty
body submits nothing and consumes no quota, yet still exercises site+token
validation. **Run this before every real submission** — it is the cheapest way to
tell a token problem from a content problem, and it costs one request.

```bash
curl -s -X POST "http://data.zz.baidu.com/urls?site=www.lifeseos.com&token=<token>" \
  -H 'Content-Type:text/plain' --data-binary ''
```

Interpretation:

| Answer | Meaning |
|---|---|
| `{"error":400,"message":"empty content"}` | site+token accepted — the only thing wrong was the empty body. A real submission will go through. |
| `{"error":400,"message":"token invalid"}` | The (site, token) pair is rejected **before the body is even looked at**. Site format is not the issue when `site=` is bare; suspect the token: wrong property, wrong account, stray quote/space, or regenerated after being copied. |
| `{"error":400,"message":"site init fail"}` | `site=` probably still carries a scheme. |

Measured on 2026-11-06 with `site=www.lifeseos.com` and the then-current Preview
token: HTTP 400 `{"error":400,"message":"token invalid"}` in 957 ms. Because the
body was empty and the site string was in documented form, that is a
site+token-stage rejection, not a content or property-initialisation problem.

A rejection happens before quota accounting, so failed attempts do not consume
the daily allowance. There is **no read-only quota endpoint**; `remain` is only
returned by an accepted call.

Submit (max 50 URLs per call, deduplicated, same-host only):

```bash
curl -s -X POST https://www.lifeseos.com/api/baidu-push \
  -H "content-type: application/json" \
  -H "x-baidu-token: $BAIDU_PUSH_TOKEN" \
  -d '{"urls":["/zh/tools/seo-analyzer","/zh/blog","/zh/tools"]}'
```

Baidu answers with `success`, `remain`, `not_same_site`, `not_valid`.
**A successful submission only means the URL entered the crawl queue — it does
not confirm indexing.** Check 索引量 in 资源平台 for that.

Rate limits from Baidu apply per account per day; the endpoint caps a single
request at 50 URLs and does not retry automatically.

## 4. Monitoring procedure (weekly)

1. `ziyuan.baidu.com → 数据统计 → 索引量` — record 索引量 and its 7-day trend.
2. `数据统计 → 抓取频次 / 抓取异常` — record HTTP 5xx, 404 and robots-blocked counts.
3. `普通收录 → 提交记录` — compare submitted URLs against the sitemap.
4. Re-check the crawler head request from §2 and the sitemap URL count:

```bash
curl -s https://www.lifeseos.com/sitemap.xml | grep -c "<loc>"
```

5. Log the four numbers (提交 / 抓取 / 索引 / 异常) in the release notes.

Baidu does not expose a public, unauthenticated API for index status; anything
outside 资源平台 numbers is an estimate and must be labelled as such.

## 5. China accessibility

- Vercel's edge network has no mainland China PoP. Latency from mainland China is
  therefore consistently worse than from Hong Kong/Singapore, and some networks
  throttle or reset connections to Vercel's anycast ranges.
- **No mainland test node has been used in this repository's checks.** Until one
  is, treat mainland performance as unverified.
- Practical options, in order of effort:
  1. Keep Vercel and measure with a real mainland node (e.g. 站长工具/17ce) before
     changing anything.
  2. Put a China-facing CDN in front (Aliyun CDN / Tencent Cloud CDN) with an ICP
     filing for the domain — required by regulation before serving from mainland
     infrastructure.
  3. Mirror only the Chinese section (`/zh/*`) on a mainland host and keep the
     rest on Vercel; use `hreflang` + canonical so the two copies do not compete.
