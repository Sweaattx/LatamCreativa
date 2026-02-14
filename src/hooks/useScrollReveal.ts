'use client';

import { useEffect, useRef, useState, RefObject } from 'react';

interface UseScrollRevealOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

/**
 * Hook para animaciones de reveal al scroll usando Intersection Observer
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>({
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
}: UseScrollRevealOptions = {}): [RefObject<T | null>, boolean] {
    const elementRef = useRef<T>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (triggerOnce) {
                        observer.unobserve(element);
                    }
                } else if (!triggerOnce) {
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [threshold, rootMargin, triggerOnce]);

    return [elementRef, isVisible];
}

/**
 * Genera clases de animación para stagger effect
 */
export function getStaggerDelay(index: number, baseDelay: number = 100): string {
    return `${index * baseDelay}ms`;
}

/**
 * Hook para stagger animations en listas
 */
export function useStaggerReveal<T extends HTMLElement = HTMLDivElement>(
    itemCount: number,
    options: UseScrollRevealOptions & { staggerDelay?: number } = {}
): [RefObject<T | null>, boolean, (index: number) => React.CSSProperties] {
    const { staggerDelay = 100, ...revealOptions } = options;
    const [ref, isVisible] = useScrollReveal<T>(revealOptions);

    const getItemStyle = (index: number): React.CSSProperties => ({
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease-out ${index * staggerDelay}ms, transform 0.5s ease-out ${index * staggerDelay}ms`,
    });

    return [ref, isVisible, getItemStyle];
}
