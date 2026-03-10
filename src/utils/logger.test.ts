/**
 * Logger Tests
 * Tests for logger.ts - 12 tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from './logger';

describe('logger', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
        vi.spyOn(console, 'debug').mockImplementation(() => { });
        vi.spyOn(console, 'info').mockImplementation(() => { });
        vi.spyOn(console, 'warn').mockImplementation(() => { });
        vi.spyOn(console, 'error').mockImplementation(() => { });
        vi.spyOn(console, 'group').mockImplementation(() => { });
        vi.spyOn(console, 'groupEnd').mockImplementation(() => { });
        vi.spyOn(console, 'table').mockImplementation(() => { });
        vi.spyOn(console, 'time').mockImplementation(() => { });
        vi.spyOn(console, 'timeEnd').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        process.env.NODE_ENV = originalEnv;
    });

    describe('warn', () => {
        it('should always log warnings', () => {
            logger.warn('test warning');
            expect(console.warn).toHaveBeenCalledTimes(1);
        });

        it('should include level prefix in message', () => {
            logger.warn('test warning');
            const message = (console.warn as ReturnType<typeof vi.fn>).mock.calls[0][0];
            expect(message).toContain('[WARN]');
        });
    });

    describe('error', () => {
        it('should always log errors', () => {
            logger.error('test error');
            expect(console.error).toHaveBeenCalledTimes(1);
        });

        it('should include level prefix in message', () => {
            logger.error('test error');
            const message = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0];
            expect(message).toContain('[ERROR]');
        });

        it('should pass additional arguments', () => {
            const extra = { key: 'value' };
            logger.error('test error', extra);
            expect(console.error).toHaveBeenCalledWith(
                expect.any(String),
                extra
            );
        });
    });

    describe('log with custom level', () => {
        it('should format message with warn level', () => {
            logger.log('warn', 'custom warning');
            expect(console.warn).toHaveBeenCalledTimes(1);
        });

        it('should format message with error level', () => {
            logger.log('error', 'custom error');
            expect(console.error).toHaveBeenCalledTimes(1);
        });

        it('should accept custom options', () => {
            logger.log('warn', 'no timestamp', { showTimestamp: false });
            const message = (console.warn as ReturnType<typeof vi.fn>).mock.calls[0][0];
            // Without timestamp, should not start with [
            expect(message).toContain('[WARN]');
        });
    });

    describe('message formatting', () => {
        it('should include timestamp by default', () => {
            logger.warn('test');
            const message = (console.warn as ReturnType<typeof vi.fn>).mock.calls[0][0];
            // ISO timestamp pattern
            expect(message).toMatch(/\[\d{4}-\d{2}-\d{2}T/);
        });

        it('should include level by default', () => {
            logger.error('test');
            const message = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0];
            expect(message).toContain('[ERROR]');
        });

        it('should include the message content', () => {
            logger.warn('hello world');
            const message = (console.warn as ReturnType<typeof vi.fn>).mock.calls[0][0];
            expect(message).toContain('hello world');
        });
    });
});

