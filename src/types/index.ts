// Types Index - Re-exports all types for backward compatibility
// This allows existing imports from '../types' to continue working

// Core type aliases
export type ItemType = 'project' | 'article' | 'portfolio' | 'collection';
export type CreateMode = 'none' | ItemType;

// Navigation Types
export * from './navigation';

// Content Types (Portfolio, Articles, Blog)
export * from './content';

// Commerce Types (Courses, Assets, Services, Sales)
export * from './commerce';

// Community Types (Groups, Events, Challenges, Jobs)
// Note: Excluding legacy ForumReply and ForumPost to avoid conflicts with new forum types
export {
    type CommunityGroup,
    type EventItem,
    type ChallengeItem,
    type JobItem
} from './community';

// Forum Types (Threads, Replies, Categories) - New complete forum system
export * from './forum';

// User Types (Profile, Auth, Social, Notifications)
export * from './user';

// Common Types (Collections, etc.)
export * from './common';

