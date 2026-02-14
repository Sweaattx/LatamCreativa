/**
 * Rate Limiter Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    checkRateLimit,
    withRateLimit,
    clearRateLimit,
    clearAllRateLimits,
    getRateLimitStatus,
    RateLimitPresets
} from './rateLimiter';

describe('rateLimiter', () => {
    beforeEach(() => {
        clearAllRateLimits();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('checkRateLimit', () => {
        it('should allow requests within limit', () => {
            const result = checkRateLimit('test-key', { maxRequests: 3, windowMs: 1000 });
            expect(result.allowed).toBe(true);
            // remaining shows requests left BEFORE current request is consumed
            expect(result.remaining).toBe(3);
        });

        it('should block requests exceeding limit', () => {
            const config = { maxRequests: 2, windowMs: 1000 };

            checkRateLimit('test-key', config);
            checkRateLimit('test-key', config);
            const result = checkRateLimit('test-key', config);

            expect(result.allowed).toBe(false);
            expect(result.remaining).toBe(0);
        });

        it('should reset after window expires', () => {
            const config = { maxRequests: 1, windowMs: 1000 };

            checkRateLimit('test-key', config);
            expect(checkRateLimit('test-key', config).allowed).toBe(false);

            // Advance time past window
            vi.advanceTimersByTime(1001);

            expect(checkRateLimit('test-key', config).allowed).toBe(true);
        });
    });

    describe('withRateLimit', () => {
        it('should execute function when not rate limited', async () => {
            const fn = vi.fn().mockResolvedValue('success');
            const result = await withRateLimit('test', fn, { maxRequests: 1, windowMs: 1000 });

            expect(result).toBe('success');
            expect(fn).toHaveBeenCalled();
        });

        it('should throw error when rate limited', async () => {
            const fn = vi.fn().mockResolvedValue('success');
            const config = { maxRequests: 1, windowMs: 1000 };

            await withRateLimit('test', fn, config);

            await expect(withRateLimit('test', fn, config)).rejects.toThrow(/Demasiadas solicitudes/);
        });
    });

    describe('clearRateLimit', () => {
        it('should clear limit for specific key', () => {
            const config = { maxRequests: 1, windowMs: 1000 };

            checkRateLimit('key1', config);
            checkRateLimit('key2', config);

            clearRateLimit('key1');

            expect(checkRateLimit('key1', config).allowed).toBe(true);
            expect(checkRateLimit('key2', config).allowed).toBe(false);
        });
    });

    describe('getRateLimitStatus', () => {
        it('should return status without consuming a request', () => {
            const config = { maxRequests: 2, windowMs: 1000 };

            checkRateLimit('test', config);

            const status1 = getRateLimitStatus('test', config);
            const status2 = getRateLimitStatus('test', config);

            // Both should show same remaining (1) because getRateLimitStatus doesn't consume
            expect(status1.remaining).toBe(1);
            expect(status2.remaining).toBe(1);
            expect(status1.isLimited).toBe(false);
        });
    });

    describe('RateLimitPresets', () => {
        it('should have all expected presets', () => {
            expect(RateLimitPresets.standard).toBeDefined();
            expect(RateLimitPresets.form).toBeDefined();
            expect(RateLimitPresets.auth).toBeDefined();
            expect(RateLimitPresets.search).toBeDefined();
            expect(RateLimitPresets.upload).toBeDefined();
        });
    });
});
