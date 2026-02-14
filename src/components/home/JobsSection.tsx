'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Briefcase } from 'lucide-react';
import { featuredJobs } from '@/data/homeData';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useAppStore } from '@/hooks/useAppStore';

export function JobsSection() {
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
                            Oportunidades
                        </span>
                        <h2 className="text-2xl font-light text-content-1">
                            Trabajos
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

                {/* List */}
                <div className="space-y-2">
                    {featuredJobs.map((job, i) => (
                        <motion.div
                            key={job.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={isVisible ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.3, delay: i * 0.06 }}
                        >
                            <Link
                                href={`/jobs/${job.id}`}
                                className="group flex items-center gap-5 p-4 rounded-xl hover:bg-dark-2/40 transition-all duration-200"
                            >
                                {/* Logo */}
                                <div className="w-11 h-11 rounded-lg bg-dark-2 border border-dark-5 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    <Image
                                        src={job.logo}
                                        alt={job.company}
                                        width={44}
                                        height={44}
                                        className="object-cover"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2.5 mb-0.5">
                                        <h3 className="text-sm font-medium text-content-1 truncate group-hover:text-accent-400 transition-colors">
                                            {job.title}
                                        </h3>
                                        <span className={`hidden sm:inline-block text-2xs font-medium px-2 py-0.5 rounded-full ${isDevMode ? 'bg-dev-subtle text-dev-400' : 'bg-accent-subtle text-accent-500'
                                            }`}>
                                            {job.type}
                                        </span>
                                    </div>
                                    <p className="text-xs text-content-3 truncate">{job.company}</p>
                                </div>

                                {/* Meta */}
                                <div className="hidden md:flex items-center gap-5 text-xs text-content-3">
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {job.location}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Briefcase className="w-3.5 h-3.5" />
                                        {job.type}
                                    </span>
                                </div>

                                {/* Salary */}
                                <div className={`text-sm font-medium ${isDevMode ? 'text-dev-400' : 'text-accent-500'}`}>
                                    {job.salary}
                                </div>

                                {/* Arrow */}
                                <ArrowRight className="w-4 h-4 text-content-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-8 text-center">
                    <Link
                        href="/freelance"
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isDevMode
                                ? 'bg-dev-subtle text-dev-400 hover:bg-dev-glow'
                                : 'bg-accent-subtle text-accent-500 hover:bg-accent-glow'
                            }`}
                    >
                        Explorar todas las oportunidades
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
