'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { mockProjects } from '@/data/homeData';

/**
 * TrendingProjects - Arrow navigation with smooth lerp animation
 */
export function TrendingProjects() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const trackRef = useRef<HTMLDivElement>(null);
    const currentXRef = useRef(0);
    const targetXRef = useRef(0);
    const rafIdRef = useRef<number | null>(null);
    const isAnimatingRef = useRef(false);

    const numProjects = mockProjects.length;
    const smoothFactor = 0.08;

    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const animate = useCallback(() => {
        const track = trackRef.current;
        if (!track) return;

        currentXRef.current = lerp(currentXRef.current, targetXRef.current, smoothFactor);
        track.style.transform = `translate3d(-${currentXRef.current}vw, 0, 0)`;

        if (Math.abs(targetXRef.current - currentXRef.current) > 0.01) {
            rafIdRef.current = requestAnimationFrame(animate);
        } else {
            currentXRef.current = targetXRef.current;
            track.style.transform = `translate3d(-${currentXRef.current}vw, 0, 0)`;
            rafIdRef.current = null;
            isAnimatingRef.current = false;
        }
    }, []);

    const goToProject = useCallback((direction: 'prev' | 'next') => {
        const nextIndex = direction === 'next'
            ? Math.min(currentIndex + 1, numProjects - 1)
            : Math.max(currentIndex - 1, 0);

        if (nextIndex === currentIndex) return;

        setCurrentIndex(nextIndex);
        targetXRef.current = nextIndex * 100;
        isAnimatingRef.current = true;

        if (rafIdRef.current === null) {
            rafIdRef.current = requestAnimationFrame(animate);
        }
    }, [currentIndex, numProjects, animate]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
        };
    }, []);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-dark-0">
            {/* Sliding track */}
            <div
                ref={trackRef}
                className="absolute inset-0 flex"
                style={{
                    width: `${numProjects * 100}vw`,
                    willChange: 'transform',
                }}
            >
                {mockProjects.map((project, index) => (
                    <Link
                        key={project.id}
                        href={`/portfolio/${project.slug}`}
                        className="group relative flex-shrink-0 block overflow-hidden"
                        style={{ width: '100vw', height: '100vh' }}
                    >
                        <Image
                            src={project.image.replace('w=800&h=600', 'w=3840&h=2160&q=90')}
                            alt={project.title}
                            fill
                            className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.02]"
                            priority={index < 2}
                            quality={90}
                            sizes="100vw"
                        />

                        {/* Gradient overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-0 via-dark-0/30 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-dark-0/50 to-transparent" />

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16">
                            <div className="max-w-4xl">
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="text-content-3 font-mono text-sm tracking-wider">
                                        [{String(index + 1).padStart(2, '0')}]
                                    </span>
                                    <span className="text-content-2 text-xs uppercase tracking-[0.2em]">
                                        {project.category}
                                    </span>
                                </div>

                                <h2 className="text-4xl md:text-6xl lg:text-7xl font-extralight text-content-1 leading-[0.95] tracking-tight mb-4 transition-transform duration-500 group-hover:translate-x-2">
                                    {project.title}
                                </h2>

                                <p className="text-content-3 text-md mb-6">
                                    {project.artist}
                                </p>

                                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                                    <span className="text-content-1 text-sm uppercase tracking-widest">Ver proyecto</span>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-content-1 transition-transform duration-300 group-hover:translate-x-1">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Big number watermark */}
                        <div className="absolute top-8 right-8 md:top-12 md:right-12 text-content-1/[0.02] text-[150px] md:text-[250px] lg:text-[300px] font-extralight leading-none select-none pointer-events-none">
                            {String(index + 1).padStart(2, '0')}
                        </div>
                    </Link>
                ))}
            </div>

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 p-8 md:p-12 flex justify-between items-start pointer-events-none">
                <span className="text-content-3 text-xs uppercase tracking-[0.3em]">Proyectos</span>
                <div className="text-content-3 font-mono text-sm">
                    <span className="text-content-1">{String(currentIndex + 1).padStart(2, '0')}</span>
                    <span className="mx-2">/</span>
                    <span>{String(numProjects).padStart(2, '0')}</span>
                </div>
            </div>

            {/* Arrow — left edge */}
            {currentIndex > 0 && (
                <button
                    onClick={() => goToProject('prev')}
                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/40 hover:text-white/90 transition-all duration-300 cursor-pointer"
                    aria-label="Proyecto anterior"
                >
                    <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
                </button>
            )}

            {/* Arrow — right edge */}
            {currentIndex < numProjects - 1 && (
                <button
                    onClick={() => goToProject('next')}
                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/40 hover:text-white/90 transition-all duration-300 cursor-pointer"
                    aria-label="Siguiente proyecto"
                >
                    <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
                </button>
            )}

            {/* Progress dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                {mockProjects.map((_, index) => (
                    <div
                        key={index}
                        className={`h-1 rounded-full transition-all duration-500 ${index === currentIndex
                            ? 'w-6 bg-white/60'
                            : 'w-1.5 bg-white/20'
                            }`}
                    />
                ))}
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 z-20 flex flex-col items-end gap-2 pointer-events-none">
                <div className="h-20 w-px bg-dark-5 overflow-hidden">
                    <div
                        className="w-full bg-content-2 transition-all duration-700"
                        style={{ height: `${((currentIndex + 1) / numProjects) * 100}%` }}
                    />
                </div>
                <span className="text-content-3 text-2xs uppercase tracking-widest">Scroll</span>
            </div>
        </div>
    );
}
