'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
import { mockArticles, MockArticle } from '@/data/homeData';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useAppStore } from '@/hooks/useAppStore';

export function ArticlesSection() {
    const [sectionRef, isVisible] = useScrollReveal<HTMLElement>();
    const { state } = useAppStore();
    const isDevMode = state.contentMode === 'dev';

    return (
        <section ref={sectionRef} className="py-20 bg-dark-0">
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
                            Blog
                        </span>
                        <h2 className="text-2xl font-light text-content-1">
                            Artículos
                        </h2>
                    </div>
                    <Link
                        href="/blog"
                        className="text-sm text-content-3 hover:text-content-1 transition-colors flex items-center gap-2"
                    >
                        Ver todos
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>

                {/* Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {mockArticles.map((article: MockArticle, i: number) => (
                        <motion.article
                            key={article.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={isVisible ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.3, delay: i * 0.08 }}
                        >
                            <Link
                                href={`/blog/${article.slug}`}
                                className="group block rounded-xl overflow-hidden bg-dark-2/30 hover:bg-dark-2/50 transition-all duration-300"
                            >
                                {/* Image */}
                                <div className="aspect-[16/9] relative overflow-hidden">
                                    <Image
                                        src={article.image}
                                        alt={article.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                    />
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className={`text-2xs font-medium uppercase tracking-wider ${isDevMode ? 'text-dev-400' : 'text-accent-500'}`}>
                                            {article.category}
                                        </span>
                                        <span className="text-content-3 text-2xs flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {article.readTime}
                                        </span>
                                    </div>

                                    <h3 className="text-md font-medium text-content-1 leading-snug mb-2 group-hover:text-accent-400 transition-colors line-clamp-2">
                                        {article.title}
                                    </h3>

                                    <p className="text-sm text-content-3 line-clamp-2 mb-4">
                                        {article.excerpt}
                                    </p>

                                    {/* Author */}
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-6 h-6 rounded-full overflow-hidden">
                                            <Image
                                                src={article.authorAvatar}
                                                alt={article.author}
                                                width={24}
                                                height={24}
                                                className="object-cover"
                                            />
                                        </div>
                                        <span className="text-xs text-content-2">{article.author}</span>
                                    </div>
                                </div>
                            </Link>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
