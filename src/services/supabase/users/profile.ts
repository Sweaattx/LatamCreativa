/**
 * Operaciones de Perfil de Usuario (Supabase)
 * 
 * Módulo que maneja las operaciones CRUD para perfiles de usuario.
 * 
 * @module services/supabase/users/profile
 */
import { supabase } from '../../../lib/supabase';
import { User } from '../../../types';
import { mapDbUserToUser, mapUserToDbUser, sanitizeData } from '../utils';
import { RealtimeChannel } from '@supabase/supabase-js';

export type UserProfile = User | null;

export const usersProfile = {
    /**
     * Obtiene perfil de usuario por ID.
     * 
     * @param userId - ID del usuario
     * @returns Perfil del usuario o null si no existe
     */
    getUserProfile: async (userId: string): Promise<UserProfile> => {
        try {
            if (!userId) return null;

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // No rows returned
                throw error;
            }

            return data ? mapDbUserToUser(data) as unknown as User : null;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw error;
        }
    },

    /**
     * Actualiza el perfil de un usuario.
     * 
     * @param userId - ID del usuario
     * @param data - Datos parciales a actualizar
     */
    updateUserProfile: async (userId: string, data: Partial<User>): Promise<void> => {
        try {
            const sanitized = sanitizeData(data);
            const dbData = mapUserToDbUser(sanitized);

            // Add updated_at timestamp
            (dbData as Record<string, unknown>).updated_at = new Date().toISOString();

            const { error } = await supabase
                .from('users')
                .update(dbData as never)
                .eq('id', userId);

            if (error) throw error;
        } catch (error) {
            console.error("Error updating user profile:", error);
            throw error;
        }
    },

    /**
     * Asegura que un perfil de usuario existe en la base de datos.
     * 
     * Si no existe, crea uno nuevo con valores por defecto.
     * Ideal para Google Auth o inicialización desde App.tsx.
     * 
     * @param user - Objeto de usuario de Supabase Auth
     * @param additionalData - Datos adicionales para el perfil
     * @returns Perfil existente o recién creado
     */
    initializeUserProfile: async (
        user: { id: string; email?: string | null; user_metadata?: { full_name?: string; avatar_url?: string; firstName?: string; lastName?: string } },
        additionalData: Partial<User> = {}
    ): Promise<UserProfile> => {
        try {
            // Check if user exists
            const { data: existingUser, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (existingUser) {
                return mapDbUserToUser(existingUser) as unknown as User;
            }

            // Handle "no rows" error - user doesn't exist, create them
            if (fetchError && fetchError.code !== 'PGRST116') {
                throw fetchError;
            }

            // Create new user
            const displayName = additionalData.name ||
                user.user_metadata?.full_name ||
                `${user.user_metadata?.firstName || ''} ${user.user_metadata?.lastName || ''}`.trim() ||
                'Usuario';

            const avatarUrl = additionalData.avatar ||
                user.user_metadata?.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`;

            const newUser = {
                id: user.id,
                email: user.email || '',
                name: displayName,
                first_name: additionalData.firstName || user.user_metadata?.firstName || '',
                last_name: additionalData.lastName || user.user_metadata?.lastName || '',
                avatar: avatarUrl,
                role: 'Creative Member',
                location: 'Latam',
                is_profile_complete: false,
                is_admin: false,
                available_for_work: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                stats: { views: 0, likes: 0, followers: 0, following: 0 }
            };

            const { data: insertedUser, error: insertError } = await supabase
                .from('users')
                .insert(newUser as never)
                .select()
                .single();

            if (insertError) throw insertError;

            return insertedUser ? mapDbUserToUser(insertedUser) as unknown as User : null;
        } catch (error) {
            console.error("Error initializing user profile:", error);
            throw error;
        }
    },

    /**
     * Obtiene perfil de usuario por username.
     * 
     * @param username - Username a buscar
     * @returns Perfil o null si no existe
     */
    getUserProfileByUsername: async (username: string): Promise<UserProfile> => {
        try {
            if (!username) return null;

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                throw error;
            }

            return data ? mapDbUserToUser(data) as unknown as User : null;
        } catch (error) {
            console.error('Error fetching user profile by username:', error);
            return null;
        }
    },

    /**
     * Verifica si un username está disponible.
     * 
     * @param username - Username a verificar
     * @returns true si está disponible, false si ya existe
     */
    checkUsernameAvailability: async (username: string): Promise<boolean> => {
        try {
            if (!username) return false;

            const { data, error } = await supabase
                .from('users')
                .select('id')
                .eq('username', username)
                .maybeSingle();

            if (error) throw error;
            return data === null;
        } catch (error) {
            console.error("Error checking username availability:", error);
            return false;
        }
    },

    /**
     * Listener en tiempo real para perfil de usuario por ID.
     * 
     * @param userId - ID del usuario
     * @param callback - Función que recibe el perfil actualizado
     * @returns Función para cancelar la suscripción
     */
    listenToUserProfile: (userId: string, callback: (user: UserProfile) => void): (() => void) => {
        if (!userId) return () => { };

        // Initial fetch
        usersProfile.getUserProfile(userId).then(callback);

        // Setup realtime subscription
        const channel: RealtimeChannel = supabase
            .channel(`user-profile-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'users',
                    filter: `id=eq.${userId}`
                },
                (payload) => {
                    if (payload.eventType === 'DELETE') {
                        callback(null);
                    } else if (payload.new) {
                        callback(mapDbUserToUser(payload.new as Record<string, unknown>) as unknown as User);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },

    /**
     * Listener en tiempo real para perfil de usuario por username.
     * 
     * @param username - Username del usuario
     * @param callback - Función que recibe el perfil actualizado
     * @returns Función para cancelar la suscripción
     */
    listenToUserProfileByUsername: (username: string, callback: (user: UserProfile) => void): (() => void) => {
        if (!username) return () => { };

        // Initial fetch
        usersProfile.getUserProfileByUsername(username).then(callback);

        // Setup realtime subscription
        const channel: RealtimeChannel = supabase
            .channel(`user-username-${username}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'users',
                    filter: `username=eq.${username}`
                },
                (payload) => {
                    if (payload.eventType === 'DELETE') {
                        callback(null);
                    } else if (payload.new) {
                        callback(mapDbUserToUser(payload.new as Record<string, unknown>) as unknown as User);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },

    /**
     * Obtiene perfil de usuario por nombre.
     * 
     * @param name - Nombre del usuario
     * @returns Perfil o null si no existe
     */
    getUserProfileByName: async (name: string): Promise<UserProfile> => {
        try {
            if (!name || name === 'Unknown User') return null;

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('name', name)
                .limit(1)
                .maybeSingle();

            if (error) throw error;
            return data ? mapDbUserToUser(data) as unknown as User : null;
        } catch (error) {
            console.error('Error fetching user profile by name:', error);
            return null;
        }
    },

    /**
     * Obtiene todos los usuarios.
     * 
     * @returns Array de todos los usuarios
     */
    getAllUsers: async (): Promise<User[]> => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return (data || []).map(u => mapDbUserToUser(u) as unknown as User);
        } catch (error) {
            console.error("Error fetching all users:", error);
            throw error;
        }
    },

    /**
     * Busca usuarios por query.
     * 
     * @param query - Término de búsqueda
     * @param limit - Límite de resultados
     * @returns Array de usuarios que coinciden
     */
    searchUsers: async (query: string, limit = 10): Promise<User[]> => {
        try {
            if (!query) return [];

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .or(`name.ilike.%${query}%,username.ilike.%${query}%,email.ilike.%${query}%`)
                .limit(limit);

            if (error) throw error;
            return (data || []).map(u => mapDbUserToUser(u) as unknown as User);
        } catch (error) {
            console.error("Error searching users:", error);
            return [];
        }
    }
};
