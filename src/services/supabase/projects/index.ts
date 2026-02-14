/**
 * Projects Service Index (Supabase)
 * 
 * Barrel export para todos los módulos de proyectos.
 * 
 * @module services/supabase/projects
 */

export { projectsCrud } from './crud';
export { projectsComments, type ProjectComment } from './comments';
export { projectsLikes } from './likes';

// Combined service for backward compatibility
import { projectsCrud } from './crud';
import { projectsComments, ProjectComment } from './comments';
import { projectsLikes } from './likes';

export const projectsService = {
    ...projectsCrud,
    ...projectsComments,
    ...projectsLikes,

    // Aliases for backward compatibility with hooks
    getProjectBySlug: projectsCrud.getProject,
    
    listenToComments: (projectId: string, callback: (comments: ProjectComment[]) => void) => 
        projectsComments.subscribeToProjectComments(projectId, callback),
    
    addComment: projectsComments.addProjectComment,
    
    deleteComment: projectsComments.deleteProjectComment,
    
    getProjectLikeStatus: projectsLikes.hasUserLiked,
    
    toggleProjectLike: async (projectId: string, userId: string): Promise<boolean> => {
        return projectsLikes.toggleLike(projectId, userId);
    }
};
