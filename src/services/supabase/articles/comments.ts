/**
 * Operaciones de Comentarios de Artículos (Supabase)
 * 
 * @module services/supabase/articles/comments
 */
import { supabase } from '../../../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface DbComment {
    id: string;
    content: string;
    author_id: string;
    author_name: string;
    author_avatar: string | null;
    target_id: string;
    target_type: string;
    parent_id: string | null;
    likes: number;
    created_at: string;
    updated_at: string;
}

export interface ArticleComment {
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    articleId: string;
    parentId?: string;
    likes: number;
    createdAt: string;
    updatedAt: string;
}

export const articlesComments = {
    /**
     * Obtiene comentarios de un artículo.
     * 
     * @param articleId - ID del artículo
     * @returns Array de comentarios
     */
    getArticleComments: async (articleId: string): Promise<ArticleComment[]> => {
        try {
            const { data, error } = await supabase
                .from('comments')
                .select('*')
                .eq('target_id', articleId)
                .eq('target_type', 'article')
                .order('created_at', { ascending: true });

            if (error) throw error;

            return ((data || []) as unknown as DbComment[]).map(c => ({
                id: c.id,
                content: c.content,
                authorId: c.author_id,
                authorName: c.author_name,
                authorAvatar: c.author_avatar ?? undefined,
                articleId: c.target_id,
                parentId: c.parent_id ?? undefined,
                likes: c.likes,
                createdAt: c.created_at,
                updatedAt: c.updated_at
            }));
        } catch (error) {
            console.error('Error fetching article comments:', error);
            return [];
        }
    },

    /**
     * Añade un comentario a un artículo.
     * 
     * @param articleId - ID del artículo
     * @param comment - Datos del comentario
     * @returns ID del comentario creado
     */
    addArticleComment: async (
        articleId: string,
        comment: {
            content: string;
            authorId: string;
            authorName: string;
            authorAvatar?: string;
            parentId?: string;
        }
    ): Promise<string> => {
        try {
            const { data, error } = await supabase
                .from('comments')
                .insert({
                    content: comment.content,
                    author_id: comment.authorId,
                    author_name: comment.authorName,
                    author_avatar: comment.authorAvatar || null,
                    target_type: 'article',
                    target_id: articleId,
                    parent_id: comment.parentId || null,
                    likes: 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                } as never)
                .select('id')
                .single();

            if (error) throw error;

            // Increment article comments count
            await supabase.rpc('increment_article_comments', { article_id: articleId, amount: 1 } as never);

            return (data as unknown as { id: string })?.id || '';
        } catch (error) {
            console.error('Error adding article comment:', error);
            throw error;
        }
    },

    /**
     * Elimina un comentario de un artículo.
     * 
     * @param commentId - ID del comentario
     * @param articleId - ID del artículo (para actualizar el contador)
     */
    deleteArticleComment: async (commentId: string, articleId: string): Promise<void> => {
        try {
            // Count child comments
            const { count: childCount } = await supabase
                .from('comments')
                .select('id', { count: 'exact', head: true })
                .eq('parent_id', commentId);

            // Delete child comments
            await supabase.from('comments').delete().eq('parent_id', commentId);

            // Delete main comment
            const { error } = await supabase
                .from('comments')
                .delete()
                .eq('id', commentId);

            if (error) throw error;

            // Decrement article comments count (main + children)
            const totalDeleted = 1 + (childCount || 0);
            await supabase.rpc('increment_article_comments', { article_id: articleId, amount: -totalDeleted } as never);

        } catch (error) {
            console.error('Error deleting article comment:', error);
            throw error;
        }
    },

    /**
     * Da like a un comentario.
     * 
     * @param commentId - ID del comentario
     * @param userId - ID del usuario
     */
    likeComment: async (commentId: string, userId: string): Promise<void> => {
        try {
            // Check if already liked
            const { data: existing } = await supabase
                .from('likes')
                .select('id')
                .eq('user_id', userId)
                .eq('target_id', commentId)
                .eq('target_type', 'comment')
                .maybeSingle();

            if (existing) return;

            await supabase
                .from('likes')
                .insert({
                    user_id: userId,
                    target_id: commentId,
                    target_type: 'comment',
                    created_at: new Date().toISOString()
                } as never);

            // Increment comment likes via direct update
            const { data: currentComment } = await supabase
                .from('comments')
                .select('likes')
                .eq('id', commentId)
                .single();
            
            const currentLikes = ((currentComment as unknown as { likes: number }) || { likes: 0 }).likes;
            await supabase
                .from('comments')
                .update({ likes: currentLikes + 1 } as never)
                .eq('id', commentId);

        } catch (error) {
            console.error('Error liking comment:', error);
        }
    },

    /**
     * Quita like de un comentario.
     * 
     * @param commentId - ID del comentario
     * @param userId - ID del usuario
     */
    unlikeComment: async (commentId: string, userId: string): Promise<void> => {
        try {
            await supabase
                .from('likes')
                .delete()
                .eq('user_id', userId)
                .eq('target_id', commentId)
                .eq('target_type', 'comment');

            // Decrement comment likes via direct update
            const { data: currentComment } = await supabase
                .from('comments')
                .select('likes')
                .eq('id', commentId)
                .single();
            
            const currentLikes = ((currentComment as unknown as { likes: number }) || { likes: 0 }).likes;
            await supabase
                .from('comments')
                .update({ likes: Math.max(0, currentLikes - 1) } as never)
                .eq('id', commentId);

        } catch (error) {
            console.error('Error unliking comment:', error);
        }
    },

    /**
     * Listener en tiempo real para comentarios de un artículo.
     * 
     * @param articleId - ID del artículo
     * @param callback - Función que recibe los comentarios actualizados
     * @returns Función para cancelar la suscripción
     */
    subscribeToArticleComments: (
        articleId: string,
        callback: (comments: ArticleComment[]) => void
    ): (() => void) => {
        // Initial fetch
        articlesComments.getArticleComments(articleId).then(callback);

        // Setup realtime subscription
        const channel: RealtimeChannel = supabase
            .channel(`article-comments-${articleId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'comments',
                    filter: `target_id=eq.${articleId}`
                },
                () => {
                    articlesComments.getArticleComments(articleId).then(callback);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }
};
