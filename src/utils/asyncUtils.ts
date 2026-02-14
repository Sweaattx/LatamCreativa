/**
 * Async Utilities
 * 
 * Utility functions for handling async operations with retry logic,
 * debouncing, and error handling.
 * 
 * @module utils/asyncUtils
 */

interface RetryConfig {
    /** Maximum number of retry attempts */
    maxRetries: number;
    /** Initial delay in ms (doubles with each retry - exponential backoff) */
    initialDelayMs: number;
    /** Maximum delay between retries */
    maxDelayMs: number;
    /** Function to determine if error is retryable */
    shouldRetry?: (error: unknown) => boolean;
}

const defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    shouldRetry: () => true,
};

/**
 * Execute an async function with retry logic and exponential backoff
 * 
 * @param fn - Async function to execute
 * @param config - Retry configuration
 * @returns Result of the function
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    config: Partial<RetryConfig> = {}
): Promise<T> {
    const { maxRetries, initialDelayMs, maxDelayMs, shouldRetry } = {
        ...defaultRetryConfig,
        ...config,
    };

    let lastError: unknown;
    let delay = initialDelayMs;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Don't retry if this is the last attempt or error is not retryable
            if (attempt === maxRetries || !shouldRetry!(error)) {
                throw error;
            }

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));

            // Exponential backoff with jitter
            delay = Math.min(delay * 2 + Math.random() * 100, maxDelayMs);
        }
    }

    throw lastError;
}

/**
 * Create a debounced version of an async function
 * 
 * @param fn - Function to debounce
 * @param delayMs - Delay in milliseconds
 * @returns Debounced function
 */
export function debounceAsync<T extends unknown[], R>(
    fn: (...args: T) => Promise<R>,
    delayMs: number
): (...args: T) => Promise<R> {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let pendingPromise: {
        resolve: (value: R) => void;
        reject: (error: unknown) => void;
    } | null = null;

    return (...args: T): Promise<R> => {
        return new Promise((resolve, reject) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            pendingPromise = { resolve, reject };

            timeoutId = setTimeout(async () => {
                try {
                    const result = await fn(...args);
                    pendingPromise?.resolve(result);
                } catch (error) {
                    pendingPromise?.reject(error);
                } finally {
                    timeoutId = null;
                    pendingPromise = null;
                }
            }, delayMs);
        });
    };
}

/**
 * Create a throttled version of an async function
 * Ensures the function is called at most once per interval
 * 
 * @param fn - Function to throttle
 * @param intervalMs - Minimum interval between calls
 * @returns Throttled function
 */
export function throttleAsync<T extends unknown[], R>(
    fn: (...args: T) => Promise<R>,
    intervalMs: number
): (...args: T) => Promise<R | undefined> {
    let lastCall = 0;
    let pending: Promise<R> | null = null;

    return async (...args: T): Promise<R | undefined> => {
        const now = Date.now();

        if (pending) {
            return pending;
        }

        if (now - lastCall >= intervalMs) {
            lastCall = now;
            pending = fn(...args);
            try {
                return await pending;
            } finally {
                pending = null;
            }
        }

        return undefined;
    };
}

/**
 * Execute an async function with a timeout
 * 
 * @param fn - Async function to execute
 * @param timeoutMs - Timeout in milliseconds
 * @param timeoutMessage - Custom timeout error message
 * @returns Result of the function
 */
export async function withTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number,
    timeoutMessage = 'Operation timed out'
): Promise<T> {
    return Promise.race([
        fn(),
        new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
        }),
    ]);
}

/**
 * Execute multiple async operations in parallel with a concurrency limit
 * 
 * @param items - Items to process
 * @param fn - Async function to apply to each item
 * @param concurrency - Maximum concurrent operations
 * @returns Array of results
 */
export async function parallelLimit<T, R>(
    items: T[],
    fn: (item: T, index: number) => Promise<R>,
    concurrency: number
): Promise<R[]> {
    const results: R[] = [];
    const executing: Promise<void>[] = [];

    for (let i = 0; i < items.length; i++) {
        const promise = fn(items[i], i).then(result => {
            results[i] = result;
        });

        executing.push(promise);

        if (executing.length >= concurrency) {
            await Promise.race(executing);
            // Remove completed promises
            for (let j = executing.length - 1; j >= 0; j--) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((executing[j] as any).status === 'fulfilled') {
                    executing.splice(j, 1);
                }
            }
        }
    }

    await Promise.all(executing);
    return results;
}
