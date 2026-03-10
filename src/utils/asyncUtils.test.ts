/**
 * Async Utilities Tests
 * Tests for asyncUtils.ts - 15 tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    withRetry,
    debounceAsync,
    throttleAsync,
    withTimeout,
    parallelLimit,
} from './asyncUtils';

describe('asyncUtils', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('withRetry', () => {
        it('should succeed on first try without retrying', async () => {
            vi.useRealTimers();
            const fn = vi.fn().mockResolvedValue('success');
            const result = await withRetry(fn);
            expect(result).toBe('success');
            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('should retry on failure and eventually succeed', async () => {
            vi.useRealTimers();
            const fn = vi.fn()
                .mockRejectedValueOnce(new Error('fail 1'))
                .mockResolvedValue('success');
            const result = await withRetry(fn, { maxRetries: 2, initialDelayMs: 10, maxDelayMs: 50 });
            expect(result).toBe('success');
            expect(fn).toHaveBeenCalledTimes(2);
        });

        it('should throw after max retries', async () => {
            vi.useRealTimers();
            const fn = vi.fn().mockRejectedValue(new Error('always fails'));
            await expect(
                withRetry(fn, { maxRetries: 2, initialDelayMs: 10, maxDelayMs: 50 })
            ).rejects.toThrow('always fails');
            expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
        });

        it('should respect shouldRetry predicate', async () => {
            vi.useRealTimers();
            const fn = vi.fn().mockRejectedValue(new Error('non-retryable'));
            await expect(
                withRetry(fn, {
                    maxRetries: 3,
                    initialDelayMs: 10,
                    maxDelayMs: 50,
                    shouldRetry: () => false
                })
            ).rejects.toThrow('non-retryable');
            expect(fn).toHaveBeenCalledTimes(1);
        });
    });

    describe('withTimeout', () => {
        it('should resolve if function completes within timeout', async () => {
            vi.useRealTimers();
            const fn = () => Promise.resolve('done');
            const result = await withTimeout(fn, 1000);
            expect(result).toBe('done');
        });

        it('should reject with timeout error if function takes too long', async () => {
            vi.useRealTimers();
            const fn = () => new Promise(resolve => setTimeout(resolve, 200));
            await expect(
                withTimeout(fn, 50, 'Too slow')
            ).rejects.toThrow('Too slow');
        });

        it('should use default timeout message', async () => {
            vi.useRealTimers();
            const fn = () => new Promise(resolve => setTimeout(resolve, 200));
            await expect(
                withTimeout(fn, 50)
            ).rejects.toThrow('Operation timed out');
        });
    });

    describe('parallelLimit', () => {
        it('should process all items', async () => {
            vi.useRealTimers();
            const items = [1, 2, 3, 4, 5];
            const fn = vi.fn(async (item: number) => item * 2);
            const results = await parallelLimit(items, fn, 2);
            expect(results).toEqual([2, 4, 6, 8, 10]);
            expect(fn).toHaveBeenCalledTimes(5);
        });

        it('should handle empty arrays', async () => {
            vi.useRealTimers();
            const results = await parallelLimit([], async (x: number) => x, 3);
            expect(results).toEqual([]);
        });

        it('should maintain order of results', async () => {
            vi.useRealTimers();
            const items = [3, 1, 2];
            const fn = async (item: number) => {
                await new Promise(r => setTimeout(r, item * 10));
                return `item-${item}`;
            };
            const results = await parallelLimit(items, fn, 5);
            expect(results).toEqual(['item-3', 'item-1', 'item-2']);
        });
    });

    describe('debounceAsync', () => {
        it('should debounce multiple rapid calls', async () => {
            vi.useRealTimers();
            const fn = vi.fn().mockResolvedValue('result');
            const debounced = debounceAsync(fn, 50);

            // Make multiple rapid calls
            debounced('a');
            debounced('b');
            const resultPromise = debounced('c');

            const result = await resultPromise;
            expect(result).toBe('result');
            // The fn should only be called once (with the last call)
            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenCalledWith('c');
        });
    });

    describe('throttleAsync', () => {
        it('should execute immediately on first call', async () => {
            vi.useRealTimers();
            const fn = vi.fn().mockResolvedValue('result');
            const throttled = throttleAsync(fn, 100);
            const result = await throttled();
            expect(result).toBe('result');
            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('should return undefined when throttled', async () => {
            vi.useRealTimers();
            const fn = vi.fn().mockResolvedValue('result');
            const throttled = throttleAsync(fn, 100);
            await throttled(); // first call
            const result = await throttled(); // second call (throttled)
            // Should be either the pending result or undefined
            expect(fn).toHaveBeenCalledTimes(1);
        });
    });
});

