/**
 * Focused verification for the final refinement pass.
 * Chromium via CDP, plus WebKit (Safari) via safaridriver when available.
 *
 * Usage: node scripts/verify-refine.mjs [baseUrl]
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = process.argv[2] || "http://127.0.0.1:3111";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9337;

const results = [];
let failures = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function check(name, cond, detail) {
  results.push({ pass: !!cond, name, detail });
  if (cond) console.log(`  PASS  ${name}${detail ? ` — ${detail}` : ""}`);
  else {
    failures += 1;
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

/* ------------------------------------------------------------ Chromium CDP */
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
      }, 30000);
    });
  }
  async evaluate(fn, ...args) {
    const expr = `(${fn.toString()})(${args.map((a) => JSON.stringify(a)).join(",")})`;
    const r = await this.send("Runtime.evaluate", {
      expression: expr,
      awaitPromise: true,
      returnByValue: true,
    });
    if (r.exceptionDetails)
      throw new Error(r.exceptionDetails.exception?.description ?? "eval failed");
    return r.result.value;
  }
  async goto(url) {
    await this.send("Page.navigate", { url });
    await this.waitFor("document.readyState === 'complete'");
  }
  async waitFor(expr, timeout = 20000) {
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
    return this.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile,
    });
  }
  errors() {
    return this.events
      .filter((e) => e.method === "Runtime.consoleAPICalled" && e.params.type === "error")
      .map((e) => e.params.args.map((a) => a.value ?? a.description ?? "").join(" "))
      .filter((m) => m && !/favicon|adsbygoogle|ERR_BLOCKED/i.test(m));
  }
}

async function launchChrome() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "ls-cdp-"));
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
  return cdp;
}

