/**
 * Async Utilities Tests
 */

import { describe, it, expect, vi } from 'vitest';
import {
    withRetry,
    withTimeout
} from './asyncUtils';

describe('asyncUtils', () => {
    describe('withRetry', () => {
        it('should succeed on first attempt', async () => {
            const fn = vi.fn().mockResolvedValue('success');
            const result = await withRetry(fn, { maxRetries: 0, initialDelayMs: 10 });

            expect(result).toBe('success');
            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('should retry on failure and succeed', async () => {
            const fn = vi.fn()
                .mockRejectedValueOnce(new Error('fail'))
                .mockResolvedValueOnce('success');

            const result = await withRetry(fn, { maxRetries: 1, initialDelayMs: 10, maxDelayMs: 20 });

            expect(result).toBe('success');
            expect(fn).toHaveBeenCalledTimes(2);
        }, 5000);

        it('should throw after max retries', async () => {
            const fn = vi.fn().mockRejectedValue(new Error('always fail'));

            await expect(
                withRetry(fn, { maxRetries: 1, initialDelayMs: 10, maxDelayMs: 20 })
            ).rejects.toThrow('always fail');

            expect(fn).toHaveBeenCalledTimes(2); // initial + 1 retry
        }, 5000);

        it('should not retry when shouldRetry returns false', async () => {
            const fn = vi.fn().mockRejectedValue(new Error('not retryable'));

            await expect(
                withRetry(fn, {
                    maxRetries: 3,
                    initialDelayMs: 10,
                    shouldRetry: () => false
                })
            ).rejects.toThrow('not retryable');

            expect(fn).toHaveBeenCalledTimes(1);
        });
    });

    describe('withTimeout', () => {
        it('should resolve if function completes in time', async () => {
            const fn = vi.fn().mockResolvedValue('success');
            const result = await withTimeout(fn, 1000);
            expect(result).toBe('success');
        });

        it('should reject if function times out', async () => {
            const fn = vi.fn().mockImplementation(() =>
                new Promise(resolve => setTimeout(resolve, 200))
            );

            await expect(withTimeout(fn, 50, 'Timeout!')).rejects.toThrow('Timeout!');
        }, 5000);
    });
});
