import { payloadTooLarge, safeSessionKey, validateEvent, deviceFromUserAgent, localeFromPath, deterministicEventId, MAX_BODY_BYTES } from "../lib/analytics.ts";

const ok = (label: string, cond: boolean) => console.log((cond ? "PASS" : "FAIL") + "  " + label);

// payload cap
const mkReq = (len: number) => new Request("https://x/", { method: "POST", headers: { "content-length": String(len) } });
ok("rejects declared 3000B", payloadTooLarge(mkReq(3000), null));
ok("accepts 120B", !payloadTooLarge(mkReq(120), "x".repeat(120)));
ok("rejects raw 3000B even with small header", payloadTooLarge(mkReq(10), "x".repeat(3000)));
ok("MAX_BODY_BYTES is 2048", MAX_BODY_BYTES === 2048);

// session key
ok("rejects non-uuid session", safeSessionKey("evil") === null);
ok("rejects path traversal", safeSessionKey("../../x") === null);
ok("accepts uuid", safeSessionKey("23f02d16-49f7-4b42-852e-5df463cef348") !== null);
ok("rejects 10k string", safeSessionKey("a".repeat(10000)) === null);

// device bucketing
ok("iPhone -> mobile", deviceFromUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)") === "mobile");
ok("iPad -> tablet", deviceFromUserAgent("Mozilla/5.0 (iPad; CPU OS 17_0)") === "tablet");
ok("desktop -> desktop", deviceFromUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)") === "desktop");
ok("null UA -> desktop", deviceFromUserAgent(null) === "desktop");

// locale from path
ok("/ar/tools -> ar", localeFromPath("/ar/tools/x") === "ar");
ok("/tools -> en", localeFromPath("/tools/x") === "en");
ok("bogus locale -> en", localeFromPath("/xx/tools") === "en");

// event validation
const ctx = { pathname: "/fr/tools/seo-analyzer", userAgent: "iPhone", userId: null, sessionKey: null };
ok("rejects unknown event", validateEvent({ eventName: "hack" }, ctx) === null);
ok("rejects tool event without key", validateEvent({ eventName: "tool_success" }, ctx) === null);
ok("rejects unknown tool key", validateEvent({ eventName: "tool_success", toolKey: "../../etc/passwd" }, ctx) === null);
const v = validateEvent({ eventName: "tool_use", toolKey: "seo-analyzer" }, ctx)!;
ok("tool_use accepted with key", v !== null);
ok("locale derived from path = fr", v.locale === "fr");
ok("device derived from UA = mobile", v.device === "mobile");
ok("tool_use has null error_code", v.error_code === null);

// error code restricted to categories
const e = validateEvent({ eventName: "tool_error", toolKey: "seo-analyzer", errorCode: "https://secret-site.com/leaked" }, ctx)!;
ok("raw message rejected as error_code", e.error_code === null);
const e2 = validateEvent({ eventName: "tool_error", toolKey: "seo-analyzer", errorCode: "UPSTREAM_ERROR" }, ctx)!;
ok("valid error code kept", e2.error_code === "UPSTREAM_ERROR");

// dedupe determinism
ok("same inputs -> same id", deterministicEventId(["a","b","c","d"]) === deterministicEventId(["a","b","c","d"]));
ok("different inputs -> different id", deterministicEventId(["a","b","c","d"]) !== deterministicEventId(["a","b","c","e"]));
