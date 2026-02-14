'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { topArtists, TopArtist } from '@/data/homeData';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useAppStore } from '@/hooks/useAppStore';
import { getFlagUrl, getCountryName } from '@/utils/countryFlags';

export function TopCreators() {
    const [sectionRef, isVisible] = useScrollReveal<HTMLElement>();
    const { state } = useAppStore();
    const isDevMode = state.contentMode === 'dev';

    return (
        <section ref={sectionRef} className="py-20 bg-dark-1">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    className="flex items-center justify-between mb-10"
                    initial={{ opacity: 0 }}
                    animate={isVisible ? { opacity: 1 } : {}}
                    transition={{ duration: 0.4 }}
                >
                    <div>
                        <span className={`text-xs uppercase tracking-widest mb-2 block ${isDevMode ? 'text-dev-400' : 'text-accent-500'}`}>
                            Comunidad
                        </span>
                        <h2 className="text-2xl font-light text-content-1">
                            Top Creadores
                        </h2>
                    </div>
                    <Link
                        href="/freelance"
                        className="text-sm text-content-3 hover:text-content-1 transition-colors flex items-center gap-2"
                    >
                        Ver todos
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {topArtists.map((artist: TopArtist, i: number) => (
                        <motion.div
                            key={artist.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={isVisible ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                        >
                            <Link
                                href={`/user/${artist.id}`}
                                className="group flex items-center gap-4 p-4 rounded-xl hover:bg-dark-2/50 transition-all duration-200"
                            >
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-dark-5 group-hover:ring-dark-6 transition-all">
                                        <Image
                                            src={artist.avatar}
                                            alt={artist.name}
                                            width={48}
                                            height={48}
                                            className="object-cover"
                                        />
                                    </div>
                                    {/* Flag */}
                                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-dark-1 overflow-hidden">
                                        <img
                                            src={getFlagUrl(artist.country)}
                                            alt={getCountryName(artist.country)}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-medium text-content-1 truncate group-hover:text-accent-400 transition-colors">
                                        {artist.name}
                                    </h3>
                                    <p className="text-xs text-content-3 truncate">
                                        {artist.role}
                                    </p>
                                </div>

                                {/* Followers */}
                                <div className="flex-shrink-0 text-xs text-content-3">
                                    {artist.followers}
                                </div>

                                {/* Rank */}
                                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-2xs font-bold ${i < 3
                                    ? isDevMode ? 'bg-dev-subtle text-dev-400' : 'bg-accent-subtle text-accent-500'
                                    : 'bg-dark-3 text-content-3'
                                    }`}>
                                    {i + 1}
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
