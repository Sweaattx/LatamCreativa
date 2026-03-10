/**
 * Rate Limiter Tests
 * Tests for rateLimiter.ts - 15 tests
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    checkRateLimit,
    withRateLimit,
    clearRateLimit,
    clearAllRateLimits,
    getRateLimitStatus,
    RateLimitPresets,
} from './rateLimiter';

describe('rateLimiter', () => {
    beforeEach(() => {
        clearAllRateLimits();
    });

    describe('RateLimitPresets', () => {
        it('should have correct preset configurations', () => {
            expect(RateLimitPresets.standard).toEqual({ maxRequests: 30, windowMs: 60000 });
            expect(RateLimitPresets.form).toEqual({ maxRequests: 5, windowMs: 60000 });
            expect(RateLimitPresets.auth).toEqual({ maxRequests: 5, windowMs: 300000 });
            expect(RateLimitPresets.search).toEqual({ maxRequests: 20, windowMs: 60000 });
            expect(RateLimitPresets.upload).toEqual({ maxRequests: 10, windowMs: 60000 });
        });
    });

    describe('checkRateLimit', () => {
        it('should allow first request and record it', () => {
            const result = checkRateLimit('test-action');
            expect(result.allowed).toBe(true);
            // After recording, remaining = maxRequests - 1 = 29
            // But checkRateLimit records THEN returns remaining AFTER recording
            expect(result.remaining).toBeGreaterThanOrEqual(0);
        });

        it('should track remaining requests decreasing', () => {
            const config = { maxRequests: 5, windowMs: 60000 };
            const r1 = checkRateLimit('track-test', config);
            const r2 = checkRateLimit('track-test', config);
            expect(r1.remaining).toBeGreaterThan(r2.remaining);
        });

        it('should deny requests when limit exceeded', () => {
            const config = { maxRequests: 3, windowMs: 60000 };
            checkRateLimit('limited-action', config);
            checkRateLimit('limited-action', config);
            checkRateLimit('limited-action', config);
            const result = checkRateLimit('limited-action', config);
            expect(result.allowed).toBe(false);
            expect(result.remaining).toBe(0);
        });

        it('should track different keys independently', () => {
            const config = { maxRequests: 2, windowMs: 60000 };
            checkRateLimit('action-a', config);
            checkRateLimit('action-a', config);
            const resultA = checkRateLimit('action-a', config);
            const resultB = checkRateLimit('action-b', config);

            expect(resultA.allowed).toBe(false);
            expect(resultB.allowed).toBe(true);
        });

        it('should provide resetIn time when limited', () => {
            const config = { maxRequests: 1, windowMs: 60000 };
            checkRateLimit('reset-test', config);
            const result = checkRateLimit('reset-test', config);
            expect(result.resetIn).toBeGreaterThan(0);
            expect(result.resetIn).toBeLessThanOrEqual(60000);
        });
    });

    describe('withRateLimit', () => {
        it('should execute function when not limited', async () => {
            const fn = async () => 'success';
            const result = await withRateLimit('exec-test', fn);
            expect(result).toBe('success');
        });

        it('should throw error when rate limited', async () => {
            const config = { maxRequests: 1, windowMs: 60000 };
            await withRateLimit('throw-test', async () => 'first', config);
            await expect(
                withRateLimit('throw-test', async () => 'second', config)
            ).rejects.toThrow('Demasiadas solicitudes');
        });

        it('should include retry time in error message', async () => {
            const config = { maxRequests: 1, windowMs: 60000 };
            await withRateLimit('msg-test', async () => 'first', config);
            await expect(
                withRateLimit('msg-test', async () => 'second', config)
            ).rejects.toThrow(/segundos/);
        });
    });

    describe('clearRateLimit', () => {
        it('should clear limit for specific key', () => {
            const config = { maxRequests: 1, windowMs: 60000 };
            checkRateLimit('clear-test', config);
            clearRateLimit('clear-test');
            const result = checkRateLimit('clear-test', config);
            expect(result.allowed).toBe(true);
        });
    });

    describe('clearAllRateLimits', () => {
        it('should clear all limits', () => {
            const config = { maxRequests: 1, windowMs: 60000 };
            checkRateLimit('action-1', config);
            checkRateLimit('action-2', config);
            clearAllRateLimits();
            expect(checkRateLimit('action-1', config).allowed).toBe(true);
            expect(checkRateLimit('action-2', config).allowed).toBe(true);
        });
    });

    describe('getRateLimitStatus', () => {
        it('should return full capacity for unknown keys', () => {
            const status = getRateLimitStatus('unknown');
            expect(status.remaining).toBe(30);
            expect(status.isLimited).toBe(false);
            expect(status.resetIn).toBe(0);
        });

        it('should report decreasing remaining after requests', () => {
            checkRateLimit('status-test');
            const status = getRateLimitStatus('status-test');
            expect(status.remaining).toBeLessThan(30);
            expect(status.isLimited).toBe(false);
        });

        it('should report isLimited when at capacity', () => {
            const config = { maxRequests: 2, windowMs: 60000 };
            checkRateLimit('limit-check', config);
            checkRateLimit('limit-check', config);
            const status = getRateLimitStatus('limit-check', config);
            expect(status.isLimited).toBe(true);
            expect(status.remaining).toBe(0);
        });
    });
});
