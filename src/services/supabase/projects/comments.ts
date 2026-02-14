/**
 * Operaciones de Comentarios de Proyectos (Supabase)
 * 
 * @module services/supabase/projects/comments
 */
import { supabase } from '../../../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface DbComment {
    id: string;
    content: string;
    author_id: string;
    author_name: string;
    author_avatar: string | null;
    target_id: string;
    target_type: string;
    parent_id: string | null;
    likes: number;
    created_at: string;
    updated_at: string;
}

export interface ProjectComment {
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    projectId: string;
    parentId?: string;
    likes: number;
    createdAt: string;
    updatedAt: string;
}

export const projectsComments = {
    /**
     * Obtiene comentarios de un proyecto.
     * 
     * @param projectId - ID del proyecto
     * @returns Array de comentarios
     */
    getProjectComments: async (projectId: string): Promise<ProjectComment[]> => {
        try {
            const { data, error } = await supabase
                .from('comments')
                .select('*')
                .eq('target_id', projectId)
                .eq('target_type', 'project')
                .order('created_at', { ascending: true });

            if (error) throw error;

            return ((data || []) as unknown as DbComment[]).map(c => ({
                id: c.id,
                content: c.content,
                authorId: c.author_id,
                authorName: c.author_name,
                authorAvatar: c.author_avatar ?? undefined,
                projectId: c.target_id,
                parentId: c.parent_id ?? undefined,
                likes: c.likes,
                createdAt: c.created_at,
                updatedAt: c.updated_at
            }));
        } catch (error) {
            console.error('Error fetching project comments:', error);
            return [];
        }
    },

    /**
     * Añade un comentario a un proyecto.
     * 
     * @param projectId - ID del proyecto
     * @param comment - Datos del comentario
     * @returns ID del comentario creado
     */
    addProjectComment: async (
        projectId: string,
        comment: {
            content: string;
            authorId: string;
            authorName: string;
            authorAvatar?: string;
            parentId?: string;
        }
    ): Promise<string> => {
        try {
            const { data, error } = await supabase
                .from('comments')
                .insert({
                    content: comment.content,
                    author_id: comment.authorId,
                    author_name: comment.authorName,
                    author_avatar: comment.authorAvatar || null,
                    target_type: 'project',
                    target_id: projectId,
                    parent_id: comment.parentId || null,
                    likes: 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                } as never)
                .select('id')
                .single();

            if (error) throw error;
            return (data as unknown as { id: string })?.id || '';
        } catch (error) {
            console.error('Error adding project comment:', error);
            throw error;
        }
    },

    /**
     * Elimina un comentario de un proyecto.
     * 
     * @param commentId - ID del comentario
     */
    deleteProjectComment: async (commentId: string): Promise<void> => {
        try {
            // Also delete child comments (replies)
            await supabase.from('comments').delete().eq('parent_id', commentId);
            
            const { error } = await supabase
                .from('comments')
                .delete()
                .eq('id', commentId);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting project comment:', error);
            throw error;
        }
    },

    /**
     * Listener en tiempo real para comentarios de un proyecto.
     * 
     * @param projectId - ID del proyecto
     * @param callback - Función que recibe los comentarios actualizados
     * @returns Función para cancelar la suscripción
     */
    subscribeToProjectComments: (
        projectId: string,
        callback: (comments: ProjectComment[]) => void
    ): (() => void) => {
        // Initial fetch
        projectsComments.getProjectComments(projectId).then(callback);

        // Setup realtime subscription
        const channel: RealtimeChannel = supabase
            .channel(`project-comments-${projectId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'comments',
                    filter: `target_id=eq.${projectId}`
                },
                () => {
                    // Refetch all comments on any change
                    projectsComments.getProjectComments(projectId).then(callback);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }
};
