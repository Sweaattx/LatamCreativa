/**
 * Forum Hooks — Backward Compatibility Re-export
 * 
 * This file re-exports all forum hooks from their split modules.
 * Import from '@/hooks/forum' or '@/hooks/useForumHooks' interchangeably.
 * 
 * @deprecated Import from '@/hooks/forum' directly for better tree-shaking.
 */

export {
    useForumThreads,
    useForumThread,
    useCreateThread,
    useUpdateThread,
    useDeleteThread,
    useUserThreads,
    useForumReplies,
    useAddReply,
    useReplyActions,
    useThreadLike,
    useReplyLike,
    useThreadModeration,
    useReportContent,
    useForumStats,
    useRecentThreads
} from './forum';
