'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Plus, TrendingUp, Clock, MessageSquare,
  Users, X
} from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';
import { useForumThreads } from '@/hooks/useForumHooks';
import { ThreadCard } from '@/components/forum/ThreadCard';
import { FORUM_CATEGORIES, getCategoryById } from '@/data/forumCategories';

type SortOption = 'recent' | 'popular' | 'unanswered';

export default function ForumPage() {
  const router = useRouter();
  const { state } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  const { threads, loading, error } = useForumThreads(selectedCategory || undefined, sortBy);

  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) return threads;
    const query = searchQuery.toLowerCase();
    return threads.filter(thread =>
      thread.title.toLowerCase().includes(query) ||
      thread.content.toLowerCase().includes(query)
    );
  }, [threads, searchQuery]);

  const pinnedThreads = filteredThreads.filter(t => t.isPinned);
  const regularThreads = filteredThreads.filter(t => !t.isPinned);

  return (
    <div className="min-h-screen bg-dark-1">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Header — minimal */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-light text-content-1">Foro</h1>
            <p className="text-sm text-content-3 mt-1">
              {threads.length} temas · Comunidad creativa
            </p>
          </div>
          {state.user && (
            <button
              onClick={() => router.push('/forum/new')}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo Tema
            </button>
          )}
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar temas..."
              className="w-full h-10 pl-10 pr-4 bg-dark-2 border border-dark-5 rounded-lg text-sm text-content-1 placeholder:text-content-3 focus:outline-none focus:border-accent-500/50 transition-colors"
            />
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setSortBy('recent')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm transition-colors ${sortBy === 'recent'
                  ? 'bg-dark-3 text-content-1'
                  : 'text-content-3 hover:text-content-2'
                }`}
            >
              <Clock className="w-4 h-4" />
              Recientes
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm transition-colors ${sortBy === 'popular'
                  ? 'bg-dark-3 text-content-1'
                  : 'text-content-3 hover:text-content-2'
                }`}
            >
              <TrendingUp className="w-4 h-4" />
              Popular
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-8 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3.5 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${!selectedCategory
                ? 'bg-dark-3 text-content-1'
                : 'text-content-3 hover:text-content-2'
              }`}
          >
            Todos
          </button>
          {FORUM_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`px-3.5 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${selectedCategory === cat.id
                  ? 'bg-dark-3 text-content-1'
                  : 'text-content-3 hover:text-content-2'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Active filter */}
        {selectedCategory && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-content-3">Filtrando:</span>
            <button
              onClick={() => setSelectedCategory(null)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-dark-3 text-content-2 text-sm rounded-md hover:text-content-1 transition-colors"
            >
              {getCategoryById(selectedCategory)?.name}
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Threads */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-400 text-sm">{error}</div>
        ) : filteredThreads.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-10 h-10 text-content-3/30 mx-auto mb-3" />
            <p className="text-content-3 text-sm">No hay temas aún</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pinnedThreads.length > 0 && (
              <>
                <p className="text-xs text-content-3 uppercase tracking-wider pb-1">Fijados</p>
                {pinnedThreads.map((thread) => (
                  <ThreadCard
                    key={thread.id}
                    thread={thread}
                    onClick={() => router.push(`/forum/${thread.slug || thread.id}`)}
                  />
                ))}
                <div className="h-3" />
              </>
            )}

            {pinnedThreads.length > 0 && regularThreads.length > 0 && (
              <p className="text-xs text-content-3 uppercase tracking-wider pb-1">Recientes</p>
            )}
            {regularThreads.map((thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                onClick={() => router.push(`/forum/${thread.slug || thread.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
