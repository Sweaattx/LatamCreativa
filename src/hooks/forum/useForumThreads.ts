/**
 * Forum Thread Hooks
 * 
 * Hooks for fetching, creating, updating, and deleting forum threads.
 * 
 * @module hooks/forum/useForumThreads
 */

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../useAppStore';
import { ForumThread, ThreadSortOption } from '../../types/forum';
import { forumService } from '../../services/supabase/forum';

/**
 * Hook para obtener hilos paginados con filtros.
 */
export function useForumThreads(
    category?: string,
    sortBy: ThreadSortOption = 'activity'
) {
    const [threads, setThreads] = useState<ForumThread[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [lastId, setLastId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pageHistory, setPageHistory] = useState<(string | null)[]>([null]);

    const fetchThreads = useCallback(async (startAfterId: string | null = null) => {
        setLoading(true);
        setError(null);

        try {
            const result = await forumService.getThreads({
                category: category === 'all' ? undefined : category,
                sortBy,
                lastId: startAfterId,
                pageSize: 20
            });

            setThreads(result.items);
            setHasMore(result.hasMore);
            setLastId(result.lastId);
        } catch (err) {
            if (err && Object.keys(err as object).length > 0) {
                console.error('Error fetching threads:', err);
            }
            setError('Error al cargar los hilos');
        } finally {
            setLoading(false);
        }
    }, [category, sortBy]);

    useEffect(() => {
        setPage(1);
        setPageHistory([null]);
        fetchThreads(null);
    }, [category, sortBy, fetchThreads]);

    const nextPage = useCallback(() => {
        if (hasMore && lastId) {
            setPageHistory(prev => [...prev, lastId]);
            setPage(p => p + 1);
            fetchThreads(lastId);
        }
    }, [hasMore, lastId, fetchThreads]);

    const prevPage = useCallback(() => {
        if (page > 1) {
            const previousId = pageHistory[page - 2] || null;
            setPageHistory(prev => prev.slice(0, -1));
            setPage(p => p - 1);
            fetchThreads(previousId);
        }
    }, [page, pageHistory, fetchThreads]);

    const refresh = useCallback(() => {
        setPage(1);
        setPageHistory([null]);
        fetchThreads(null);
    }, [fetchThreads]);

    return { threads, loading, error, hasMore, page, nextPage, prevPage, refresh };
}

/**
 * Hook para obtener un hilo individual por slug o ID.
 */
export function useForumThread(slugOrId: string | undefined) {
    const [thread, setThread] = useState<ForumThread | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slugOrId) {
            setLoading(false);
            return;
        }

        const fetchThread = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await forumService.getThreadBySlug(slugOrId);
                setThread(result);

                if (result) {
                    const viewedKey = `forum_viewed_${result.id}`;
                    if (!sessionStorage.getItem(viewedKey)) {
                        sessionStorage.setItem(viewedKey, 'true');
                        forumService.incrementViews(result.id).catch(console.error);
                    }
                }
            } catch (err) {
                console.error('Error fetching thread:', err);
                setError('Error al cargar el hilo');
            } finally {
                setLoading(false);
            }
        };

        fetchThread();
    }, [slugOrId]);

    return { thread, loading, error };
}

/**
 * Hook para crear un nuevo hilo.
 */
export function useCreateThread() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { state } = useAppStore();

    const create = useCallback(async (
        data: {
            title: string;
            content: string;
            category: string;
            tags?: string[];
        }
    ): Promise<{ id: string; slug: string } | null> => {
        if (!state.user) {
            setError('Debes iniciar sesión para crear un hilo');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await forumService.createThread({
                title: data.title,
                content: data.content,
                category: data.category,
                authorId: state.user.uid,
                authorName: state.user.name,
                authorUsername: state.user.username,
                authorAvatar: state.user.photoURL || state.user.avatar
            });
            return result;
        } catch (err) {
            console.error('Error creating thread:', err);
            setError('Error al crear el hilo');
            return null;
        } finally {
            setLoading(false);
        }
    }, [state.user]);

    return { create, loading, error };
}

/**
 * Hook para actualizar un hilo.
 */
export function useUpdateThread() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const update = useCallback(async (
        threadId: string,
        data: Partial<Pick<ForumThread, 'title' | 'content' | 'category' | 'tags'>>
    ): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            await forumService.updateThread(threadId, data);
            return true;
        } catch (err) {
            console.error('Error updating thread:', err);
            setError('Error al actualizar el hilo');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return { update, loading, error };
}

/**
 * Hook para eliminar un hilo.
 */
export function useDeleteThread() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteThread = useCallback(async (threadId: string): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            await forumService.deleteThread(threadId);
            return true;
        } catch (err) {
            console.error('Error deleting thread:', err);
            setError('Error al eliminar el hilo');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return { deleteThread, loading, error };
}

/**
 * Hook para obtener hilos de un usuario.
 */
export function useUserThreads(userId?: string) {
    const [threads, setThreads] = useState<ForumThread[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchThreads = async () => {
            setLoading(true);
            try {
                const result = await forumService.getUserThreads(userId);
                setThreads(result);
            } catch (err) {
                console.error('Error fetching user threads:', err);
                setError('Error al cargar los hilos');
            } finally {
                setLoading(false);
            }
        };

        fetchThreads();
    }, [userId]);

    return { threads, loading, error };
}
