'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppStore } from '@/hooks/useAppStore';
import { mockProjects } from '@/data/homeData';

interface HeroSectionProps {
    isLoggedIn: boolean;
}

const marqueeProjects = [...mockProjects, ...mockProjects];

export function HeroSection({ isLoggedIn }: HeroSectionProps) {
    const { state } = useAppStore();
    const isDevMode = state.contentMode === 'dev';

    return (
        <section className="relative h-[calc(100vh-56px)] flex items-center overflow-hidden bg-dark-0">
            {/* Subtle gradient overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: isDevMode
                        ? 'radial-gradient(ellipse 70% 50% at 30% 50%, rgba(59,130,246,0.06) 0%, transparent 70%)'
                        : 'radial-gradient(ellipse 70% 50% at 30% 50%, rgba(255,106,0,0.05) 0%, transparent 70%)',
                }}
            />

            {/* Grain texture */}
            <div
                className="absolute inset-0 opacity-[0.025] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                }}
            />

            {/* Image marquee */}
            <div className="absolute inset-0 w-full max-w-[1600px] mx-auto px-6 grid grid-cols-12 gap-12 h-full items-center pointer-events-none">
                <div className="col-span-6 pointer-events-none" />

                <div className="hidden lg:flex lg:col-span-7 h-full relative z-10 gap-5 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] cursor-pointer" style={{ transform: 'translateX(700px)' }}>
                    {/* Column 1 */}
                    <div
                        className="flex flex-col gap-5 animate-marqueeVerticalSlow"
                        style={{ willChange: 'transform', contain: 'layout', transform: 'translateZ(0)' }}
                    >
                        {marqueeProjects.map((project, i) => (
                            <div key={`col1-${i}`} className="w-[260px] aspect-[3/4] rounded-2xl overflow-hidden relative transition-all duration-500 hover:scale-[1.02] group">
                                <Image src={project.image} alt={project.title} fill className="object-cover" />
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <p className="text-content-1 font-medium text-sm">{project.title}</p>
                                    <p className="text-xs text-content-2">{project.artist}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Column 2 */}
                    <div
                        className="flex flex-col gap-5 animate-marqueeVerticalFast mt-[-200px]"
                        style={{ willChange: 'transform', contain: 'layout', transform: 'translateZ(0)' }}
                    >
                        {marqueeProjects.slice().reverse().map((project, i) => (
                            <div key={`col2-${i}`} className="w-[260px] aspect-[3/4] rounded-2xl overflow-hidden relative transition-all duration-500 hover:scale-[1.02] group">
                                <Image src={project.image} alt={project.title} fill className="object-cover" />
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <p className="text-content-1 font-medium text-sm">{project.title}</p>
                                    <p className="text-xs text-content-2">{project.artist}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Column 3 */}
                    <div
                        className="flex flex-col gap-5 animate-marqueeVerticalSlow mt-[-100px]"
                        style={{ willChange: 'transform', contain: 'layout', transform: 'translateZ(0)' }}
                    >
                        {marqueeProjects.map((project, i) => (
                            <div key={`col3-${i}`} className="w-[260px] aspect-[3/4] rounded-2xl overflow-hidden relative transition-all duration-500 hover:scale-[1.02] group">
                                <Image src={project.image} alt={project.title} fill className="object-cover" />
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <p className="text-content-1 font-medium text-sm">{project.title}</p>
                                    <p className="text-xs text-content-2">{project.artist}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Hero content */}
            <div className="relative z-50 w-full max-w-[1600px] mx-auto px-6 pointer-events-none">
                <div className="max-w-2xl">
                    <h1 className="font-sans text-content-1 leading-[0.95] tracking-tight mb-8" style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', fontWeight: '200' }}>
                        LATAM<br />
                        <span className={isDevMode ? 'text-dev-400' : 'text-accent-500'}>CREATIVE</span>
                    </h1>

                    <p className="text-lg md:text-xl text-content-2 leading-relaxed mb-10 max-w-lg font-light">
                        La galería infinita de talento.<br />
                        Conecta con la <span className="text-content-1 font-medium">próxima vanguardia</span> de diseñadores y fundadores.
                    </p>

                    <div className="flex flex-col gap-4 items-start">
                        <Link
                            href={isLoggedIn ? "/dashboard" : "/register"}
                            className={`
                                h-12 px-8 rounded-full font-medium text-base flex items-center justify-center gap-2
                                transition-all duration-300 ease-smooth pointer-events-auto
                                hover:scale-[1.02] hover:shadow-lg
                                ${isDevMode
                                    ? 'bg-dev-500 text-white hover:bg-dev-600 hover:shadow-dev-glow'
                                    : 'bg-accent-500 text-white hover:bg-accent-600 hover:shadow-glow-orange'
                                }
                            `}
                        >
                            {isLoggedIn ? 'Dashboard' : 'Entrar al Club'}
                        </Link>

                        <div className="flex items-center gap-3 pl-2">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full border-2 border-dark-0 overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="https://ui-avatars.com/api/?name=Maria+Lopez&background=FF6A00&color=fff&size=32" alt="Creator" width={32} height={32} className="w-full h-full object-cover" />
                                </div>
                                <div className="w-8 h-8 rounded-full border-2 border-dark-0 overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="https://ui-avatars.com/api/?name=Carlos+Silva&background=E65100&color=fff&size=32" alt="Creator" width={32} height={32} className="w-full h-full object-cover" />
                                </div>
                                <div className="w-8 h-8 rounded-full border-2 border-dark-0 overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="https://ui-avatars.com/api/?name=Ana+Torres&background=FF8A50&color=fff&size=32" alt="Creator" width={32} height={32} className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <span className="text-sm text-content-2">+2.4k Creadores</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
