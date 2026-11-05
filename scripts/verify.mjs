/**
 * CDP verification harness.
 *
 * Drives a real headless Chrome over the DevTools protocol (no extra deps: Node
 * 22 ships a global WebSocket) and asserts on measured DOM values — geometry,
 * computed styles, animation state. Nothing here trusts a screenshot.
 *
 * Usage: node scripts/verify.mjs [baseUrl]
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = process.argv[2] || "http://localhost:3111";
const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9333;

const results = [];
let failures = 0;

function ok(name, detail) {
  results.push({ pass: true, name, detail });
  console.log(`  PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail) {
  failures += 1;
  results.push({ pass: false, name, detail });
  console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
}

function check(name, condition, detail) {
  if (condition) ok(name, detail);
  else fail(name, detail);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ browser */
class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    ws.addEventListener("message", (msg) => {
      const data = JSON.parse(msg.data);
      if (data.id && this.pending.has(data.id)) {
        const { resolve, reject } = this.pending.get(data.id);
        this.pending.delete(data.id);
        if (data.error) reject(new Error(JSON.stringify(data.error)));
        else resolve(data.result);
      } else if (data.method) {
        this.events.push(data);
      }
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
          reject(new Error(`timeout: ${method}`));
        }
      }, 30000);
    });
  }

  async evaluate(fn, ...args) {
    const expr = `(${fn.toString()})(${args.map((a) => JSON.stringify(a)).join(",")})`;
    const res = await this.send("Runtime.evaluate", {
      expression: expr,
      awaitPromise: true,
      returnByValue: true,
    });
    if (res.exceptionDetails) {
      throw new Error(
        `eval failed: ${res.exceptionDetails.exception?.description ?? JSON.stringify(res.exceptionDetails)}`,
      );
    }
    return res.result.value;
  }

  async goto(url) {
    await this.send("Page.navigate", { url });
    await this.waitFor("document.readyState === 'complete'");
  }

  async waitFor(expression, timeout = 20000) {
    const start = Date.now();
    // `returnByValue` cannot serialise a DOM node, so every probe is coerced to
    // a boolean before it crosses the protocol boundary.
    const probe = new Function(`try { return !!(${expression}); } catch (e) { return false; }`);
    while (Date.now() - start < timeout) {
      try {
        const v = await this.evaluate(probe);
        if (v) return true;
      } catch {
        /* page still navigating */
      }
      await sleep(120);
    }
    throw new Error(`waitFor timeout: ${expression}`);
  }

  async viewport(width, height, mobile = false) {
    await this.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile,
    });
  }

  async consoleErrors() {
    return this.events
      .filter((e) => e.method === "Runtime.consoleAPICalled")
      .filter((e) => e.params.type === "error")
      .map((e) =>
        e.params.args.map((a) => a.value ?? a.description ?? "").join(" "),
      )
      .filter((m) => m && !/favicon|adsbygoogle|ERR_BLOCKED/i.test(m));
  }
}

async function launch() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "ls-cdp-"));
  const child = spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "--no-default-browser-check",
      // This sandboxed CI-like environment does not grant Chrome's own sandbox
      // the privileges it needs; disabling it is what makes the harness run at
      // all. It only ever loads localhost.
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-software-rasterizer",
      "--disable-extensions",
      // The environment sets HTTP(S)_PROXY for outbound traffic. Chrome must
      // not send localhost through it, or the local server looks unreachable.
      "--proxy-bypass-list=<-loopback>",
      "--proxy-server=direct://",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "about:blank",
    ],
    { stdio: "ignore", detached: false },
  );

  let target = null;
  for (let i = 0; i < 80; i += 1) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await r.json();
      target = list.find((t) => t.type === "page");
      if (target) break;
    } catch {
      /* not up yet */
    }
    await sleep(150);
  }
  if (!target) throw new Error("Chrome did not expose a page target");

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });

  const cdp = new CDP(ws);
  cdp.child = child;
  cdp.profile = profile;
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  return cdp;
}

