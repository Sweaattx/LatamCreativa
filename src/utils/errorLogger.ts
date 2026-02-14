/**
 * Error Logger Utility
 * 
 * Centralized error logging and reporting service.
 * In development, logs to console with full details.
 * In production, can be extended to send to external services (Sentry, LogRocket, etc.)
 * 
 * @module utils/errorLogger
 */

type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

interface ErrorContext {
    /** Component or function where error occurred */
    source?: string;
    /** User ID if available */
    userId?: string;
    /** Additional metadata */
    metadata?: Record<string, unknown>;
    /** Error severity level */
    severity?: ErrorSeverity;
    /** Tags for categorization */
    tags?: string[];
}

interface ErrorLogEntry {
    timestamp: string;
    message: string;
    stack?: string;
    context: ErrorContext;
    url: string;
    userAgent: string;
}

const isDev = process.env.NODE_ENV === 'development';

// In-memory error buffer for batching (production)
const errorBuffer: ErrorLogEntry[] = [];
const MAX_BUFFER_SIZE = 10;
const FLUSH_INTERVAL = 30000; // 30 seconds

/**
 * Format error for logging
 */
function formatError(error: unknown): { message: string; stack?: string } {
    if (error instanceof Error) {
        return { message: error.message, stack: error.stack };
    }
    if (typeof error === 'string') {
        return { message: error };
    }
    return { message: String(error) };
}

/**
 * Get browser info safely
 */
function getBrowserInfo(): { url: string; userAgent: string } {
    if (typeof window === 'undefined') {
        return { url: 'server', userAgent: 'server' };
    }
    return {
        url: window.location.href,
        userAgent: navigator.userAgent
    };
}

/**
 * Create error log entry
 */
function createLogEntry(error: unknown, context: ErrorContext = {}): ErrorLogEntry {
    const { message, stack } = formatError(error);
    const { url, userAgent } = getBrowserInfo();

    return {
        timestamp: new Date().toISOString(),
        message,
        stack,
        context: {
            severity: 'medium',
            ...context
        },
        url,
        userAgent
    };
}

/**
 * Flush error buffer to external service
 * Override this function to integrate with Sentry, LogRocket, etc.
 */
async function flushErrors(): Promise<void> {
    if (errorBuffer.length === 0) return;

    const errors = [...errorBuffer];
    errorBuffer.length = 0;

    // In production, send to external service
    if (!isDev) {
        // Example: await fetch('/api/errors', { method: 'POST', body: JSON.stringify(errors) });
        console.warn('[ErrorLogger] Would send errors to service:', errors.length);
    }
}

// Auto-flush in production
if (typeof window !== 'undefined' && !isDev) {
    setInterval(flushErrors, FLUSH_INTERVAL);
    window.addEventListener('beforeunload', flushErrors);
}

/**
 * Error Logger Service
 */
export const errorLogger = {
    /**
     * Log an error with optional context
     */
    log(error: unknown, context: ErrorContext = {}): void {
        const entry = createLogEntry(error, context);

        if (isDev) {
            // Detailed console output in development
            console.group(`🚨 [${entry.context.severity?.toUpperCase()}] ${entry.message}`);
            if (entry.stack) console.error(entry.stack);
            if (Object.keys(entry.context).length > 0) {
                console.info('Context:', entry.context);
            }
            console.info('URL:', entry.url);
            console.groupEnd();
        } else {
            // Buffer errors in production
            errorBuffer.push(entry);
            if (errorBuffer.length >= MAX_BUFFER_SIZE) {
                flushErrors();
            }
        }
    },

    /**
     * Log a handled error (expected errors)
     */
    handled(error: unknown, context: ErrorContext = {}): void {
        this.log(error, { ...context, severity: 'low', tags: [...(context.tags || []), 'handled'] });
    },

    /**
     * Log an unhandled error (unexpected errors)
     */
    unhandled(error: unknown, context: ErrorContext = {}): void {
        this.log(error, { ...context, severity: 'critical', tags: [...(context.tags || []), 'unhandled'] });
    },

    /**
     * Log a warning (non-fatal issues)
     */
    warn(message: string, context: ErrorContext = {}): void {
        this.log(new Error(message), { ...context, severity: 'low' });
    },

    /**
     * Capture and rethrow (for error boundaries)
     */
    captureAndThrow(error: unknown, context: ErrorContext = {}): never {
        this.unhandled(error, context);
        throw error;
    },

    /**
     * Create a wrapped function that logs errors
     */
    wrap<T extends (...args: unknown[]) => unknown>(
        fn: T,
        context: ErrorContext = {}
    ): T {
        return ((...args: unknown[]) => {
            try {
                const result = fn(...args);
                if (result instanceof Promise) {
                    return result.catch((error) => {
                        this.log(error, context);
                        throw error;
                    });
                }
                return result;
            } catch (error) {
                this.log(error, context);
                throw error;
            }
        }) as T;
    },

    /**
     * Flush any buffered errors immediately
     */
    flush: flushErrors
};

export default errorLogger;
