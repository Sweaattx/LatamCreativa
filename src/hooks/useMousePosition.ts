'use client';

import { useState, useEffect, useCallback, useRef, RefObject } from 'react';

interface MousePosition {
    x: number;
    y: number;
    elementX: number;
    elementY: number;
    isInside: boolean;
}

/**
 * Hook para tracking de posición del mouse - OPTIMIZADO
 * Usa throttling con RAF para reducir re-renders
 */
export function useMousePosition(elementRef?: RefObject<HTMLElement | null>) {
    const [mousePosition, setMousePosition] = useState<MousePosition>({
        x: 0,
        y: 0,
        elementX: 0.5,
        elementY: 0.5,
        isInside: false,
    });

    const rafIdRef = useRef<number | null>(null);
    const lastEventRef = useRef<MouseEvent | null>(null);

    const processMousePosition = useCallback(() => {
        const ev = lastEventRef.current;
        if (!ev) return;

        const element = elementRef?.current;

        if (element) {
            const rect = element.getBoundingClientRect();
            const isInside =
                ev.clientX >= rect.left &&
                ev.clientX <= rect.right &&
                ev.clientY >= rect.top &&
                ev.clientY <= rect.bottom;

            const elementX = isInside ? (ev.clientX - rect.left) / rect.width : 0.5;
            const elementY = isInside ? (ev.clientY - rect.top) / rect.height : 0.5;

            setMousePosition({
                x: ev.clientX,
                y: ev.clientY,
                elementX,
                elementY,
                isInside,
            });
        } else {
            setMousePosition({
                x: ev.clientX,
                y: ev.clientY,
                elementX: ev.clientX / window.innerWidth,
                elementY: ev.clientY / window.innerHeight,
                isInside: true,
            });
        }

        rafIdRef.current = null;
    }, [elementRef]);

    const handleMouseMove = useCallback((ev: MouseEvent) => {
        lastEventRef.current = ev;

        // Throttle con requestAnimationFrame - máximo 60 updates/segundo
        if (rafIdRef.current === null) {
            rafIdRef.current = requestAnimationFrame(processMousePosition);
        }
    }, [processMousePosition]);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    }, [handleMouseMove]);

    return mousePosition;
}

/**
 * Hook para efecto de tilt 3D en cards
 */
export function useTilt(maxTilt: number = 10) {
    const [tiltStyle, setTiltStyle] = useState({
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
        transition: 'transform 0.1s ease-out',
    });

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const tiltX = (y - 0.5) * maxTilt * -1;
        const tiltY = (x - 0.5) * maxTilt;

        setTiltStyle({
            transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`,
            transition: 'transform 0.1s ease-out',
        });
    }, [maxTilt]);

    const handleMouseLeave = useCallback(() => {
        setTiltStyle({
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
            transition: 'transform 0.3s ease-out',
        });
    }, []);

    return { tiltStyle, handleMouseMove, handleMouseLeave };
}
