/**
 * Operaciones de Respuestas del Foro (Supabase)
 * 
 * @module services/supabase/forum/replies
 */
import { supabase } from '../../../lib/supabase';
import { ForumReply } from '../../../types/forum';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ReplyRow {
    id: string;
    thread_id: string;
    content: string;
    author_id: string;
    author_name: string;
    author_avatar: string | null;
    author_username: string | null;
    is_solution: boolean;
    likes: number;
    parent_id: string | null;
    created_at: string;
    updated_at: string;
}

interface ReplyInsert {
    thread_id: string;
    content: string;
    author_id: string;
    author_name: string;
    author_avatar: string | null;
    author_username: string | null;
    is_solution: boolean;
    likes: number;
    parent_id: string | null;
    created_at: string;
    updated_at: string;
}

interface LikeInsert {
    user_id: string;
    target_id: string;
    target_type: string;
    created_at: string;
}

export const forumReplies = {
    /**
     * Obtiene respuestas de un hilo.
     */
    async getReplies(threadId: string): Promise<ForumReply[]> {
        try {
            const { data, error } = await supabase
                .from('forum_replies')
                .select('*')
                .eq('thread_id', threadId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            return ((data || []) as unknown as ReplyRow[]).map((r): ForumReply => ({
                id: r.id,
                threadId: r.thread_id,
                content: r.content,
                authorId: r.author_id,
                authorName: r.author_name,
                authorAvatar: r.author_avatar ?? undefined,
                authorUsername: r.author_username ?? undefined,
                isBestAnswer: r.is_solution || false,
                isEdited: r.updated_at !== r.created_at,
                likes: r.likes,
                parentId: r.parent_id ?? undefined,
                createdAt: r.created_at,
                updatedAt: r.updated_at
            }));
        } catch (error) {
            console.error('Error fetching replies:', error);
            return [];
        }
    },

    /**
     * Crea una respuesta.
     */
    async createReply(replyData: {
        threadId: string;
        content: string;
        authorId: string;
        authorName: string;
        authorAvatar?: string;
        authorUsername?: string;
        parentId?: string;
    }): Promise<string> {
        try {
            const now = new Date().toISOString();

            const replyInsert: ReplyInsert = {
                thread_id: replyData.threadId,
                content: replyData.content,
                author_id: replyData.authorId,
                author_name: replyData.authorName,
                author_avatar: replyData.authorAvatar ?? null,
                author_username: replyData.authorUsername ?? null,
                is_solution: false,
                likes: 0,
                parent_id: replyData.parentId ?? null,
                created_at: now,
                updated_at: now
            };

            const { data, error } = await supabase
                .from('forum_replies')
                .insert(replyInsert as never)
                .select('id')
                .single();

            if (error) throw error;

            // Update thread reply count and last activity
            await supabase
                .from('forum_threads')
                .update({
                    last_activity_at: now
                } as never)
                .eq('id', replyData.threadId);

            return (data as unknown as { id: string })?.id || '';
        } catch (error) {
            console.error('Error creating reply:', error);
            throw error;
        }
    },

    /**
     * Actualiza una respuesta.
     */
    async updateReply(replyId: string, content: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('forum_replies')
                .update({
                    content,
                    updated_at: new Date().toISOString()
                } as never)
                .eq('id', replyId);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating reply:', error);
            throw error;
        }
    },

    /**
     * Elimina una respuesta.
     */
    async deleteReply(replyId: string): Promise<void> {
        try {
            // Delete child replies
            await supabase.from('forum_replies').delete().eq('parent_id', replyId);

            const { error } = await supabase
                .from('forum_replies')
                .delete()
                .eq('id', replyId);

            if (error) throw error;

            // Note: Reply count decrement should be handled by database trigger
        } catch (error) {
            console.error('Error deleting reply:', error);
            throw error;
        }
    },

    /**
     * Marca una respuesta como solución.
     */
    async markAsSolution(replyId: string, threadId: string): Promise<void> {
        try {
            // First, unmark any existing solution
            await supabase
                .from('forum_replies')
                .update({ is_solution: false } as never)
                .eq('thread_id', threadId);

            // Mark this reply as solution
            await supabase
                .from('forum_replies')
                .update({ is_solution: true } as never)
                .eq('id', replyId);

            // Mark thread as resolved
            await supabase
                .from('forum_threads')
                .update({ is_resolved: true } as never)
                .eq('id', threadId);

        } catch (error) {
            console.error('Error marking as solution:', error);
            throw error;
        }
    },

    /**
     * Toggle like en una respuesta.
     */
    async toggleLike(replyId: string, userId: string): Promise<boolean> {
        try {
            const { data: existing } = await supabase
                .from('likes')
                .select('id')
                .eq('user_id', userId)
                .eq('target_id', replyId)
                .eq('target_type', 'forum_reply')
                .maybeSingle();

            if (existing) {
                const existingData = existing as { id: string };
                await supabase.from('likes').delete().eq('id', existingData.id);
                return false;
            } else {
                const likeInsert: LikeInsert = {
                    user_id: userId,
                    target_id: replyId,
                    target_type: 'forum_reply',
                    created_at: new Date().toISOString()
                };
                await supabase.from('likes').insert(likeInsert as never);
                return true;
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            return false;
        }
    },

    /**
     * Suscripción en tiempo real a respuestas.
     */
    subscribeToReplies(threadId: string, callback: (replies: ForumReply[]) => void): () => void {
        forumReplies.getReplies(threadId).then(callback);

        const channel: RealtimeChannel = supabase
            .channel(`forum-replies-${threadId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'forum_replies',
                    filter: `thread_id=eq.${threadId}`
                },
                () => {
                    forumReplies.getReplies(threadId).then(callback);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },

    /**
     * Alias para createReply (compatibilidad con hooks).
     */
    async addReply(threadId: string, data: {
        content: string;
        authorId: string;
        authorName: string;
        authorUsername?: string;
        authorAvatar?: string;
        authorRole?: string;
        parentId?: string;
    }): Promise<ForumReply | null> {
        try {
            const replyId = await forumReplies.createReply({
                threadId,
                content: data.content,
                authorId: data.authorId,
                authorName: data.authorName,
                authorAvatar: data.authorAvatar,
                authorUsername: data.authorUsername,
                parentId: data.parentId
            });

            // Fetch and return the created reply
            const { data: reply } = await supabase
                .from('forum_replies')
                .select('*')
                .eq('id', replyId)
                .single();

            if (!reply) return null;

            const r = reply as unknown as ReplyRow;
            return {
                id: r.id,
                threadId: r.thread_id,
                content: r.content,
                authorId: r.author_id,
                authorName: r.author_name,
                authorAvatar: r.author_avatar ?? undefined,
                authorUsername: r.author_username ?? undefined,
                isBestAnswer: r.is_solution || false,
                isEdited: r.updated_at !== r.created_at,
                likes: r.likes,
                parentId: r.parent_id ?? undefined,
                createdAt: r.created_at,
                updatedAt: r.updated_at
            };
        } catch (error) {
            console.error('Error adding reply:', error);
            return null;
        }
    },

    /**
     * Verifica si un usuario ha dado like a una respuesta.
     */
    async getReplyLikeStatus(threadId: string, replyId: string, userId: string): Promise<boolean> {
        try {
            const { data } = await supabase
                .from('likes')
                .select('id')
                .eq('user_id', userId)
                .eq('target_id', replyId)
                .eq('target_type', 'forum_reply')
                .maybeSingle();

            return !!data;
        } catch (error) {
            console.error('Error checking reply like status:', error);
            return false;
        }
    },

    /**
     * Toggle like en respuesta (alias para toggleLike).
     */
    async toggleReplyLike(threadId: string, replyId: string, userId: string): Promise<boolean> {
        return forumReplies.toggleLike(replyId, userId);
    },

    /**
     * Marca/desmarca una respuesta como mejor respuesta.
     */
    async toggleBestAnswer(threadId: string, replyId: string, isBest: boolean): Promise<void> {
        if (isBest) {
            await forumReplies.markAsSolution(replyId, threadId);
        } else {
            // Unmark solution
            await supabase
                .from('forum_replies')
                .update({ is_solution: false } as never)
                .eq('id', replyId);
            
            await supabase
                .from('forum_threads')
                .update({ is_resolved: false } as never)
                .eq('id', threadId);
        }
    }
};
