/**
 * Server-Side Rate Limiter
 * 
 * In-memory rate limiter for API routes. Uses a sliding window approach.
 * In Cloudflare Workers, each worker instance has its own memory,
 * so this provides per-instance rate limiting.
 * 
 * @module lib/rateLimit
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Cleanup expired entries periodically
const CLEANUP_INTERVAL = 60_000; // 1 minute
let lastCleanup = Date.now();

function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;

    for (const [key, entry] of rateLimitMap) {
        if (now > entry.resetAt) {
            rateLimitMap.delete(key);
        }
    }
}

interface RateLimitConfig {
    /** Maximum number of requests allowed in the window */
    maxRequests: number;
    /** Window duration in seconds */
    windowSeconds: number;
}

interface RateLimitResult {
    /** Whether the request is allowed */
    allowed: boolean;
    /** Number of remaining requests in the window */
    remaining: number;
    /** Unix timestamp (ms) when the window resets */
    resetAt: number;
    /** Total limit for the window */
    limit: number;
}

/**
 * Check and enforce rate limit for a given identifier.
 * 
 * @param identifier - Unique identifier for the rate limit (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 * 
 * @example
 * ```ts
 * const result = checkRateLimit(ip, { maxRequests: 10, windowSeconds: 60 });
 * if (!result.allowed) {
 *   return new Response('Too Many Requests', { status: 429 });
 * }
 * ```
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    cleanup();

    const now = Date.now();
    const windowMs = config.windowSeconds * 1000;
    const key = `${identifier}`;

    const existing = rateLimitMap.get(key);

    if (!existing || now > existing.resetAt) {
        // New window
        const entry: RateLimitEntry = {
            count: 1,
            resetAt: now + windowMs,
        };
        rateLimitMap.set(key, entry);
        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetAt: entry.resetAt,
            limit: config.maxRequests,
        };
    }

    // Existing window
    existing.count++;

    if (existing.count > config.maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetAt: existing.resetAt,
            limit: config.maxRequests,
        };
    }

    return {
        allowed: true,
        remaining: config.maxRequests - existing.count,
        resetAt: existing.resetAt,
        limit: config.maxRequests,
    };
}

/**
 * Create rate limit headers for the response.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
    return {
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
    };
}
