/**
 * Logger Utility Tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock import.meta.env.DEV
const mockEnv = { DEV: true };
vi.mock('import.meta', () => ({
    env: mockEnv
}));

// We need to dynamically import after mocking
describe('Logger Utility', () => {
    const originalConsole = {
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error,
    };

    beforeEach(() => {
        console.debug = vi.fn();
        console.info = vi.fn();
        console.warn = vi.fn();
        console.error = vi.fn();
    });

    afterEach(() => {
        console.debug = originalConsole.debug;
        console.info = originalConsole.info;
        console.warn = originalConsole.warn;
        console.error = originalConsole.error;
        vi.clearAllMocks();
    });

    it('should export logger object with expected methods', async () => {
        const { logger } = await import('./logger');
        
        expect(logger).toBeDefined();
        expect(typeof logger.debug).toBe('function');
        expect(typeof logger.info).toBe('function');
        expect(typeof logger.warn).toBe('function');
        expect(typeof logger.error).toBe('function');
    });

    it('warn should always log regardless of environment', async () => {
        const { logger } = await import('./logger');
        
        logger.warn('test warning');
        
        expect(console.warn).toHaveBeenCalled();
    });

    it('error should always log regardless of environment', async () => {
        const { logger } = await import('./logger');
        
        logger.error('test error');
        
        expect(console.error).toHaveBeenCalled();
    });

    it('should include formatted message with level', async () => {
        const { logger } = await import('./logger');
        
        logger.warn('test message');
        
        expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining('[WARN]'),
            // No additional args
        );
    });
});
