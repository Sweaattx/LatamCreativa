// Content Types - Portfolio, Articles, Blog

export interface PortfolioItem {
    id: string;
    /** URL-friendly identifier */
    slug?: string;
    title: string;
    /** Artist display name (legacy, use authorId for lookups) */
    artist?: string;
    /** Primary owner identifier */
    authorId: string;
    artistAvatar?: string;
    artistHeadline?: string;
    artistRole?: string;
    artistUsername?: string;
    location?: string;
    image: string;
    views: string | number;
    likes: string | number;
    category: string;
    isExclusive?: boolean;
    isPrivate?: boolean;
    description?: string;
    images?: string[];
    gallery?: {
        url: string;
        caption: string;
        type?: 'image' | 'video' | 'youtube' | 'sketchfab';
    }[];
    /** Software/tools used in the project */
    software?: string[];
    /** Tags for categorization and search */
    tags?: string[];
    /** Tools used (alias for software) */
    tools?: string[];
    domain?: 'creative' | 'dev';
    createdAt?: string;
    updatedAt?: string;
    /** Project publication status */
    status?: 'draft' | 'published' | 'scheduled';
    /** ISO date string for scheduled publication */
    scheduledAt?: string;
    /** Whether author is available for work */
    availableForWork?: boolean;
}

export interface ArticleItem {
    id: string;
    /** URL-friendly identifier */
    slug?: string;
    title: string;
    excerpt: string;
    image: string;
    author: string;
    authorId: string;
    authorAvatar: string;
    date: string;
    readTime: string;
    category: string;
    likes: number;
    comments: number;
    isExclusive?: boolean;
    content?: string;
    domain?: 'creative' | 'dev';
    role?: string;
    tags?: string[];
    /** Article publication status */
    status?: 'draft' | 'published' | 'scheduled' | 'rejected';
    /** ISO date string for scheduled publication */
    scheduledAt?: string;
    /** View count */
    views?: number;

    // ============================================
    // AUTOMATION FIELDS (n8n Integration)
    // ============================================
    /** Content source: 'manual' for user-created, 'n8n' for automated */
    source?: 'manual' | 'n8n';
    /** Secret token for secure preview access (drafts only) */
    previewToken?: string;
    /** Original source URL (for automated/curated content) */
    originalLink?: string;
    /** ISO date when article was published */
    publishedAt?: string;
}

export interface BlogComment {
    id: string;
    author: string;
    authorId?: string;
    avatar: string;
    content: string;
    date: string;
    timeAgo: string;
    likes: number;
    parentId?: string;
    replies?: BlogComment[];
}

export interface VideoSuggestion {
    id: string;
    title: string;
    channel: string;
    views: string;
    timeAgo: string;
    duration: string;
    thumbnail: string;
}

export interface VideoPageData {
    title: string;
    channelName: string;
    channelAvatar: string;
    subscribers: string;
    views: string;
    timeAgo: string;
    description: string;
    thumbnail: string;
    videoUrl?: string;
    likes: string;
    isLiked?: boolean;
}
