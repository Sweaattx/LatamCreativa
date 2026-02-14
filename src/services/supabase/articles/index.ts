/**
 * Articles Service Index (Supabase)
 * 
 * Barrel export para todos los módulos de artículos.
 * 
 * @module services/supabase/articles
 */

export { articlesCrud } from './crud';
export { articlesComments, type ArticleComment } from './comments';
export { articlesLikes } from './likes';

// Combined service for backward compatibility
import { articlesCrud } from './crud';
import { articlesComments, ArticleComment } from './comments';
import { articlesLikes } from './likes';

export const articlesService = {
    ...articlesCrud,
    ...articlesComments,
    ...articlesLikes,

    // Aliases for backward compatibility with hooks
    listenToComments: (articleId: string, callback: (comments: ArticleComment[]) => void) => 
        articlesComments.subscribeToArticleComments(articleId, callback),
    
    addComment: articlesComments.addArticleComment,
    
    updateComment: async (_articleId: string, commentId: string, content: string): Promise<void> => {
        // Update comment content directly
        const { supabase } = await import('../../../lib/supabase');
        await supabase.from('comments').update({ content, updated_at: new Date().toISOString() } as never).eq('id', commentId);
    },
    
    deleteComment: articlesComments.deleteArticleComment,
    
    toggleCommentLike: async (_articleId: string, commentId: string, userId: string): Promise<boolean> => {
        // Check if liked
        const { supabase } = await import('../../../lib/supabase');
        const { data: existing } = await supabase
            .from('likes')
            .select('id')
            .eq('user_id', userId)
            .eq('target_id', commentId)
            .eq('target_type', 'comment')
            .maybeSingle();
        
        if (existing) {
            await articlesComments.unlikeComment(commentId, userId);
            return false;
        } else {
            await articlesComments.likeComment(commentId, userId);
            return true;
        }
    },
    
    getArticleLikeStatus: articlesLikes.hasUserLiked,
    
    toggleArticleLike: async (articleId: string, userId: string): Promise<boolean> => {
        return articlesLikes.toggleLike(articleId, userId);
    }
};
