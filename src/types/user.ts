// User Types - Profile, Auth, Social

export interface ExperienceItem {
    id: number | string;
    role: string;
    company: string;
    period: string;
    location: string;
    description: string;
}

export interface EducationItem {
    id: number | string;
    degree: string;
    school: string;
    period: string;
    description: string;
}

export interface UserStats {
    views: number;
    likes: number;
    followers: number;
    following: number;
}

export interface SocialLinks {
    linkedin?: string;
    artstation?: string;
    instagram?: string;
    website?: string;
    twitter?: string;
    github?: string;
    behance?: string;
    dribbble?: string;
}

export interface NotificationPreferences {
    emailDigest?: boolean;
    newFollower?: boolean;
    comments?: boolean;
    likes?: boolean;
    projectUpdates?: boolean;
    platformNews?: boolean;
}

export interface User {
    id: string;
    uid: string;
    email: string;
    name: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    photoURL?: string;
    avatar?: string;
    coverImage?: string;
    role?: string;
    location?: string;
    country?: string;
    city?: string;
    bio?: string;
    description?: string;
    skills?: string[];
    socialLinks?: SocialLinks;
    isProfileComplete?: boolean;
    isAdmin?: boolean;
    experience?: ExperienceItem[];
    education?: EducationItem[];
    stats?: UserStats;
    createdAt?: string;
    availableForWork?: boolean;
    notificationPreferences?: NotificationPreferences;
}

export interface ArtistProfile {
    id: string;
    name: string;
    handle: string;
    username?: string;
    avatar: string;
    role: string;
    location: string;
    bio?: string;
    skills: string[];
    followers: string;
    projects: number;
    isPro?: boolean;
    availableForWork?: boolean;
    coverImage: string;
    domain?: 'creative' | 'dev';
    level?: 'Novice' | 'Pro' | 'Expert' | 'Master';
    stats?: {
        views: number;
        likes: number;
        followers: number;
        following: number;
    };
}

export interface Friend {
    id: string;
    name: string;
    avatar: string;
    status: 'online' | 'offline' | 'busy';
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount?: number;
}

export interface ChatMessage {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
}

export interface Notification {
    id: string | number;
    type: 'comment' | 'follow' | 'system' | 'like' | 'purchase';
    user: string;
    avatar: string;
    content: string;
    category?: string;
    link?: string;
    time: string;
    read: boolean;
}
