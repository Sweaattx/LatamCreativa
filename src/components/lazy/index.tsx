/**
 * Lazy Loading Utilities
 * 
 * Functions for lazy loading components on demand
 * to improve initial page load performance.
 * 
 * Usage:
 * ```tsx
 * import { withLazyLoading, lazyNamed } from '@/components/lazy';
 * 
 * // For default exports
 * const LazyComponent = withLazyLoading(() => import('./Component'));
 * 
 * // For named exports
 * const LazyNamed = lazyNamed(() => import('./Module'), 'ComponentName');
 * ```
 * 
 * @module components/lazy
 */

'use client';

import { lazy, Suspense, ComponentType, ReactNode } from 'react';
import { Loader } from '../common/Loader';

/**
 * Create a lazy loaded component from a default export
 */
export function withLazyLoading<P extends object>(
    importFn: () => Promise<{ default: ComponentType<P> }>,
    fallback: ReactNode = <Loader />
): ComponentType<P> {
    const LazyComponent = lazy(importFn);

    return function WrappedComponent(props: P) {
        return (
            <Suspense fallback={fallback}>
                <LazyComponent {...props} />
            </Suspense>
        );
    };
}

/**
 * Create a lazy loaded component from a named export
 */
export function lazyNamed<P extends object>(
    importFn: () => Promise<Record<string, ComponentType<P>>>,
    componentName: string,
    fallback: ReactNode = <Loader />
): ComponentType<P> {
    const LazyComponent = lazy(() =>
        importFn().then(module => ({ default: module[componentName] }))
    );

    return function WrappedComponent(props: P) {
        return (
            <Suspense fallback={fallback}>
                <LazyComponent {...props} />
            </Suspense>
        );
    };
}
