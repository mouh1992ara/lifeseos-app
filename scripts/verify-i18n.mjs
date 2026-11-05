/**
 * Multilingual QA — en / ar / fr / zh.
 *
 * Part A (static, no browser): status, <html lang/dir>, canonical, hreflang
 * cluster correctness + reachability, and a "is this actually translated" signal.
 * Part B (Chromium via CDP): 390px mobile layouts — horizontal overflow,
 * header/mobile-nav presence, tap-target sizing, console errors, RTL direction
 * after hydration.
 *
 * Usage: node scripts/verify-i18n.mjs [baseUrl]
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = (process.argv[2] || "https://www.lifeseos.com").replace(/\/$/, "");
// Canonical/hreflang are built from NEXT_PUBLIC_SITE_URL, which stays the
// production origin even when the pages are served from localhost, so the
// expected origin is configurable and independent of the URL under test.
const ORIGIN = (process.env.EXPECTED_ORIGIN || "https://www.lifeseos.com").replace(/\/$/, "");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9341;

const LOCALES = [
  { code: "en", htmlLang: "en", dir: "ltr" },
  { code: "ar", htmlLang: "ar", dir: "rtl" },
  { code: "fr", htmlLang: "fr", dir: "ltr" },
  { code: "zh", htmlLang: "zh-Hans", dir: "ltr" },
];
const ROUTES = ["/", "/tools", "/blog", "/about"];
const MOBILE_ROUTES = ["/", "/tools", "/blog"];

let failures = 0;
const results = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function check(name, cond, detail) {
  results.push({ pass: !!cond, name, detail });
  if (cond) console.log(`  PASS  ${name}${detail ? ` — ${detail}` : ""}`);
  else {
    failures += 1;
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

const pathFor = (locale, route) => {
  const prefix = locale === "en" ? "" : `/${locale}`;
  return `${prefix}${route === "/" ? "" : route}` || "/";
};
const absolute = (locale, route) => `${ORIGIN}${pathFor(locale, route)}`.replace(/\/$/, "") || ORIGIN;
const norm = (u) => u.replace(/\/$/, "");

const attr = (html, re) => [...html.matchAll(re)].map((m) => m[1]);

/* ------------------------------------------------------------------ Part A */
async function staticChecks() {
  console.log("\nHREFLANG + CANONICAL — 4 locales x 4 routes");
  const titlesByRoute = new Map();

  for (const route of ROUTES) {
    for (const { code, htmlLang, dir } of LOCALES) {
      const url = absolute(code, route);
      let html = "";
      let status = 0;
      try {
        const res = await fetch(url, { redirect: "follow" });
        status = res.status;
        html = await res.text();
      } catch (e) {
        check(`${code}${route} responds`, false, e.message);
        continue;
      }

      check(`${code}${route} → 200`, status === 200, `${status}`);

      const htmlTag = html.match(/<html[^>]*>/i)?.[0] ?? "";
      const lang = htmlTag.match(/lang="([^"]+)"/i)?.[1];
      const dirAttr = htmlTag.match(/dir="([^"]+)"/i)?.[1];
      check(`${code}${route} <html lang dir>`, lang === htmlLang && dirAttr === dir, `lang=${lang} dir=${dirAttr}`);

      const canonicals = attr(html, /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/gi);
      check(
        `${code}${route} single self-canonical`,
        canonicals.length === 1 && norm(canonicals[0]) === norm(url),
        `${canonicals.length} @ ${canonicals[0] ?? "none"}`,
      );

      const alts = [...html.matchAll(/<link[^>]+hreflang="([^"]+)"[^>]+href="([^"]+)"/gi)].map((m) => [m[1], m[2]]);
      const map = new Map(alts);
      const expected = new Map(
        LOCALES.map((l) => [l.htmlLang, absolute(l.code, route)]).concat([["x-default", absolute("en", route)]]),
      );
      const missing = [...expected.keys()].filter((k) => !map.has(k));
      const wrong = [...expected.entries()].filter(([k, v]) => map.has(k) && norm(map.get(k)) !== norm(v));
      check(
        `${code}${route} hreflang cluster (5)`,
        missing.length === 0 && wrong.length === 0 && alts.length === 5,
        `${alts.length} tags${missing.length ? `, missing ${missing.join(",")}` : ""}${wrong.length ? `, wrong ${wrong.map(([k]) => k).join(",")}` : ""}`,
      );

      const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "";
      if (!titlesByRoute.has(route)) titlesByRoute.set(route, new Map());
      titlesByRoute.get(route).set(code, title);
    }
  }

  console.log("\nTRANSLATED CONTENT — titles differ per language");
  for (const route of ROUTES) {
    const t = titlesByRoute.get(route) ?? new Map();
    const en = t.get("en");
    const others = ["ar", "fr", "zh"].filter((c) => t.get(c));
    check(
      `${route} titles localised (not English fallback)`,
      others.length === 3 && others.every((c) => t.get(c).length > 0 && t.get(c) !== en),
      others.map((c) => `${c}: ${t.get(c)?.slice(0, 28)}`).join(" | "),
    );
  }
}

