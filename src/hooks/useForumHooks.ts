/**
 * Forum Hooks
 * 
 * Custom React hooks para operaciones del foro.
 * Incluye hooks para hilos, respuestas, likes y moderación.
 * 
 * @module hooks/useForumHooks
 */

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from './useAppStore';
import {
    ForumThread,
    ForumReply,
    ThreadSortOption
} from '../types/forum';
import { forumService, forumReplies, forumModeration } from '../services/supabase/forum';

// ============================================
// THREADS HOOKS
// ============================================

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
            // Silently handle empty response - expected when no threads exist
            if (err && Object.keys(err as object).length > 0) {
                console.error('Error fetching threads:', err);
            }
            setError('Error al cargar los hilos');
        } finally {
            setLoading(false);
        }
    }, [category, sortBy]);

    // Initial fetch and refetch when filters change
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

    return {
        threads,
        loading,
        error,
        hasMore,
        page,
        nextPage,
        prevPage,
        refresh
    };
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

                // Increment views only once per session (prevent spam)
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
            // Note: attachments should be handled separately after thread creation
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

// ============================================
// REPLIES HOOKS
// ============================================

/**
 * Hook para obtener respuestas de un hilo.
 */
export function useForumReplies(threadId: string | undefined) {
    const [replies, setReplies] = useState<ForumReply[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReplies = useCallback(async () => {
        if (!threadId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await forumReplies.getReplies(threadId);
            setReplies(result);
        } catch (err) {
            console.error('Error fetching replies:', err);
            setError('Error al cargar las respuestas');
        } finally {
            setLoading(false);
        }
    }, [threadId]);

    useEffect(() => {
        fetchReplies();
    }, [fetchReplies]);

    const refresh = useCallback(() => {
        fetchReplies();
    }, [fetchReplies]);

    return { replies, loading, error, refresh };
}

/**
 * Hook para agregar una respuesta.
 */
export function useAddReply() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { state } = useAppStore();

    const addReply = useCallback(async (
        threadId: string,
        content: string,
        parentId?: string
    ): Promise<ForumReply | null> => {
        if (!state.user) {
            setError('Debes iniciar sesión para responder');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await forumReplies.addReply(threadId, {
                content,
                authorId: state.user.uid,
                authorName: state.user.name,
                authorUsername: state.user.username,
                authorAvatar: state.user.photoURL || state.user.avatar,
                authorRole: state.user.role,
                parentId
            });
            return result;
        } catch (err) {
            console.error('Error adding reply:', err);
            setError('Error al agregar la respuesta');
            return null;
        } finally {
            setLoading(false);
        }
    }, [state.user]);

    return { addReply, loading, error };
}

/**
 * Hook para acciones sobre respuestas (editar, eliminar).
 */
