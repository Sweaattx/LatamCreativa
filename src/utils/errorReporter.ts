/**
 * Enhanced Error Reporter with External Service Support
 * 
 * Extends the existing error logger with hooks for external services
 * like Sentry, LogRocket, etc.
 * 
 * @module utils/errorReporter
 */

import { errorLogger } from './errorLogger';

type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

interface ErrorContext {
    source?: string;
    severity?: ErrorSeverity;
    metadata?: Record<string, unknown>;
}

interface ExternalErrorService {
    name: string;
    captureException: (error: Error, context?: Record<string, unknown>) => void;
    captureMessage: (message: string, level?: string) => void;
    setUser: (user: { id: string; email?: string; name?: string } | null) => void;
}

// Registry of external error services
const externalServices: ExternalErrorService[] = [];

/**
 * Register an external error service (e.g., Sentry)
 * 
 * @example
 * ```ts
 * import * as Sentry from '@sentry/nextjs';
 * 
 * registerErrorService({
 *   name: 'Sentry',
 *   captureException: Sentry.captureException,
 *   captureMessage: Sentry.captureMessage,
 *   setUser: Sentry.setUser,
 * });
 * ```
 */
export function registerErrorService(service: ExternalErrorService): void {
    externalServices.push(service);
}

/**
 * Report an error to all registered services and local logger
 */
export function reportError(
    error: Error | string,
    options: ErrorContext = {}
): void {
    const { ...context } = options;

    // Log locally
    errorLogger.log(error, context);

    // Send to external services
    const errorObj = typeof error === 'string' ? new Error(error) : error;

    for (const service of externalServices) {
        try {
            service.captureException(errorObj, {
                source: context.source,
                severity: context.severity,
                ...context.metadata,
            });
        } catch (e) {
            console.error(`Failed to report to ${service.name}:`, e);
        }
    }
}

/**
 * Report a warning to all registered services
 */
export function reportWarning(
    message: string,
    options: ErrorContext = {}
): void {
    errorLogger.warn(message, options);

    for (const service of externalServices) {
        try {
            service.captureMessage(message, 'warning');
        } catch (e) {
            console.error(`Failed to report to ${service.name}:`, e);
        }
    }
}

/**
 * Set user context for error reporting
 */
export function setErrorReportingUser(
    user: { id: string; email?: string; name?: string } | null
): void {
    for (const service of externalServices) {
        try {
            service.setUser(user);
        } catch (e) {
            console.error(`Failed to set user in ${service.name}:`, e);
        }
    }
}

/**
 * Create an error boundary handler that reports to external services
 */
export function createErrorBoundaryHandler(sectionName: string) {
    return (error: Error, errorInfo: React.ErrorInfo) => {
        reportError(error, {
            source: `ErrorBoundary:${sectionName}`,
            severity: 'high',
            metadata: {
                componentStack: errorInfo.componentStack,
            },
        });
    };
}

export type { ErrorSeverity, ErrorContext };
