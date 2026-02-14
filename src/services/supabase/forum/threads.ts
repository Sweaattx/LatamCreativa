/**
 * Operaciones de Hilos del Foro (Supabase)
 * 
 * @module services/supabase/forum/threads
 */
import { supabase } from '../../../lib/supabase';
import { ForumThread } from '../../../types/forum';
import { generateUniqueSlug } from '../../../utils/slugUtils';

interface ThreadRow {
    id: string;
    slug: string;
    title: string;
    content: string;
    excerpt: string | null;
    category: string;
    author_id: string;
    author_name: string;
    author_avatar: string | null;
    author_username: string | null;
    is_pinned: boolean;
    is_locked: boolean;
    is_resolved: boolean;
    views: number;
    likes: number;
    reply_count: number;
    last_activity_at: string;
    created_at: string;
    updated_at: string;
}

interface ThreadInsert {
    slug: string;
    title: string;
    content: string;
    excerpt: string;
    category: string;
    author_id: string;
    author_name: string;
    author_avatar: string | null;
    author_username: string | null;
    is_pinned: boolean;
    is_locked: boolean;
    is_resolved: boolean;
    views: number;
    likes: number;
    reply_count: number;
    last_activity_at: string;
    created_at: string;
    updated_at: string;
}

interface LikeInsert {
    user_id: string;
    target_id: string;
    target_type: string;
    created_at: string;
}

interface ForumPaginatedResult<T> {
    items: T[];
    hasMore: boolean;
    lastId: string | null;
}

/**
 * Genera un extracto del contenido
 */
