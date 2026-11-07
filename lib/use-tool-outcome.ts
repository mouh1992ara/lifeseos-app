"use client";

import { useCallback } from "react";

import { stableEventId } from "./event-id.ts";

/**
 * Real tool outcomes.
 *
 * A tool run has three moments, and each is a different fact:
 *
 *   tool_use      the user asked for something
 *   tool_success  the operation produced valid output
 *   tool_error    the operation failed
 *
 * The rule this module exists to enforce: `tool_use` is not success. A click, a
 * request that was sent, or an empty result is never a success. Success is only
 * emitted from the place in the code that already knows real output exists.
 *
 * ## Why one operation id, and why the terminal event gets its own
 *
 * Every run mints its own `operationId`. All events from that run are derived
 * from it, which gives two properties at once:
 *
 *  - **Retries and re-renders collapse.** React StrictMode double-invokes
 *    effects, a user double-clicks, a promise resolves twice — the same run
 *    derives the same ids, and the unique index turns the duplicates into no-ops.
 *  - **Genuinely separate operations do not collapse.** Two real runs a second
 *    apart are two operation ids, hence four distinct event ids. The server's
 *    minute-based deterministic id is a legacy fallback for beacons that carry
 *    no id at all; real instruments never use it, because it would merge a
 *    user's second search into their first.
 *
 * The terminal event must NOT reuse the `tool_use` id. `analytics_events.event_id`
 * is uniquely indexed and `recordEvent` inserts with `ignoreDuplicates`, so a
 * shared id would make the database silently discard every `tool_success` and
 * `tool_error` — the instrumentation would look correct in the code and store
 * nothing but usage. `eventIdFor` derives a distinct id per (operation, event
 * name) instead, deterministically, so the retry guarantee survives.
 *
 * A terminal event also fires at most once per operation, guarded by a flag, so
 * a success followed by a stray error in the same run cannot both land.
 */

type Outcome = "success" | "error";

/**
 * UUID-shaped id derived from a seed, stable across calls.
 *
 * Mirrors `deterministicEventId` on the server (FNV-1a expanded into UUID
 * shape), so a derived id is idempotent without a round trip. It is not a
 * security primitive: the worst a collision can do is merge two analytics rows.
 */
export function eventIdFor(operationId: string, eventName: string): string {
  // The operation's own event keeps the raw id; only terminals are derived, so
  // there is no path where two different events share one id.
  if (eventName === "tool_use") return operationId;
  return stableEventId([operationId, eventName]);
}

export type ErrorCode =
  | "INVALID_URL"
  | "BLOCKED_ADDRESS"
  | "RATE_LIMITED"
  | "UPSTREAM_ERROR"
  | "TIMEOUT"
  | "TOO_LARGE"
  | "NOT_HTML"
  | "INVALID_REQUEST"
  | "CAPTCHA_FAILED"
  | "INTERNAL";

export type ToolOperation = {
  /** Emit `tool_success`. No-op if the operation already terminated. */
  success: (durationOverrideMs?: number) => void;
  /**
   * Emit `tool_error`. No-op if the operation already terminated.
   * `code` must be a category — never a raw message, which could carry a URL.
   */
  error: (code: ErrorCode, durationOverrideMs?: number) => void;
};

/** Fire-and-forget beacon. Never awaits, never throws, never blocks the UI. */
function send(payload: Record<string, unknown>) {
  void fetch("/api/tool-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {
    // Analytics is not a feature of the page.
  });
}

export function useToolOutcome(toolKey: string) {
  /**
   * Begin an operation and emit `tool_use`.
   *
   * Call this at the point the user commits to a run — after client-side
   * validation has passed, so a user who never submitted a real request is not
   * counted as having used the tool.
   */
  const start = useCallback((): ToolOperation => {
    const operationId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const startedAt = Date.now();
    let terminated = false;

    send({
      tool_key: toolKey,
      event_name: "tool_use",
      event_id: eventIdFor(operationId, "tool_use"),
      path: typeof window !== "undefined" ? window.location.pathname : undefined,
    });

    const finish = (outcome: Outcome, extra: Record<string, unknown>) => {
      if (terminated) return; // one terminal event per operation, ever
      terminated = true;
      const eventName = outcome === "success" ? "tool_success" : "tool_error";
      send({
        tool_key: toolKey,
        event_name: eventName,
        /* Derived, not reused: a shared id would be dropped by the unique index
           and the outcome would vanish. See the note above `eventIdFor`. */
        event_id: eventIdFor(operationId, eventName),
        // Path is sent so the server can derive locale, which it reads from the
        // path prefix. Only the pathname is sent — never a query string.
        path: typeof window !== "undefined" ? window.location.pathname : undefined,
        ...extra,
      });
    };

    return {
      success: (override) =>
        finish("success", {
          duration_ms:
            typeof override === "number"
              ? Math.max(0, Math.round(override))
              : Date.now() - startedAt,
        }),
      error: (code, override) =>
        finish("error", {
          error_code: code,
          duration_ms:
            typeof override === "number"
              ? Math.max(0, Math.round(override))
              : Date.now() - startedAt,
        }),
    };
  }, [toolKey]);

  return { start };
}

/**
 * Guard for "did this actually produce output".
 *
 * The generators are synchronous string builders. Treating a click as success
 * would be wrong, and so would treating a blank string as success — an empty
 * sitemap for a site with no pages is a real failure from the user's point of
 * view, not a completed operation.
 */
export function hasRealOutput(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.keys(value).length > 0;
  return false;
}

/**
 * Maps a server error code to the closed category set.
 *
 * The API already returns categories (`UPSTREAM_ERROR`, `BLOCKED_ADDRESS`…), but
 * a network failure or an unexpected throw has no code. Those become `INTERNAL`
 * rather than being dropped — a failure we cannot classify is still a failure,
 * and silently omitting it would bias success rates upward.
 */
export function errorCodeFrom(err: unknown): ErrorCode {
  const code = (err as { code?: unknown } | null)?.code;
  const known: ErrorCode[] = [
    "INVALID_URL",
    "BLOCKED_ADDRESS",
    "RATE_LIMITED",
    "UPSTREAM_ERROR",
    "TIMEOUT",
    "TOO_LARGE",
    "NOT_HTML",
    "INVALID_REQUEST",
    "CAPTCHA_FAILED",
    "INTERNAL",
  ];
  if (typeof code === "string" && (known as string[]).includes(code)) {
    return code as ErrorCode;
  }
  return "INTERNAL";
}

/**
 * A 4xx that the user caused by their own input (empty URL, malformed URL) is a
 * validation error, not a failed operation. Counting those as `tool_error` would
 * make every typo look like an outage.
 */
export function isUserValidationError(status: number): boolean {
  return status === 400 || status === 422;
}
