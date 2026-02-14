/**
 * Forum Moderation Functions (Supabase)
 * 
 * Módulo que maneja las funciones de moderación del foro.
 * 
 * @module services/supabase/forum/moderation
 */
import { supabase } from '../../../lib/supabase';
import { ReportReason, ForumStats } from '../../../types/forum';

export const forumModeration = {
    /**
     * Fija o desfija un hilo (solo para admins/moderadores).
     */
    async pinThread(threadId: string, isPinned: boolean): Promise<void> {
        try {
            const { error } = await supabase
                .from('forum_threads')
                .update({ is_pinned: isPinned, updated_at: new Date().toISOString() } as never)
                .eq('id', threadId);

            if (error) throw error;
        } catch (error) {
            console.error('Error pinning thread:', error);
            throw error;
        }
    },

    /**
     * Cierra o abre un hilo (evita nuevas respuestas).
     */
    async closeThread(threadId: string, isClosed: boolean): Promise<void> {
        try {
            const { error } = await supabase
                .from('forum_threads')
                .update({ is_locked: isClosed, updated_at: new Date().toISOString() } as never)
                .eq('id', threadId);

            if (error) throw error;
        } catch (error) {
            console.error('Error closing thread:', error);
            throw error;
        }
    },

    /**
     * Marca un hilo como resuelto.
     */
    async markResolved(threadId: string, isResolved: boolean): Promise<void> {
        try {
            const { error } = await supabase
                .from('forum_threads')
                .update({ is_resolved: isResolved, updated_at: new Date().toISOString() } as never)
                .eq('id', threadId);

            if (error) throw error;
        } catch (error) {
            console.error('Error marking thread as resolved:', error);
            throw error;
        }
    },

    /**
     * Reporta contenido (hilo o respuesta).
     */
    async reportContent(
        targetType: 'thread' | 'reply',
        targetId: string,
        threadId: string,
        reporterId: string,
        reporterName: string,
        reason: ReportReason,
        description?: string
    ): Promise<string> {
        try {
            const { data, error } = await supabase
                .from('forum_reports')
                .insert({
                    target_type: targetType,
                    target_id: targetId,
                    thread_id: threadId,
                    reporter_id: reporterId,
                    reporter_name: reporterName,
                    reason,
                    description: description || null,
                    status: 'pending',
                    created_at: new Date().toISOString()
                } as never)
                .select('id')
                .single();

            if (error) throw error;
            return (data as unknown as { id: string })?.id || '';
        } catch (error) {
            console.error('Error reporting content:', error);
            throw error;
        }
    },

    /**
     * Verifica si un usuario ya reportó un contenido específico.
     */
    async hasUserReported(
        targetType: 'thread' | 'reply',
        targetId: string,
        reporterId: string
    ): Promise<boolean> {
        try {
            const { data, error } = await supabase
                .from('forum_reports')
                .select('id')
                .eq('target_type', targetType)
                .eq('target_id', targetId)
                .eq('reporter_id', reporterId)
                .maybeSingle();

            if (error) throw error;
            return !!data;
        } catch (error) {
            console.error('Error checking if user reported:', error);
            return false;
        }
    },

    /**
     * Obtiene estadísticas globales del foro.
     */
    async getForumStats(): Promise<ForumStats> {
        try {
            // Get total threads count
            const { count: totalThreads } = await supabase
                .from('forum_threads')
                .select('*', { count: 'exact', head: true });

            // Get total replies count
            const { count: totalReplies } = await supabase
                .from('forum_replies')
                .select('*', { count: 'exact', head: true });

            // Get total users count
            const { count: totalUsers } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true });

            // Active today (users with recent activity)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const { count: activeToday } = await supabase
                .from('forum_threads')
                .select('author_id', { count: 'exact', head: true })
                .gte('last_activity_at', today.toISOString());

            return {
                totalThreads: totalThreads || 0,
                totalReplies: totalReplies || 0,
                totalUsers: totalUsers || 0,
                activeToday: activeToday || 0
            };
        } catch (error) {
            console.error('Error getting forum stats:', error);
            return {
                totalThreads: 0,
                totalReplies: 0,
                totalUsers: 0,
                activeToday: 0
            };
        }
    },

    /**
     * Mueve un hilo a otra categoría.
     */
    async moveThread(threadId: string, newCategory: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('forum_threads')
                .update({ category: newCategory, updated_at: new Date().toISOString() } as never)
                .eq('id', threadId);

            if (error) throw error;
        } catch (error) {
            console.error('Error moving thread:', error);
            throw error;
        }
    }
};
