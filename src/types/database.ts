/**
 * Supabase Database Types
 * 
 * Define los tipos para la base de datos de Supabase.
 * Estos tipos proporcionan autocompletado y type-safety para consultas.
 * 
 * @module types/database
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    name: string
                    first_name: string | null
                    last_name: string | null
                    username: string | null
                    avatar: string | null
                    cover_image: string | null
                    role: string | null
                    location: string | null
                    country: string | null
                    city: string | null
                    bio: string | null
                    skills: string[] | null
                    social_links: Json | null
                    is_profile_complete: boolean
                    is_admin: boolean
                    experience: Json | null
                    education: Json | null
                    stats: Json | null
                    available_for_work: boolean
                    notification_preferences: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    name: string
                    first_name?: string | null
                    last_name?: string | null
                    username?: string | null
                    avatar?: string | null
                    cover_image?: string | null
                    role?: string | null
                    location?: string | null
                    country?: string | null
                    city?: string | null
                    bio?: string | null
                    skills?: string[] | null
                    social_links?: Json | null
                    is_profile_complete?: boolean
                    is_admin?: boolean
                    experience?: Json | null
                    education?: Json | null
                    stats?: Json | null
                    available_for_work?: boolean
                    notification_preferences?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    name?: string
                    first_name?: string | null
                    last_name?: string | null
                    username?: string | null
                    avatar?: string | null
                    cover_image?: string | null
                    role?: string | null
                    location?: string | null
                    country?: string | null
                    city?: string | null
                    bio?: string | null
                    skills?: string[] | null
                    social_links?: Json | null
                    is_profile_complete?: boolean
                    is_admin?: boolean
                    experience?: Json | null
                    education?: Json | null
                    stats?: Json | null
                    available_for_work?: boolean
                    notification_preferences?: Json | null
                    updated_at?: string
                }
            }
            projects: {
                Row: {
                    id: string
                    slug: string
                    title: string
                    description: string | null
                    domain: string
                    author_id: string
                    image: string | null
                    images: string[] | null
                    gallery: Json | null
                    tags: string[] | null
                    category: string | null
                    tools: string[] | null
                    available_for_work: boolean
                    artist_username: string | null
                    status: string
                    scheduled_at: string | null
                    views: number
                    likes: number
                    stats: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    slug: string
                    title: string
                    description?: string | null
                    domain?: string
                    author_id: string
                    image?: string | null
                    images?: string[] | null
                    gallery?: Json | null
                    tags?: string[] | null
                    category?: string | null
                    tools?: string[] | null
                    available_for_work?: boolean
                    artist_username?: string | null
                    status?: string
                    scheduled_at?: string | null
                    views?: number
                    likes?: number
                    stats?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    slug?: string
                    title?: string
                    description?: string | null
                    domain?: string
                    author_id?: string
                    image?: string | null
                    images?: string[] | null
                    gallery?: Json | null
                    tags?: string[] | null
                    category?: string | null
                    tools?: string[] | null
                    available_for_work?: boolean
                    artist_username?: string | null
                    status?: string
                    scheduled_at?: string | null
                    views?: number
                    likes?: number
                    stats?: Json | null
                    updated_at?: string
                }
            }
            articles: {
                Row: {
                    id: string
                    slug: string
                    title: string
                    content: string
                    excerpt: string | null
                    image: string | null
                    category: string | null
                    tags: string[] | null
                    author_id: string
                    author: string | null
                    author_avatar: string | null
                    status: string
                    scheduled_at: string | null
                    views: number
                    likes: number
                    comments_count: number
                    date: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    slug: string
                    title: string
                    content: string
                    excerpt?: string | null
                    image?: string | null
                    category?: string | null
                    tags?: string[] | null
                    author_id: string
                    author?: string | null
                    author_avatar?: string | null
                    status?: string
                    scheduled_at?: string | null
                    views?: number
                    likes?: number
                    comments_count?: number
                    date?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    slug?: string
                    title?: string
                    content?: string
                    excerpt?: string | null
                    image?: string | null
                    category?: string | null
                    tags?: string[] | null
                    author_id?: string
                    author?: string | null
                    author_avatar?: string | null
                    status?: string
                    scheduled_at?: string | null
                    views?: number
                    likes?: number
                    comments_count?: number
                    updated_at?: string
                }
            }
            comments: {
                Row: {
                    id: string
                    content: string
                    author_id: string
                    author_name: string
                    author_avatar: string | null
                    target_type: 'article' | 'project'
                    target_id: string
                    parent_id: string | null
                    likes: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    content: string
                    author_id: string
                    author_name: string
                    author_avatar?: string | null
                    target_type: 'article' | 'project'
                    target_id: string
                    parent_id?: string | null
                    likes?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    content?: string
                    likes?: number
                    updated_at?: string
                }
            }
            likes: {
                Row: {
                    id: string
                    user_id: string
                    target_type: 'article' | 'project' | 'comment' | 'forum_thread' | 'forum_reply'
                    target_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    target_type: 'article' | 'project' | 'comment' | 'forum_thread' | 'forum_reply'
                    target_id: string
                    created_at?: string
                }
                Update: never
            }
            followers: {
                Row: {
                    id: string
                    follower_id: string
                    following_id: string
                    follower_name: string | null
                    follower_avatar: string | null
                    follower_username: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    follower_id: string
                    following_id: string
                    follower_name?: string | null
                    follower_avatar?: string | null
                    follower_username?: string | null
                    created_at?: string
                }
                Update: never
            }
            notifications: {
                Row: {
                    id: string
                    user_id: string
                    type: string
                    user_name: string
                    avatar: string | null
                    content: string
                    category: string | null
                    link: string | null
                    read: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    type: string
                    user_name: string
                    avatar?: string | null
                    content: string
                    category?: string | null
                    link?: string | null
                    read?: boolean
                    created_at?: string
                }
                Update: {
                    read?: boolean
                }
            }
            collections: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    is_private: boolean
                    item_count: number
                    thumbnails: string[] | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    is_private?: boolean
                    item_count?: number
                    thumbnails?: string[] | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    title?: string
                    is_private?: boolean
                    item_count?: number
                    thumbnails?: string[] | null
                    updated_at?: string
                }
            }
            collection_items: {
                Row: {
                    id: string
                    collection_id: string
                    item_id: string
                    item_type: string
                    added_at: string
                }
                Insert: {
                    id?: string
                    collection_id: string
                    item_id: string
                    item_type: string
                    added_at?: string
                }
                Update: never
            }
            forum_threads: {
                Row: {
                    id: string
                    slug: string
                    title: string
                    content: string
                    excerpt: string | null
                    category: string
                    author_id: string
                    author_name: string
                    author_avatar: string | null
                    author_username: string | null
                    is_pinned: boolean
                    is_locked: boolean
                    is_resolved: boolean
                    views: number
                    likes: number
                    reply_count: number
                    last_activity_at: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    slug: string
                    title: string
                    content: string
                    excerpt?: string | null
                    category: string
                    author_id: string
                    author_name: string
                    author_avatar?: string | null
                    author_username?: string | null
                    is_pinned?: boolean
                    is_locked?: boolean
                    is_resolved?: boolean
                    views?: number
                    likes?: number
                    reply_count?: number
                    last_activity_at?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    slug?: string
                    title?: string
                    content?: string
                    excerpt?: string | null
                    category?: string
                    is_pinned?: boolean
                    is_locked?: boolean
                    is_resolved?: boolean
                    views?: number
                    likes?: number
                    reply_count?: number
                    last_activity_at?: string
                    updated_at?: string
                }
            }
            forum_replies: {
                Row: {
                    id: string
                    thread_id: string
                    content: string
                    author_id: string
                    author_name: string
                    author_avatar: string | null
                    author_username: string | null
                    is_solution: boolean
                    likes: number
                    parent_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    thread_id: string
                    content: string
                    author_id: string
                    author_name: string
                    author_avatar?: string | null
                    author_username?: string | null
                    is_solution?: boolean
                    likes?: number
                    parent_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    content?: string
                    is_solution?: boolean
                    likes?: number
                    updated_at?: string
                }
            }
            reports: {
                Row: {
                    id: string
                    reporter_id: string
                    reporter_name: string | null
                    content_type: 'user' | 'article' | 'project' | 'comment'
                    content_id: string
                    content_title: string | null
                    reason: 'spam' | 'harassment' | 'inappropriate' | 'copyright' | 'other'
                    description: string | null
                    status: string
                    created_at: string
                    reviewed_at: string | null
                    reviewed_by: string | null
                    notes: string | null
                }
                Insert: {
                    id?: string
                    reporter_id: string
                    reporter_name?: string | null
                    content_type: 'user' | 'article' | 'project' | 'comment'
                    content_id: string
                    content_title?: string | null
                    reason: 'spam' | 'harassment' | 'inappropriate' | 'copyright' | 'other'
                    description?: string | null
                    status?: string
                    created_at?: string
                    reviewed_at?: string | null
                    reviewed_by?: string | null
                    notes?: string | null
                }
                Update: {
                    status?: string
                    reviewed_at?: string | null
                    reviewed_by?: string | null
                    notes?: string | null
                }
            }
            forum_reports: {
                Row: {
                    id: string
                    target_type: 'thread' | 'reply'
                    target_id: string
                    thread_id: string
                    reporter_id: string
                    reporter_name: string
                    reason: string
                    description: string | null
                    status: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    target_type: 'thread' | 'reply'
                    target_id: string
                    thread_id: string
                    reporter_id: string
                    reporter_name: string
                    reason: string
                    description?: string | null
                    status?: string
                    created_at?: string
                }
                Update: {
                    status?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            increment_user_stat: {
                Args: {
                    user_id: string
                    stat_name: string
                    amount: number
                }
                Returns: void
            }
            increment_project_views: {
                Args: {
                    project_id: string
                }
                Returns: void
            }
            increment_project_likes: {
                Args: {
                    project_id: string
                    amount: number
                }
                Returns: void
            }
            increment_article_views: {
                Args: {
                    article_id: string
                }
                Returns: void
            }
            increment_article_likes: {
                Args: {
                    article_id: string
                    amount: number
                }
                Returns: void
            }
            increment_article_comments: {
                Args: {
                    article_id: string
                    amount: number
                }
                Returns: void
            }
            increment_thread_views: {
                Args: {
                    thread_id: string
                }
                Returns: void
            }
            increment_thread_likes: {
                Args: {
                    thread_id: string
                    amount: number
                }
                Returns: void
            }
            increment_reply_likes: {
                Args: {
                    reply_id: string
                    amount: number
                }
                Returns: void
            }
            decrement_thread_replies: {
                Args: {
                    thread_id: string
                }
                Returns: void
            }
            decrement_collection_items: {
                Args: {
                    collection_id: string
                }
                Returns: void
            }
        }
        Enums: {
            [_ in never]: never
        }
    }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertDto<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateDto<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table types
export type DbUser = Tables<'users'>
export type DbProject = Tables<'projects'>
export type DbArticle = Tables<'articles'>
export type DbComment = Tables<'comments'>
export type DbLike = Tables<'likes'>
export type DbFollower = Tables<'followers'>
export type DbNotification = Tables<'notifications'>
export type DbCollection = Tables<'collections'>
export type DbCollectionItem = Tables<'collection_items'>
export type DbForumThread = Tables<'forum_threads'>
export type DbForumReply = Tables<'forum_replies'>
export type DbReport = Tables<'reports'>
