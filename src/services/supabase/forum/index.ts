/**
 * Forum Service Index (Supabase)
 * 
 * @module services/supabase/forum
 */

export { forumThreadsCrud } from './threads';
export { forumReplies } from './replies';
export { forumModeration } from './moderation';

import { forumThreadsCrud } from './threads';
import { forumReplies } from './replies';
import { forumModeration } from './moderation';

export const forumService = {
    ...forumThreadsCrud,
    ...forumReplies,
    ...forumModeration
};
