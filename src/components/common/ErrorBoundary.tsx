/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in child component tree,
 * logs those errors, and displays a fallback UI.
 * 
 * @module components/common/ErrorBoundary
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { logger } from '../../utils/logger';

interface Props {
  children: ReactNode;
  /** Optional fallback component to show when error occurs */
  fallback?: ReactNode;
  /** Optional callback when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether this is a route-level boundary */
  isRouteBoundary?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({ errorInfo });

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleGoHome = (): void => {
    window.location.href = '/';
  };

  private handleGoBack = (): void => {
    window.history.back();
  };

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, isRouteBoundary } = this.props;

    if (hasError) {
      // If a custom fallback is provided, use it
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            {/* Error Title */}
            <h2 className="text-2xl font-bold text-white mb-3">
              Algo salió mal
            </h2>

            {/* Error Description */}
            <p className="text-neutral-400 mb-6">
              {isRouteBoundary
                ? 'Ha ocurrido un error al cargar esta página. Por favor, intenta de nuevo.'
                : 'Ha ocurrido un error en esta sección. Puedes intentar recargar o volver atrás.'}
            </p>

            {/* Error Details (dev only) */}
            {process.env.NODE_ENV === 'development' && error && (
              <div className="mb-6 p-4 bg-neutral-900 rounded-lg border border-red-500/20 text-left overflow-auto max-h-32">
                <p className="text-sm font-mono text-red-400 break-all">
                  {error.message}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Intentar de nuevo
              </button>

              {isRouteBoundary ? (
                <button
                  onClick={this.handleGoHome}
                  className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Ir al inicio
                </button>
              ) : (
                <button
                  onClick={this.handleGoBack}
                  className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </button>
              )}
            </div>

            {/* Reload option */}
            <button
              onClick={this.handleReload}
              className="mt-4 text-sm text-neutral-500 hover:text-white transition-colors"
            >
              O recargar la página completa
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * Higher-order component to wrap any component with ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
): React.FC<P> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const ComponentWithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return ComponentWithErrorBoundary;
}

export default ErrorBoundary;
