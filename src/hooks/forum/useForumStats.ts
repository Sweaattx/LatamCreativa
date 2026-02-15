/**
 * Forum Stats Hooks
 * 
 * Hooks for forum statistics and recent threads.
 * 
 * @module hooks/forum/useForumStats
 */

import { useState, useEffect } from 'react';
import { ForumThread } from '../../types/forum';
import { forumService, forumModeration } from '../../services/supabase/forum';

/**
 * Hook para obtener estadísticas del foro.
 */
export function useForumStats() {
    const [stats, setStats] = useState({
        totalThreads: 0,
        totalReplies: 0,
        totalUsers: 0,
        activeToday: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        forumModeration.getForumStats()
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return { stats, loading };
}

/**
 * Hook para obtener hilos recientes (para widgets/sidebar).
 */
export function useRecentThreads(limitCount = 5) {
    const [threads, setThreads] = useState<ForumThread[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        forumService.getRecentThreads(limitCount)
            .then(setThreads)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [limitCount]);

    return { threads, loading };
}
