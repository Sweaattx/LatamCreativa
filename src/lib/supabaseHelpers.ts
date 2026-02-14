/**
 * Supabase Typed Helpers
 * 
 * Helpers tipados para operaciones comunes de Supabase.
 * Estos helpers proporcionan type safety cuando el cliente genérico no infiere bien.
 * 
 * @module lib/supabaseHelpers
 */
import { supabase } from './supabase';

// ============================================
// ARTICLES HELPERS
// ============================================

export const articlesHelper = {
    async insert(data: Record<string, unknown>) {
        const { data: result, error } = await supabase
            .from('articles')
            .insert(data as never)
            .select()
            .single();
        return { data: result, error };
    },

    async update(id: string, data: Record<string, unknown>) {
        const { error } = await supabase
            .from('articles')
            .update(data as never)
            .eq('id', id);
        return { error };
    },

    async getById(id: string) {
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('id', id)
            .single();
        return { data, error };
    },

    async getBySlug(slug: string) {
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('slug', slug)
            .single();
        return { data, error };
    }
};

// ============================================
// COMMENTS HELPERS
// ============================================

export const commentsHelper = {
    async insert(data: Record<string, unknown>) {
        const { data: result, error } = await supabase
            .from('comments')
            .insert(data as never)
            .select()
            .single();
        return { data: result, error };
    },

    async update(id: string, data: Record<string, unknown>) {
        const { error } = await supabase
            .from('comments')
            .update(data as never)
            .eq('id', id);
        return { error };
    },

    async getByTarget(targetType: 'article' | 'project', targetId: string) {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('target_type', targetType)
            .eq('target_id', targetId)
            .order('created_at', { ascending: true });
        return { data: data || [], error };
    }
};

// ============================================
// LIKES HELPERS
// ============================================

export const likesHelper = {
    async insert(data: Record<string, unknown>) {
        const { data: result, error } = await supabase
            .from('likes')
            .insert(data as never)
            .select()
            .single();
        return { data: result, error };
    },

    async delete(userId: string, targetId: string, targetType: string) {
        const { error } = await supabase
            .from('likes')
            .delete()
            .eq('user_id', userId)
            .eq('target_id', targetId)
            .eq('target_type', targetType);
        return { error };
    },

    async exists(userId: string, targetId: string, targetType: string) {
        const { data, error } = await supabase
            .from('likes')
            .select('id')
            .eq('user_id', userId)
            .eq('target_id', targetId)
            .eq('target_type', targetType)
            .maybeSingle();
        return { exists: data !== null, error };
    }
};

// ============================================
// COLLECTIONS HELPERS
// ============================================

export const collectionsHelper = {
    async insert(data: Record<string, unknown>) {
        const { data: result, error } = await supabase
            .from('collections')
            .insert(data as never)
            .select()
            .single();
        return { data: result, error };
    },

    async update(id: string, data: Record<string, unknown>) {
        const { error } = await supabase
            .from('collections')
            .update(data as never)
            .eq('id', id);
        return { error };
    },

    async insertItem(data: Record<string, unknown>) {
        const { data: result, error } = await supabase
            .from('collection_items')
            .insert(data as never)
            .select()
            .single();
        return { data: result, error };
    },

    async getByUser(userId: string) {
        const { data, error } = await supabase
            .from('collections')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        return { data: data || [], error };
    },

    async getItems(collectionId: string) {
        const { data, error } = await supabase
            .from('collection_items')
            .select('*')
            .eq('collection_id', collectionId)
            .order('added_at', { ascending: false });
        return { data: data || [], error };
    }
};

// ============================================
// FORUM HELPERS
// ============================================

