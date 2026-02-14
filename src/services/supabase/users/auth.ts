/**
 * Operaciones de Autenticación de Usuario (Supabase)
 * 
 * Módulo que maneja operaciones de cuenta: cambio de email, contraseña y eliminación.
 * 
 * @module services/users/auth
 */
import { supabase } from '../../../lib/supabase';

export const usersAuth = {
    /**
     * Actualiza el email del usuario.
     * 
     * @param newEmail - Nuevo correo electrónico
     * @throws Error si el email está en uso
     */
    updateUserEmail: async (newEmail: string): Promise<void> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('No hay usuario autenticado');
        }

        // Actualizar en Supabase Auth
        const { error: authError } = await supabase.auth.updateUser({ email: newEmail });
        if (authError) throw authError;

        // Actualizar en la tabla users
        const { error: dbError } = await supabase
            .from('users')
            .update({ email: newEmail, updated_at: new Date().toISOString() } as never)
            .eq('id', user.id);

        if (dbError) throw dbError;
    },

    /**
     * Actualiza la contraseña del usuario.
     * 
     * @param newPassword - Nueva contraseña (mínimo 8 caracteres)
     * @throws Error si la contraseña es muy débil
     */
    updateUserPassword: async (newPassword: string): Promise<void> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('No hay usuario autenticado');
        }

        if (newPassword.length < 8) {
            throw new Error('La contraseña debe tener al menos 8 caracteres');
        }

        if (!/[A-Z]/.test(newPassword)) {
            throw new Error('La contraseña debe contener al menos una mayúscula');
        }

        if (!/[0-9]/.test(newPassword)) {
            throw new Error('La contraseña debe contener al menos un número');
        }

        if (!/[^A-Za-z0-9]/.test(newPassword)) {
            throw new Error('La contraseña debe contener al menos un símbolo');
        }

        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
    },

    /**
     * Envía un email para restablecer la contraseña.
     * 
     * @param email - Correo electrónico del usuario
     */
    resetPassword: async (email: string): Promise<void> => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        });
        if (error) throw error;
    },

    /**
     * Elimina la cuenta del usuario y TODO su contenido.
     * 
     * Elimina en orden:
     * 1. Todos los proyectos del usuario (incluyendo imágenes)
     * 2. Todos los artículos del usuario (incluyendo imágenes)
     * 3. Todas las colecciones del usuario
     * 4. Carpeta completa del usuario en Storage
     * 5. Documento de usuario de la base de datos
     * 6. Usuario de Supabase Auth (via Edge Function)
     * 
     * @throws Error si falla la eliminación
     */
    deleteUserAccount: async (): Promise<void> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('No hay usuario autenticado');
        }

        const userId = user.id;

        try {
            // 1. Eliminar todos los proyectos del usuario
            const { data: projects } = await supabase
                .from('projects')
                .select('id, image, images')
                .eq('author_id', userId);

            if (projects) {
                for (const proj of projects as unknown as { id: string; image: string | null; images: string[] | null }[]) {
                    // Eliminar imágenes del proyecto en storage
                    if (proj.image) {
                        await supabase.storage.from('projects').remove([proj.image]);
                    }
                    if (proj.images) {
                        await supabase.storage.from('projects').remove(proj.images);
                    }
                }

                // Eliminar documentos de proyectos
                await supabase.from('projects').delete().eq('author_id', userId);
            }

            // 2. Eliminar todos los artículos del usuario
            const { data: articles } = await supabase
                .from('articles')
                .select('id, image')
                .eq('author_id', userId);

            if (articles) {
                for (const art of articles as unknown as { id: string; image: string | null }[]) {
                    if (art.image) {
                        await supabase.storage.from('articles').remove([art.image]);
                    }
                }
                await supabase.from('articles').delete().eq('author_id', userId);
            }

            // 3. Eliminar todas las colecciones del usuario
            // Primero eliminar los items de las colecciones
            const { data: collections } = await supabase
                .from('collections')
                .select('id')
                .eq('user_id', userId);

            if (collections) {
                for (const coll of collections as unknown as { id: string }[]) {
                    await supabase.from('collection_items').delete().eq('collection_id', coll.id);
                }
                await supabase.from('collections').delete().eq('user_id', userId);
            }

            // 4. Eliminar todas las notificaciones
            await supabase.from('notifications').delete().eq('user_id', userId);

            // 5. Eliminar todos los seguidores y seguidos
            await supabase.from('followers').delete().eq('follower_id', userId);
            await supabase.from('followers').delete().eq('following_id', userId);

            // 6. Eliminar todos los likes del usuario
            await supabase.from('likes').delete().eq('user_id', userId);

            // 7. Eliminar comentarios del usuario
            await supabase.from('comments').delete().eq('author_id', userId);

            // 8. Eliminar threads y replies del foro
            await supabase.from('forum_replies').delete().eq('author_id', userId);
            await supabase.from('forum_threads').delete().eq('author_id', userId);

            // 9. Eliminar carpeta del usuario en storage
            const { data: userFiles } = await supabase.storage.from('users').list(userId);
            if (userFiles && userFiles.length > 0) {
                const filesToDelete = userFiles.map(file => `${userId}/${file.name}`);
                await supabase.storage.from('users').remove(filesToDelete);
            }

            // 10. Eliminar documento de usuario
            await supabase.from('users').delete().eq('id', userId);

            // 11. Obtener token para llamar a Edge Function
            const { data: sessionData } = await supabase.auth.getSession();
            const accessToken = sessionData.session?.access_token;

            // 12. Llamar a Edge Function para eliminar de Auth
            if (accessToken) {
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                const response = await fetch(`${supabaseUrl}/functions/v1/delete-user`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error from Edge Function:', errorData);
                    // Continue with sign out even if Edge Function fails
                }
            }

            // 13. Cerrar sesión
            await supabase.auth.signOut();

        } catch (error) {
            console.error('Error deleting user account:', error);
            throw new Error('Error al eliminar la cuenta. Por favor contacta soporte.');
        }
    },

    /**
     * Cierra la sesión del usuario actual.
     */
    signOut: async (): Promise<void> => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    /**
     * Inicia sesión con email y contraseña.
     */
    signInWithEmail: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data;
    },

    /**
     * Registra un nuevo usuario con email y contraseña.
     */
    signUpWithEmail: async (email: string, password: string, metadata?: { firstName?: string; lastName?: string }) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
                data: metadata
            }
        });
        if (error) throw error;
        return data;
    },

    /**
     * Inicia sesión con Google OAuth.
     */
    signInWithGoogle: async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        });
        if (error) throw error;
        return data;
    },

    /**
     * Reenvía el email de confirmación.
     */
    resendConfirmationEmail: async (email: string) => {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`
            }
        });
        if (error) throw error;
    },

    /**
     * Obtiene el usuario actual.
     */
    getCurrentUser: async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    },

    /**
     * Obtiene la sesión actual.
     */
    getSession: async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
    }
};
