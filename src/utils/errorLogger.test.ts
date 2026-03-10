/**
 * Error Logger Tests
 * Tests for errorLogger.ts - 12 tests
 *
 * Note: NODE_ENV is 'test' in vitest, so errorLogger buffers errors
 * instead of using console.group (which is dev-only behavior).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { errorLogger } from './errorLogger';

describe('errorLogger', () => {
    beforeEach(() => {
        vi.spyOn(console, 'group').mockImplementation(() => { });
        vi.spyOn(console, 'groupEnd').mockImplementation(() => { });
        vi.spyOn(console, 'error').mockImplementation(() => { });
        vi.spyOn(console, 'info').mockImplementation(() => { });
        vi.spyOn(console, 'warn').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('log', () => {
        it('should not throw when logging errors', () => {
            expect(() => errorLogger.log(new Error('test error'))).not.toThrow();
        });

        it('should handle Error objects without crashing', () => {
            expect(() => errorLogger.log(new Error('test message'))).not.toThrow();
        });

        it('should handle string errors', () => {
            expect(() => errorLogger.log('string error')).not.toThrow();
        });

        it('should handle non-standard error types', () => {
            expect(() => errorLogger.log(42)).not.toThrow();
            expect(() => errorLogger.log(null)).not.toThrow();
            expect(() => errorLogger.log(undefined)).not.toThrow();
        });

        it('should accept context parameter', () => {
            expect(() => errorLogger.log(new Error('test'), {
                source: 'AuthForm',
                severity: 'high'
            })).not.toThrow();
        });
    });

    describe('handled', () => {
        it('should not throw when logging handled errors', () => {
            expect(() => errorLogger.handled(new Error('expected error'))).not.toThrow();
        });

        it('should accept context with tags', () => {
            expect(() => errorLogger.handled(new Error('expected'), {
                tags: ['auth', 'validation']
            })).not.toThrow();
        });
    });

    describe('unhandled', () => {
        it('should not throw when logging unhandled errors', () => {
            expect(() => errorLogger.unhandled(new Error('unexpected error'))).not.toThrow();
        });
    });

    describe('warn', () => {
        it('should not throw when logging warnings', () => {
            expect(() => errorLogger.warn('something looks off')).not.toThrow();
        });
    });

    describe('captureAndThrow', () => {
        it('should rethrow the error', () => {
            const error = new Error('critical');
            expect(() => errorLogger.captureAndThrow(error)).toThrow('critical');
        });
    });

    describe('wrap', () => {
        it('should wrap sync functions and rethrow errors', () => {
            const fn = () => { throw new Error('wrapped error'); };
            const wrapped = errorLogger.wrap(fn);
            expect(() => wrapped()).toThrow('wrapped error');
        });

        it('should pass through successful results', () => {
            const fn = (x: number) => x * 2;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const wrapped = errorLogger.wrap(fn as any);
            expect(wrapped(5)).toBe(10);
        });
    });
});
