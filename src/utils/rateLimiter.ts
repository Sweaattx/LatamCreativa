/**
 * Rate Limiter Utility
 * 
 * Client-side rate limiting to prevent abuse of API calls.
 * Uses a sliding window algorithm with configurable limits.
 * 
 * @module utils/rateLimiter
 */

interface RateLimitConfig {
    /** Maximum number of requests allowed in the window */
    maxRequests: number;
    /** Time window in milliseconds */
    windowMs: number;
}

interface RateLimitEntry {
    timestamps: number[];
}

const limiters = new Map<string, RateLimitEntry>();

/**
 * Default configurations for different action types
 */
export const RateLimitPresets = {
    /** Standard API calls - 30 per minute */
    standard: { maxRequests: 30, windowMs: 60000 },
    /** Form submissions - 5 per minute */
    form: { maxRequests: 5, windowMs: 60000 },
    /** Auth attempts - 5 per 5 minutes */
    auth: { maxRequests: 5, windowMs: 300000 },
    /** Search queries - 20 per minute */
    search: { maxRequests: 20, windowMs: 60000 },
    /** File uploads - 10 per minute */
    upload: { maxRequests: 10, windowMs: 60000 },
} as const;

/**
 * Check if an action is rate limited
 * 
 * @param key - Unique identifier for the action (e.g., 'login', 'search', 'comment-create')
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
    key: string,
    config: RateLimitConfig = RateLimitPresets.standard
): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get or create entry
    let entry = limiters.get(key);
    if (!entry) {
        entry = { timestamps: [] };
        limiters.set(key, entry);
    }

    // Remove expired timestamps
    entry.timestamps = entry.timestamps.filter(ts => ts > windowStart);

    // Check if limit exceeded
    const allowed = entry.timestamps.length < config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - entry.timestamps.length);

    // Calculate reset time
    const oldestTimestamp = entry.timestamps[0] || now;
    const resetIn = Math.max(0, oldestTimestamp + config.windowMs - now);

    // If allowed, record this request
    if (allowed) {
        entry.timestamps.push(now);
    }

    return { allowed, remaining, resetIn };
}

/**
 * Rate limited async function wrapper
 * Throws error if rate limit exceeded
 * 
 * @param key - Rate limit key
 * @param fn - Function to execute
 * @param config - Rate limit configuration
 * @returns Result of the function
 */
export async function withRateLimit<T>(
    key: string,
    fn: () => Promise<T>,
    config: RateLimitConfig = RateLimitPresets.standard
): Promise<T> {
    const { allowed, resetIn } = checkRateLimit(key, config);

    if (!allowed) {
        const seconds = Math.ceil(resetIn / 1000);
        throw new Error(`Demasiadas solicitudes. Intenta de nuevo en ${seconds} segundos.`);
    }

    return fn();
}

/**
 * Clear rate limit for a specific key
 * Useful after successful operations that should reset limits
 */
export function clearRateLimit(key: string): void {
    limiters.delete(key);
}

/**
 * Clear all rate limits
 * Useful on logout or session change
 */
export function clearAllRateLimits(): void {
    limiters.clear();
}

/**
 * Hook-friendly rate limit check
 * Returns current status without recording a request
 */
export function getRateLimitStatus(
    key: string,
    config: RateLimitConfig = RateLimitPresets.standard
): { remaining: number; resetIn: number; isLimited: boolean } {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    const entry = limiters.get(key);
    if (!entry) {
        return { remaining: config.maxRequests, resetIn: 0, isLimited: false };
    }

    const validTimestamps = entry.timestamps.filter(ts => ts > windowStart);
    const remaining = Math.max(0, config.maxRequests - validTimestamps.length);
    const oldestTimestamp = validTimestamps[0] || now;
    const resetIn = validTimestamps.length >= config.maxRequests
        ? Math.max(0, oldestTimestamp + config.windowMs - now)
        : 0;

    return {
        remaining,
        resetIn,
        isLimited: validTimestamps.length >= config.maxRequests
    };
}