export function useReplyActions() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const update = useCallback(async (
        threadId: string,
        replyId: string,
        content: string
    ): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            await forumReplies.updateReply(replyId, content);
            return true;
        } catch (err) {
            console.error('Error updating reply:', err);
            setError('Error al actualizar la respuesta');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const remove = useCallback(async (
        replyId: string
    ): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            await forumReplies.deleteReply(replyId);
            return true;
        } catch (err) {
            console.error('Error deleting reply:', err);
            setError('Error al eliminar la respuesta');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return { update, remove, loading, error };
}

// ============================================
// LIKES HOOKS
// ============================================

/**
 * Hook para manejar likes en hilos.
 */
export function useThreadLike(threadId: string | undefined, userId?: string) {
    const [liked, setLiked] = useState(false);
    const [loading, setLoading] = useState(false);

    // Check initial like status
    useEffect(() => {
        if (!threadId || !userId) return;

        forumService.getLikeStatus(threadId, userId)
            .then(setLiked)
            .catch(console.error);
    }, [threadId, userId]);

    const toggleLike = useCallback(async (): Promise<boolean> => {
        if (!threadId || !userId) return liked;

        setLoading(true);
        try {
            const newStatus = await forumService.toggleLike(threadId, userId);
            setLiked(newStatus);
            return newStatus;
        } catch (err) {
            console.error('Error toggling like:', err);
            return liked;
        } finally {
            setLoading(false);
        }
    }, [threadId, userId, liked]);

    return { liked, toggleLike, loading };
}

/**
 * Hook para manejar likes en respuestas.
 */
export function useReplyLike(
    threadId: string | undefined,
    replyId: string | undefined,
    userId?: string
) {
    const [liked, setLiked] = useState(false);
    const [loading, setLoading] = useState(false);

    // Check initial like status
    useEffect(() => {
        if (!threadId || !replyId || !userId) return;

        forumReplies.getReplyLikeStatus(threadId, replyId, userId)
            .then(setLiked)
            .catch(console.error);
    }, [threadId, replyId, userId]);

    const toggleLike = useCallback(async (): Promise<boolean> => {
        if (!threadId || !replyId || !userId) return liked;

        setLoading(true);
        try {
            const newStatus = await forumReplies.toggleReplyLike(threadId, replyId, userId);
            setLiked(newStatus);
            return newStatus;
        } catch (err) {
            console.error('Error toggling reply like:', err);
            return liked;
        } finally {
            setLoading(false);
        }
    }, [threadId, replyId, userId, liked]);

    return { liked, toggleLike, loading };
}

// ============================================
// MODERATION HOOKS
// ============================================

/**
 * Hook para acciones de moderación.
 */
export function useThreadModeration() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pin = useCallback(async (threadId: string, isPinned: boolean): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            await forumModeration.pinThread(threadId, isPinned);
            return true;
        } catch {
            setError('Error al fijar el hilo');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const close = useCallback(async (threadId: string, isClosed: boolean): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            await forumModeration.closeThread(threadId, isClosed);
            return true;
        } catch {
            setError('Error al cerrar el hilo');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const markResolved = useCallback(async (threadId: string, isResolved: boolean): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            await forumModeration.markResolved(threadId, isResolved);
            return true;
        } catch {
            setError('Error al marcar como resuelto');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const markBestAnswer = useCallback(async (
        threadId: string,
        replyId: string,
        isBest: boolean
    ): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            await forumReplies.toggleBestAnswer(threadId, replyId, isBest);
            return true;
        } catch {
            setError('Error al marcar la mejor respuesta');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return { pin, close, markResolved, markBestAnswer, loading, error };
}

/**
 * Hook para reportar contenido.
 */
export function useReportContent() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const { state } = useAppStore();

    const report = useCallback(async (
        targetType: 'thread' | 'reply',
        targetId: string,
        threadId: string,
        reason: 'spam' | 'offensive' | 'off-topic' | 'harassment' | 'other',
        description?: string
    ): Promise<boolean> => {
        if (!state.user) {
            setError('Debes iniciar sesión para reportar');
            return false;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Check if already reported
            const alreadyReported = await forumModeration.hasUserReported(
                targetType,
                targetId,
                state.user.uid
            );

            if (alreadyReported) {
                setError('Ya has reportado este contenido');
                return false;
            }

            await forumModeration.reportContent(
                targetType,
                targetId,
                threadId,
                state.user.uid,
                state.user.name,
                reason,
                description
            );

            setSuccess(true);
            return true;
        } catch (err) {
            console.error('Error reporting content:', err);
            setError('Error al reportar el contenido');
            return false;
        } finally {
            setLoading(false);
        }
    }, [state.user]);

    return { report, loading, error, success };
}

// ============================================
// STATS HOOKS
// ============================================

/**
 * Hook para obtener estadísticas del foro.
 */
export function useForumStats() {
    const [stats, setStats] = useState({
        totalThreads: 0,
        totalReplies: 0,
        totalUsers: 0,
        activeToday: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        forumModeration.getForumStats()
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return { stats, loading };
}

/**
 * Hook para obtener hilos recientes (para widgets/sidebar).
 */
export function useRecentThreads(limitCount = 5) {
    const [threads, setThreads] = useState<ForumThread[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        forumService.getRecentThreads(limitCount)
            .then(setThreads)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [limitCount]);

    return { threads, loading };
}
