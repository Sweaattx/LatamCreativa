'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useAppStore } from '@/hooks/useAppStore';

interface CTASectionProps {
    isLoggedIn: boolean;
}

export function CTASection({ isLoggedIn }: CTASectionProps) {
    const [sectionRef, isVisible] = useScrollReveal<HTMLElement>();
    const { state } = useAppStore();
    const isDevMode = state.contentMode === 'dev';

    return (
        <section ref={sectionRef} className="py-24 bg-dark-0">
            <div className="max-w-4xl mx-auto px-6">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                >
                    {/* Badge */}
                    <span className={`inline-block text-xs uppercase tracking-widest mb-6 ${isDevMode ? 'text-dev-400' : 'text-accent-500'}`}>
                        Únete a la comunidad
                    </span>

                    {/* Heading */}
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-extralight text-content-1 leading-tight mb-6">
                        {isLoggedIn
                            ? 'Sigue explorando el talento creativo de Latinoamérica'
                            : 'Forma parte de la red creativa más grande de Latinoamérica'
                        }
                    </h2>

                    {/* Subtext */}
                    <p className="text-lg text-content-2 max-w-2xl mx-auto mb-10">
                        {isLoggedIn
                            ? 'Descubre nuevos proyectos, conecta con creadores y encuentra oportunidades únicas.'
                            : 'Miles de diseñadores, desarrolladores y creativos ya están compartiendo su trabajo y conectando con oportunidades.'
                        }
                    </p>

                    {/* CTA Button */}
                    <Link
                        href={isLoggedIn ? '/portfolio' : '/register'}
                        className={`
                            inline-flex items-center gap-2 h-12 px-8 rounded-full text-base font-medium
                            transition-all duration-300 ease-smooth
                            hover:scale-[1.02] hover:shadow-lg
                            ${isDevMode
                                ? 'bg-dev-500 text-white hover:bg-dev-600 hover:shadow-glow-blue'
                                : 'bg-accent-500 text-white hover:bg-accent-600 hover:shadow-glow-orange'
                            }
                        `}
                    >
                        {isLoggedIn ? 'Explorar proyectos' : 'Crear cuenta gratis'}
                        <ArrowRight className="w-4 h-4" />
                    </Link>

                    {/* Stats */}
                    {!isLoggedIn && (
                        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-content-3">
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-light text-content-1">2.4k+</span>
                                <span>Creadores</span>
                            </div>
                            <div className="w-px h-10 bg-dark-5" />
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-light text-content-1">850+</span>
                                <span>Proyectos</span>
                            </div>
                            <div className="w-px h-10 bg-dark-5" />
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-light text-content-1">45</span>
                                <span>Países</span>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
