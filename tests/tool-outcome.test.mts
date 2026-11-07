/**
 * Tool outcome instrumentation — behaviour, not coverage.
 *
 * The interesting failures here are silent ones: an event that the database
 * discards looks exactly like an event that was never sent. These tests pin the
 * properties that keep stored numbers honest.
 */
import {
  eventIdFor,
  errorCodeFrom,
  hasRealOutput,
  isUserInputError,
} from "../lib/use-tool-outcome.ts";
import { deterministicEventId, validateEvent } from "../lib/analytics.ts";
import { readFileSync } from "node:fs";

let pass = 0;
let fail = 0;
const ok = (label: string, cond: boolean) => {
  if (cond) pass += 1;
  else fail += 1;
  console.log((cond ? "PASS" : "FAIL") + "  " + label);
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-a[0-9a-f]{3}-[0-9a-f]{12}$/i;

/* ------------------------------------------------------------------ *
 * 1. The bug this suite exists for
 * ------------------------------------------------------------------ */

const opA = "4f1d2c3a-9b8e-4a7f-8c61-2d3e4f5a6b7c";

ok("tool_use keeps the operation id", eventIdFor(opA, "tool_use") === opA);
ok(
  "tool_success does NOT reuse the tool_use id",
  eventIdFor(opA, "tool_success") !== eventIdFor(opA, "tool_use"),
);
ok(
  "tool_error does NOT reuse the tool_use id",
  eventIdFor(opA, "tool_error") !== eventIdFor(opA, "tool_use"),
);
ok(
  "success and error on one operation are distinct",
  eventIdFor(opA, "tool_success") !== eventIdFor(opA, "tool_error"),
);

/* A non-UUID id is replaced by a random one server-side, which would defeat
   dedup entirely. Every derived id must survive validation unchanged. */
ok("success id is UUID-shaped", UUID.test(eventIdFor(opA, "tool_success")));
ok("error id is UUID-shaped", UUID.test(eventIdFor(opA, "tool_error")));

/* The legacy fallback feeds the same `uuid` column. A malformed id here would
   fail the insert with 22P02 and the beacon would be dropped without a trace. */
const legacyId = deterministicEventId(["tool", "seo-analyzer", "anon", "2026-11-07T06:29"]);
ok("server-derived id is UUID-shaped", UUID.test(legacyId));
ok("server-derived id is stable", legacyId === deterministicEventId(["tool", "seo-analyzer", "anon", "2026-11-07T06:29"]));
ok("a different minute is a different id", legacyId !== deterministicEventId(["tool", "seo-analyzer", "anon", "2026-11-07T06:30"]));

/* ------------------------------------------------------------------ *
 * 2. Retries collapse, real operations do not
 * ------------------------------------------------------------------ */

ok(
  "a resent terminal event derives the same id",
  eventIdFor(opA, "tool_success") === eventIdFor(opA, "tool_success"),
);

const opB = "8a2b3c4d-5e6f-4a7b-9c8d-1e2f3a4b5c6d";
const run = (op: string) => [op, eventIdFor(op, "tool_success")];
const ids = [...run(opA), ...run(opB)];
ok("two separate runs produce four distinct ids", new Set(ids).size === 4);

/* Same user, same tool, same minute — the case the legacy minute-based id
   would have merged. */
const sameMinute = new Set([
  opA,
  eventIdFor(opA, "tool_success"),
  opB,
  eventIdFor(opB, "tool_success"),
]);
ok("back-to-back runs are not merged into one", sameMinute.size === 4);

/* ------------------------------------------------------------------ *
 * 3. Output must be real
 * ------------------------------------------------------------------ */

ok("empty string is not output", hasRealOutput("") === false);
ok("whitespace is not output", hasRealOutput("   \n ") === false);
ok("empty array is not output", hasRealOutput([]) === false);
ok("empty object is not output", hasRealOutput({}) === false);
ok("null is not output", hasRealOutput(null) === false);
ok("undefined is not output", hasRealOutput(undefined) === false);
ok("zero is not output", hasRealOutput(0) === false);
ok("text is output", hasRealOutput("User-agent: *") === true);
ok("a populated array is output", hasRealOutput(["a"]) === true);
ok("a populated object is output", hasRealOutput({ score: 0 }) === true);

/* ------------------------------------------------------------------ *
 * 4. Error classification never leaks input
 * ------------------------------------------------------------------ */

ok("known code passes through", errorCodeFrom({ code: "TIMEOUT" }) === "TIMEOUT");
ok("unknown code becomes INTERNAL", errorCodeFrom({ code: "WHATEVER" }) === "INTERNAL");
ok(
  "a raw message is not used as a code",
  errorCodeFrom({ message: "failed to fetch https://secret.example" }) === "INTERNAL",
);
ok("null becomes INTERNAL", errorCodeFrom(null) === "INTERNAL");
ok(
  "a thrown Error becomes INTERNAL",
  errorCodeFrom(new Error("https://secret.example/timeout")) === "INTERNAL",
);

ok("a bare 400 is input", isUserInputError(undefined, 400) === true);
ok("a bare 422 is input", isUserInputError(undefined, 422) === true);
ok("a bare 429 is a failure", isUserInputError(undefined, 429) === false);
ok("a bare 500 is a failure", isUserInputError(undefined, 500) === false);

/* The API answers 400 for these too, so status alone cannot decide. Confirmed
   against the live preview: BLOCKED_ADDRESS and UPSTREAM_ERROR both come back
   as 400, and treating those as validation would hide every real failure. */
ok("INVALID_URL is input", isUserInputError("INVALID_URL", 400) === true);
ok("INVALID_REQUEST is input", isUserInputError("INVALID_REQUEST", 400) === true);
ok(
  "BLOCKED_ADDRESS is a real failure despite 400",
  isUserInputError("BLOCKED_ADDRESS", 400) === false,
);
ok(
  "UPSTREAM_ERROR is a real failure despite 400",
  isUserInputError("UPSTREAM_ERROR", 400) === false,
);
ok("RATE_LIMITED is a real failure", isUserInputError("RATE_LIMITED", 429) === false);
ok("a blank code falls back to status", isUserInputError("", 400) === true);

/* ------------------------------------------------------------------ *
 * 5. What the server actually stores
 * ------------------------------------------------------------------ */

const ctx = {
  pathname: "/ar/tools/seo-analyzer?url=https://private.example",
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
  userId: null,
  sessionKey: "23f02d16-49f7-4b42-852e-5df463cef348",
};

const success = validateEvent(
  {
    eventId: eventIdFor(opA, "tool_success"),
    eventName: "tool_success",
    toolKey: "seo-analyzer",
    durationMs: 812.7,
  },
  ctx,
);

ok("success is accepted", success !== null);
ok("success keeps its derived id", success?.event_id === eventIdFor(opA, "tool_success"));
ok("success gets outcome=success", success?.outcome === "success");
ok("duration is rounded", success?.duration_ms === 813);
ok("locale comes from the path", success?.locale === "ar");
ok("device comes from the UA", success?.device === "mobile");
ok("query string is stripped from path", success?.path === "/ar/tools/seo-analyzer");
ok("no URL is stored", JSON.stringify(success).includes("private.example") === false);
ok("no email is stored", JSON.stringify(success).includes("@") === false);

const failure = validateEvent(
  {
    eventId: eventIdFor(opA, "tool_error"),
    eventName: "tool_error",
    toolKey: "seo-analyzer",
    errorCode: "UPSTREAM_ERROR",
    durationMs: 2400,
  },
  ctx,
);

ok("error is accepted", failure !== null);
ok("error gets outcome=error", failure?.outcome === "error");
ok("error keeps the category", failure?.error_code === "UPSTREAM_ERROR");
ok(
  "error and success on one operation store separately",
  failure?.event_id !== success?.event_id,
);

const junkError = validateEvent(
  {
    eventId: eventIdFor(opA, "tool_error"),
    eventName: "tool_error",
    toolKey: "seo-analyzer",
    errorCode: "fetch failed for https://private.example/x",
  },
  ctx,
);
ok("an arbitrary error string is dropped, not stored", junkError?.error_code === null);

ok(
  "an unknown event name is rejected",
  validateEvent({ eventName: "tool_amazing", toolKey: "seo-analyzer" }, ctx) === null,
);
ok(
  "a tool event without a tool key is rejected",
  validateEvent({ eventName: "tool_success" }, ctx) === null,
);
ok(
  "an unknown tool key is rejected",
  validateEvent({ eventName: "tool_use", toolKey: "made-up-tool" }, ctx) === null,
);

const clamp = validateEvent(
  { eventName: "tool_success", toolKey: "page-speed", durationMs: 99_999_999 },
  ctx,
);
ok("absurd duration is clamped", clamp?.duration_ms === 600_000);

const negative = validateEvent(
  { eventName: "tool_success", toolKey: "page-speed", durationMs: -5 },
  ctx,
);
ok("negative duration is dropped", negative?.duration_ms === null);

/* A legacy-format beacon must still land, mapped to tool_use with unknown
   outcome — never as a success. */
const legacy = validateEvent(
  { eventName: "tool_use", toolKey: "schema-markup-generator" },
  ctx,
);
ok("legacy beacon is tool_use", legacy?.event_name === "tool_use");
ok("legacy beacon claims no outcome", legacy?.outcome === null);
ok("legacy beacon claims no error", legacy?.error_code === null);

/* ------------------------------------------------------------------ *
 * 6. The whole lifecycle, as the database sees it
 * ------------------------------------------------------------------ */

const lifecycle = [
  validateEvent(
    { eventId: eventIdFor(opA, "tool_use"), eventName: "tool_use", toolKey: "page-speed" },
    ctx,
  ),
  validateEvent(
    { eventId: eventIdFor(opA, "tool_success"), eventName: "tool_success", toolKey: "page-speed" },
    ctx,
  ),
];

ok("both lifecycle events are storable", lifecycle.every((e) => e !== null));
ok(
  "the unique index cannot collapse the outcome",
  new Set(lifecycle.map((e) => e?.event_id)).size === 2,
);

/* ------------------------------------------------------------------ *
 * 7. Compatibility with the shipped migration, read from the SQL
 * ------------------------------------------------------------------ */

/* Asserting "it matches the schema" in prose is worth nothing. This reads the
   migration itself, so a column or vocabulary added in one place and not the
   other fails here instead of failing an INSERT in production. */
const sql = readFileSync(
  new URL("../supabase/migrations/20261107_analytics_foundation.sql", import.meta.url),
  "utf8",
);

const table = sql.slice(
  sql.indexOf("create table if not exists public.analytics_events"),
  sql.indexOf("create unique index", sql.indexOf("create table if not exists public.analytics_events")),
);
const columns = new Set(
  [...table.matchAll(/^\s{2}([a-z_]+)\s+(?:uuid|text|integer|timestamptz)/gm)].map((m) => m[1]),
);

const emitted = Object.keys(success ?? {});
ok(
  "every stored field exists in the migration",
  emitted.every((c) => columns.has(c)),
);
ok(
  "no migration column is left unwritten (except server defaults)",
  [...columns].filter((c) => c !== "id" && c !== "created_at").every((c) => emitted.includes(c)),
);

const checkList = (name: string) => {
  // `check (event_name in (...))` and `check (error_code is null or error_code in (...))`
  // — take the vocabulary that follows the `in (` for this column.
  const opener = sql.search(new RegExp(`${name} (?:is null or ${name} )?in \\(`));
  if (opener === -1) return new Set<string>();
  const start = sql.indexOf("in (", opener);
  const j = sql.indexOf("))", start);
  return new Set([...sql.slice(start, j).matchAll(/'([^']+)'/g)].map((m) => m[1]));
};

const allowedEvents = checkList("event_name");
const allowedErrors = checkList("error_code");
ok("tool_use is in the CHECK vocabulary", allowedEvents.has("tool_use"));
ok("tool_success is in the CHECK vocabulary", allowedEvents.has("tool_success"));
ok("tool_error is in the CHECK vocabulary", allowedEvents.has("tool_error"));
ok("UPSTREAM_ERROR is in the CHECK vocabulary", allowedErrors.has("UPSTREAM_ERROR"));
ok("INTERNAL is in the CHECK vocabulary", allowedErrors.has("INTERNAL"));

/* Everything the app can emit must be insertable. */
const everyErrorCode = [
  "INVALID_URL", "BLOCKED_ADDRESS", "RATE_LIMITED", "UPSTREAM_ERROR", "TIMEOUT",
  "TOO_LARGE", "NOT_HTML", "INVALID_REQUEST", "CAPTCHA_FAILED", "INTERNAL",
] as const;
ok(
  "every client error code passes the CHECK constraint",
  everyErrorCode.every((c) => allowedErrors.has(c)),
);
ok(
  "the table still has RLS enabled with no permissive policy",
  /alter table public\.analytics_events enable row level security/.test(sql) &&
    !/create policy/i.test(sql),
);
ok(
  "the migration is additive only",
  !/(^|\n)\s*drop\s+(table|column|schema)/i.test(
    sql.slice(0, sql.indexOf("-- ROLLBACK")),
  ),
);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