/* ------------------------------------------------------------------ Part B */
class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    ws.addEventListener("message", (m) => {
      const d = JSON.parse(m.data);
      if (d.id && this.pending.has(d.id)) {
        const { resolve, reject } = this.pending.get(d.id);
        this.pending.delete(d.id);
        d.error ? reject(new Error(JSON.stringify(d.error))) : resolve(d.result);
      } else if (d.method) this.events.push(d);
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`timeout ${method}`));
        }
      }, 40000);
    });
  }
  async evaluate(fn, ...args) {
    const expr = `(${fn.toString()})(${args.map((a) => JSON.stringify(a)).join(",")})`;
    const r = await this.send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? "eval failed");
    return r.result.value;
  }
  async goto(url) {
    this.events = [];
    await this.send("Page.navigate", { url });
    await this.waitFor("document.readyState === 'complete'");
    await sleep(800);
  }
  async waitFor(expr, timeout = 30000) {
    const start = Date.now();
    const probe = new Function(`try { return !!(${expr}); } catch(e) { return false; }`);
    while (Date.now() - start < timeout) {
      try {
        if (await this.evaluate(probe)) return true;
      } catch {}
      await sleep(120);
    }
    throw new Error(`waitFor timeout: ${expr}`);
  }
  viewport(width, height, mobile = false) {
    return this.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  }
  errors() {
    return this.events
      .filter((e) => e.method === "Runtime.consoleAPICalled" && e.params.type === "error")
      .map((e) => e.params.args.map((a) => a.value ?? a.description ?? "").join(" "))
      .filter((m) => m && !/favicon|adsbygoogle|ERR_BLOCKED|Failed to load resource/i.test(m));
  }
}

async function launchChrome() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "ls-i18n-"));
  const child = spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--proxy-bypass-list=<-loopback>",
      "--proxy-server=direct://",
      "--hide-scrollbars",
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  let target = null;
  for (let i = 0; i < 80; i += 1) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      target = list.find((t) => t.type === "page");
      if (target) break;
    } catch {}
    await sleep(150);
  }
  if (!target) throw new Error("no chrome page target");
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.addEventListener("open", res, { once: true });
    ws.addEventListener("error", rej, { once: true });
  });
  const cdp = new CDP(ws);
  cdp.child = child;
  cdp.profile = profile;
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("DOM.enable");
  return cdp;
}