async function main() {
  console.log(`\nLifeSeos verification — ${BASE}\n`);
  const cdp = await launch();

  try {
    /* ================================================================= HERO */
    console.log("HOMEPAGE — radial SEO composition");
    await cdp.viewport(1440, 900);
    await cdp.goto(`${BASE}/`);
    await cdp.waitFor("document.querySelector('[data-radial]')");
    // Let the 1.85s sequence finish.
    await sleep(2400);

    const radial = await cdp.evaluate(() => {
      const wrap = document.querySelector("[data-radial]");
      const nodes = [...document.querySelectorAll("[data-radial-node]")];
      const box = wrap.getBoundingClientRect();
      const centre = { x: box.left + box.width / 2, y: box.top + box.height / 2 };

      const items = nodes.map((n) => {
        const r = n.getBoundingClientRect();
        return {
          key: n.dataset.radialNode,
          cx: r.left + r.width / 2 - centre.x,
          cy: r.top + r.height / 2 - centre.y,
          w: r.width,
          h: r.height,
          href: n.getAttribute("href"),
        };
      });

      // Distance + angle of each icon from the hub.
      const polar = items.map((i) => ({
        key: i.key,
        r: Math.hypot(i.cx, i.cy),
        deg: (Math.atan2(i.cy, i.cx) * 180) / Math.PI,
      }));

      // Overlap test between icon boxes.
      let overlaps = 0;
      for (let a = 0; a < items.length; a += 1) {
        for (let b = a + 1; b < items.length; b += 1) {
          const A = items[a];
          const B = items[b];
          if (
            Math.abs(A.cx - B.cx) < (A.w + B.w) / 2 - 1 &&
            Math.abs(A.cy - B.cy) < (A.h + B.h) / 2 - 1
          ) {
            overlaps += 1;
          }
        }
      }

      const arrows = [...document.querySelectorAll(".radial-arrow:not([data-halo])")];
      const offsets = arrows.map((p) => getComputedStyle(p).strokeDashoffset);

      return {
        count: items.length,
        polar,
        overlaps,
        container: { w: box.width, h: box.height },
        arrowOffsets: offsets,
        offsets: items.map((i) => i.href),
        done: wrap.getAttribute("data-done"),
      };
    });

    check("8 discipline icons render", radial.count === 8, `${radial.count} nodes`);

    const radii = radial.polar.map((p) => p.r);
    const rMin = Math.min(...radii);
    const rMax = Math.max(...radii);
    check(
      "all icons sit on one ring (radius spread < 2px)",
      rMax - rMin < 2,
      `r = ${rMin.toFixed(1)}…${rMax.toFixed(1)}px`,
    );

    // Symmetry: opposite icons are 180° apart, neighbours 45°.
    const degs = radial.polar.map((p) => ((p.deg + 360) % 360)).sort((a, b) => a - b);
    const gaps = degs.map((d, i) => {
      const next = degs[(i + 1) % degs.length];
      return (next - d + 360) % 360;
    });
    const gapErr = Math.max(...gaps.map((g) => Math.abs(g - 45)));
    check(
      "even 45° spacing around the ring",
      gapErr < 1,
      `max gap error ${gapErr.toFixed(2)}°`,
    );

    check("no icon overlaps another", radial.overlaps === 0, `${radial.overlaps} overlaps`);

    check(
      "arrows fully drawn after the sequence",
      radial.arrowOffsets.every((o) => parseFloat(o) === 0),
      `offsets: ${[...new Set(radial.arrowOffsets)].join(", ")}`,
    );

    check("sequence reached its end state", radial.done === "1", `data-done=${radial.done}`);

    // Arrows must terminate at their icon, not short of it.
    const arrowEnds = await cdp.evaluate(() => {
      const wrap = document.querySelector("[data-radial]");
      const svg = wrap.querySelector("svg");
      const nodes = [...document.querySelectorAll("[data-radial-node]")];
      const box = wrap.getBoundingClientRect();
      const vb = svg.viewBox.baseVal;
      const scale = box.width / vb.width;

      return nodes.map((n) => {
        const key = n.dataset.radialNode;
        const circles = [...svg.querySelectorAll("circle.radial-tip")];
        const g = svg.querySelectorAll("g");
        let tip = null;
        // Tips are emitted per node group in source order.
        const index = [...svg.querySelectorAll("g")].findIndex((grp) =>
          grp.querySelector(".radial-tip"),
        );
        // Use the node index to pick the matching group by position instead.
        const allTips = [...svg.querySelectorAll(".radial-tip")];
        const nodeIndex = nodes.findIndex((x) => x.dataset.radialNode === key);
        tip = allTips[nodeIndex];
        if (!tip) return null;

        const cx = parseFloat(tip.getAttribute("cx"));
        const cy = parseFloat(tip.getAttribute("cy"));

        // Convert to the same centre-relative px space as the icon boxes.
        const tipX = (cx - vb.width / 2) * scale;
        const tipY = (cy - vb.height / 2) * scale;

        const r = n.getBoundingClientRect();
        const iconX = r.left + r.width / 2 - (box.left + box.width / 2);
        const iconY = r.top + r.height / 2 - (box.top + box.height / 2);

        return {
          key,
          distance: Math.hypot(tipX - iconX, tipY - iconY),
          edgeGap: Math.hypot(tipX - iconX, tipY - iconY) - r.width / 2,
        };
      });
    });

    const worst = Math.max(...arrowEnds.filter(Boolean).map((a) => Math.abs(a.edgeGap)));
    check(
      "each arrow stops just outside its icon (gap < 12px)",
      worst < 12,
      `worst edge gap ${worst.toFixed(1)}px`,
    );

    check(
      "every icon links to a real tool",
      radial.offsets.every((h) => h && h.startsWith("/tools/")),
      radial.offsets.slice(0, 3).join(", ") + "…",
    );

    // Responsive: repeat the geometry test at tablet and phone widths.
    console.log("\nHOMEPAGE — radial at other widths");
    for (const [w, h, label] of [
      [834, 1000, "tablet 834"],
      [390, 844, "phone 390"],
    ]) {
      await cdp.viewport(w, h, true);
      await cdp.goto(`${BASE}/`);
      await cdp.waitFor("document.querySelector('[data-radial]')");
      await sleep(2300);

      const g = await cdp.evaluate(() => {
        const wrap = document.querySelector("[data-radial]");
        const box = wrap.getBoundingClientRect();
        const centre = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
        const nodes = [...document.querySelectorAll("[data-radial-node]")];
        const items = nodes.map((n) => {
          const r = n.getBoundingClientRect();
          return {
            cx: r.left + r.width / 2 - centre.x,
            cy: r.top + r.height / 2 - centre.y,
            w: r.width,
            h: r.height,
            left: r.left,
            right: r.right,
          };
        });
        let overlaps = 0;
        for (let a = 0; a < items.length; a += 1) {
          for (let b = a + 1; b < items.length; b += 1) {
            const A = items[a];
            const B = items[b];
            if (
              Math.abs(A.cx - B.cx) < (A.w + B.w) / 2 - 1 &&
              Math.abs(A.cy - B.cy) < (A.h + B.h) / 2 - 1
            )
              overlaps += 1;
          }
        }
        return {
          overlaps,
          ringSpread:
            Math.max(...items.map((i) => Math.hypot(i.cx, i.cy))) -
            Math.min(...items.map((i) => Math.hypot(i.cx, i.cy))),
          outOfBounds: items.filter((i) => i.left < -2 || i.right > window.innerWidth + 2).length,
          nodeSize: items[0]?.w ?? 0,
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        };
      });

      check(`${label}: no icon overlap`, g.overlaps === 0, `${g.overlaps} overlaps`);
      check(
        `${label}: still one ring`,
        g.ringSpread < 2,
        `spread ${g.ringSpread.toFixed(1)}px, icon ${g.nodeSize.toFixed(0)}px`,
      );
      check(`${label}: icons inside the viewport`, g.outOfBounds === 0, `${g.outOfBounds} outside`);
      check(`${label}: no horizontal page overflow`, !g.overflow);
    }

    /* ============================================================== COUNTERS */
    console.log("\nHOMEPAGE — counters and chart");
    await cdp.viewport(1440, 900);
    await cdp.goto(`${BASE}/`);
    await sleep(600);

    const counters = await cdp.evaluate(async () => {
      // Scroll the KPI row into view so the counter starts on its observer,
      // not on the safety timer — this is the path a visitor actually takes.
      const section = document.querySelector("#analytics");
      section.scrollIntoView({ block: "center" });
      await new Promise((r) => setTimeout(r, 260));

      const readAll = () =>
        [...section.querySelectorAll("[class*='tabular-nums']")].map((n) =>
          n.textContent.trim(),
        );

      const atStart = readAll();
      await new Promise((r) => setTimeout(r, 1900));
      const atEnd = readAll();
      return { atStart, atEnd };
    });

    const counterMoved = counters.atEnd.some((v, i) => v !== counters.atStart[i]);
    const zeroStart = counters.atStart.some((v) => /^0(\.0+)?/.test(v));

    check(
      "KPI counters count up from zero once visible",
      counterMoved,
      `${counters.atStart.slice(0, 2).join(" → ")} … then ${counters.atEnd.slice(0, 2).join(" → ")}`,
    );
    check(
      "counters begin at zero, not at their final value",
      zeroStart,
      counters.atStart.join(" | "),
    );

    const chart = await cdp.evaluate(async () => {
      const box = document.querySelector("[data-drawn]");
      box?.scrollIntoView();
      await new Promise((r) => setTimeout(r, 2200));
      const drawn = box?.getAttribute("data-drawn");
      const line = document.querySelector(".chart-line");
      const offset = line ? getComputedStyle(line).strokeDashoffset : null;
      return { drawn, offset };
    });

    check(
      "chart draws itself in view",
      chart.drawn === "true" && parseFloat(chart.offset) < 5,
      `data-drawn=${chart.drawn}, dashoffset=${chart.offset}`,
    );

    /* ============================================================ CAROUSEL */
    console.log("\nHOMEPAGE — testimonial carousel");
    await cdp.goto(`${BASE}/#community`);
    await cdp.waitFor("document.querySelector('[data-carousel-next]')");

    const carousel = await cdp.evaluate(async () => {
      const slides = () => document.querySelectorAll(".testimonial-slide").length;
      const card = document.querySelector(".testimonial-card");
      const dotOn = () =>
        [...document.querySelectorAll("[data-carousel-dot]")].findIndex(
          (d) => d.getAttribute("aria-selected") === "true",
        );
      const pos = () => document.querySelector("[data-carousel-position]").textContent;

      const before = { slides: slides(), dot: dotOn(), pos: pos(), h: card.getBoundingClientRect().height };

      // Next
      document.querySelector("[data-carousel-next]").click();
      await new Promise((r) => setTimeout(r, 220));
      const midClass = document.querySelector(".testimonial-slide")?.className ?? "";
      await new Promise((r) => setTimeout(r, 700));
      const afterNext = { slides: slides(), dot: dotOn(), pos: pos() };

      // Previous
      document.querySelector("[data-carousel-prev]").click();
      await new Promise((r) => setTimeout(r, 220));
      const prevClass = document.querySelector(".testimonial-slide")?.className ?? "";
      await new Promise((r) => setTimeout(r, 700));
      const afterPrev = { slides: slides(), dot: dotOn(), pos: pos() };

      return { before, midClass, afterNext, prevClass, afterPrev, cardH: card.getBoundingClientRect().height };
    });

    check(
      "exactly one testimonial is mounted",
      carousel.before.slides === 1,
      `${carousel.before.slides} slides in the DOM`,
    );

    check(
      "next advances the index",
      carousel.afterNext.dot === carousel.before.dot + 1,
      `dot ${carousel.before.dot} → ${carousel.afterNext.dot}`,
    );

    check(
      "next slides out toward the inline-end",
      carousel.midClass.includes("is-out-next"),
      carousel.midClass.trim(),
    );

    check(
      "previous slides the other way",
      carousel.prevClass.includes("is-out-prev"),
      carousel.prevClass.trim(),
    );

    check(
      "previous returns to the starting review",
      carousel.afterPrev.dot === carousel.before.dot,
      `dot ${carousel.afterPrev.dot}`,
    );

    check(
      "position counter tracks the index",
      /2/.test(carousel.afterNext.pos) || /1/.test(carousel.afterPrev.pos),
      `${carousel.before.pos} → ${carousel.afterNext.pos} → ${carousel.afterPrev.pos}`,
    );

    check(
      "card stays compact (no vertical stacking)",
      carousel.cardH < 420,
      `${carousel.cardH.toFixed(0)}px tall`,
    );

    // Autoplay pause on hover
    const autoplay = await cdp.evaluate(async () => {
      const shell = document.querySelector("[data-carousel-dot]").closest("[role='group']");
      const pos = () => document.querySelector("[data-carousel-position]").textContent;
      const before = pos();

      shell.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      await new Promise((r) => setTimeout(r, 7600));
      const during = pos();
      shell.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
      return { before, during };
    });

    check(
      "autoplay pauses while hovered",
      autoplay.before === autoplay.during,
      `${autoplay.before} → ${autoplay.during} after 7.6s hovered`,
    );

    // RTL direction
    await cdp.goto(`${BASE}/ar`);
    await cdp.waitFor("document.querySelector('[data-carousel-next]')");
    const rtl = await cdp.evaluate(async () => {
      const dir = document.documentElement.getAttribute("dir");
      document.querySelector("[data-carousel-next]").click();
      await new Promise((r) => setTimeout(r, 240));
      const cls = document.querySelector(".testimonial-slide")?.className ?? "";
      const name = getComputedStyle(document.querySelector(".testimonial-slide")).animationName;
      return { dir, cls, name };
    });

    check(
      "Arabic page is RTL and the carousel picks the mirrored animation",
      rtl.dir === "rtl" && rtl.name.startsWith("tcard-out-prev"),
      `dir=${rtl.dir}, animation=${rtl.name}`,
    );

    /* =============================================================== TOOLS */
    console.log("\nTOOLS PAGE");
    await cdp.viewport(1440, 900);
    await cdp.goto(`${BASE}/tools`);
    await cdp.waitFor("document.querySelector('[data-tools-grid]')");
    await sleep(900);

    const toolsBase = await cdp.evaluate(() => {
      const cards = [...document.querySelectorAll("[data-tool-card]")];
      return {
        cards: cards.length,
        tabs: document.querySelectorAll("[data-category-tab]").length,
        allEntered: cards.every((c) => c.getAttribute("data-in") === "1"),
        hrefs: cards.map((c) => c.getAttribute("href")),
        count: document.querySelector("[data-result-count]")?.textContent ?? "",
      };
    });

    check("all 17 tools render", toolsBase.cards === 17, `${toolsBase.cards} cards`);
    check("7 category tabs present", toolsBase.tabs === 7, `${toolsBase.tabs} tabs`);
    check(
      "cards finished their staggered entrance",
      toolsBase.allEntered,
      "every card data-in=1",
    );
    check(
      "every card links to a real tool route",
      toolsBase.hrefs.every((h) => /\/tools\/[a-z-]+$/.test(h)),
      toolsBase.hrefs.slice(0, 2).join(", ") + "…",
    );

    // Category filtering
    const filtered = await cdp.evaluate(async () => {
      const perf = [...document.querySelectorAll("[data-category-tab]")].find(
        (t) => t.dataset.categoryTab === "performance",
      );
      perf.click();
      await new Promise((r) => setTimeout(r, 600));
      const cards = [...document.querySelectorAll("[data-tool-card]")];
      return {
        count: cards.length,
        cats: cards.map((c) => c.dataset.toolCategory),
        selected: perf.getAttribute("aria-selected"),
        countText: document.querySelector("[data-result-count]")?.textContent ?? "",
      };
    });

    check(
      "Performance tab filters to performance tools only",
      filtered.count > 0 && filtered.count < 17,
      `${filtered.count} cards: ${[...new Set(filtered.cats)].join(",")}`,
    );
    check("selected tab is marked", filtered.selected === "true");

    // Search
    const searched = await cdp.evaluate(async () => {
      // Reset first
      [...document.querySelectorAll("[data-category-tab]")].find(
        (t) => t.dataset.categoryTab === "all",
      ).click();
      await new Promise((r) => setTimeout(r, 400));

      const input = document.querySelector("input[type='search']");
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      ).set;
      setter.call(input, "sitemap");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await new Promise((r) => setTimeout(r, 600));

      const cards = [...document.querySelectorAll("[data-tool-card]")];
      return {
        values: cards.map((c) => c.dataset.toolCard),
        count: cards.length,
      };
    });

    check(
      "searching “sitemap” finds the sitemap tool",
      searched.values.includes("xmlSitemapGenerator"),
      `matches: ${searched.values.join(", ")}`,
    );

    const empty = await cdp.evaluate(async () => {
      const input = document.querySelector("input[type='search']");
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      ).set;
      setter.call(input, "zzzznothing");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await new Promise((r) => setTimeout(r, 500));
      return {
        emptyShown: !!document.querySelector("[data-tools-empty]"),
        cards: document.querySelectorAll("[data-tool-card]").length,
      };
    });

    check(
      "empty state replaces the grid when nothing matches",
      empty.emptyShown && empty.cards === 0,
      `empty=${empty.emptyShown}, cards=${empty.cards}`,
    );

    // Search by category name
    const byCategory = await cdp.evaluate(async () => {
      const input = document.querySelector("input[type='search']");
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      ).set;
      setter.call(input, "youtube");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await new Promise((r) => setTimeout(r, 500));
      return document.querySelectorAll("[data-tool-card]").length;
    });

    check(
      "searching a category name returns that category",
      byCategory === 5,
      `${byCategory} YouTube tools`,
    );

    // Mobile tools layout
    await cdp.viewport(390, 844, true);
    await cdp.goto(`${BASE}/tools`);
    await cdp.waitFor("document.querySelector('[data-tool-card]')");
    await sleep(800);
    const toolsMobile = await cdp.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      cards: document.querySelectorAll("[data-tool-card]").length,
      oneColumn:
        document.querySelector("[data-tools-grid]").getBoundingClientRect().width < 400,
    }));
    check("tools page: no horizontal overflow on phone", !toolsMobile.overflow);
    check("tools page: cards still render on phone", toolsMobile.cards === 17);

    /* Sticky rail must clear the (taller) mobile header. */
    for (const [w, h, label] of [
      [1440, 900, "desktop"],
      [390, 844, "phone"],
    ]) {
      await cdp.viewport(w, h, w < 800);
      await cdp.goto(`${BASE}/tools`);
      await cdp.waitFor("document.querySelector('[data-tools-grid]')");
      await sleep(700);

      const stick = await cdp.evaluate(async () => {
        window.scrollTo({ top: 1400, behavior: "instant" });
        await new Promise((r) => setTimeout(r, 400));

        const header = document.querySelector("header.site-header");
        const rail = document.querySelector("[role='tablist']").closest(".sticky");
        return {
          headerBottom: header.getBoundingClientRect().bottom,
          railTop: rail.getBoundingClientRect().top,
          headerH: Math.round(header.getBoundingClientRect().height),
          varValue: getComputedStyle(document.documentElement).getPropertyValue("--header-h").trim(),
        };
      });

      check(
        `${label}: sticky category rail sits below the header`,
        stick.railTop >= stick.headerBottom - 1,
        `rail top ${stick.railTop.toFixed(0)}px vs header bottom ${stick.headerBottom.toFixed(0)}px (--header-h=${stick.varValue})`,
      );
    }

    /* ================================================================ AUTH */
    console.log("\nAUTH");
    await cdp.viewport(1440, 900);
    await cdp.goto(`${BASE}/auth/sign-up`);
    await cdp.waitFor("document.querySelector('#fullName')");

    const signup = await cdp.evaluate(async () => {
      const input = document.querySelector("#password");
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      ).set;
      setter.call(input, "abc");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await new Promise((r) => setTimeout(r, 200));
      const weak = document.querySelector("#password-strength").textContent;

      setter.call(input, "Str0ng!Passw0rd");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await new Promise((r) => setTimeout(r, 200));
      const strong = document.querySelector("#password-strength").textContent;

      // Show/hide toggle
      const toggle = [...document.querySelectorAll("button[aria-pressed]")].find(
        (b) => b.getAttribute("aria-pressed") !== "null" && b.closest(".relative"),
      );
      const typeBefore = input.type;
      toggle?.click();
      await new Promise((r) => setTimeout(r, 150));
      const typeAfter = input.type;

      return {
        weak: weak.replace(/\s+/g, " ").trim().slice(0, 80),
        strong: strong.replace(/\s+/g, " ").trim().slice(0, 80),
        typeBefore,
        typeAfter,
        hasTerms: !!document.querySelector("input[type='checkbox'][required]"),
        termsLinks: [...document.querySelectorAll("a[href*='terms'], a[href*='privacy']")].length,
        submitDisabled: document.querySelector("button[type='submit']")?.disabled,
      };
    });

    check(
      "password strength reacts to input",
      signup.weak !== signup.strong,
      `“${signup.weak}” vs “${signup.strong}”`,
    );
    check(
      "show/hide password toggles the input type",
      signup.typeBefore === "password" && signup.typeAfter === "text",
      `${signup.typeBefore} → ${signup.typeAfter}`,
    );
    check("terms checkbox is required", signup.hasTerms);
    check(
      "terms and privacy are real links",
      signup.termsLinks >= 2,
      `${signup.termsLinks} links`,
    );

    // The consent line must render real sentences with real link text. A broken
    // rich-text message renders as "I agree to the and the ." — this catches it.
    const termsCopy = await cdp.evaluate(() => {
      const label = document.querySelector("input[type='checkbox'][required]")?.closest("label");
      const text = (label?.textContent ?? "").replace(/\s+/g, " ").trim();
      const links = [...(label?.querySelectorAll("a") ?? [])].map((a) => ({
        text: a.textContent.trim(),
        href: a.getAttribute("href"),
      }));
      return { text, links };
    });

    check(
      "consent sentence reads correctly (no empty placeholders)",
      termsCopy.text.length > 30 &&
        !/\bthe\s+(and|\.|$)/i.test(termsCopy.text) &&
        !/wor\s|Placeholder/i.test(termsCopy.text),
      `“${termsCopy.text.slice(0, 64)}…”`,
    );
    check(
      "consent links carry their own visible labels",
      termsCopy.links.length >= 2 &&
        termsCopy.links.every((l) => l.text.length > 3 && l.href),
      termsCopy.links.map((l) => `${l.text}→${l.href}`).join(", "),
    );

    // Blocked submission without consent
    const blocked = await cdp.evaluate(async () => {
      const form = document.querySelector("form");
      form.requestSubmit();
      await new Promise((r) => setTimeout(r, 400));
      return {
        alert: document.querySelector("[role='alert']")?.textContent?.trim() ?? null,
        url: location.pathname,
      };
    });

    check(
      "submitting without consent is refused in-page",
      blocked.url.includes("/auth/sign-up"),
      `still on ${blocked.url}`,
    );

    // Sign-up shows the verification screen (no fake success)
    const verifyFlow = await cdp.evaluate(async () => {
      // A unique address per run, so repeated local runs do not collide.
      const email = `probe.${Date.now()}@example.com`;
      const input = document.querySelector("#email");
      const eset = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      ).set;
      eset.call(input, email);
      input.dispatchEvent(new Event("input", { bubbles: true }));

      const pw = document.querySelector("#password");
      const pset = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      ).set;
      pset.call(pw, "Str0ng!Passw0rd");
      pw.dispatchEvent(new Event("input", { bubbles: true }));

      const repeat = document.querySelector("#repeat");
      pset.call(repeat, "Str0ng!Passw0rd");
      repeat.dispatchEvent(new Event("input", { bubbles: true }));

      document.querySelector("input[type='checkbox'][required]").click();

      document.querySelector("form").requestSubmit();
      await new Promise((r) => setTimeout(r, 4000));

      return {
        url: location.pathname + location.search,
        alert: document.querySelector("[role='alert']")?.textContent?.trim() ?? null,
        email,
      };
    });

    // Two acceptable outcomes, both real: the backend accepted the sign-up and
    // sent a verification mail (→ /auth/verify), or it refused (rate limit,
    // invalid project key) and the form shows the backend's own message. What
    // must never happen is a screen claiming "account created" with no backend.
    const accepted = /\/auth\/verify/.test(verifyFlow.url);
    check(
      "sign-up either routes to verification or shows the real backend error",
      accepted || verifyFlow.alert !== null,
      accepted
        ? `redirected to ${verifyFlow.url}`
        : `backend said: ${verifyFlow.alert?.slice(0, 80)}`,
    );

    if (accepted) {
      const verifyPanel = await cdp.evaluate(() => ({
        status: document.querySelector("[data-verify-status]")?.getAttribute("data-verify-status"),
        hasResend: [...document.querySelectorAll("button")].some((b) =>
          /resend|إعادة|Renvoyer|重新发送/i.test(b.textContent ?? ""),
        ),
        showsEmail: document.body.innerText.includes("probe."),
      }));
      check(
        "verification panel reports a backend-derived status",
        ["pending", "verified", "unknown", "error"].includes(verifyPanel.status ?? ""),
        `status=${verifyPanel.status}`,
      );
      check("verification panel offers a resend action", verifyPanel.hasResend);
      check("verification panel names the address it emailed", verifyPanel.showsEmail);

      check(
        "verification panel does not claim success before confirmation",
        verifyPanel.status !== "verified",
        "still pending until the link is opened",
      );
    }

    // Login page structure
    await cdp.goto(`${BASE}/auth/login`);
    await cdp.waitFor("document.querySelector('#email')");
    const login = await cdp.evaluate(() => ({
      password: !!document.querySelector("#password"),
      remember: !!document.querySelector("input[type='checkbox']"),
      forgot: !!document.querySelector("a[href*='forgot-password']"),
      signupLink: !!document.querySelector("a[href*='sign-up']"),
      toggle: [...document.querySelectorAll("button[aria-pressed]")].length > 0,
    }));
    check("login has email + password", login.password);
    check("login has remember-me", login.remember);
    check("login links to password reset", login.forgot);
    check("login links to sign-up", login.signupLink);
    check("login has show/hide password", login.toggle);

    // Wrong credentials produce a real backend error, not a fake success
    const badLogin = await cdp.evaluate(async () => {
      const set = (sel, val) => {
        const el = document.querySelector(sel);
        Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value",
        ).set.call(el, val);
        el.dispatchEvent(new Event("input", { bubbles: true }));
      };
      set("#email", "definitely-not-a-user@example.com");
      set("#password", "wrongpassword123");
      document.querySelector("form").requestSubmit();
      await new Promise((r) => setTimeout(r, 2500));
      return {
        alert: document.querySelector("[role='alert']")?.textContent?.trim() ?? null,
        path: location.pathname,
      };
    });

    check(
      "invalid credentials surface the real backend error",
      badLogin.alert !== null && badLogin.path.includes("/auth/login"),
      badLogin.alert?.slice(0, 70) ?? "no alert",
    );

    /* ================================================================ GATE */
    console.log("\nSIGN-UP INVITATION");
    await cdp.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    // A tool page is a real tool surface, so the interaction trigger exists.
    await cdp.goto(`${BASE}/tools/seo-analyzer`);
    await cdp.waitFor("document.querySelector('[data-tool-surface]')");

    const gateEarly = await cdp.evaluate(() => ({
      present: !!document.querySelector("[data-signup-gate]"),
      dialog: !!document.querySelector("[role='dialog']"),
    }));

    check(
      "no modal on load",
      !gateEarly.present && !gateEarly.dialog,
      "nothing rendered immediately",
    );

    // Trigger via scroll depth.
    const gateShown = await cdp.evaluate(async () => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
      window.dispatchEvent(new Event("scroll"));
      await new Promise((r) => setTimeout(r, 900));
      const dialog = document.querySelector("[data-signup-gate]");
      return {
        present: !!dialog,
        ariaModal: dialog?.getAttribute("aria-modal"),
        buttons: dialog
          ? [...dialog.querySelectorAll("a, button")].map((b) => b.textContent.trim())
          : [],
      };
    });

    check(
      "scrolling deep enough opens the invitation",
      gateShown.present,
      gateShown.present ? "dialog mounted" : "not shown",
    );
    check("modal is marked aria-modal", gateShown.ariaModal === "true");

    const gateDismiss = await cdp.evaluate(async () => {
      const later = [...document.querySelectorAll("[data-signup-gate] button")].pop();
      later?.click();
      await new Promise((r) => setTimeout(r, 500));
      return {
        gone: !document.querySelector("[data-signup-gate]"),
        state: localStorage.getItem("ls.gate"),
      };
    });

    check(
      "dismissing closes the modal and records the refusal",
      gateDismiss.gone && !!gateDismiss.state,
      gateDismiss.state,
    );

    // Re-visit: must stay closed (frequency limit)
    await cdp.goto(`${BASE}/tools/seo-analyzer`);
    await cdp.waitFor("document.querySelector('[data-tool-surface]')");
    const gateAgain = await cdp.evaluate(async () => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
      window.dispatchEvent(new Event("scroll"));
      await new Promise((r) => setTimeout(r, 1200));
      return !!document.querySelector("[data-signup-gate]");
    });

    check("frequency limit keeps it closed on the next visit", !gateAgain);

    // Excluded route
    await cdp.evaluate(() => localStorage.clear());
    await cdp.goto(`${BASE}/auth/login`);
    await cdp.waitFor("document.querySelector('#email')");
    const gateAuth = await cdp.evaluate(async () => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
      window.dispatchEvent(new Event("scroll"));
      await new Promise((r) => setTimeout(r, 1000));
      return !!document.querySelector("[data-signup-gate]");
    });
    check("never appears on auth routes", !gateAuth);

    /* ============================================================ REDUCED */
    console.log("\nACCESSIBILITY — reduced motion");
    await cdp.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    });
    await cdp.viewport(1440, 900);
    await cdp.goto(`${BASE}/`);
    await cdp.waitFor("document.querySelector('[data-radial]')");
    await sleep(500);

    const reduced = await cdp.evaluate(() => {
      const wrap = document.querySelector("[data-radial]");
      const node = document.querySelector("[data-radial-node]");
      const cs = getComputedStyle(node);
      const card = document.querySelector("[data-tool-card]");
      return {
        motionOn: document.documentElement.classList.contains("motion-on"),
        done: wrap.getAttribute("data-done"),
        pi: node.style.getPropertyValue("--pi"),
        translate: cs.translate,
        cardOpacity: card ? getComputedStyle(card).opacity : null,
      };
    });

    check(
      "reduced motion disables the motion class",
      reduced.motionOn === false,
      `motion-on=${reduced.motionOn}`,
    );
    check(
      "icons still land in their final slots",
      reduced.done === "1" && parseFloat(reduced.pi) === 1,
      `data-done=${reduced.done}, --pi=${reduced.pi}`,
    );

    await cdp.send("Emulation.setEmulatedMedia", { features: [] });

    /* ======================================================== CONSOLE/SEO */
    console.log("\nCONSOLE + SEO");
    await cdp.viewport(1440, 900);
    await cdp.goto(`${BASE}/`);
    await sleep(1800);
    const errors = await cdp.consoleErrors();

    check(
      "no console errors on the homepage",
      errors.length === 0,
      errors.slice(0, 2).join(" | ") || "clean",
    );

    const seo = await cdp.evaluate(() => {
      const ld = [...document.querySelectorAll("script[type='application/ld+json']")]
        .map((s) => {
          try {
            return JSON.parse(s.textContent);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
      return {
        title: document.title,
        h1: document.querySelectorAll("h1").length,
        h1Text: document.querySelector("h1")?.textContent?.trim().slice(0, 60),
        jsonLd: ld.map((d) => d["@type"]),
        canonical: document.querySelector("link[rel='canonical']")?.getAttribute("href"),
        hreflang: document.querySelectorAll("link[rel='alternate'][hreflang]").length,
      };
    });

    check("one H1 per page", seo.h1 === 1, `“${seo.h1Text}…”`);
    check(
      "structured data present",
      seo.jsonLd.includes("Organization") || seo.jsonLd.includes("WebSite"),
      seo.jsonLd.join(", "),
    );
    check("canonical present", !!seo.canonical, seo.canonical);
    check(
      "hreflang alternates emitted for every locale",
      seo.hreflang >= 5,
      `${seo.hreflang} alternates`,
    );

    // Locale coverage of the new sections
    console.log("\nLOCALISATION — new sections in all four locales");

    await cdp.goto(`${BASE}/tools`);
    await cdp.waitFor("document.querySelector('[data-tools-grid]')");
    const enHeading = await cdp.evaluate(
      () => document.querySelector("h1")?.textContent?.trim() ?? "",
    );

    for (const locale of ["ar", "fr", "zh"]) {
      await cdp.goto(`${BASE}/${locale}/tools`);
      await cdp.waitFor("document.querySelector('[data-tools-grid]')");
      const local = await cdp.evaluate(() => {
        const h1 = document.querySelector("h1")?.textContent ?? "";
        const tabs = [...document.querySelectorAll("[data-category-tab]")].map((t) =>
          t.textContent.replace(/\d+$/, "").trim(),
        );
        return {
          h1: h1.trim(),
          cards: document.querySelectorAll("[data-tool-card]").length,
          tabs,
          dir: document.documentElement.getAttribute("dir"),
          searchPlaceholder:
            document.querySelector("input[type='search']")?.getAttribute("placeholder") ?? "",
        };
      });

      // Translation is proven by the copy being different from English, not by
      // the character set: French here happens to be all ASCII.
      const translated = local.h1.length > 0 && local.h1 !== enHeading;
      check(
        `${locale}: tools page translated`,
        local.cards === 17 && translated,
        `“${local.h1.slice(0, 40)}” · ${local.cards} cards`,
      );
      check(
        `${locale}: category tabs translated`,
        local.tabs.length === 7 && !local.tabs.includes("All Tools"),
        local.tabs.slice(0, 3).join(" / "),
      );
      check(
        `${locale}: search placeholder translated`,
        local.searchPlaceholder.length > 0 &&
          local.searchPlaceholder !== "Search tools, categories or keywords…",
        `“${local.searchPlaceholder.slice(0, 34)}”`,
      );
    }

    // Homepage carousel copy must exist in every locale too.
    for (const [locale, prefix] of [["ar", "/ar"], ["fr", "/fr"], ["zh", "/zh"]]) {
      await cdp.goto(`${BASE}${prefix}/#community`);
      await cdp.waitFor("document.querySelector('[data-carousel-dot]')");
      const community = await cdp.evaluate(() => ({
        title: document.querySelector("#community-title")?.textContent?.trim() ?? "",
        slides: document.querySelectorAll(".testimonial-slide").length,
        cta: [...document.querySelectorAll("#community a")].map((a) =>
          a.textContent.trim(),
        ),
      }));
      check(
        `${locale}: community section translated and single-card`,
        community.title.length > 0 && community.slides === 1,
        `“${community.title.slice(0, 34)}…”, ${community.slides} slide`,
      );
    }

    /* ========================================================== VERIFY PAGE */
    console.log("\nEMAIL VERIFICATION SCREEN");
    await cdp.viewport(1440, 900);
    await cdp.goto(`${BASE}/auth/verify?email=someone%40example.com`);
    await cdp.waitFor("document.querySelector('[data-verify-status]')");

    const verifyPage = await cdp.evaluate(async () => {
      const initial = document
        .querySelector("[data-verify-status]")
        ?.getAttribute("data-verify-status");

      const checkBtn = [...document.querySelectorAll("button")].find((b) =>
        /check|تحقّق|Vérifier|检查/i.test(b.textContent ?? ""),
      );
      checkBtn?.click();
      await new Promise((r) => setTimeout(r, 1800));

      const after = document
        .querySelector("[data-verify-status]")
        ?.getAttribute("data-verify-status");

      return {
        initial,
        after,
        showsAddress: document.body.innerText.includes("someone@example.com"),
        resend: [...document.querySelectorAll("button")].some((b) =>
          /resend|إعادة|Renvoyer|重新发送/i.test(b.textContent ?? ""),
        ),
        claimsVerified:
          document.querySelector("[data-verify-status]")?.textContent?.includes("verified") ??
          false,
      };
    });

    check(
      "verification screen renders a status from the backend",
      ["pending", "verified", "unknown", "error"].includes(verifyPage.initial ?? ""),
      `initial=${verifyPage.initial}, after check=${verifyPage.after}`,
    );
    check("verification screen names the address", verifyPage.showsAddress);
    check("verification screen offers resend", verifyPage.resend);
    check(
      "does not claim verification without confirmation",
      verifyPage.after !== "verified",
      `status stays ${verifyPage.after}`,
    );

    /* =========================================================== 404 + A11Y */
    console.log("\nHOVER + KEYBOARD");
    await cdp.goto(`${BASE}/`);
    await cdp.waitFor("document.querySelector('[data-radial]')");
    await sleep(2200);

    // Real pointer movement, not a synthetic hover class.
    const target = await cdp.evaluate(() => {
      const n = document.querySelector("[data-radial-node]");
      const r = n.getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    });
    await cdp.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: target.x,
      y: target.y,
    });
    await sleep(320);

    const hover = await cdp.evaluate(() => {
      const n = document.querySelector("[data-radial-node]");
      return {
        hot: n.getAttribute("data-hot"),
        label: getComputedStyle(n.querySelector(".radial-label")).opacity,
        scale: getComputedStyle(n).scale,
      };
    });

    check("hovering an icon marks it active", hover.hot === "1", `data-hot=${hover.hot}`);
    check(
      "hover reveals the icon's label",
      parseFloat(hover.label) > 0.9,
      `label opacity ${hover.label}`,
    );
    check(
      "hover scales the icon without reflow",
      hover.scale !== "none" && parseFloat(hover.scale) > 1,
      `scale ${hover.scale}`,
    );

    // Keyboard: tab until a radial node has focus, then read the label.
    const keyboard = await cdp.evaluate(async () => {
      // Move focus into the document so Tab walks the real order.
      document.body.setAttribute("tabindex", "-1");
      document.body.focus();

      const node = document.querySelector("[data-radial-node]");
      node.focus();
      // React commits state on the next frame; measure after it.
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      return {
        focused: document.activeElement === node,
        hot: node.getAttribute("data-hot"),
        label: getComputedStyle(node.querySelector(".radial-label")).opacity,
        tag: node.tagName,
        href: node.getAttribute("href"),
      };
    });

    check(
      "radial icons are focusable links",
      keyboard.focused && keyboard.tag === "A" && !!keyboard.href,
      `${keyboard.tag} → ${keyboard.href}`,
    );
    check(
      "keyboard focus reveals the label",
      parseFloat(keyboard.label) > 0.9 && keyboard.hot === "1",
      `label opacity ${keyboard.label}`,
    );
  } finally {
    try {
      cdp.child.kill("SIGKILL");
    } catch {
      /* already gone */
    }
    try {
      fs.rmSync(cdp.profile, { recursive: true, force: true });
    } catch {
      /* best effort */
    }
  }

  /* --------------------------------------------------------------- summary */
  const passed = results.filter((r) => r.pass).length;
  console.log(`\n${"—".repeat(58)}`);
  console.log(`${passed}/${results.length} checks passed, ${failures} failed`);
  fs.writeFileSync(
    "/tmp/verify-results.json",
    JSON.stringify({ base: BASE, passed, failed: failures, results }, null, 2),
  );

  if (failures > 0) {
    console.log("\nFailed checks:");
    for (const r of results.filter((x) => !x.pass)) {
      console.log(`  · ${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
    }
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("\nHarness error:", err.message);
  process.exitCode = 1;
});