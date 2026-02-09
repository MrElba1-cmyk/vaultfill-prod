/**
 * In-Memory Sliding Window Rate Limiter
 * 
 * For production with multiple instances, swap for @upstash/ratelimit + Redis.
 * This implementation is single-process safe and suitable for Vercel serverless
 * (each cold start gets a fresh window, which is acceptable for basic protection).
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically (prevent memory leak)
const CLEANUP_INTERVAL = 60_000; // 1 min
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window size in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

/**
 * Check rate limit for a given key (typically IP + route).
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  cleanup(config.windowMs);

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < config.windowMs);

  if (entry.timestamps.length >= config.limit) {
    const oldest = entry.timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      resetMs: oldest + config.windowMs - now,
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: config.limit - entry.timestamps.length,
    resetMs: config.windowMs,
  };
}

/**
 * Extract client IP from request headers.
 */
export function getClientIP(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Rate limit middleware. Returns a Response if rate limited, null if OK.
 */
export function rateLimitGuard(
  req: Request,
  route: string,
  config: RateLimitConfig
): Response | null {
  const ip = getClientIP(req);
  const key = `${route}:${ip}`;
  const result = checkRateLimit(key, config);

  if (!result.allowed) {
    return Response.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(result.resetMs / 1000)),
          'X-RateLimit-Limit': String(config.limit),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  return null;
}

// Pre-configured limits
export const RATE_LIMITS = {
  leads: { limit: 10, windowMs: 60_000 } as RateLimitConfig,
  chat: { limit: 20, windowMs: 60_000 } as RateLimitConfig,
  onboarding: { limit: 20, windowMs: 60_000 } as RateLimitConfig,
} as const;
