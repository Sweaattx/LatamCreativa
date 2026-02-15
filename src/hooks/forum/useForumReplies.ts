/**
 * Forum Reply Hooks
 * 
 * Hooks for fetching, adding, editing, and deleting forum replies.
 * 
 * @module hooks/forum/useForumReplies
 */

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../useAppStore';
import { ForumReply } from '../../types/forum';
import { forumReplies } from '../../services/supabase/forum';

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
