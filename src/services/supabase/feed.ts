/**
 * Feed Service — Unified timeline from projects + articles
 *
 * Queries Supabase for recent projects and articles, merges them
 * into a single chronological feed, and supports different tabs
 * (for you, following, trending).
 *
 * @module services/supabase/feed
 */

import { supabase } from '../../lib/supabase';

export interface FeedItem {
    id: string;
    type: 'project' | 'article';
    slug: string;
    title: string;
    content: string | null;
    image: string | null;
    tags: string[];
    category: string | null;
    likes: number;
    views: number;
    commentsCount: number;
    createdAt: string;
    author: {
        id: string;
        name: string;
        username: string | null;
        avatar: string | null;
        role: string | null;
    };
}

export interface FeedResult {
    items: FeedItem[];
    hasMore: boolean;
}

type FeedTab = 'for-you' | 'following' | 'trending';

// Internal row shapes for type safety
interface ProjectRow { id: string; slug: string; title: string; description: string | null; image: string | null; tags: string[] | null; category: string | null; likes: number; views: number; author_id: string; created_at: string; artist_username: string | null; }
interface ArticleRow { id: string; slug: string; title: string; excerpt: string | null; image: string | null; tags: string[] | null; category: string | null; likes: number; views: number; comments_count: number; author_id: string; author: string | null; author_avatar: string | null; created_at: string; }
interface UserRow { id: string; name: string; username: string | null; avatar: string | null; role: string | null; }
interface FollowerRow { following_id: string; }
interface TagRow { tags: string[] | null; }

/**
 * Fetch unified feed from projects + articles.
 */
export async function getFeed(
    tab: FeedTab = 'for-you',
    userId?: string | null,
    pageSize = 20,
    offset = 0,
): Promise<FeedResult> {
    try {
        const [projects, articles] = await Promise.all([
            fetchProjects(tab, userId, pageSize, offset),
            fetchArticles(tab, userId, pageSize, offset),
        ]);

        let items = [...projects, ...articles];

        if (tab === 'trending') {
            items.sort((a, b) => b.likes - a.likes);
        } else {
            items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        const limited = items.slice(0, pageSize);
        return { items: limited, hasMore: items.length > pageSize };
    } catch (error) {
        console.error('Feed fetch error:', error);
        return { items: [], hasMore: false };
    }
}

/**
 * Fetch suggested users (exclude current user, limit 5).
 */
export async function getSuggestedUsers(currentUserId?: string | null, limit = 5) {
    try {
        let query = supabase
            .from('users')
            .select('id, name, username, avatar, role')
            .eq('is_profile_complete', true)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (currentUserId) {
            query = query.neq('id', currentUserId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return (data as unknown as UserRow[]) || [];
    } catch (error) {
        console.error('Suggested users error:', error);
        return [];
    }
}

/**
 * Fetch trending tags from recent projects + articles.
 */
export async function getTrendingTags(limit = 5) {
    try {
        const { data: projects } = await supabase
            .from('projects')
            .select('tags')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(50);

        const { data: articles } = await supabase
            .from('articles')
            .select('tags')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(50);

        const tagCount: Record<string, number> = {};
        const allItems = [...((projects as unknown as TagRow[]) || []), ...((articles as unknown as TagRow[]) || [])];
        for (const item of allItems) {
            for (const tag of (item.tags || [])) {
                tagCount[tag] = (tagCount[tag] || 0) + 1;
            }
        }

        return Object.entries(tagCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([tag, count]) => ({ tag, count }));
    } catch (error) {
        console.error('Trending tags error:', error);
        return [];
    }
}

// ─── Internal helpers ───

async function fetchProjects(tab: FeedTab, userId?: string | null, pageSize = 20, offset = 0): Promise<FeedItem[]> {
    let query = supabase
        .from('projects')
        .select('id, slug, title, description, image, tags, category, likes, views, author_id, created_at, artist_username')
        .eq('status', 'published');

    if (tab === 'following' && userId) {
        const followingIds = await getFollowingIds(userId);
        if (followingIds.length === 0) return [];
        query = query.in('author_id', followingIds);
    }

    if (tab === 'trending') {
        query = query.order('likes', { ascending: false });
    } else {
        query = query.order('created_at', { ascending: false });
    }

    query = query.range(offset, offset + pageSize - 1);

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data as unknown as ProjectRow[]) || [];
    const authorIds = [...new Set(rows.map(p => p.author_id))];
    const authors = await fetchUsers(authorIds);

    return rows.map(p => ({
        id: p.id,
        type: 'project' as const,
        slug: p.slug,
        title: p.title,
        content: p.description,
        image: p.image,
        tags: p.tags || [],
        category: p.category,
        likes: p.likes || 0,
        views: p.views || 0,
        commentsCount: 0,
        createdAt: p.created_at,
        author: authors[p.author_id] || { id: p.author_id, name: p.artist_username || 'Usuario', username: p.artist_username, avatar: null, role: null },
    }));
}

async function fetchArticles(tab: FeedTab, userId?: string | null, pageSize = 20, offset = 0): Promise<FeedItem[]> {
    let query = supabase
        .from('articles')
        .select('id, slug, title, excerpt, image, tags, category, likes, views, comments_count, author_id, author, author_avatar, created_at')
        .eq('status', 'published');

    if (tab === 'following' && userId) {
        const followingIds = await getFollowingIds(userId);
        if (followingIds.length === 0) return [];
        query = query.in('author_id', followingIds);
    }

    if (tab === 'trending') {
        query = query.order('likes', { ascending: false });
    } else {
        query = query.order('created_at', { ascending: false });
    }

    query = query.range(offset, offset + pageSize - 1);

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data as unknown as ArticleRow[]) || [];
    const authorIds = [...new Set(rows.map(a => a.author_id))];
    const authors = await fetchUsers(authorIds);

    return rows.map(a => ({
        id: a.id,
        type: 'article' as const,
        slug: a.slug,
        title: a.title,
        content: a.excerpt,
        image: a.image,
        tags: a.tags || [],
        category: a.category,
        likes: a.likes || 0,
        views: a.views || 0,
        commentsCount: a.comments_count || 0,
        createdAt: a.created_at,
        author: authors[a.author_id] || { id: a.author_id, name: a.author || 'Usuario', username: null, avatar: a.author_avatar, role: null },
    }));
}

async function fetchUsers(ids: string[]): Promise<Record<string, FeedItem['author']>> {
    if (ids.length === 0) return {};
    const { data, error } = await supabase
        .from('users')
        .select('id, name, username, avatar, role')
        .in('id', ids);

    if (error) return {};

    const rows = (data as unknown as UserRow[]) || [];
    const map: Record<string, FeedItem['author']> = {};
    for (const u of rows) {
        map[u.id] = { id: u.id, name: u.name, username: u.username, avatar: u.avatar, role: u.role };
    }
    return map;
}

let _followingCache: { ids: string[]; ts: number; userId: string } | null = null;

async function getFollowingIds(userId: string): Promise<string[]> {
    if (_followingCache && _followingCache.userId === userId && Date.now() - _followingCache.ts < 60000) {
        return _followingCache.ids;
    }

    const { data, error } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', userId);

    if (error) return [];
    const rows = (data as unknown as FollowerRow[]) || [];
    const ids = rows.map(f => f.following_id);
    _followingCache = { ids, ts: Date.now(), userId };
    return ids;
}