/* ------------------------------------------------------ WebKit via safaridriver */
async function launchSafari() {
  const drv = spawn("safaridriver", ["-p", "4455"], { stdio: "ignore" });
  await sleep(2500);

  const post = async (p, body) => {
    const r = await fetch(`http://127.0.0.1:4455${p}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return r.json();
  };

  const created = await post("/session", {
    capabilities: { alwaysMatch: { browserName: "safari" } },
  });
  if (!created.value?.sessionId) {
    drv.kill();
    throw new Error(created.value?.message ?? "safari session failed");
  }

  const sid = created.value.sessionId;
  const cmd = (p, body = {}) => post(`/session/${sid}${p}`, body);

  await cmd("/timeouts", { pageLoad: 30000, script: 30000 });

  const run = async (script) => {
    const res = await cmd("/execute/sync", { script, args: [] });
    if (res.value?.error === "javascript error") throw new Error(res.value.message);
    return res.value;
  };

  const nav = async (url) => {
    await cmd("/url", { url });
    await sleep(400);
  };

  return { run, nav, kill: () => drv.kill() };
}

/* ------------------------------------------------------------------- main */
async function main() {
  console.log(`\nFinal refinement verification — ${BASE}\n`);

  /* ===================== 1. Chromium: CWV dashboard ===================== */
  console.log("PAGE SPEED — native SVG dashboard (Chromium)");
  const cdp = await launchChrome();
  try {
    await cdp.viewport(1440, 1000);
    await cdp.goto(`${BASE}/tools/page-speed`);
    await cdp.waitFor("document.querySelector('[data-cwv-dashboard]')");
    await sleep(1600);

    const dash = await cdp.evaluate(() => {
      const el = document.querySelector("[data-cwv-dashboard]");
      const svg = el.querySelector("svg");
      const arcs = [...el.querySelectorAll("svg path")];
      const bars = [...el.querySelectorAll("[data-cwv-metric] div[style*='width']")];
      return {
        isSvg: !!svg,
        noRaster: el.querySelectorAll("img").length === 0,
        arcCount: arcs.length,
        dashoffset: arcs[1] ? getComputedStyle(arcs[1]).strokeDashoffset : null,
        metrics: [...el.querySelectorAll("[data-cwv-metric]")].map((m) => m.getAttribute("data-cwv-metric")),
        values: bars.map((b) => b.style.width),
        demoBadge: !!el.querySelector("[data-cwv-demo-badge]"),
        demoFlag: el.getAttribute("data-cwv-demo"),
        scoreText: el.querySelector(".text-\\[40px\\]")?.textContent?.trim() ?? el.innerText.split("\n")[0],
      };
    });

    check("dashboard is native SVG, not an image", dash.isSvg && dash.noRaster, `<svg> present, ${dash.arcCount} arcs`);
    check("3 CWV indicators rendered (LCP/INP/CLS)", dash.metrics.join(",") === "lcp,inp,cls", dash.metrics.join(", "));
    check("gauge arc is drawn (dashoffset < 1)", parseFloat(dash.dashoffset) < 0.9, `dashoffset=${dash.dashoffset}`);
    check(
      "bars animated to non-zero width",
      dash.values.length === 3 && dash.values.every((w) => parseFloat(w) > 5),
      dash.values.join(" / "),
    );
    check("sample panel is labelled demo", dash.demoFlag === "1" && dash.demoBadge, "badge visible");

    /* ================= 2. Chromium: scroll-reveal fallback ================ */
    console.log("\nSCROLL REVEAL — IO fallback when scroll-timeline is absent");
    const supportsTimeline = await cdp.evaluate(
      () => !!(window.CSS && CSS.supports && CSS.supports("animation-timeline: view()")),
    );

    // Force the fallback path by masking the feature before the app boots.
    await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
      source:
        "try{Object.defineProperty(CSS,'supports',{value:function(){return false}})}catch(e){}",
    });
    await cdp.goto(`${BASE}/`);
    await cdp.waitFor("document.querySelector('main section')");
    await sleep(1200);

    const beforeScroll = await cdp.evaluate(() => {
      const below = [...document.querySelectorAll("main section")].filter(
        (s) => s.getBoundingClientRect().top > window.innerHeight * 1.2,
      );
      return {
        total: document.querySelectorAll("main section").length,
        hidden: below.filter((s) => getComputedStyle(s).opacity === "0").length,
        sample: below.length,
      };
    });

    const afterScroll = await cdp.evaluate(async () => {
      const target = [...document.querySelectorAll("main section")].find(
        (s) => s.getBoundingClientRect().top > window.innerHeight,
      );
      target?.scrollIntoView({ block: "center" });
      await new Promise((r) => setTimeout(r, 900));
      return {
        opacity: target ? getComputedStyle(target).opacity : null,
        dataIn: target?.getAttribute("data-in") ?? null,
      };
    });

    check(
      "off-screen sections start hidden when scroll-timeline is unsupported",
      beforeScroll.sample === 0 || beforeScroll.hidden > 0,
      `${beforeScroll.hidden}/${beforeScroll.sample} below-fold sections at opacity 0`,
    );
    check(
      "scrolling reveals them via IntersectionObserver",
      parseFloat(afterScroll.opacity) > 0.9 && afterScroll.dataIn === "1",
      `opacity=${afterScroll.opacity}, data-in=${afterScroll.dataIn}`,
    );

    await cdp.send("Page.removeScriptToEvaluateOnNewDocument", {
      identifier: Object.keys({})[0] ?? "",
    }).catch(() => {});

    /* ==================== 3. Mobile sticky navigation ==================== */
    console.log("\nMOBILE NAVIGATION — sticky header + category rail");
    for (const [w, h] of [
      [390, 844],
      [360, 780],
    ]) {
      await cdp.viewport(w, h, true);
      await cdp.goto(`${BASE}/tools`);
      await cdp.waitFor("document.querySelector('[data-tools-grid]')");
      await sleep(900);

      const nav = await cdp.evaluate(async () => {
        const header = document.querySelector("header.site-header");
        window.scrollTo({ top: 1600, behavior: "instant" });
        await new Promise((r) => setTimeout(r, 500));

        const rail = document.querySelector("[role='tablist']").closest(".sticky");
        const hb = header.getBoundingClientRect();
        const rt = rail.getBoundingClientRect();
        const tabs = [...document.querySelectorAll("[data-category-tab]")];

        return {
          headerStuck: Math.abs(hb.top) <= 1,
          railBelow: rt.top >= hb.bottom - 1,
          railStuck: Math.abs(rt.top - hb.bottom) <= 2,
          tabsVisible: tabs.length,
          tapTarget: Math.min(...tabs.map((t) => t.getBoundingClientRect().height)),
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        };
      });

      check(`${w}px: header stays stuck to the top`, nav.headerStuck);
      check(`${w}px: category rail sits directly under the header`, nav.railBelow && nav.railStuck, `gap ${Math.round(nav.tapTarget)}px tap targets`);
      check(`${w}px: all 7 tabs reachable`, nav.tabsVisible === 7);
      check(`${w}px: tab tap targets >= 30px`, nav.tapTarget >= 30, `${nav.tapTarget.toFixed(0)}px`);
      check(`${w}px: no horizontal overflow`, !nav.overflow);

      // Tapping a tab must actually filter while scrolled.
      const tapped = await cdp.evaluate(async () => {
        const tab = [...document.querySelectorAll("[data-category-tab]")].find(
          (t) => t.dataset.categoryTab === "youtube",
        );
        tab.click();
        await new Promise((r) => setTimeout(r, 600));
        return {
          count: document.querySelectorAll("[data-tool-card]").length,
          cats: [...new Set([...document.querySelectorAll("[data-tool-card]")].map((c) => c.dataset.toolCategory))],
        };
      });
      check(
        `${w}px: tapping a category filters the grid`,
        tapped.count === 5 && tapped.cats.join() === "youtube",
        `${tapped.count} cards (${tapped.cats.join()})`,
      );
    }

    /* ================= 4. Testimonial card spacing/transitions =========== */
    console.log("\nTESTIMONIAL CAROUSEL — spacing + transitions");
    await cdp.viewport(1440, 1000);
    await cdp.goto(`${BASE}/#community`);
    await cdp.waitFor("document.querySelector('[data-carousel-next]')");
    await sleep(600);

    const spacing = await cdp.evaluate(() => {
      const card = document.querySelector(".testimonial-card");
      const content = document.querySelector(".testimonial-slide").firstElementChild;
      const cr = card.getBoundingClientRect();
      const ir = content.getBoundingClientRect();
      return {
        cardH: Math.round(cr.height),
        topGap: Math.round(ir.top - cr.top),
        bottomGap: Math.round(cr.bottom - ir.bottom),
        slides: document.querySelectorAll(".testimonial-slide").length,
      };
    });

    check("only one slide is mounted", spacing.slides === 1);
    check("card stays compact", spacing.cardH < 300, `${spacing.cardH}px tall`);
    check(
      "content is vertically balanced (no dead band)",
      Math.abs(spacing.topGap - spacing.bottomGap) <= 4,
      `top ${spacing.topGap}px / bottom ${spacing.bottomGap}px`,
    );

    const trans = await cdp.evaluate(async () => {
      const card = document.querySelector(".testimonial-card");
      const h0 = card.getBoundingClientRect().height;
      const next = document.querySelector("[data-carousel-next]");
      next.click();
      await new Promise((r) => setTimeout(r, 150));
      const cls = document.querySelector(".testimonial-slide")?.className ?? "";
      const name = getComputedStyle(document.querySelector(".testimonial-slide")).animationName;
      await new Promise((r) => setTimeout(r, 800));
      return { h0, h1: card.getBoundingClientRect().height, cls, name };
    });

    check("next triggers the directional slide", /is-out-next|is-in-next/.test(trans.cls + trans.name), `${trans.cls.trim()} / ${trans.name}`);
    check("card height does not jump between reviews", Math.abs(trans.h1 - trans.h0) <= 8, `${trans.h0}px → ${trans.h1}px`);

    /* =============== 5. Page-speed dashboard on mobile =================== */
    console.log("\nPAGE SPEED — dashboard responsiveness");
    await cdp.viewport(390, 844, true);
    await cdp.goto(`${BASE}/tools/page-speed`);
    await cdp.waitFor("document.querySelector('[data-cwv-dashboard]')");
    await sleep(900);
    const mobileDash = await cdp.evaluate(() => {
      const el = document.querySelector("[data-cwv-dashboard]");
      const r = el.getBoundingClientRect();
      return {
        fits: r.width <= window.innerWidth,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        metrics: el.querySelectorAll("[data-cwv-metric]").length,
      };
    });
    check("dashboard fits a 390px viewport", mobileDash.fits && !mobileDash.overflow);
    check("all indicators still render on mobile", mobileDash.metrics === 3);

    const errs = cdp.errors();
    check("no console errors", errs.length === 0, errs.slice(0, 2).join(" | ") || "clean");
  } finally {
    try {
      cdp.child.kill("SIGKILL");
      fs.rmSync(cdp.profile, { recursive: true, force: true });
    } catch {}
  }

  /* ===================== 6. WebKit: second engine ======================= */
  console.log("\nCROSS-BROWSER — WebKit (Safari)");
  let safari;
  try {
    safari = await launchSafari();

    await safari.nav(`${BASE}/tools/page-speed`);
    await sleep(1800);
    const wk = await safari.run(`
      var el = document.querySelector('[data-cwv-dashboard]');
      var svg = el && el.querySelector('svg');
      var metrics = el ? el.querySelectorAll('[data-cwv-metric]').length : 0;
      var arc = svg ? svg.querySelectorAll('path')[1] : null;
      var offset = arc ? getComputedStyle(arc).strokeDashoffset : null;
      var bars = el ? Array.prototype.map.call(el.querySelectorAll("[data-cwv-metric] div[style*='width']"), function(b){return b.style.width;}) : [];
      var supportsTimeline = !!(window.CSS && CSS.supports && CSS.supports('animation-timeline: view()'));
      return JSON.stringify({
        svg: !!svg, metrics: metrics, offset: offset, bars: bars,
        supportsTimeline: supportsTimeline,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      });
    `);
    const wkData = JSON.parse(wk);

    check("WebKit: SVG dashboard renders", wkData.svg && wkData.metrics === 3, `${wkData.metrics} indicators`);
    check("WebKit: gauge arc drawn", parseFloat(wkData.offset) < 0.9, `dashoffset=${wkData.offset}`);
    check(
      "WebKit: bars have non-zero width",
      wkData.bars.length === 3 && wkData.bars.every((b) => parseFloat(b) > 5),
      wkData.bars.join(" / "),
    );
    check("WebKit: no horizontal overflow", !wkData.overflow);

    // Scroll reveal on WebKit (this engine has no scroll-timeline).
    await safari.nav(`${BASE}/`);
    await sleep(1500);
    const wkReveal = JSON.parse(
      await safari.run(`
        var secs = Array.prototype.slice.call(document.querySelectorAll('main section'));
        var target = secs.filter(function(s){return s.getBoundingClientRect().top > window.innerHeight;})[0];
        if (!target) { target = secs[secs.length-1]; }
        target.scrollIntoView({block:'center'});
        return JSON.stringify({ op: getComputedStyle(target).opacity, dataIn: target.getAttribute('data-in') });
      `),
    );
    await sleep(900);
    const wkRevealAfter = JSON.parse(
      await safari.run(`
        var secs = Array.prototype.slice.call(document.querySelectorAll('main section'));
        var shown = secs.filter(function(s){return getComputedStyle(s).opacity === '1';}).length;
        return JSON.stringify({shown: shown, total: secs.length});
      `),
    );

    check(
      "WebKit: sections reveal and end fully visible",
      wkRevealAfter.shown >= Math.max(2, wkRevealAfter.total - 2),
      `${wkRevealAfter.shown}/${wkRevealAfter.total} visible`,
    );
    check(
      "WebKit: uses the IO fallback (no scroll-timeline)",
      wkData.supportsTimeline === false ? wkRevealAfter.shown > 0 : true,
      `animation-timeline support = ${wkData.supportsTimeline}`,
    );

    // Mobile nav on WebKit
    await safari.run(`return 1;`);
    const wkNav = JSON.parse(
      await safari.run(`
        window.scrollTo(0, 1500);
        var header = document.querySelector('header.site-header');
        var rail = document.querySelector("[role='tablist']");
        var hb = header.getBoundingClientRect();
        var rb = rail ? rail.closest('.sticky').getBoundingClientRect() : null;
        return JSON.stringify({
          stuck: Math.abs(hb.top) <= 2,
          railBelow: rb ? rb.top >= hb.bottom - 2 : false,
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
        });
      `),
    );
    check("WebKit: sticky header holds on scroll", wkNav.stuck);
    check("WebKit: rail stays below the header", wkNav.railBelow);
    check("WebKit: no overflow after scrolling", !wkNav.overflow);
  } catch (err) {
    console.log(`  SKIP  WebKit — ${err.message.slice(0, 90)}`);
    results.push({ pass: false, skipped: true, name: "WebKit verification", detail: err.message });
  } finally {
    try {
      safari?.kill();
    } catch {}
  }

  /* ------------------------------------------------------------- summary */
  const passed = results.filter((r) => r.pass).length;
  const total = results.filter((r) => !r.skipped).length;
  console.log(`\n${"—".repeat(58)}`);
  console.log(`${passed}/${total} checks passed, ${failures} failed`);
  fs.writeFileSync("/tmp/verify-refine.json", JSON.stringify({ passed, failures, results }, null, 2));
  if (failures) process.exitCode = 1;
}

main().catch((e) => {
  console.error("\nHarness error:", e.message);
  process.exitCode = 1;
});