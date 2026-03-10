'use client';

import { useAppStore } from '@/hooks/useAppStore';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Heart, MessageCircle, Share2 } from 'lucide-react';

interface ArticleFromStoreProps {
    slug: string;
}

export function ArticleFromStore({ slug }: ArticleFromStoreProps) {
    const { state } = useAppStore();

    // Find article in local store by matching slug pattern
    const article = (state.blogPosts || []).find((post) => {
        const postSlug = `${post.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${post.id}`;
        return postSlug === slug || post.id === slug;
    });

    if (!article) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-dark-0">
            {/* Header */}
            <div className="max-w-4xl mx-auto px-4 lg:px-8 pt-8">
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-content-3 hover:text-content-1 transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al blog
                </Link>
            </div>

            {/* Hero Image */}
            {article.image && (
                <div className="relative w-full max-w-4xl mx-auto aspect-video mb-8 rounded-2xl overflow-hidden mx-4 lg:mx-auto">
                    <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                </div>
            )}

            {/* Content */}
            <article className="max-w-3xl mx-auto px-4 lg:px-8 pb-16">
                {/* Category */}
                {article.category && (
                    <span className="inline-block px-3 py-1 bg-accent-500/10 text-accent-400 text-sm font-medium rounded-full mb-4">
                        {article.category}
                    </span>
                )}

                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-content-1 mb-6 leading-tight">
                    {article.title}
                </h1>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-content-3 mb-8 pb-8 border-b border-dark-5/50">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400 text-sm font-medium">
                            {article.author?.charAt(0) || 'A'}
                        </div>
                        <span className="text-content-2">{article.author || 'Anónimo'}</span>
                    </div>
                    <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(article.date).toLocaleDateString('es-LA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </span>
                    {article.readTime && (
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {article.readTime}
                        </span>
                    )}
                </div>

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                        {article.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1 bg-dark-3 text-content-3 text-sm rounded-lg"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Body */}
                <div className="prose prose-invert prose-lg max-w-none text-content-2 leading-relaxed whitespace-pre-wrap">
                    {article.content}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-12 pt-8 border-t border-dark-5/50">
                    <button className="flex items-center gap-2 px-4 py-2 bg-dark-3 hover:bg-dark-4 rounded-xl text-content-2 transition-colors">
                        <Heart className="w-4 h-4" />
                        <span>{article.likes || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-dark-3 hover:bg-dark-4 rounded-xl text-content-2 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span>{article.comments || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-dark-3 hover:bg-dark-4 rounded-xl text-content-2 transition-colors ml-auto">
                        <Share2 className="w-4 h-4" />
                        Compartir
                    </button>
                </div>
            </article>
        </div>
    );
}
