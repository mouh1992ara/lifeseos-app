/**
 * Targeted verification for the bug-fix pass.
 * Chromium via CDP. Measures real geometry/transform, not screenshots.
 *
 * Usage: node scripts/verify-fixes.mjs [baseUrl]
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = process.argv[2] || "http://127.0.0.1:3000";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9339;

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
  errors() {
    return this.events
      .filter((e) => e.method === "Runtime.consoleAPICalled" && e.params.type === "error")
      .map((e) => e.params.args.map((a) => a.value ?? a.description ?? "").join(" "))
      .filter((m) => m && !/favicon|adsbygoogle|ERR_BLOCKED/i.test(m));
  }
}

async function launchChrome() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "ls-fix-"));
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

/* Helpers evaluated in the page */
const tx = () => {
  const el = document.querySelector("[data-carousel-track]");
  if (!el) return null;
  const m = getComputedStyle(el).transform;
  if (m === "none") return 0;
  const nums = m.match(/-?[\d.]+/g)?.map(Number) ?? [];
  return Math.round(nums[4] ?? 0);
};
const idx = () => Number(document.querySelector("[data-carousel-track]")?.dataset.carouselIndex ?? -1);

async function main() {
  const cdp = await launchChrome();
  try {
    /* Carousel coverage lives in scripts/verify-carousel.mjs */

    /* =========================================================== 3. TOOLS */
    console.log("\nTOOLS PAGE — filters, search, destinations");
    await cdp.viewport(1440, 1000, false);
    await cdp.goto(`${BASE}/tools`);
    await cdp.waitFor("document.querySelector('[data-tool-card]')");
    await sleep(700);

    const grid = await cdp.evaluate(() => ({
      cards: document.querySelectorAll("[data-tool-card]").length,
      revealed: [...document.querySelectorAll("[data-tool-card]")].filter(
        (c) => c.getAttribute("data-in") === "1",
      ).length,
    }));
    check("all 17 tools are listed", grid.cards === 17, `${grid.cards} cards`);
    check(
      "cards actually run their entrance animation",
      grid.revealed === 17,
      `${grid.revealed}/17 reached data-in=1`,
    );

    const clickTab = async (label) => {
      await cdp.evaluate((l) => {
        const tab = [...document.querySelectorAll("[role='tab']")].find((b) =>
          b.textContent.toLowerCase().includes(l),
        );
        tab?.click();
      }, label);
      await sleep(650);
      return cdp.evaluate(() => ({
        n: document.querySelectorAll("[data-tool-card]").length,
        selected: document
          .querySelector("[role='tab'][aria-selected='true']")
          ?.textContent?.trim(),
      }));
    };

    const youtube = await clickTab("youtube");
    check(
      "category filter narrows the grid",
      youtube.n === 5,
      `${youtube.n} cards, active "${youtube.selected}"`,
    );
    const perf = await clickTab("performance");
    check("a second category swaps the set", perf.n >= 1 && perf.n < 17, `${perf.n} cards`);
    await clickTab("all");
    const all = await cdp.evaluate(() => document.querySelectorAll("[data-tool-card]").length);
    check("All Tools restores the full set", all === 17, `${all} cards`);

    const typeSearch = async (q) => {
      await cdp.evaluate((value) => {
        const input = document.querySelector("input[type='search'], input[placeholder]");
        const set = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value",
        ).set;
        set.call(input, value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }, q);
      await sleep(600);
      return cdp.evaluate(() => ({
        n: document.querySelectorAll("[data-tool-card]").length,
        empty: /no tools|nothing|no match/i.test(document.body.innerText),
      }));
    };

    const s1 = await typeSearch("sitemap");
    check("search by name matches", s1.n >= 1 && s1.n < 17, `${s1.n} results for "sitemap"`);
    const s2 = await typeSearch("youtube");
    check("search by keyword matches", s2.n === 5, `${s2.n} results for "youtube"`);
    const s3 = await typeSearch("zzqqxx");
    check("empty search shows an empty state", s3.n === 0 && s3.empty, `0 cards, empty state shown`);
    await typeSearch("");

    const links = await cdp.evaluate(() =>
      [...document.querySelectorAll("[data-tool-card]")].map((c) => ({
        href: c.getAttribute("href"),
        name: c.querySelector("h3, h2, p")?.textContent?.trim()?.slice(0, 30),
      })),
    );
    const bad = [];
    for (const l of links) {
      const r = await fetch(`${BASE}${l.href}`, { method: "GET" });
      if (r.status !== 200) bad.push(`${l.href} → ${r.status}`);
    }
    check(
      "every tool card points at a live page",
      bad.length === 0 && links.length === 17,
      bad.length ? bad.join(", ") : `${links.length}/17 return 200`,
    );
    const uniqueHrefs = new Set(links.map((l) => l.href));
    check("every card has a distinct destination", uniqueHrefs.size === 17, `${uniqueHrefs.size} unique`);

    /* ============================================================ 4. AUTH */
    console.log("\nAUTH — real backend, no simulation");

    await cdp.goto(`${BASE}/auth/login`);
    await cdp.waitFor("document.querySelector('form')");
    await sleep(600);
    const login = await cdp.evaluate(() => ({
      email: !!document.querySelector("#email"),
      password: !!document.querySelector("#password"),
      toggle: !!document.querySelector("button[aria-label*='assword' i]"),
      remember: !!document.querySelector("input[type='checkbox']"),
      forgot: !!document.querySelector("a[href*='forgot']"),
      signup: !!document.querySelector("a[href*='sign-up']"),
    }));
    check(
      "login has email, password, reveal toggle, remember, forgot, sign-up",
      login.email && login.password && login.toggle && login.remember && login.forgot && login.signup,
      JSON.stringify(login),
    );

    const badLogin = await cdp.evaluate(async () => {
      const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      const e = document.querySelector("#email");
      const p = document.querySelector("#password");
      set.call(e, `nobody-${Date.now()}@example.com`);
      e.dispatchEvent(new Event("input", { bubbles: true }));
      set.call(p, "definitely-not-the-password");
      p.dispatchEvent(new Event("input", { bubbles: true }));
      document.querySelector("form").requestSubmit();
      await new Promise((r) => setTimeout(r, 3200));
      return {
        url: location.pathname,
        error: document.body.innerText.match(/does not match|not confirmed|invalid|incorrect/i)?.[0] ?? null,
      };
    });
    check(
      "wrong credentials are rejected by the real backend (no fake success)",
      badLogin.error !== null && !/dashboard/.test(badLogin.url),
      `stayed on ${badLogin.url}, message "${badLogin.error}"`,
    );

    await cdp.goto(`${BASE}/auth/sign-up`);
    await cdp.waitFor("document.querySelector('form')");
    await sleep(600);
    const signup = await cdp.evaluate(() => ({
      name: !!document.querySelector("#fullName, #name"),
      confirm: !!document.querySelector("#repeat, #confirmPassword"),
      terms: !!document.querySelector("input[type='checkbox'][required]"),
      strength: /weak|fair|good|strong|short/i.test(document.body.innerText),
    }));
    check(
      "sign-up has full name, password confirmation and a required consent",
      signup.name && signup.confirm && signup.terms,
      JSON.stringify(signup),
    );

    const gateBlocked = await cdp.evaluate(async () => {
      const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      const email = document.querySelector("#email");
      const pw = document.querySelector("#password");
      const rep = document.querySelector("#repeat, #confirmPassword");
      const name = document.querySelector("#fullName, #name");
      if (name) {
        set.call(name, "Test Person");
        name.dispatchEvent(new Event("input", { bubbles: true }));
      }
      set.call(email, "someone@example.com");
      email.dispatchEvent(new Event("input", { bubbles: true }));
      set.call(pw, "Str0ng!Passw0rd");
      pw.dispatchEvent(new Event("input", { bubbles: true }));
      if (rep) {
        set.call(rep, "Str0ng!Passw0rd");
        rep.dispatchEvent(new Event("input", { bubbles: true }));
      }
      // consent deliberately left unticked
      document.querySelector("form").requestSubmit();
      await new Promise((r) => setTimeout(r, 1200));
      return { url: location.pathname, blocked: !/verify|sign-up-success/.test(location.pathname) };
    });
    check(
      "sign-up refuses to submit without accepting the terms",
      gateBlocked.blocked,
      `still on ${gateBlocked.url}`,
    );

    const verifyPage = await cdp.evaluate(async () => {
      const r = await fetch("/auth/verify?email=probe%40example.com");
      const html = await r.text();
      return { status: r.status, mentionsEmail: /probe@example\.com/.test(html) };
    });
    check(
      "/auth/verify renders and reflects the addressed account",
      verifyPage.status === 200 && verifyPage.mentionsEmail,
      `status ${verifyPage.status}`,
    );

    await cdp.goto(`${BASE}/auth/verify?email=probe%40example.com`);
    await cdp.waitFor("document.querySelector('main')");
    await sleep(1200);
    const verifyDom = await cdp.evaluate(() => ({
      buttons: [...document.querySelectorAll("button")].map((b) => b.textContent.trim()).filter(Boolean),
      status: document.body.innerText.match(/pending|verified|not confirmed|check/i)?.[0] ?? null,
    }));
    check(
      "verification screen offers a real resend action and shows backend status",
      verifyDom.buttons.some((b) => /resend|again|send/i.test(b)) && verifyDom.status !== null,
      `${JSON.stringify(verifyDom.buttons.slice(0, 4))} · status "${verifyDom.status}"`,
    );

    await cdp.goto(`${BASE}/auth/forgot-password`);
    await cdp.waitFor("document.querySelector('form')");
    const forgot = await cdp.evaluate(async () => {
      const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      const e = document.querySelector("#email");
      set.call(e, "nobody@example.com");
      e.dispatchEvent(new Event("input", { bubbles: true }));
      document.querySelector("form").requestSubmit();
      await new Promise((r) => setTimeout(r, 4000));
      return document.body.innerText.replace(/\s+/g, " ");
    });
    const resetMsg = forgot.match(
      /password reset instructions sent|check your email|too many|rate limit|error/i,
    );
    check(
      "password reset reaches the backend and reports a real outcome",
      resetMsg !== null,
      `"${resetMsg?.[0] ?? "no message"}"`,
    );

    /* Registration popup rules */
    console.log("\nREGISTRATION POPUP — frequency + audience rules");
    const modal = await cdp.evaluate(async () => {
      localStorage.removeItem("ls.gate");
      sessionStorage.clear();
      return true;
    });
    await cdp.goto(`${BASE}/tools/seo-analyzer`);
    await cdp.waitFor("document.querySelector('[data-tool-surface]')");
    const immediately = await cdp.evaluate(
      () => !!document.querySelector("[aria-modal='true']"),
    );
    check("popup is not shown on page load", !immediately);
    await cdp.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
      window.dispatchEvent(new Event("scroll"));
    });
    await sleep(1600);
    const shown = await cdp.evaluate(() => {
      const d = document.querySelector("[aria-modal='true']");
      return { present: !!d, text: d?.textContent?.slice(0, 60) ?? "" };
    });
    check("popup appears after meaningful engagement", shown.present, shown.text.replace(/\s+/g, " "));
    if (shown.present) {
      await cdp.evaluate(() => {
        const btn = [...document.querySelectorAll("[aria-modal='true'] button")].at(-1);
        btn?.click();
      });
      await sleep(700);
      await cdp.goto(`${BASE}/tools/page-speed`);
      await cdp.waitFor("document.querySelector('[data-tool-surface]')");
      await cdp.evaluate(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
        window.dispatchEvent(new Event("scroll"));
      });
      await sleep(1600);
      check(
        "dismissal is remembered — the popup does not nag on the next page",
        !(await cdp.evaluate(() => !!document.querySelector("[aria-modal='true']"))),
      );
    }

    /* ==================================================== 5. REGRESSION */
    console.log("\nREGRESSION");
    await cdp.viewport(390, 844, true);
    for (const route of ["/", "/tools", "/blog", "/auth/login"]) {
      await cdp.goto(`${BASE}${route}`);
      await sleep(700);
      const over = await cdp.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      check(`no horizontal overflow at 390px on ${route}`, !over);
    }
    const errs = cdp.errors().filter((e) => !/hydrat|Warning:/i.test(e));
    check("no console errors during the run", errs.length === 0, errs.slice(0, 2).join(" | "));

    const summary = {
      passed: results.filter((r) => r.pass).length,
      failed: failures,
      results,
    };
    fs.writeFileSync("/tmp/verify-fixes.json", JSON.stringify(summary, null, 2));
    console.log(
      `\n${summary.passed}/${summary.passed + summary.failed} checks passed` +
        (summary.failed ? ` — ${summary.failed} FAILED` : ""),
    );
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
