/**
 * App Store Types
 * Type definitions for Zustand store slices
 */

import { CartItem, Notification, CollectionItem, PortfolioItem, ArticleItem, ItemType, CreateMode, User, SocialLinks } from '../../types';

// Re-export for convenience
export type { CreateMode, ItemType } from '../../types';

// --- Core Types ---
export type ContentMode = 'creative' | 'dev';
export type ToastType = 'success' | 'error' | 'info';

export interface ToastState {
    message: string;
    type: ToastType;
}

// --- UI Slice ---
export interface UISlice {
    // State
    isSidebarOpen: boolean;
    activeCategory: string;
    activeModule: string;
    contentMode: ContentMode;
    createMode: CreateMode;
    searchQuery: string;
    toast: ToastState | null;
    subscriptionsTimestamp: number;
    isSaveModalOpen: boolean;
    isShareModalOpen: boolean;
    itemToSave: { id: string; image: string; type: ItemType } | null;
    viewingAuthor: { name: string; avatar?: string; id?: string } | null;

    setIsSidebarOpen: (isOpen: boolean) => void;
    setActiveCategory: (category: string) => void;
    setActiveModule: (module: string) => void;
    setContentMode: (mode: ContentMode) => void;
    setCreateMode: (mode: CreateMode) => void;
    setSearchQuery: (query: string) => void;
    showToast: (message: string, type?: ToastType) => void;
    triggerSubscriptionUpdate: () => void;
    openSaveModal: (id: string, image: string, type: ItemType) => void;
    closeSaveModal: () => void;
    openShareModal: () => void;
    closeShareModal: () => void;
    setViewingAuthor: (author: { name: string; avatar?: string; id?: string } | null) => void;
}

// --- Auth Slice ---
export interface AuthSlice {
    // State
    user: User | null;
    cartItems: CartItem[];
    likedItems: string[];
    createdItems: PortfolioItem[];
    notifications: Notification[];
    collections: CollectionItem[];
    blogPosts: ArticleItem[];
    isLoadingAuth: boolean;
    isLoadingNotifications?: boolean;
    unsubscribeNotifications: (() => void) | null;

    // Actions
    setUser: (user: AuthSlice['user']) => void;
    clearUser: () => void;
    updateUserProfile: (updates: Partial<AuthSlice['user']>) => void;
    addSkill: (skill: string) => void;
    removeSkill: (skill: string) => void;
    updateSocialLinks: (links: SocialLinks) => void;
    setLoadingAuth: (loading: boolean) => void;
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: string) => void;
    clearCart: () => void;
    toggleLike: (itemId: string) => void;
    addCreatedItem: (item: PortfolioItem) => void;
    addBlogPost: (post: ArticleItem) => void;
    markNotificationRead: (id: string | number) => void;
    deleteNotification: (id: string | number) => void;
    markAllNotificationsRead: () => void;
    subscribeToNotifications: (userId: string) => void;
    cleanupNotifications: () => void;
    fetchCollections: () => Promise<void>;
    saveToCollection: (collectionId: string) => Promise<void>;
    createCollection: (title: string, isPrivate: boolean) => Promise<void>;
    deleteCollection: (collectionId: string) => Promise<void>;
}

// --- Blog Slice ---
export interface BlogState {
    articles: ArticleItem[];
    pageStack: string[]; // IDs for pagination
    currentPage: number;
    hasMore: boolean;
    loading: boolean;
    lastId: string | null; // String ID for cursor-based pagination
    sortOption: 'recent' | 'oldest' | 'popular';
}

export interface BlogSlice {
    blogState: BlogState;
    setBlogState: (updates: Partial<BlogState>) => void;
    resetBlogState: () => void;
}

// --- Combined Store Type ---
export type AppStore = UISlice & AuthSlice & BlogSlice;

// --- Initial State Constants ---
export const INITIAL_UI_STATE: Pick<UISlice,
    'isSidebarOpen' | 'activeCategory' | 'activeModule' | 'contentMode' |
    'createMode' | 'searchQuery' | 'toast' |
    'isSaveModalOpen' | 'isShareModalOpen' | 'itemToSave' | 'viewingAuthor' | 'subscriptionsTimestamp'
> = {
    isSidebarOpen: false,
    activeCategory: 'Home',
    activeModule: 'home',
    contentMode: 'creative',
    createMode: 'none',
    searchQuery: '',
    toast: null,
    isSaveModalOpen: false,
    isShareModalOpen: false,
    itemToSave: null,
    viewingAuthor: null,
    subscriptionsTimestamp: 0,
};

export const INITIAL_AUTH_STATE: Pick<AuthSlice,
    'user' | 'cartItems' | 'likedItems' | 'createdItems' | 'notifications' |
    'collections' | 'blogPosts' | 'isLoadingAuth' | 'unsubscribeNotifications'
> = {
    user: null,
    cartItems: [],
    likedItems: [],
    createdItems: [],
    notifications: [],
    collections: [],
    blogPosts: [],
    isLoadingAuth: false,
    unsubscribeNotifications: null,
};

export const INITIAL_BLOG_STATE: BlogState = {
    articles: [],
    pageStack: [],
    currentPage: 1,
    hasMore: true,
    loading: false,
    lastId: null,
    sortOption: 'recent',
};
