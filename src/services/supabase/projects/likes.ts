/**
 * Operaciones de Likes de Proyectos (Supabase)
 * 
 * @module services/supabase/projects/likes
 */
import { supabase } from '../../../lib/supabase';
import { logger } from '../../../utils/logger';

export const projectsLikes = {
    /**
     * Da like a un proyecto.
     * 
     * @param projectId - ID del proyecto
     * @param userId - ID del usuario
     */
    likeProject: async (projectId: string, userId: string): Promise<void> => {
        try {
            // Check if already liked
            const { data: existing } = await supabase
                .from('likes')
                .select('id')
                .eq('user_id', userId)
                .eq('target_id', projectId)
                .eq('target_type', 'project')
                .maybeSingle();

            if (existing) return; // Already liked

            // Insert like
            const { error: insertError } = await supabase
                .from('likes')
                .insert({
                    user_id: userId,
                    target_id: projectId,
                    target_type: 'project',
                    created_at: new Date().toISOString()
                } as never);

            if (insertError) throw insertError;

            // Increment project likes count
            await supabase.rpc('increment_project_likes', { project_id: projectId, amount: 1 } as never);

        } catch (error) {
            logger.error('Error liking project:', error);
            throw error;
        }
    },

    /**
     * Quita like de un proyecto.
     * 
     * @param projectId - ID del proyecto
     * @param userId - ID del usuario
     */
    unlikeProject: async (projectId: string, userId: string): Promise<void> => {
        try {
            const { error } = await supabase
                .from('likes')
                .delete()
                .eq('user_id', userId)
                .eq('target_id', projectId)
                .eq('target_type', 'project');

            if (error) throw error;

            // Decrement project likes count
            await supabase.rpc('increment_project_likes', { project_id: projectId, amount: -1 } as never);

        } catch (error) {
            logger.error('Error unliking project:', error);
            throw error;
        }
    },

    /**
     * Toggle like de un proyecto.
     * 
     * @param projectId - ID del proyecto
     * @param userId - ID del usuario
     * @returns true si ahora tiene like, false si se quitó
     */
    toggleLike: async (projectId: string, userId: string): Promise<boolean> => {
        const hasLike = await projectsLikes.hasUserLiked(projectId, userId);

        if (hasLike) {
            await projectsLikes.unlikeProject(projectId, userId);
            return false;
        } else {
            await projectsLikes.likeProject(projectId, userId);
            return true;
        }
    },

    /**
     * Verifica si un usuario ha dado like a un proyecto.
     * 
     * @param projectId - ID del proyecto
     * @param userId - ID del usuario
     * @returns true si tiene like
     */
    hasUserLiked: async (projectId: string, userId: string): Promise<boolean> => {
        try {
            const { data, error } = await supabase
                .from('likes')
                .select('id')
                .eq('user_id', userId)
                .eq('target_id', projectId)
                .eq('target_type', 'project')
                .maybeSingle();

            if (error) throw error;
            return data !== null;
        } catch (error) {
            logger.error('Error checking like status:', error);
            return false;
        }
    },

    /**
     * Obtiene el conteo de likes de un proyecto.
     * 
     * @param projectId - ID del proyecto
     * @returns Número de likes
     */
    getLikeCount: async (projectId: string): Promise<number> => {
        try {
            const { count, error } = await supabase
                .from('likes')
                .select('id', { count: 'exact', head: true })
                .eq('target_id', projectId)
                .eq('target_type', 'project');

            if (error) throw error;
            return count || 0;
        } catch (error) {
            logger.error('Error getting like count:', error);
            return 0;
        }
    },

    /**
     * Obtiene todos los proyectos que un usuario ha dado like.
     * 
     * @param userId - ID del usuario
     * @returns Array de IDs de proyectos
     */
    getUserLikedProjects: async (userId: string): Promise<string[]> => {
        try {
            const { data, error } = await supabase
                .from('likes')
                .select('target_id')
                .eq('user_id', userId)
                .eq('target_type', 'project');

            if (error) throw error;
            return ((data || []) as unknown as { target_id: string }[]).map(l => l.target_id);
        } catch (error) {
            logger.error('Error getting user liked projects:', error);
            return [];
        }
    }
};
