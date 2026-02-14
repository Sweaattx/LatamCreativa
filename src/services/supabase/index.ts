/**
 * API Service (Supabase)
 * 
 * Aggregated API Service - Combina todos los servicios en un punto de acceso único.
 * 
 * @module services/supabase/api
 */
import { projectsService } from './projects';
import { articlesService } from './articles';
import { usersService } from './users';
import { notificationsService } from './notifications';
import { collectionsService } from './collections';
import { forumService } from './forum';

// Re-export shared types
export type { PaginatedResult } from './utils';

// Aggregated API Service
export const api = {
    // Projects (Portfolio)
    ...projectsService,

    // Blog (Articles & Comments)
    ...articlesService,

    // Users (Profiles & Social)
    ...usersService,

    // Notifications
    ...notificationsService,

    // Collections
    ...collectionsService,

    // Forum
    ...forumService
};

// Named exports for direct imports
export { projectsService } from './projects';
export { articlesService } from './articles';
export { usersService } from './users';
export { notificationsService } from './notifications';
export { collectionsService } from './collections';
export { forumService } from './forum';
export { storageService } from './storage';
