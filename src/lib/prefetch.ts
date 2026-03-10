/**
 * Prefetch Configuration
 * 
 * Configuration for strategic link prefetching to improve navigation performance.
 * Uses native browser prefetch APIs (compatible with Next.js App Router).
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
 * Prefetch a route using the native browser prefetch API.
 * Appends a <link rel="prefetch"> tag to the document head.
 */
export function prefetchRoute(route: string): void {
    if (typeof window === 'undefined') return;

    // Avoid duplicate prefetch links
    const existing = document.querySelector(`link[rel="prefetch"][href="${route}"]`);
    if (existing) return;

    try {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        link.as = 'document';
        document.head.appendChild(link);
    } catch {
        // Silently fail — prefetch is an optimization
    }
}

/**
 * Prefetch multiple routes
 */
export function prefetchRoutes(routes: string[]): void {
    routes.forEach(prefetchRoute);
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

