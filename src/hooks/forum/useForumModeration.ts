/**
 * Forum Moderation Hooks
 * 
 * Hooks for moderation actions and content reporting.
 * 
 * @module hooks/forum/useForumModeration
 */

import { useState, useCallback } from 'react';
import { useAppStore } from '../useAppStore';
import { forumModeration, forumReplies } from '../../services/supabase/forum';

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
