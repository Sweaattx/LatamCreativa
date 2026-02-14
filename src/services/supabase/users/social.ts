/**
 * Operaciones Sociales de Usuario (Supabase)
 * 
 * Módulo que maneja operaciones de seguimiento entre usuarios.
 * 
 * @module services/supabase/users/social
 */
import { supabase } from '../../../lib/supabase';
import { notificationsService } from '../notifications';

export const usersSocial = {
    /**
     * Sigue a un usuario.
     * 
     * @param followerId - ID del usuario que sigue
     * @param followingId - ID del usuario a seguir
     * @param followerData - Datos del seguidor para mostrar en notificaciones
     */
    followUser: async (
        followerId: string,
        followingId: string,
        followerData?: { name?: string; avatar?: string; username?: string }
    ): Promise<void> => {
        try {
            // Check if already following
            const { data: existing } = await supabase
                .from('followers')
                .select('id')
                .eq('follower_id', followerId)
                .eq('following_id', followingId)
                .maybeSingle();

            if (existing) return; // Already following

            // Insert follow relationship
            const { error } = await supabase
                .from('followers')
                .insert({
                    follower_id: followerId,
                    following_id: followingId,
                    follower_name: followerData?.name || null,
                    follower_avatar: followerData?.avatar || null,
                    follower_username: followerData?.username || null,
                    created_at: new Date().toISOString()
                } as never);

            if (error) throw error;

            // Update stats for both users
            await Promise.all([
                supabase.rpc('increment_user_stat', { user_id: followerId, stat_name: 'following', amount: 1 } as never),
                supabase.rpc('increment_user_stat', { user_id: followingId, stat_name: 'followers', amount: 1 } as never)
            ]).catch(console.warn);

            // Create notification for the followed user
            await notificationsService.createNotification(followingId, {
                type: 'follow',
                user_name: followerData?.name || 'Alguien',
                avatar: followerData?.avatar || null,
                content: 'comenzó a seguirte',
                link: followerData?.username ? `/user/${followerData.username}` : null,
                read: false
            });

        } catch (error) {
            console.error('Error following user:', error);
            throw error;
        }
    },

    /**
     * Deja de seguir a un usuario.
     * 
     * @param followerId - ID del usuario que deja de seguir
     * @param followingId - ID del usuario a dejar de seguir
     */
    unfollowUser: async (followerId: string, followingId: string): Promise<void> => {
        try {
            const { error } = await supabase
                .from('followers')
                .delete()
                .eq('follower_id', followerId)
                .eq('following_id', followingId);

            if (error) throw error;

            // Update stats for both users
            await Promise.all([
                supabase.rpc('increment_user_stat', { user_id: followerId, stat_name: 'following', amount: -1 } as never),
                supabase.rpc('increment_user_stat', { user_id: followingId, stat_name: 'followers', amount: -1 } as never)
            ]).catch(console.warn);

        } catch (error) {
            console.error('Error unfollowing user:', error);
            throw error;
        }
    },

    /**
     * Verifica si un usuario sigue a otro.
     * 
     * @param followerId - ID del posible seguidor
     * @param followingId - ID del usuario a verificar
     * @returns true si lo sigue, false si no
     */
    isFollowing: async (followerId: string, followingId: string): Promise<boolean> => {
        try {
            const { data, error } = await supabase
                .from('followers')
                .select('id')
                .eq('follower_id', followerId)
                .eq('following_id', followingId)
                .maybeSingle();

            if (error) throw error;
            return data !== null;
        } catch (error) {
            console.error('Error checking follow status:', error);
            return false;
        }
    },

    /**
     * Obtiene los seguidores de un usuario.
     * 
     * @param userId - ID del usuario
     * @returns Array de IDs de seguidores
     */
    getFollowers: async (userId: string): Promise<string[]> => {
        try {
            const { data, error } = await supabase
                .from('followers')
                .select('follower_id')
                .eq('following_id', userId);

            if (error) throw error;
            return ((data || []) as unknown as { follower_id: string }[]).map(f => f.follower_id);
        } catch (error) {
            console.error('Error getting followers:', error);
            return [];
        }
    },

    /**
     * Obtiene los usuarios que sigue un usuario.
     * 
     * @param userId - ID del usuario
     * @returns Array de IDs de usuarios seguidos
     */
    getFollowing: async (userId: string): Promise<string[]> => {
        try {
            const { data, error } = await supabase
                .from('followers')
                .select('following_id')
                .eq('follower_id', userId);

            if (error) throw error;
            return ((data || []) as unknown as { following_id: string }[]).map(f => f.following_id);
        } catch (error) {
            console.error('Error getting following:', error);
            return [];
        }
    },

    /**
     * Obtiene el conteo de seguidores y seguidos.
     * 
     * @param userId - ID del usuario
     * @returns Objeto con followers y following counts
     */
    getFollowCounts: async (userId: string): Promise<{ followers: number; following: number }> => {
        try {
            const [followersResult, followingResult] = await Promise.all([
                supabase.from('followers').select('id', { count: 'exact', head: true }).eq('following_id', userId),
                supabase.from('followers').select('id', { count: 'exact', head: true }).eq('follower_id', userId)
            ]);

            return {
                followers: followersResult.count || 0,
                following: followingResult.count || 0
            };
        } catch (error) {
            console.error('Error getting follow counts:', error);
            return { followers: 0, following: 0 };
        }
    },

    /**
     * Obtiene la lista de seguidores con perfil completo.
     * 
     * @param userId - ID del usuario
     * @param limit - Límite de resultados
     * @returns Array de perfiles de seguidores
     */
    getFollowersWithProfiles: async (userId: string, limit = 20) => {
        try {
            const { data, error } = await supabase
                .from('followers')
                .select(`
                    follower_id,
                    follower_name,
                    follower_avatar,
                    follower_username,
                    created_at,
                    follower:users!follower_id(id, name, avatar, username, role)
                `)
                .eq('following_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting followers with profiles:', error);
            return [];
        }
    },

    /**
     * Obtiene la lista de seguidos con perfil completo.
     * 
     * @param userId - ID del usuario
     * @param limit - Límite de resultados
     * @returns Array de perfiles de usuarios seguidos
     */
    getFollowingWithProfiles: async (userId: string, limit = 20) => {
        try {
            const { data, error } = await supabase
                .from('followers')
                .select(`
                    following_id,
                    created_at,
                    following:users!following_id(id, name, avatar, username, role)
                `)
                .eq('follower_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting following with profiles:', error);
            return [];
        }
    }
};
