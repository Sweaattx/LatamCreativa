'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { errorLogger } from '@/utils/errorLogger';

interface Props {
    children: ReactNode;
    /** Fallback UI to show when error occurs */
    fallback?: ReactNode;
    /** Called when error is caught */
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    /** Source identifier for logging */
    source?: string;
    /** Whether to show reset button */
    showReset?: boolean;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Global Error Boundary Component
 * 
 * Wraps sections of the app to catch and handle errors gracefully.
 * Logs errors to the centralized error logging service.
 * 
 * @example
 * <GlobalErrorBoundary source="ForumSection">
 *   <ForumContent />
 * </GlobalErrorBoundary>
 */
export class GlobalErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        // Log to centralized error service
        errorLogger.unhandled(error, {
            source: this.props.source || 'GlobalErrorBoundary',
            metadata: {
                componentStack: errorInfo.componentStack
            }
        });

        // Call optional error handler
        this.props.onError?.(error, errorInfo);
    }

    handleReset = (): void => {
        this.setState({ hasError: false, error: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Custom fallback
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="flex flex-col items-center justify-center min-h-[300px] p-8 bg-neutral-900/50 rounded-xl border border-red-500/20">
                    <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                        Algo salió mal
                    </h3>
                    <p className="text-neutral-400 text-center max-w-md mb-6">
                        Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
                    </p>

                    <div className="flex gap-4">
                        {this.props.showReset !== false && (
                            <button
                                onClick={this.handleReset}
                                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Reintentar
                            </button>
                        )}
                        <Link
                            href="/"
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            Ir al inicio
                        </Link>
                    </div>

                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details className="mt-6 w-full max-w-2xl">
                            <summary className="cursor-pointer text-sm text-neutral-500 hover:text-neutral-300">
                                Detalles del error (solo en desarrollo)
                            </summary>
                            <pre className="mt-2 p-4 bg-black/50 rounded-lg text-xs text-red-400 overflow-auto">
                                {this.state.error.message}
                                {'\n\n'}
                                {this.state.error.stack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Functional wrapper for easier use with hooks
 */
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    options: Omit<Props, 'children'> = {}
): React.FC<P> {
    const WrappedComponent: React.FC<P> = (props) => (
        <GlobalErrorBoundary {...options}>
            <Component {...props} />
        </GlobalErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

    return WrappedComponent;
}

export default GlobalErrorBoundary;
