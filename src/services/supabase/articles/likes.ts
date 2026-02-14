/**
 * Operaciones de Likes de Artículos (Supabase)
 * 
 * @module services/supabase/articles/likes
 */
import { supabase } from '../../../lib/supabase';

export const articlesLikes = {
    /**
     * Da like a un artículo.
     * 
     * @param articleId - ID del artículo
     * @param userId - ID del usuario
     */
    likeArticle: async (articleId: string, userId: string): Promise<void> => {
        try {
            // Check if already liked
            const { data: existing } = await supabase
                .from('likes')
                .select('id')
                .eq('user_id', userId)
                .eq('target_id', articleId)
                .eq('target_type', 'article')
                .maybeSingle();

            if (existing) return;

            // Insert like
            const { error: insertError } = await supabase
                .from('likes')
                .insert({
                    user_id: userId,
                    target_id: articleId,
                    target_type: 'article',
                    created_at: new Date().toISOString()
                } as never);

            if (insertError) throw insertError;

            // Increment article likes count
            await supabase.rpc('increment_article_likes', { article_id: articleId, amount: 1 } as never);

        } catch (error) {
            console.error('Error liking article:', error);
            throw error;
        }
    },

    /**
     * Quita like de un artículo.
     * 
     * @param articleId - ID del artículo
     * @param userId - ID del usuario
     */
    unlikeArticle: async (articleId: string, userId: string): Promise<void> => {
        try {
            const { error } = await supabase
                .from('likes')
                .delete()
                .eq('user_id', userId)
                .eq('target_id', articleId)
                .eq('target_type', 'article');

            if (error) throw error;

            // Decrement article likes count
            await supabase.rpc('increment_article_likes', { article_id: articleId, amount: -1 } as never);

        } catch (error) {
            console.error('Error unliking article:', error);
            throw error;
        }
    },

    /**
     * Toggle like de un artículo.
     * 
     * @param articleId - ID del artículo
     * @param userId - ID del usuario
     * @returns true si ahora tiene like, false si se quitó
     */
    toggleLike: async (articleId: string, userId: string): Promise<boolean> => {
        const hasLike = await articlesLikes.hasUserLiked(articleId, userId);

        if (hasLike) {
            await articlesLikes.unlikeArticle(articleId, userId);
            return false;
        } else {
            await articlesLikes.likeArticle(articleId, userId);
            return true;
        }
    },

    /**
     * Verifica si un usuario ha dado like a un artículo.
     * 
     * @param articleId - ID del artículo
     * @param userId - ID del usuario
     * @returns true si tiene like
     */
    hasUserLiked: async (articleId: string, userId: string): Promise<boolean> => {
        try {
            const { data, error } = await supabase
                .from('likes')
                .select('id')
                .eq('user_id', userId)
                .eq('target_id', articleId)
                .eq('target_type', 'article')
                .maybeSingle();

            if (error) throw error;
            return data !== null;
        } catch (error) {
            console.error('Error checking like status:', error);
            return false;
        }
    },

    /**
     * Obtiene el conteo de likes de un artículo.
     * 
     * @param articleId - ID del artículo
     * @returns Número de likes
     */
    getLikeCount: async (articleId: string): Promise<number> => {
        try {
            const { count, error } = await supabase
                .from('likes')
                .select('id', { count: 'exact', head: true })
                .eq('target_id', articleId)
                .eq('target_type', 'article');

            if (error) throw error;
            return count || 0;
        } catch (error) {
            console.error('Error getting like count:', error);
            return 0;
        }
    },

    /**
     * Obtiene todos los artículos que un usuario ha dado like.
     * 
     * @param userId - ID del usuario
     * @returns Array de IDs de artículos
     */
    getUserLikedArticles: async (userId: string): Promise<string[]> => {
        try {
            const { data, error } = await supabase
                .from('likes')
                .select('target_id')
                .eq('user_id', userId)
                .eq('target_type', 'article');

            if (error) throw error;
            return ((data || []) as unknown as { target_id: string }[]).map(l => l.target_id);
        } catch (error) {
            console.error('Error getting user liked articles:', error);
            return [];
        }
    }
};
