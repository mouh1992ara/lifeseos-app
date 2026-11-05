/**
 * Carousel-only verification: grouped multi-card paging, faster autoplay,
 * responsive per-view count, swipe, RTL, and the absence of placeholder wording.
 *
 * Usage: node scripts/verify-carousel.mjs [baseUrl]
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = process.argv[2] || "http://127.0.0.1:3000";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9341;

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
}

async function launch() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "ls-car-"));
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
  if (!target) throw new Error("no chrome target");
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

const state = () => {
  const track = document.querySelector("[data-carousel-track]");
  const slides = [...document.querySelectorAll("[data-carousel-slide]")];
  const m = getComputedStyle(track).transform;
  const x = m === "none" ? 0 : Math.round(Number((m.match(/-?[\d.]+/g) ?? [])[4] ?? 0));
  return {
    i: Number(track.dataset.carouselIndex),
    pv: Number(track.style.getPropertyValue("--pv") || 1),
    x,
    trackW: Math.round(track.getBoundingClientRect().width),
    slideW: Math.round(slides[0].getBoundingClientRect().width),
    visible: slides.filter((s) => s.getAttribute("aria-hidden") === "false").length,
    dots: document.querySelectorAll("[data-carousel-dot]").length,
  };
};

async function main() {
  const cdp = await launch();
  try {
    /* ---------------------------------------------- desktop: 3 across */
    console.log("\nDESKTOP 1440px");
    await cdp.viewport(1440, 1000, false);
    await cdp.goto(`${BASE}/`);
    await cdp.waitFor("document.querySelector('[data-carousel-track]')");
    await sleep(1100);

    const d = await cdp.evaluate(state);
    check("three reviews are visible at once on desktop", d.visible === 3, `${d.visible} visible, --pv=${d.pv}`);
    check(
      "each card is one third of the rail",
      Math.abs(d.slideW - d.trackW / 3) <= 2,
      `card ${d.slideW}px, rail ${d.trackW}px`,
    );
    check(
      "group dots match the number of pages",
      d.dots === 2,
      `${d.dots} dots for 4 reviews in groups of 3`,
    );

    /* autoplay speed — 2 grouped transitions must finish well under 10s */
    const t0 = Date.now();
    let changes = 0;
    let last = d.i;
    while (Date.now() - t0 < 10000) {
      const s = await cdp.evaluate(state);
      if (s.i !== last) {
        changes += 1;
        last = s.i;
        if (changes >= 2) break;
      }
      await sleep(110);
    }
    const elapsed = Date.now() - t0;
    check("autoplay runs two grouped transitions", changes >= 2, `${changes} in ${(elapsed / 1000).toFixed(1)}s`);
    check(
      "the auto-slide cadence is faster than before (was 6.0s, now 4.2s)",
      changes >= 2 && elapsed < 10500,
      `~${(elapsed / 2 / 1000).toFixed(1)}s per transition`,
    );

    await sleep(700);
    const stuck = await cdp.evaluate(state);
    check(
      "a group step moves exactly one card width",
      Math.abs(Math.abs(stuck.x) - (stuck.trackW / 3) * stuck.i) <= 2,
      `translateX ${stuck.x}px = ${stuck.i} × ${Math.round(stuck.trackW / 3)}px`,
    );

    /* ---------------------------------------------- manual controls */
    await cdp.goto(`${BASE}/`);
    await cdp.waitFor("document.querySelector('[data-carousel-track]')");
    await sleep(700);

    const click = (sel) => cdp.evaluate((s) => document.querySelector(s).click(), sel);
    const before = await cdp.evaluate(state);
    await click("[data-carousel-next]");
    const mid = [];
    for (let k = 0; k < 6; k += 1) {
      await sleep(60);
      mid.push(await cdp.evaluate(state).then((s) => s.x));
    }
    await sleep(700);
    const afterNext = await cdp.evaluate(state);
    check("next advances a whole group", afterNext.i === before.i + 1, `group ${before.i} → ${afterNext.i}`);
    check(
      "the group slides left as one continuous movement",
      afterNext.x < before.x - Math.round(before.trackW / 3) * 0.9 && new Set(mid).size >= 3,
      `${before.x}px → ${afterNext.x}px, ${new Set(mid).size} intermediate offsets`,
    );

    await click("[data-carousel-prev]");
    await sleep(800);
    const afterPrev = await cdp.evaluate(state);
    check(
      "previous slides the group back",
      afterPrev.i === before.i && afterPrev.x > afterNext.x,
      `${afterNext.x}px → ${afterPrev.x}px`,
    );

    await click("[data-carousel-dot='1']");
    await sleep(800);
    const afterDot = await cdp.evaluate(state);
    check(
      "dots jump to that group",
      afterDot.i === 1 && afterDot.visible === 3,
      `group ${afterDot.i}, ${afterDot.visible} visible`,
    );

    const counter = await cdp.evaluate(
      () => document.querySelector("[data-carousel-position]")?.textContent?.trim(),
    );
    check("the counter reports the visible range", /2[–-]4|2\s*to\s*4/.test(counter ?? ""), `"${counter}"`);

    /* hover pause, given the shorter interval */
    await cdp.evaluate(() => document.querySelector("[data-carousel]").scrollIntoView({ block: "center" }));
    await sleep(600);
    const box = await cdp.evaluate(() => {
      const r = document.querySelector("[data-carousel]").getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    });
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: box.x, y: box.y, buttons: 0 });
    await sleep(300);
    const hStart = await cdp.evaluate(state);
    await sleep(5600);
    const hEnd = await cdp.evaluate(state);
    check(
      "hover still pauses automatic movement",
      hStart.i === hEnd.i,
      `held group ${hStart.i} for 5.6s`,
    );

    /* ---------------------------------------------- tablet: 2 across */
    console.log("\nTABLET 834px");
    await cdp.viewport(834, 1000, false);
    await cdp.goto(`${BASE}/`);
    await cdp.waitFor("document.querySelector('[data-carousel-track]')");
    await sleep(1100);
    const tab = await cdp.evaluate(state);
    check("two reviews are visible on tablet", tab.visible === 2, `${tab.visible} visible, --pv=${tab.pv}`);
    check(
      "each card is half the rail on tablet",
      Math.abs(tab.slideW - tab.trackW / 2) <= 2,
      `card ${tab.slideW}px, rail ${tab.trackW}px`,
    );

    /* ---------------------------------------------- phone: 1 + swipe */
    console.log("\nPHONE 390px");
    await cdp.viewport(390, 844, true);
    await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
    await cdp.goto(`${BASE}/`);
    await cdp.waitFor("document.querySelector('[data-carousel-track]')");
    await sleep(1200);
    const mob = await cdp.evaluate(state);
    check("one review is visible on a phone", mob.visible === 1, `${mob.visible} visible, --pv=${mob.pv}`);
    check("all four dots exist at one-up", mob.dots === 4, `${mob.dots} dots`);

    await cdp.evaluate(() => document.querySelector("[data-carousel]").scrollIntoView({ block: "center" }));
    await sleep(700);
    const touchY = await cdp.evaluate(() => {
      const r = document.querySelector("[data-carousel]").getBoundingClientRect();
      return Math.round(r.top + r.height / 2);
    });
    const swipe = async (fromX, toX, y) => {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: fromX, y }] });
      for (let i = 1; i <= 8; i += 1) {
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: Math.round(fromX + ((toX - fromX) * i) / 8), y }],
        });
        await sleep(20);
      }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await sleep(800);
    };
    const mStart = await cdp.evaluate(state);
    await swipe(320, 90, touchY);
    const mAfter = await cdp.evaluate(state);
    check("swipe left advances on mobile", mAfter.i === (mStart.i + 1) % 4, `group ${mStart.i} → ${mAfter.i}`);
    await swipe(90, 320, touchY);
    check("swipe right goes back", (await cdp.evaluate(state)).i === mStart.i);

    const fit = await cdp.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      heights: [...document.querySelectorAll("[data-carousel-slide]")].map(
        (s) => Math.round(s.getBoundingClientRect().height),
      ),
    }));
    check("no horizontal page overflow on a phone", !fit.overflow);
    check(
      "all cards share one height (no strip resize between groups)",
      new Set(fit.heights).size === 1,
      `${fit.heights[0]}px across 4 slides`,
    );

    /* ---------------------------------------------- RTL */
    await cdp.viewport(1440, 1000, false);
    await cdp.goto(`${BASE}/ar`);
    await cdp.waitFor("document.querySelector('[data-carousel-track]')");
    await sleep(900);
    const rtlBefore = await cdp.evaluate(state);
    await cdp.evaluate(() => document.querySelector("[data-carousel-next]").click());
    await sleep(800);
    const rtlAfter = await cdp.evaluate(state);
    check(
      "RTL slides travel the mirrored direction",
      rtlAfter.x > rtlBefore.x && rtlAfter.i === rtlBefore.i + 1,
      `${rtlBefore.x}px → ${rtlAfter.x}px`,
    );

    /* ---------------------------------------------- wording + honesty */
    console.log("\nCONTENT");
    await cdp.viewport(1440, 1000, false);
    await cdp.goto(`${BASE}/`);
    await cdp.waitFor("document.querySelector('[data-carousel-track]')");
    await sleep(800);
    const text = await cdp.evaluate(() =>
      document.querySelector("#community").innerText.replace(/\s+/g, " "),
    );
    check("no “example review” placeholder wording remains", !/example review/i.test(text), text.slice(0, 70) + "…");
    check(
      "no fabricated person names or star ratings",
      !/\b(John|Jane|Sarah|Mike|Alex|Emily|David)\b/.test(text) && !/★|⭐|\b5\.0\b/.test(text),
    );
    check(
      "sample content is still labelled as such",
      /sample profile|Illustrative examples/i.test(text),
    );

    fs.writeFileSync("/tmp/verify-carousel.json", JSON.stringify({ failures, results }, null, 2));
    const passed = results.filter((r) => r.pass).length;
    console.log(`\n${passed}/${passed + failures} carousel checks passed` + (failures ? ` — ${failures} FAILED` : ""));
  } finally {
    try {
      cdp.ws.close();
      cdp.child.kill("SIGKILL");
      fs.rmSync(cdp.profile, { recursive: true, force: true });
    } catch {}
  }
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error("HARNESS ERROR:", e.message);
  process.exit(2);
});
