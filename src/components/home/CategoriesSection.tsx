'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { categories } from '@/data/homeData';
import { useAppStore } from '@/hooks/useAppStore';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export function CategoriesSection() {
    const { state } = useAppStore();
    const isDevMode = state.contentMode === 'dev';
    const [sectionRef, isVisible] = useScrollReveal<HTMLElement>();

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
                            Explorar
                        </span>
                        <h2 className="text-2xl font-light text-content-1">
                            Categorías
                        </h2>
                    </div>
                    <Link
                        href="/portfolio"
                        className="text-sm text-content-3 hover:text-content-1 transition-colors flex items-center gap-2"
                    >
                        Ver todas
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {categories.map((cat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={isVisible ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.3, delay: i * 0.04 }}
                        >
                            <Link
                                href={`/portfolio?category=${encodeURIComponent(cat.name)}`}
                                className="group relative block rounded-xl overflow-hidden aspect-[3/4]"
                            >
                                {/* Image */}
                                <Image
                                    src={cat.image}
                                    alt={cat.name}
                                    fill
                                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-dark-0/90 via-dark-0/30 to-transparent" />

                                {/* Content */}
                                <div className="absolute inset-0 flex flex-col justify-end p-4">
                                    <h3 className="text-content-1 font-medium text-sm mb-0.5 group-hover:text-accent-400 transition-colors">
                                        {cat.name}
                                    </h3>
                                    <p className="text-content-3 text-xs">
                                        {cat.count}
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
