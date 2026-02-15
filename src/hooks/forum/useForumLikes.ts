/**
 * Forum Like Hooks
 * 
 * Hooks for managing thread and reply likes.
 * 
 * @module hooks/forum/useForumLikes
 */

import { useState, useEffect, useCallback } from 'react';
import { forumService, forumReplies } from '../../services/supabase/forum';

/**
 * Hook para manejar likes en hilos.
 */
export function useThreadLike(threadId: string | undefined, userId?: string) {
    const [liked, setLiked] = useState(false);
    const [loading, setLoading] = useState(false);

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
