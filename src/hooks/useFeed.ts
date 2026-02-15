'use client';

/**
 * useFeed Hook
 * 
 * Fetches projects and articles from Supabase, merges them into
 * a single chronological feed, and handles infinite scroll pagination.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { projectsService } from '@/services/supabase/projects';
import { articlesService } from '@/services/supabase/articles';
import { PortfolioItem, ArticleItem } from '@/types';

export type FeedItemType = 'project' | 'article';

export interface FeedItem {
    id: string;
    type: FeedItemType;
    data: PortfolioItem | ArticleItem;
    createdAt: string;
}

interface UseFeedReturn {
    items: FeedItem[];
    isLoading: boolean;
    isLoadingMore: boolean;
    hasMore: boolean;
    error: string | null;
    loadMore: () => void;
    refresh: () => void;
}

const PAGE_SIZE = 12;

function mergeAndSort(projects: PortfolioItem[], articles: ArticleItem[]): FeedItem[] {
    const projectItems: FeedItem[] = projects.map(p => ({
        id: p.id,
        type: 'project' as const,
        data: p,
        createdAt: p.createdAt || new Date().toISOString(),
    }));

    const articleItems: FeedItem[] = articles.map(a => ({
        id: a.id,
        type: 'article' as const,
        data: a,
        createdAt: a.date || new Date().toISOString(),
    }));

    return [...projectItems, ...articleItems].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function useFeed(): UseFeedReturn {
    const [items, setItems] = useState<FeedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const projectLastId = useRef<string | null>(null);
    const articleLastId = useRef<string | null>(null);
    const projectsHasMore = useRef(true);
    const articlesHasMore = useRef(true);

    const fetchFeed = useCallback(async (isInitial: boolean) => {
        try {
            if (isInitial) {
                setIsLoading(true);
                setError(null);
            } else {
                setIsLoadingMore(true);
            }

            // Fetch projects and articles in parallel
            const [projectsResult, articlesResult] = await Promise.all([
                projectsHasMore.current
                    ? projectsService.getProjects({
                        lastId: isInitial ? null : projectLastId.current,
                        pageSize: PAGE_SIZE,
                        sortBy: 'date',
                        sortDirection: 'desc',
                    })
                    : Promise.resolve({ data: [], lastId: null, hasMore: false }),
                articlesHasMore.current
                    ? articlesService.getArticles(
                        isInitial ? null : articleLastId.current,
                        PAGE_SIZE,
                        'date',
                        'desc'
                    )
                    : Promise.resolve({ data: [], lastId: null, hasMore: false }),
            ]);

            // Update cursors
            projectLastId.current = projectsResult.lastId;
            articleLastId.current = articlesResult.lastId;
            projectsHasMore.current = projectsResult.hasMore;
            articlesHasMore.current = articlesResult.hasMore;

            const newItems = mergeAndSort(projectsResult.data, articlesResult.data);

            if (isInitial) {
                setItems(newItems);
            } else {
                setItems(prev => [...prev, ...newItems]);
            }

            setHasMore(projectsResult.hasMore || articlesResult.hasMore);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error cargando feed');
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchFeed(true);
    }, [fetchFeed]);

    const loadMore = useCallback(() => {
        if (!isLoadingMore && hasMore) {
            fetchFeed(false);
        }
    }, [isLoadingMore, hasMore, fetchFeed]);

    const refresh = useCallback(() => {
        projectLastId.current = null;
        articleLastId.current = null;
        projectsHasMore.current = true;
        articlesHasMore.current = true;
        fetchFeed(true);
    }, [fetchFeed]);

    return { items, isLoading, isLoadingMore, hasMore, error, loadMore, refresh };
}
