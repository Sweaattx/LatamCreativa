'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect user's preference for reduced motion
 * Returns true if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        // Check if window is available (client-side)
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        // Set initial value
        setPrefersReducedMotion(mediaQuery.matches);

        // Listen for changes
        function handleChange(event: MediaQueryListEvent) {
            setPrefersReducedMotion(event.matches);
        }

        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }

        // Legacy browsers
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
    }, []);

    return prefersReducedMotion;
}

/**
 * Helper to get motion props based on reduced motion preference
 * Use this to conditionally apply animations
 */
export function useMotionProps<T extends Record<string, unknown>>(
    animatedProps: T,
    reducedProps: Partial<T> = {}
): T | Partial<T> {
    const prefersReducedMotion = useReducedMotion();

    if (prefersReducedMotion) {
        return { ...animatedProps, ...reducedProps };
    }

    return animatedProps;
}

export default useReducedMotion;
