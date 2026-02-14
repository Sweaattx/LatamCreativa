/**
 * Section Error Boundary
 * 
 * Granular error boundary for wrapping individual sections
 * so errors don't crash the entire page.
 * 
 * @module components/common/SectionErrorBoundary
 */

'use client';

import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    /** Section name for error reporting */
    sectionName?: string;
    /** Custom fallback UI */
    fallback?: ReactNode;
    /** Show retry button */
    showRetry?: boolean;
    /** Callback when error occurs */
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class SectionErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        const { sectionName, onError } = this.props;

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error(`Error in section "${sectionName || 'Unknown'}":`, error);
            console.error('Component stack:', errorInfo.componentStack);
        }

        // Call custom error handler if provided
        onError?.(error, errorInfo);
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null });
    };

    render(): ReactNode {
        const { hasError } = this.state;
        const { children, fallback, showRetry = true, sectionName } = this.props;

        if (hasError) {
            if (fallback) {
                return fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center p-8 bg-neutral-900/50 rounded-xl border border-neutral-800">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                        Error en {sectionName || 'esta sección'}
                    </h3>
                    <p className="text-neutral-400 text-center mb-4">
                        Ha ocurrido un error. Por favor intenta de nuevo.
                    </p>
                    {showRetry && (
                        <button
                            onClick={this.handleRetry}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reintentar
                        </button>
                    )}
                </div>
            );
        }

        return children;
    }
}

/**
 * HOC to wrap components with SectionErrorBoundary
 */
export function withSectionErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    sectionName: string
): React.ComponentType<P> {
    return function WrappedComponent(props: P) {
        return (
            <SectionErrorBoundary sectionName={sectionName}>
                <Component {...props} />
            </SectionErrorBoundary>
        );
    };
}
