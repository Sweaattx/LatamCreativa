import { supabase } from '../../lib/supabase';

export const interactionsService = {
    async toggleLike(contentType: 'project' | 'article', contentId: string, userId: string): Promise<boolean> {
        const table = contentType === 'project' ? 'project_likes' : 'article_likes';
        const col = contentType === 'project' ? 'project_id' : 'article_id';

        const { data: existing } = await (supabase as any).from(table).select('id').eq(col, contentId).eq('user_id', userId).single();

        if (existing) {
            await (supabase as any).from(table).delete().eq('id', existing.id);
            const countTable = contentType === 'project' ? 'projects' : 'articles';
            await (supabase as any).from(countTable).update({ likes: (supabase as any).rpc('decrement', { row_id: contentId }) }).eq('id', contentId);
            return false;
        } else {
            await (supabase as any).from(table).insert({ [col]: contentId, user_id: userId });
            const countTable = contentType === 'project' ? 'projects' : 'articles';
            await (supabase as any).from(countTable).update({ likes: (supabase as any).rpc('increment', { row_id: contentId }) }).eq('id', contentId);
            return true;
        }
    },

    async isLiked(contentType: 'project' | 'article', contentId: string, userId: string): Promise<boolean> {
        const table = contentType === 'project' ? 'project_likes' : 'article_likes';
        const col = contentType === 'project' ? 'project_id' : 'article_id';
        const { data } = await (supabase as any).from(table).select('id').eq(col, contentId).eq('user_id', userId).single();
        return !!data;
    },

    async addComment(contentType: 'project' | 'article', contentId: string, userId: string, text: string) {
        const { data, error } = await (supabase as any).from('comments').insert({
            target_type: contentType,
            target_id: contentId,
            user_id: userId,
            text,
        }).select('id, text, user_id, created_at').single();
        if (error) throw error;
        return data;
    },

    async getComments(contentType: 'project' | 'article', contentId: string, limit = 20) {
        const { data, error } = await (supabase as any)
            .from('comments')
            .select('id, text, user_id, created_at, users:user_id(name, avatar)')
            .eq('target_type', contentType)
            .eq('target_id', contentId)
            .order('created_at', { ascending: true })
            .limit(limit);
        if (error) throw error;
        return (data || []).map((c: Record<string, unknown>) => {
            const user = c.users as Record<string, string> | null;
            return {
                id: c.id as string,
                text: c.text as string,
                authorName: user?.name || 'Usuario',
                authorAvatar: user?.avatar || null,
                createdAt: c.created_at as string,
            };
        });
    },

    async deleteComment(commentId: string, userId: string) {
        const { error } = await (supabase as any).from('comments').delete().eq('id', commentId).eq('user_id', userId);
        if (error) throw error;
    },
};