function generateExcerpt(content: string, maxLength = 150): string {
    const plainText = content
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]*`/g, '')
        .replace(/[#*_~[\\]]/g, '')
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[.*?\]\(.*?\)/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength).trim() + '...';
}

export const forumThreadsCrud = {
    /**
     * Obtiene hilos paginados con filtros opcionales.
     */
    async getThreads(options: {
        category?: string;
        sortBy?: 'recent' | 'popular' | 'activity' | 'unanswered';
        lastId?: string | null;
        pageSize?: number;
    } = {}): Promise<ForumPaginatedResult<ForumThread>> {
        const {
            category,
            sortBy = 'activity',
            lastId = null,
            pageSize = 20
        } = options;

        try {
            let query = supabase.from('forum_threads').select('*');

            // Filter by category
            if (category && category !== 'all') {
                query = query.eq('category', category);
            }

            // Filter unanswered
            if (sortBy === 'unanswered') {
                query = query.eq('is_resolved', false);
            }

            // Sorting
            const sortColumn = sortBy === 'recent' ? 'created_at' :
                sortBy === 'popular' ? 'likes' : 'last_activity_at';
            query = query.order(sortColumn, { ascending: false });

            // Pagination
            if (lastId) {
                const { data: cursorThread } = await supabase
                    .from('forum_threads')
                    .select(sortColumn)
                    .eq('id', lastId)
                    .single();

                if (cursorThread) {
                    query = query.lt(sortColumn, cursorThread[sortColumn]);
                }
            }

            query = query.limit(pageSize + 1);

            const { data, error } = await query;
            if (error) throw error;

            const hasMore = (data?.length || 0) > pageSize;
            const items = ((data || []) as ThreadRow[]).slice(0, pageSize);

            // Sort pinned threads to top
            items.sort((a, b) => {
                if (a.is_pinned && !b.is_pinned) return -1;
                if (!a.is_pinned && b.is_pinned) return 1;
                return 0;
            });

            const threads: ForumThread[] = items.map(t => {
                const thread = t as unknown as Record<string, unknown>;
                return {
                    id: thread.id as string,
                    slug: thread.slug as string,
                    title: thread.title as string,
                    content: thread.content as string,
                    excerpt: thread.excerpt as string | undefined,
                    category: thread.category as string,
                    authorId: thread.author_id as string,
                    authorName: thread.author_name as string,
                    authorAvatar: thread.author_avatar as string | undefined,
                    authorUsername: thread.author_username as string | undefined,
                    isPinned: thread.is_pinned as boolean,
                    isLocked: thread.is_locked as boolean,
                    isClosed: thread.is_locked as boolean,
                    isResolved: thread.is_resolved as boolean,
                    views: thread.views as number,
                    likes: thread.likes as number,
                    replyCount: thread.reply_count as number,
                    replies: thread.reply_count as number,
                    lastActivityAt: thread.last_activity_at as string,
                    createdAt: thread.created_at as string,
                    updatedAt: thread.updated_at as string
                };
            });

            const lastItem = items[items.length - 1] as unknown as Record<string, unknown> | undefined;
            return {
                items: threads,
                hasMore,
                lastId: (lastItem?.id as string) || null
            };
        } catch {
            // Silently handle - empty error expected when table is empty or doesn't exist
            return { items: [], hasMore: false, lastId: null };
        }
    },

    /**
     * Obtiene un hilo por ID o slug.
     */
    async getThread(identifier: string): Promise<ForumThread | null> {
        try {
            const query = supabase.from('forum_threads').select('*').eq('id', identifier);
            let { data } = await query.maybeSingle();

            if (!data) {
                const result = await supabase.from('forum_threads').select('*').eq('slug', identifier).maybeSingle();
                data = result.data;
            }

            if (!data) return null;

            // Type cast for safe property access
            const t = data as Record<string, unknown>;
            return {
                id: t.id as string,
                slug: t.slug as string,
                title: t.title as string,
                content: t.content as string,
                excerpt: t.excerpt as string | undefined,
                category: t.category as string,
                authorId: t.author_id as string,
                authorName: t.author_name as string,
                authorAvatar: t.author_avatar as string | undefined,
                authorUsername: t.author_username as string | undefined,
                isPinned: t.is_pinned as boolean,
                isLocked: t.is_locked as boolean,
                isClosed: t.is_locked as boolean,
                isResolved: t.is_resolved as boolean,
                views: t.views as number,
                likes: t.likes as number,
                replyCount: t.reply_count as number,
                replies: t.reply_count as number,
                lastActivityAt: t.last_activity_at as string,
                createdAt: t.created_at as string,
                updatedAt: t.updated_at as string
            };
        } catch (error) {
            console.error('Error fetching thread:', error);
            return null;
        }
    },

    /**
     * Crea un nuevo hilo.
     */
    async createThread(threadData: {
        title: string;
        content: string;
        category: string;
        authorId: string;
        authorName: string;
        authorAvatar?: string;
        authorUsername?: string;
    }): Promise<{ id: string; slug: string }> {
        try {
            const slug = generateUniqueSlug(threadData.title);
            const excerpt = generateExcerpt(threadData.content);
            const now = new Date().toISOString();

            const threadInsert: ThreadInsert = {
                slug,
                title: threadData.title,
                content: threadData.content,
                excerpt,
                category: threadData.category,
                author_id: threadData.authorId,
                author_name: threadData.authorName,
                author_avatar: threadData.authorAvatar ?? null,
                author_username: threadData.authorUsername ?? null,
                is_pinned: false,
                is_locked: false,
                is_resolved: false,
                views: 0,
                likes: 0,
                reply_count: 0,
                last_activity_at: now,
                created_at: now,
                updated_at: now
            };

            const { data, error } = await supabase
                .from('forum_threads')
                .insert(threadInsert as never)
                .select('id, slug')
                .single();

            if (error) throw error;
            if (!data) throw new Error('Failed to create thread');
            const result = data as { id: string; slug: string };
            return { id: result.id, slug: result.slug };
        } catch (error) {
            console.error('Error creating thread:', error);
            throw error;
        }
    },

    /**
     * Actualiza un hilo.
     */
    async updateThread(threadId: string, updates: Partial<ForumThread>): Promise<void> {
        try {
            const updateData: Record<string, unknown> = {
                updated_at: new Date().toISOString()
            };

            if (updates.title !== undefined) updateData.title = updates.title;
            if (updates.content !== undefined) {
                updateData.content = updates.content;
                updateData.excerpt = generateExcerpt(updates.content);
            }
            if (updates.category !== undefined) updateData.category = updates.category;
            if (updates.isPinned !== undefined) updateData.is_pinned = updates.isPinned;
            if (updates.isLocked !== undefined) updateData.is_locked = updates.isLocked;
            if (updates.isClosed !== undefined) updateData.is_locked = updates.isClosed;
            if (updates.isResolved !== undefined) updateData.is_resolved = updates.isResolved;

            const { error } = await supabase
                .from('forum_threads')
                .update(updateData as never)
                .eq('id', threadId);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating thread:', error);
            throw error;
        }
    },

    /**
     * Elimina un hilo.
     */
    async deleteThread(threadId: string): Promise<void> {
        try {
            // Delete replies first
            await supabase.from('forum_replies').delete().eq('thread_id', threadId);

            const { error } = await supabase
                .from('forum_threads')
                .delete()
                .eq('id', threadId);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting thread:', error);
            throw error;
        }
    },

    /**
     * Incrementa las vistas de un hilo.
     */
    async incrementViews(threadId: string): Promise<void> {
        try {
            await supabase.rpc('increment_thread_views', { thread_id: threadId } as never);
        } catch (error) {
            console.warn('Error incrementing views:', error);
        }
    },

    /**
     * Toggle like en un hilo.
     */
    async toggleLike(threadId: string, userId: string): Promise<boolean> {
        try {
            const { data: existing } = await supabase
                .from('likes')
                .select('id')
                .eq('user_id', userId)
                .eq('target_id', threadId)
                .eq('target_type', 'forum_thread')
                .maybeSingle();

            if (existing) {
                const existingData = existing as { id: string };
                await supabase.from('likes').delete().eq('id', existingData.id);
                await supabase.rpc('increment_thread_likes', { thread_id: threadId, amount: -1 } as never);
                return false;
            } else {
                const likeInsert: LikeInsert = {
                    user_id: userId,
                    target_id: threadId,
                    target_type: 'forum_thread',
                    created_at: new Date().toISOString()
                };
                await supabase.from('likes').insert(likeInsert as never);
                await supabase.rpc('increment_thread_likes', { thread_id: threadId, amount: 1 } as never);
                return true;
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            return false;
        }
    },

    /**
     * Obtiene un hilo por slug.
     */
    async getThreadBySlug(slug: string): Promise<ForumThread | null> {
        return forumThreadsCrud.getThread(slug);
    },

    /**
     * Obtiene hilos de un usuario.
     */
    async getUserThreads(userId: string): Promise<ForumThread[]> {
        try {
            const { data, error } = await supabase
                .from('forum_threads')
                .select('*')
                .eq('author_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map(t => {
                const thread = t as Record<string, unknown>;
                return {
                    id: thread.id as string,
                    slug: thread.slug as string,
                    title: thread.title as string,
                    content: thread.content as string,
                    excerpt: thread.excerpt as string | undefined,
                    category: thread.category as string,
                    authorId: thread.author_id as string,
                    authorName: thread.author_name as string,
                    authorAvatar: thread.author_avatar as string | undefined,
                    authorUsername: thread.author_username as string | undefined,
                    isPinned: thread.is_pinned as boolean,
                    isLocked: thread.is_locked as boolean,
                    isClosed: thread.is_locked as boolean,
                    isResolved: thread.is_resolved as boolean,
                    views: thread.views as number,
                    likes: thread.likes as number,
                    replyCount: thread.reply_count as number,
                    replies: thread.reply_count as number,
                    lastActivityAt: thread.last_activity_at as string,
                    createdAt: thread.created_at as string,
                    updatedAt: thread.updated_at as string
                };
            });
        } catch (error) {
            console.error('Error fetching user threads:', error);
            return [];
        }
    },

    /**
     * Obtiene hilos recientes.
     */
    async getRecentThreads(limit = 5): Promise<ForumThread[]> {
        try {
            const { data, error } = await supabase
                .from('forum_threads')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return (data || []).map(t => {
                const thread = t as Record<string, unknown>;
                return {
                    id: thread.id as string,
                    slug: thread.slug as string,
                    title: thread.title as string,
                    content: thread.content as string,
                    excerpt: thread.excerpt as string | undefined,
                    category: thread.category as string,
                    authorId: thread.author_id as string,
                    authorName: thread.author_name as string,
                    authorAvatar: thread.author_avatar as string | undefined,
                    authorUsername: thread.author_username as string | undefined,
                    isPinned: thread.is_pinned as boolean,
                    isLocked: thread.is_locked as boolean,
                    isClosed: thread.is_locked as boolean,
                    isResolved: thread.is_resolved as boolean,
                    views: thread.views as number,
                    likes: thread.likes as number,
                    replyCount: thread.reply_count as number,
                    replies: thread.reply_count as number,
                    lastActivityAt: thread.last_activity_at as string,
                    createdAt: thread.created_at as string,
                    updatedAt: thread.updated_at as string
                };
            });
        } catch (error) {
            console.error('Error fetching recent threads:', error);
            return [];
        }
    },

    /**
     * Verifica si un usuario ha dado like a un hilo.
     */
    async getLikeStatus(threadId: string, userId: string): Promise<boolean> {
        try {
            const { data } = await supabase
                .from('likes')
                .select('id')
                .eq('user_id', userId)
                .eq('target_id', threadId)
                .eq('target_type', 'forum_thread')
                .maybeSingle();

            return !!data;
        } catch (error) {
            console.error('Error checking like status:', error);
            return false;
        }
    }
};
