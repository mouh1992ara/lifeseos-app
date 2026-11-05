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

export function getContactRatelimit(): Ratelimit | null {
  if (contactLimiter === undefined) {
    contactLimiter = makeLimiter(5, "10 m", "lifeseos:contact");
  }
  return contactLimiter;
}
