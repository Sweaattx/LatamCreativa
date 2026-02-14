'use client';

import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
    start?: number;
    end: number;
    duration?: number;
    delay?: number;
    suffix?: string;
    prefix?: string;
    decimals?: number;
    easing?: (t: number) => number;
}

// Funciones de easing
const easings = {
    easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
    easeOutQuart: (t: number) => 1 - Math.pow(1 - t, 4),
    linear: (t: number) => t,
};

/**
 * Hook para animación de números incrementales (counter up)
 */
export function useCountUp({
    start = 0,
    end,
    duration = 2000,
    delay = 0,
    suffix = '',
    prefix = '',
    decimals = 0,
    easing = easings.easeOutExpo,
}: UseCountUpOptions) {
    const [count, setCount] = useState(start);
    const [isAnimating, setIsAnimating] = useState(false);
    const frameRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);

    const startAnimation = () => {
        setIsAnimating(true);
        startTimeRef.current = null;

        const animate = (timestamp: number) => {
            if (startTimeRef.current === null) {
                startTimeRef.current = timestamp;
            }

            const elapsed = timestamp - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easing(progress);

            const currentValue = start + (end - start) * easedProgress;
            setCount(currentValue);

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            } else {
                setIsAnimating(false);
            }
        };

        frameRef.current = requestAnimationFrame(animate);
    };

    const reset = () => {
        if (frameRef.current) {
            cancelAnimationFrame(frameRef.current);
        }
        setCount(start);
        setIsAnimating(false);
    };

    useEffect(() => {
        const timeoutId = setTimeout(startAnimation, delay);

        return () => {
            clearTimeout(timeoutId);
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [end, duration, delay]);

    const formattedCount = `${prefix}${count.toFixed(decimals)}${suffix}`;

    return {
        count,
        formattedCount,
        isAnimating,
        startAnimation,
        reset,
    };
}

/**
 * Hook simplificado para mostrar números con formato K/M
 */
export function useFormattedCountUp(value: string, duration: number = 2000) {
    // Parsear valor como "25K+" o "150K+"
    const numericValue = parseFloat(value.replace(/[^\d.]/g, '')) || 0;
    const suffix = value.replace(/[\d.]/g, '');

    const { count, isAnimating } = useCountUp({
        end: numericValue,
        duration,
        decimals: numericValue % 1 !== 0 ? 1 : 0,
    });

    const formatted = count % 1 !== 0 ? count.toFixed(1) : Math.round(count).toString();

    return {
        value: `${formatted}${suffix}`,
        isAnimating,
    };
}

export { easings };
