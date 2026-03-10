import { supabase } from '../../lib/supabase';

export interface Notification {
    id: string;
    userId: string;
    type: 'like' | 'comment' | 'follow' | 'mention' | 'system';
    title: string;
    body: string;
    link: string | null;
    read: boolean;
    actorName: string | null;
    actorAvatar: string | null;
    createdAt: string;
}

export const notificationsService = {
    async getAll(userId: string, limit = 30): Promise<Notification[]> {
        const { data, error } = await (supabase as any)
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error) throw error;
        return (data || []).map((n: Record<string, unknown>) => ({
            id: n.id as string,
            userId: n.user_id as string,
            type: n.type as Notification['type'],
            title: n.title as string,
            body: n.body as string,
            link: n.link as string | null,
            read: n.read as boolean,
            actorName: n.actor_name as string | null,
            actorAvatar: n.actor_avatar as string | null,
            createdAt: n.created_at as string,
        }));
    },

    async getUnreadCount(userId: string): Promise<number> {
        const { count, error } = await (supabase as any)
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('read', false);
        if (error) return 0;
        return count || 0;
    },

    async markAsRead(notificationId: string) {
        await (supabase as any).from('notifications').update({ read: true }).eq('id', notificationId);
    },

    async markAllAsRead(userId: string) {
        await (supabase as any).from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
    },

    subscribeToNew(userId: string, onNew: (notification: Notification) => void) {
        const channel = (supabase as any)
            .channel(`notifications:${userId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`,
            }, (payload: { new: Record<string, unknown> }) => {
                const n = payload.new;
                onNew({
                    id: n.id as string,
                    userId: n.user_id as string,
                    type: n.type as Notification['type'],
                    title: n.title as string,
                    body: n.body as string,
                    link: n.link as string | null,
                    read: false,
                    actorName: n.actor_name as string | null,
                    actorAvatar: n.actor_avatar as string | null,
                    createdAt: n.created_at as string,
                });
            })
            .subscribe();
        return () => { (supabase as any).removeChannel(channel); };
    },

    async createNotification(
        userId: string,
        data: {
            type: string;
            user_name?: string | null;
            avatar?: string | null;
            content?: string;
            link?: string | null;
            read?: boolean;
            category?: string | null;
        }
    ) {
        await (supabase as any).from('notifications').insert({
            user_id: userId,
            type: data.type || 'system',
            title: data.type === 'follow' ? 'Nuevo seguidor' : 'Nuevo contenido',
            body: data.content || '',
            link: data.link || null,
            read: data.read ?? false,
            actor_name: data.user_name || null,
            actor_avatar: data.avatar || null,
        });
    },
};
