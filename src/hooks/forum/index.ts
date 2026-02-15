/**
 * Forum Hooks — Barrel Re-exports
 * 
 * Re-exports all forum hooks from their individual modules for
 * backward-compatible imports: `import { useForumThreads } from '@/hooks/forum'`
 * 
 * @module hooks/forum
 */

// Thread hooks
export {
    useForumThreads,
    useForumThread,
    useCreateThread,
    useUpdateThread,
    useDeleteThread,
    useUserThreads
} from './useForumThreads';

// Reply hooks
export {
    useForumReplies,
    useAddReply,
    useReplyActions
} from './useForumReplies';

// Like hooks
export {
    useThreadLike,
    useReplyLike
} from './useForumLikes';

// Moderation hooks
export {
    useThreadModeration,
    useReportContent
} from './useForumModeration';

// Stats hooks
export {
    useForumStats,
    useRecentThreads
} from './useForumStats';
