'use client';

import React, { useMemo, memo } from 'react';

interface ShaderBackgroundProps {
    variant?: 'hero' | 'cta' | 'section';
    intensity?: number;
    className?: string;
}

/**
 * Componente de fondo premium con mesh gradient animado - OPTIMIZADO
 * Usa CSS para animaciones en lugar de JS para mejor rendimiento
 */
export const ShaderBackground = memo(function ShaderBackground({
    variant = 'hero',
    intensity = 1,
    className = ''
}: ShaderBackgroundProps) {
    // Colores para cada variante
    const colors = useMemo(() => {
        switch (variant) {
            case 'hero':
                return {
                    primary: 'rgba(249, 115, 22, 0.12)',
                    secondary: 'rgba(168, 85, 247, 0.10)',
                    tertiary: 'rgba(6, 182, 212, 0.08)',
                    accent: 'rgba(244, 63, 94, 0.06)',
                };
            case 'cta':
                return {
                    primary: 'rgba(168, 85, 247, 0.12)',
                    secondary: 'rgba(249, 115, 22, 0.10)',
                    tertiary: 'rgba(236, 72, 153, 0.08)',
                    accent: 'rgba(59, 130, 246, 0.06)',
                };
            case 'section':
                return {
                    primary: 'rgba(249, 115, 22, 0.06)',
                    secondary: 'rgba(168, 85, 247, 0.05)',
                    tertiary: 'rgba(6, 182, 212, 0.04)',
                    accent: 'rgba(244, 63, 94, 0.03)',
                };
            default:
                return {
                    primary: 'rgba(249, 115, 22, 0.08)',
                    secondary: 'rgba(168, 85, 247, 0.06)',
                    tertiary: 'rgba(6, 182, 212, 0.05)',
                    accent: 'rgba(244, 63, 94, 0.04)',
                };
        }
    }, [variant]);

    return (
        <div
            className={`absolute inset-0 overflow-hidden ${className}`}
            style={{
                isolation: 'isolate',
                contain: 'strict',
                willChange: 'auto'
            }}
        >
            {/* Base dark gradient - estático, sin animación */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(15, 15, 15, 1) 0%, rgba(12, 10, 9, 1) 100%)',
                    transform: 'translateZ(0)',
                }}
            />

            {/* Mesh gradient estático - más performante */}
            <div
                className="absolute inset-0"
                style={{
                    background: `
                        radial-gradient(circle at 20% 20%, ${colors.primary} 0%, transparent 50%),
                        radial-gradient(circle at 80% 30%, ${colors.secondary} 0%, transparent 45%),
                        radial-gradient(circle at 40% 70%, ${colors.tertiary} 0%, transparent 50%),
                        radial-gradient(circle at 90% 80%, ${colors.accent} 0%, transparent 40%)
                    `,
                    opacity: intensity,
                    transform: 'translateZ(0)',
                }}
            />

            {/* Orbs con blur reducido y will-change para GPU */}
            <div
                className="absolute w-[500px] h-[500px] rounded-full opacity-25"
                style={{
                    background: `radial-gradient(circle, ${colors.primary} 0%, transparent 70%)`,
                    left: '10%',
                    top: '20%',
                    filter: 'blur(40px)',
                    animation: 'orbFloat1 20s ease-in-out infinite',
                    transform: 'translateZ(0)',
                    willChange: 'transform',
                    contain: 'layout paint',
                }}
            />

            <div
                className="absolute w-[400px] h-[400px] rounded-full opacity-20"
                style={{
                    background: `radial-gradient(circle, ${colors.secondary} 0%, transparent 70%)`,
                    right: '10%',
                    top: '30%',
                    filter: 'blur(40px)',
                    animation: 'orbFloat2 25s ease-in-out infinite reverse',
                    transform: 'translateZ(0)',
                    willChange: 'transform',
                    contain: 'layout paint',
                }}
            />

            <div
                className="absolute w-[350px] h-[350px] rounded-full opacity-15"
                style={{
                    background: `radial-gradient(circle, ${colors.tertiary} 0%, transparent 70%)`,
                    left: '30%',
                    bottom: '10%',
                    filter: 'blur(30px)',
                    animation: 'orbFloat3 18s ease-in-out infinite',
                    transform: 'translateZ(0)',
                    willChange: 'transform',
                    contain: 'layout paint',
                }}
            />

            {/* Grid pattern overlay - estático */}
            <div
                className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px',
                    transform: 'translateZ(0)',
                }}
            />

            {/* Partículas optimizadas - menos cantidad */}
            <FloatingParticles count={variant === 'hero' ? 8 : 4} />
        </div>
    );
});

/**
 * Componente de partículas flotantes - OPTIMIZADO
 * Usa CSS animations en lugar de JS para mejor rendimiento
 */
const FloatingParticles = memo(function FloatingParticles({ count = 8 }: { count?: number }) {
    const particles = useMemo(() => {
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            size: Math.random() * 3 + 1.5,
            x: Math.random() * 100,
            y: Math.random() * 100,
            duration: Math.random() * 15 + 20,
            delay: Math.random() * 5,
            opacity: Math.random() * 0.2 + 0.05,
        }));
    }, [count]);

    return (
        <>
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        width: particle.size,
                        height: particle.size,
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 70%)',
                        opacity: particle.opacity,
                        animation: `particleFloat ${particle.duration}s ease-in-out infinite`,
                        animationDelay: `${particle.delay}s`,
                        transform: 'translateZ(0)',
                        willChange: 'transform, opacity',
                        contain: 'layout paint',
                    }}
                />
            ))}
        </>
    );
});

export default ShaderBackground;

