import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiting is optional infrastructure: the tools must keep working when
 * Redis is not configured (local development, preview deploys, or a
 * deliberately disabled limiter). Clients are therefore created lazily and
 * resolve to `null` when the credentials are missing or malformed.
 */
function createRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;
  // Guard against placeholder values such as "..." in .env files.
  if (!/^https:\/\/.+/.test(url)) return null;

  return new Redis({ url, token });
}

let redis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redis === undefined) {
    redis = createRedis();
  }
  return redis;
}

function makeLimiter(
  limit: number,
  window: Parameters<typeof Ratelimit.slidingWindow>[1],
  prefix: string,
): Ratelimit | null {
  const client = getRedis();
  if (!client) return null;

  return new Ratelimit({
    redis: client,
    limiter: Ratelimit.slidingWindow(limit, window),
    prefix,
    analytics: false,
  });
}

let analyzeLimiter: Ratelimit | null | undefined;
let contactLimiter: Ratelimit | null | undefined;
let statusLimiter: Ratelimit | null | undefined;
let pageSpeedLimiter: Ratelimit | null | undefined;
let baiduLimiter: Ratelimit | null | undefined;

/** `null` means Redis is unavailable; callers should skip limiting. */
export function getAnalyzeRatelimit(): Ratelimit | null {
  if (analyzeLimiter === undefined) {
    analyzeLimiter = makeLimiter(10, "1 m", "lifeseos:analyze");
  }
  return analyzeLimiter;
}

/** Status checks are cheap header-only requests, so they get a looser budget. */
export function getStatusRatelimit(): Ratelimit | null {
  if (statusLimiter === undefined) {
    statusLimiter = makeLimiter(30, "1 m", "lifeseos:http-status");
  }
  return statusLimiter;
}

/** PageSpeed calls are expensive upstream (Lighthouse), so keep the budget small. */
export function getPageSpeedRatelimit(): Ratelimit | null {
  if (pageSpeedLimiter === undefined) {
    pageSpeedLimiter = makeLimiter(10, "1 m", "lifeseos:page-speed");
  }
  return pageSpeedLimiter;
}

/** Baidu accepts limited daily quota, so submissions are throttled per IP. */
export function getBaiduRatelimit(): Ratelimit | null {
  if (baiduLimiter === undefined) {
    baiduLimiter = makeLimiter(20, "1 h", "lifeseos:baidu-push");
  }
  return baiduLimiter;
}

export function getContactRatelimit(): Ratelimit | null {
  if (contactLimiter === undefined) {
    contactLimiter = makeLimiter(5, "10 m", "lifeseos:contact");
  }
  return contactLimiter;
}

let signupLimiter: Ratelimit | null | undefined;
let resendLimiter: Ratelimit | null | undefined;
let verifyLimiter: Ratelimit | null | undefined;

/**
 * Registration: 5 accounts per IP per hour. Deliberately generous for shared
 * connections (offices, universities, mobile carriers) while still stopping a
 * scripted flood, and it is only one layer — Turnstile sits in front of it.
 */
export function getSignupRatelimit(): Ratelimit | null {
  if (signupLimiter === undefined) {
    signupLimiter = makeLimiter(5, "1 h", "lifeseos:auth-signup");
  }
  return signupLimiter;
}

/** Verification email resend: 3 per 10 minutes per IP, on top of the 60s UI cooldown. */
export function getResendRatelimit(): Ratelimit | null {
  if (resendLimiter === undefined) {
    resendLimiter = makeLimiter(3, "10 m", "lifeseos:auth-resend");
  }
  return resendLimiter;
}

/** Code checks: brute-forcing a 6-digit code is cheap for the attacker, so cap attempts. */
export function getVerifyRatelimit(): Ratelimit | null {
  if (verifyLimiter === undefined) {
    verifyLimiter = makeLimiter(10, "10 m", "lifeseos:auth-verify");
  }
  return verifyLimiter;
}

/**
 * Analytics beacons.
 *
 * These endpoints are public, unauthenticated, and write to the database with
 * service-role credentials — the highest-risk shape a route can have. Without a
 * limiter, one script can create rows as fast as the function can accept them.
 *
 * The budgets are set from what real traffic looks like, not from paranoia: a
 * person browsing fast might fire 20–30 page views a minute, never 120. A 429
 * here loses at most one analytics row and the client already ignores failures,
 * so a false positive costs nothing a user can perceive.
 */
let analyticsLimiter: Ratelimit | null | undefined;
let toolEventLimiter: Ratelimit | null | undefined;

export function getAnalyticsRatelimit(): Ratelimit | null {
  if (analyticsLimiter === undefined) {
    analyticsLimiter = makeLimiter(120, "1 m", "lifeseos:analytics");
  }
  return analyticsLimiter;
}

/** Tool beacons are one per completed run, so the budget is far smaller. */
export function getToolEventRatelimit(): Ratelimit | null {
  if (toolEventLimiter === undefined) {
    toolEventLimiter = makeLimiter(60, "1 m", "lifeseos:tool-events");
  }
  return toolEventLimiter;
}
