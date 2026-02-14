/**
 * Prefetch Configuration
 * 
 * Configuration for strategic link prefetching to improve navigation performance.
 * 
 * @module lib/prefetch
 */

/**
 * Routes that should be prefetched on page load
 * These are the most common navigation targets from the homepage
 */
export const PREFETCH_ROUTES = {
    /** Always prefetch these routes */
    critical: [
        '/blog',
        '/portfolio',
        '/forum',
    ],
    /** Prefetch when user is likely logged in */
    authenticated: [
        '/settings',
        '/collections',
    ],
    /** Prefetch on hover/focus */
    onInteraction: [
        '/jobs',
        '/courses',
        '/freelance',
    ],
} as const;

/**
 * Prefetch a route programmatically
 * Uses Next.js router prefetch
 */
export async function prefetchRoute(route: string): Promise<void> {
    if (typeof window === 'undefined') return;

    // Dynamic import to avoid SSR issues
    const { default: Router } = await import('next/router');

    try {
        await Router.prefetch(route);
    } catch (error) {
        // Silently fail - prefetch is an optimization
        console.debug(`Prefetch failed for ${route}`);
    }
}

/**
 * Prefetch multiple routes
 */
export async function prefetchRoutes(routes: string[]): Promise<void> {
    await Promise.all(routes.map(prefetchRoute));
}

/**
 * Create an intersection observer for lazy prefetching
 * Prefetches routes when they become visible in the viewport
 */
export function createPrefetchObserver(
    onIntersect: (route: string) => void
): IntersectionObserver | null {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
        return null;
    }

    return new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const route = entry.target.getAttribute('data-prefetch');
                    if (route) {
                        onIntersect(route);
                    }
                }
            });
        },
        {
            rootMargin: '100px',
            threshold: 0.1,
        }
    );
}