/* Measured in the page at 390px */
const layoutProbe = () => {
  const vw = window.innerWidth;
  const doc = document.documentElement;
  const offenders = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.right > vw + 1.5 && r.height > 0) {
      const cs = getComputedStyle(el);
      if (cs.position === "fixed" || cs.visibility === "hidden" || cs.display === "none") continue;
      offenders.push(
        `${el.tagName.toLowerCase()}${el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : ""} right=${Math.round(r.right)}`,
      );
      if (offenders.length >= 3) break;
    }
  }
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.right > 0 && r.left < vw;
  };
  const header = document.querySelector("header");
  const headerRect = header ? header.getBoundingClientRect() : null;
  // The mobile bar is the last <nav> inside the header that is actually rendered at 390px.
  const navs = [...(header ? header.querySelectorAll("nav") : [])].filter(visible);
  const nav = navs[navs.length - 1] ?? null;
  const links = nav ? [...nav.querySelectorAll("a")].filter(visible) : [];
  const linkRects = links.map((a) => {
    const r = a.getBoundingClientRect();
    return { text: (a.textContent || "").trim().slice(0, 12), w: Math.round(r.width), h: Math.round(r.height) };
  });
  // Language switcher = the header button that owns the popover (aria-expanded).
  const langBtn = header ? header.querySelector("button[aria-expanded]") : null;
  const langRect = langBtn ? langBtn.getBoundingClientRect() : null;
  return {
    vw,
    scrollWidth: doc.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    offenders,
    headerH: headerRect ? Math.round(headerRect.height) : 0,
    navLinks: linkRects.length,
    navLink: linkRects.length ? { h: Math.min(...linkRects.map((l) => l.h)), w: Math.min(...linkRects.map((l) => l.w)) } : null,
    lang: { present: !!langBtn, h: langRect ? Math.round(langRect.height) : 0, w: langRect ? Math.round(langRect.width) : 0 },
    dir: doc.getAttribute("dir"),
    langAttr: doc.getAttribute("lang"),
    clientWidth: doc.clientWidth,
  };
};

async function mobileChecks() {
  console.log("\nMOBILE 390px — overflow, header, nav, tap targets, console");
  const cdp = await launchChrome();
  try {
    await cdp.viewport(390, 844, true);
    for (const { code, htmlLang, dir } of LOCALES) {
      const pageErrors = [];
      const overflows = [];
      let dirSeen = null;
      let langSeen = null;

      for (const route of MOBILE_ROUTES) {
        await cdp.goto(`${BASE}${pathFor(code, route)}`);
        const m = await cdp.evaluate(layoutProbe);
        if (m.scrollWidth > m.clientWidth + 1 || m.bodyScrollWidth > m.clientWidth + 1) {
          overflows.push(`${route} (doc ${m.scrollWidth}/${m.clientWidth}, body ${m.bodyScrollWidth}${m.offenders.length ? `, e.g. ${m.offenders[0]}` : ""})`);
        }
        dirSeen = dirSeen ?? m.dir;
        langSeen = langSeen ?? m.langAttr;
        pageErrors.push(...cdp.errors());
        if (route === "/") {
          check(
            `${code} 390px header + mobile nav present`,
            m.headerH >= 40 && m.navLinks >= 3,
            `header ${m.headerH}px, ${m.navLinks} nav links`,
          );
          check(
            `${code} 390px mobile nav tap targets ≥ 44px`,
            m.navLink && m.navLink.h >= 44 && m.navLink.w >= 44,
            m.navLink ? `smallest ${m.navLink.w}x${m.navLink.h}px` : "no links",
          );
          check(
            `${code} 390px language switcher ≥ 44x44`,
            m.lang.present && m.lang.h >= 44 && m.lang.w >= 44,
            m.lang.present ? `${m.lang.w}x${m.lang.h}px` : "missing",
          );
        }
      }

      check(`${code} 390px no horizontal overflow (/, /tools, /blog)`, overflows.length === 0, overflows.length ? overflows.join(",") : "3 pages clean");
      check(`${code} direction after hydration`, dirSeen === dir && langSeen === htmlLang, `dir=${dirSeen} lang=${langSeen}`);
      check(`${code} zero console errors at 390px`, pageErrors.length === 0, pageErrors.length ? pageErrors.slice(0, 2).join(" / ") : "clean");
    }
  } finally {
    try {
      cdp.child.kill("SIGKILL");
    } catch {}
    try {
      fs.rmSync(cdp.profile, { recursive: true, force: true });
    } catch {}
  }
}

(async () => {
  console.log(`\nMULTILINGUAL QA — ${BASE}\n${"=".repeat(56)}`);
  await staticChecks();
  await mobileChecks();
  console.log(`\n${results.filter((r) => r.pass).length}/${results.length} checks passed`);
  process.exit(failures === 0 ? 0 : 1);
})();
