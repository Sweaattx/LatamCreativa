'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { Plus, RefreshCw, Compass, TrendingUp, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/hooks/useAppStore';
import { useFeed } from '@/hooks/useFeed';
import { FeedCard } from './FeedCard';

/**
 * FeedPage — Option 1: Masonry Grid (Dribbble/Pinterest style)
 * 
 * Infinite-scroll masonry layout mixing projects and articles.
 * Shown to authenticated users instead of the landing page.
 */
export function FeedPage() {
    const { state, actions } = useAppStore();
    const { items, isLoading, isLoadingMore, hasMore, error, loadMore, refresh } = useFeed();
    const router = useRouter();
    const observerRef = useRef<HTMLDivElement>(null);
    const userName = state.user?.name?.split(' ')[0] || state.user?.username || 'Creador';

    // Infinite scroll observer
    useEffect(() => {
        const target = observerRef.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                    loadMore();
                }
            },
            { rootMargin: '200px' }
        );

        observer.observe(target);
        return () => observer.disconnect();
    }, [hasMore, isLoadingMore, loadMore]);

    const handleSave = useCallback((id: string, image: string) => {
        actions.openSaveModal(id, image, 'project');
    }, [actions]);

    return (
        <div className="min-h-screen bg-dark-1 bg-texture">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-dark-1/80 backdrop-blur-xl border-b border-white/[0.04]">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-semibold text-content-1">
                                Hola, <span className="text-accent-400">{userName}</span> 👋
                            </h1>
                            <p className="text-sm text-content-3 mt-0.5">Descubre lo último de la comunidad</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={refresh}
                                className="p-2.5 rounded-xl bg-dark-2 border border-white/[0.06] text-content-3 hover:text-content-1 hover:border-white/[0.1] transition-all"
                                aria-label="Actualizar feed"
                            >
                                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={() => router.push('/create')}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-500 text-white text-sm font-medium hover:bg-accent-600 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Crear</span>
                            </button>
                        </div>
                    </div>

                    {/* Quick filters */}
                    <div className="flex items-center gap-2 mt-4 overflow-x-auto scrollbar-hide">
                        {[
                            { icon: Sparkles, label: 'Para ti', active: true },
                            { icon: TrendingUp, label: 'Trending', active: false },
                            { icon: Compass, label: 'Explorar', active: false },
                        ].map((filter) => (
                            <button
                                key={filter.label}
                                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${filter.active
                                    ? 'bg-accent-500/15 text-accent-400 border border-accent-500/30'
                                    : 'bg-dark-2 text-content-3 border border-white/[0.04] hover:text-content-1 hover:border-white/[0.08]'
                                    }`}
                            >
                                <filter.icon className="w-3.5 h-3.5" />
                                {filter.label}
                            </button>
                        ))}
                        <div className="w-px h-5 bg-white/[0.06] mx-1" />
                        {['3D', 'Ilustración', 'UI/UX', 'Fotografía', 'Motion', 'Branding'].map((cat) => (
                            <button
                                key={cat}
                                className="px-3 py-1.5 rounded-full text-xs font-medium bg-dark-2 text-content-3 border border-white/[0.04] hover:text-content-1 hover:border-white/[0.08] transition-all whitespace-nowrap"
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Feed Content */}
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Loading skeleton */}
                {isLoading && (
                    <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4">
                        {Array.from({ length: 15 }).map((_, i) => (
                            <div
                                key={i}
                                className="break-inside-avoid mb-4 rounded-xl bg-dark-2 animate-pulse border border-white/[0.04]"
                                style={{ aspectRatio: [0.75, 0.8, 1, 1.5, 1.33][i % 5] }}
                            />
                        ))}
                    </div>
                )}

                {/* Error */}
                {error && !isLoading && (
                    <div className="text-center py-20">
                        <p className="text-content-3 mb-4">{error}</p>
                        <button
                            onClick={refresh}
                            className="px-4 py-2 rounded-xl bg-accent-500 text-white text-sm hover:bg-accent-600 transition-colors"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {/* Masonry Grid */}
                {!isLoading && items.length > 0 && (
                    <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4">
                        {items.map((item) => (
                            <FeedCard key={`${item.type}-${item.id}`} item={item} onSave={handleSave} />
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && items.length === 0 && !error && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-dark-2 flex items-center justify-center border border-white/[0.06]">
                            <Compass className="w-8 h-8 text-content-3" />
                        </div>
                        <h3 className="text-lg font-medium text-content-1 mb-2">Tu feed está vacío</h3>
                        <p className="text-sm text-content-3 mb-6 max-w-sm mx-auto">
                            Explora la comunidad y sigue creadores para ver su trabajo aquí
                        </p>
                        <button
                            onClick={() => router.push('/proyectos')}
                            className="px-5 py-2.5 rounded-xl bg-accent-500 text-white text-sm font-medium hover:bg-accent-600 transition-colors"
                        >
                            Explorar proyectos
                        </button>
                    </div>
                )}

                {/* Load more trigger */}
                {hasMore && !isLoading && (
                    <div ref={observerRef} className="py-8">
                        {isLoadingMore && (
                            <div className="flex justify-center">
                                <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                )}

                {/* End of feed */}
                {!hasMore && items.length > 0 && (
                    <div className="text-center py-12 border-t border-white/[0.04]">
                        <p className="text-sm text-content-3">Has visto todo 🎉</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FeedPage;