export const forumHelper = {
    async insertThread(data: Record<string, unknown>) {
        const { data: result, error } = await supabase
            .from('forum_threads')
            .insert(data as never)
            .select()
            .single();
        return { data: result, error };
    },

    async updateThread(id: string, data: Record<string, unknown>) {
        const { error } = await supabase
            .from('forum_threads')
            .update(data as never)
            .eq('id', id);
        return { error };
    },

    async insertReply(data: Record<string, unknown>) {
        const { data: result, error } = await supabase
            .from('forum_replies')
            .insert(data as never)
            .select()
            .single();
        return { data: result, error };
    },

    async updateReply(id: string, data: Record<string, unknown>) {
        const { error } = await supabase
            .from('forum_replies')
            .update(data as never)
            .eq('id', id);
        return { error };
    },

    async insertReport(data: Record<string, unknown>) {
        const { data: result, error } = await supabase
            .from('forum_reports')
            .insert(data as never)
            .select()
            .single();
        return { data: result, error };
    },

    async getReplies(threadId: string) {
        const { data, error } = await supabase
            .from('forum_replies')
            .select('*')
            .eq('thread_id', threadId)
            .order('created_at', { ascending: true });
        return { data: data || [], error };
    }
};

// ============================================
// NOTIFICATIONS HELPERS
// ============================================

export const notificationsHelper = {
    async insert(data: Record<string, unknown>) {
        const { error } = await supabase
            .from('notifications')
            .insert(data as never);
        return { error };
    },

    async update(id: string, userId: string, data: Record<string, unknown>) {
        const { error } = await supabase
            .from('notifications')
            .update(data as never)
            .eq('id', id)
            .eq('user_id', userId);
        return { error };
    },

    async updateAll(userId: string, data: Record<string, unknown>) {
        const { error } = await supabase
            .from('notifications')
            .update(data as never)
            .eq('user_id', userId)
            .eq('read', false);
        return { error };
    }
};

// ============================================
// PROJECTS HELPERS
// ============================================

export const projectsHelper = {
    async insert(data: Record<string, unknown>) {
        const { data: result, error } = await supabase
            .from('projects')
            .insert(data as never)
            .select()
            .single();
        return { data: result, error };
    },

    async update(id: string, data: Record<string, unknown>) {
        const { error } = await supabase
            .from('projects')
            .update(data as never)
            .eq('id', id);
        return { error };
    }
};

// ============================================
// REPORTS HELPERS
// ============================================

export const reportsHelper = {
    async insert(data: Record<string, unknown>) {
        const { data: result, error } = await supabase
            .from('reports')
            .insert(data as never)
            .select()
            .single();
        return { data: result, error };
    },

    async update(id: string, data: Record<string, unknown>) {
        const { error } = await supabase
            .from('reports')
            .update(data as never)
            .eq('id', id);
        return { error };
    }
};

// ============================================
// RPC HELPERS
// ============================================

export const rpcHelper = {
    async incrementArticleViews(articleId: string) {
        return supabase.rpc('increment_article_views', { article_id: articleId } as never);
    },

    async incrementArticleLikes(articleId: string, amount: number) {
        return supabase.rpc('increment_article_likes', { article_id: articleId, amount } as never);
    },

    async incrementArticleComments(articleId: string, amount: number) {
        return supabase.rpc('increment_article_comments', { article_id: articleId, amount } as never);
    },

    async incrementProjectViews(projectId: string) {
        return supabase.rpc('increment_project_views', { project_id: projectId } as never);
    },

    async incrementProjectLikes(projectId: string, amount: number) {
        return supabase.rpc('increment_project_likes', { project_id: projectId, amount } as never);
    },

    async incrementThreadViews(threadId: string) {
        return supabase.rpc('increment_thread_views', { thread_id: threadId } as never);
    },

    async incrementThreadLikes(threadId: string, amount: number) {
        return supabase.rpc('increment_thread_likes', { thread_id: threadId, amount } as never);
    },

    async incrementReplyLikes(replyId: string, amount: number) {
        return supabase.rpc('increment_reply_likes', { reply_id: replyId, amount } as never);
    },

    async decrementCollectionItems(collectionId: string) {
        return supabase.rpc('decrement_collection_items', { collection_id: collectionId } as never);
    },

    async incrementUserStat(userId: string, statName: string, amount: number) {
        return supabase.rpc('increment_user_stat', { user_id: userId, stat_name: statName, amount } as never);
    }
};
