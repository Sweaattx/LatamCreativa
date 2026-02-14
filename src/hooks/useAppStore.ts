/**
 * App Store
 * Centralized Zustand store with modular slices
 * 
 * Architecture:
 * - types.ts    → Type definitions for all slices
 * - uiSlice.ts  → UI state (sidebar, modals, navigation, toasts)
 * - authSlice.ts → Auth state (user, cart, likes, notifications, collections)
 * - blogSlice.ts → Blog state (article pagination)
 * 
 * Optimizations:
 * - Selective subscriptions with useShallow
 * - Memoized selectors for derived state
 * - Persist middleware for critical state only
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { useMemo, useCallback } from 'react';
import { CartItem, CreateMode } from '../types';
import {
  AppStore,
  createUISlice,
  createAuthSlice,
  createBlogSlice
} from './store';

// --- Zustand Implementation with Modular Slices ---
const useZustandStore = create<AppStore>()(
  devtools(
    persist(
      (...a) => ({
        ...createUISlice(...a),
        ...createAuthSlice(...a),
        ...createBlogSlice(...a),
      }),
      {
        name: 'app-storage',
        version: 1,
        migrate: (persistedState: unknown, version: number) => {
          if (version < 1) {
            const state = (persistedState || {}) as Record<string, unknown>;
            return {
              ...state,
              createdItems: [],
              blogPosts: [],
              collections: [],
              cartItems: [],
              likedItems: [],
              notifications: []
            };
          }
          return persistedState as Record<string, unknown>;
        },
        partialize: (state) => ({
          user: state.user,
          createdItems: state.createdItems,
          blogPosts: state.blogPosts,
          cartItems: state.cartItems,
          likedItems: state.likedItems,
          collections: state.collections,
          contentMode: state.contentMode,
          notifications: state.notifications
        }),
      }
    )
  )
);

// Expose raw store for non-hook usage (e.g. hydration)
export { useZustandStore as appStoreApi };

// --- Re-export types for convenience ---
export type { ContentMode, ToastType, ToastState } from './store/types';

// --- Selectores optimizados para subscripciones selectivas ---
const selectUIState = (state: AppStore) => ({
  isSidebarOpen: state.isSidebarOpen,
  activeCategory: state.activeCategory,
  activeModule: state.activeModule,
  viewingAuthor: state.viewingAuthor,
  contentMode: state.contentMode,
  createMode: state.createMode,
  searchQuery: state.searchQuery,
  toast: state.toast,
  isSaveModalOpen: state.isSaveModalOpen,
  itemToSave: state.itemToSave,
  isShareModalOpen: state.isShareModalOpen,
  subscriptionsTimestamp: state.subscriptionsTimestamp,
});

const selectAuthState = (state: AppStore) => ({
  user: state.user,
  cartItems: state.cartItems,
  likedItems: state.likedItems,
  createdItems: state.createdItems,
  blogPosts: state.blogPosts,
  collections: state.collections,
  notifications: state.notifications,
  isLoadingAuth: state.isLoadingAuth,
  isLoadingNotifications: state.isLoadingNotifications,
});

const selectBlogState = (state: AppStore) => ({
  blogState: state.blogState,
});

const selectActions = (state: AppStore) => ({
  // UI Actions
  setIsSidebarOpen: state.setIsSidebarOpen,
  setActiveCategory: state.setActiveCategory,
  setViewingAuthor: state.setViewingAuthor,
  setContentMode: state.setContentMode,
  setCreateMode: state.setCreateMode,
  setActiveModule: state.setActiveModule,
  openSaveModal: state.openSaveModal,
  closeSaveModal: state.closeSaveModal,
  openShareModal: state.openShareModal,
  closeShareModal: state.closeShareModal,
  triggerSubscriptionUpdate: state.triggerSubscriptionUpdate,
  showToast: state.showToast,
  setSearchQuery: state.setSearchQuery,
  // Auth Actions
  setUser: state.setUser,
  setLoadingAuth: state.setLoadingAuth,
  clearUser: state.clearUser,
  updateUserProfile: state.updateUserProfile,
  addSkill: state.addSkill,
  removeSkill: state.removeSkill,
  updateSocialLinks: state.updateSocialLinks,
  addToCart: state.addToCart,
  removeFromCart: state.removeFromCart,
  clearCart: state.clearCart,
  toggleLike: state.toggleLike,
  addCreatedItem: state.addCreatedItem,
  addBlogPost: state.addBlogPost,
  markNotificationRead: state.markNotificationRead,
  deleteNotification: state.deleteNotification,
  markAllNotificationsRead: state.markAllNotificationsRead,
  subscribeToNotifications: state.subscribeToNotifications,
  cleanupNotifications: state.cleanupNotifications,
  unsubscribeNotifications: state.unsubscribeNotifications,
  fetchCollections: state.fetchCollections,
  saveToCollection: state.saveToCollection,
  createCollection: state.createCollection,
  deleteCollection: state.deleteCollection,
  // Blog Actions
  setBlogState: state.setBlogState,
  resetBlogState: state.resetBlogState,
});

// --- Adapter Hook (Facade Pattern) con optimizaciones ---
export const useAppStore = () => {
  // Usar useShallow para evitar re-renders cuando propiedades no cambian
  const uiState = useZustandStore(useShallow(selectUIState));
  const authState = useZustandStore(useShallow(selectAuthState));
  const blogState = useZustandStore(useShallow(selectBlogState));
  const storeActions = useZustandStore(useShallow(selectActions));

  // Memoizar estado combinado
  const state = useMemo(() => ({
    ...uiState,
    toastMessage: uiState.toast?.message,
    ...authState,
    ...blogState,
  }), [uiState, authState, blogState]);

  // Memoizar acciones complejas
  const toggleContentMode = useCallback(() => {
    storeActions.setContentMode(uiState.contentMode === 'creative' ? 'dev' : 'creative');
  }, [storeActions, uiState.contentMode]);

  const handleSubscriptionSelect = useCallback((name: string) => {
    storeActions.setViewingAuthor(name ? { name } : null);
  }, [storeActions]);

  const handleCreateAction = useCallback((actionId: string) => {
    if (!authState.user) {
      storeActions.showToast('Debes iniciar sesión para crear contenido', 'info');
      storeActions.setActiveModule('auth');
      storeActions.setIsSidebarOpen(false);
      return;
    }

    const moduleMap: Record<string, string> = {
      project: 'community',
      article: 'blog',
      portfolio: 'portfolio',
      course: 'education',
      asset: 'market',
      service: 'freelance',
      forum: 'forum',
      event: 'events'
    };
    if (moduleMap[actionId]) {
      storeActions.setActiveModule(moduleMap[actionId]);
      storeActions.setCreateMode(actionId as CreateMode);
    }
    storeActions.setIsSidebarOpen(false);
  }, [authState.user, storeActions]);

  const handleProClick = useCallback(() => {
    storeActions.setActiveModule('pro');
    if (typeof window !== 'undefined' && window.innerWidth < 1280) {
      storeActions.setIsSidebarOpen(false);
    }
  }, [storeActions]);

  const handleSearch = useCallback((query: string) => {
    storeActions.setSearchQuery(query);
    storeActions.setActiveModule('search');
  }, [storeActions]);

  const handleBuyNow = useCallback((item: CartItem) => {
    if (!authState.cartItems.find(i => i.id === item.id)) {
      storeActions.addToCart(item);
    }
    storeActions.setActiveModule('cart');
  }, [authState.cartItems, storeActions]);

  // Memoizar objeto de acciones
  const actions = useMemo(() => ({
    ...storeActions,
    handleModuleSelect: storeActions.setActiveModule,
    triggerFollowUpdate: storeActions.triggerSubscriptionUpdate,
    toggleContentMode,
    handleSubscriptionSelect,
    handleCreateAction,
    handleProClick,
    handleSearch,
    handleBuyNow,
  }), [
    storeActions,
    toggleContentMode,
    handleSubscriptionSelect,
    handleCreateAction,
    handleProClick,
    handleSearch,
    handleBuyNow,
  ]);

  return { state, actions };
};
