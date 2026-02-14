// ==============================================
// SUPABASE API
// ==============================================
import { projectsService } from './supabase/projects';
import { articlesService } from './supabase/articles';
import { usersService } from './supabase/users';
import { notificationsService } from './supabase/notifications';
import { collectionsService } from './supabase/collections';
import { forumService } from './supabase/forum';

// Re-export shared types for backward compatibility
export type { PaginatedResult } from './supabase/utils';

// Aggregated API Service
// This acts as a facade, combining domain-specific services into a single access point.
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
