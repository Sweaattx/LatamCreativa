/**
 * Servicio de Notificaciones (Supabase)
 * 
 * @module services/supabase/notifications
 */
import { supabase } from '../../lib/supabase';
import { Notification } from '../../types';
import { RealtimeChannel } from '@supabase/supabase-js';

interface DbNotification {
    id: string;
    user_id: string;
    type: string;
    user_name: string;
    avatar: string | null;
    content: string;
    category: string | null;
    link: string | null;
    read: boolean;
    created_at: string;
}

const mapDbNotificationToNotification = (n: DbNotification): Notification => ({
    id: n.id,
    type: n.type as Notification['type'],
    user: n.user_name,
    avatar: n.avatar || '',
    content: n.content,
    category: n.category || undefined,
    link: n.link || undefined,
    time: n.created_at,
    read: n.read
});

export const notificationsService = {
    /**
     * Crea una notificación para un usuario.
     */
    createNotification: async (
        userId: string,
        notification: {
            type: string;
            user_name: string;
            avatar?: string | null;
            content: string;
            category?: string | null;
            link?: string | null;
            read?: boolean;
        }
    ): Promise<void> => {
        try {
            const { error } = await supabase
                .from('notifications')
                .insert({
                    user_id: userId,
                    type: notification.type,
                    user_name: notification.user_name,
                    avatar: notification.avatar || null,
                    content: notification.content,
                    category: notification.category || null,
                    link: notification.link || null,
                    read: notification.read ?? false,
                    created_at: new Date().toISOString()
                } as never);

            if (error) throw error;
        } catch (error) {
            console.error("Error creating notification:", error);
        }
    },

    /**
     * Obtiene notificaciones de un usuario.
     */
    getUserNotifications: async (userId: string, limit = 20): Promise<Notification[]> => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return (data || []).map(mapDbNotificationToNotification);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            return [];
        }
    },

    /**
     * Suscripción en tiempo real a notificaciones.
     */
    subscribeToNotifications: (
        userId: string,
        callback: (notifications: Notification[]) => void
    ): (() => void) => {
        // Initial fetch
        notificationsService.getUserNotifications(userId).then(callback);

        // Realtime subscription
        const channel: RealtimeChannel = supabase
            .channel(`notifications-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                () => {
                    notificationsService.getUserNotifications(userId).then(callback);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },

    /**
     * Marca una notificación como leída.
     */
    markNotificationRead: async (userId: string, notificationId: string): Promise<void> => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true } as never)
                .eq('id', notificationId)
                .eq('user_id', userId);

            if (error) throw error;
        } catch (error) {
            console.error("Error marking notification read:", error);
        }
    },

    /**
     * Marca todas las notificaciones como leídas.
     */
    markAllNotificationsRead: async (userId: string): Promise<void> => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true } as never)
                .eq('user_id', userId)
                .eq('read', false);

            if (error) throw error;
        } catch (error) {
            console.error("Error marking all notifications read:", error);
        }
    },

    /**
     * Elimina una notificación.
     */
    deleteNotification: async (userId: string, notificationId: string): Promise<void> => {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId)
                .eq('user_id', userId);

            if (error) throw error;
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    },

    /**
     * Elimina todas las notificaciones de un usuario.
     */
    deleteAllNotifications: async (userId: string): Promise<void> => {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('user_id', userId);

            if (error) throw error;
        } catch (error) {
            console.error("Error deleting all notifications:", error);
        }
    },

    /**
     * Obtiene el conteo de notificaciones no leídas.
     */
    getUnreadCount: async (userId: string): Promise<number> => {
        try {
            const { count, error } = await supabase
                .from('notifications')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('read', false);

            if (error) throw error;
            return count || 0;
        } catch (error) {
            console.error("Error getting unread count:", error);
            return 0;
        }
    }
};
