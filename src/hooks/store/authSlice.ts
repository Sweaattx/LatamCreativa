/**
 * Auth Slice
 * Maneja autenticación de usuario, perfil, carrito, likes, notificaciones y colecciones
 * 
 * @module hooks/store/authSlice
 */

import { StateCreator } from 'zustand';
import { AuthSlice, AppStore } from './types';
import { api } from '../../services/api';
import { notificationsService } from '../../services/supabase/notifications';
import { SocialLinks, CollectionItem } from '../../types';

export const createAuthSlice: StateCreator<AppStore, [], [], AuthSlice> = (set, get) => ({
    // Initial State
    user: null,
    cartItems: [],
    likedItems: [],
    createdItems: [],
    notifications: [],
    collections: [],
    blogPosts: [],
    isLoadingAuth: true,
    isLoadingNotifications: false,
    unsubscribeNotifications: null,

    // User Actions
    setUser: (user) => set({ user, isLoadingAuth: false }),
    setLoadingAuth: (loading) => set({ isLoadingAuth: loading }),
    clearUser: () => set({ user: null }),

    updateUserProfile: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
    })),

    addSkill: (skill) => set((state) => {
        if (!state.user) return {};
        const currentSkills = state.user.skills || [];
        if (currentSkills.includes(skill)) return {};
        return { user: { ...state.user, skills: [...currentSkills, skill] } };
    }),

    removeSkill: (skill) => set((state) => {
        if (!state.user) return {};
        return { user: { ...state.user, skills: (state.user.skills || []).filter(s => s !== skill) } };
    }),

    updateSocialLinks: (links: SocialLinks) => set((state) => {
        if (!state.user) return {};
        return { user: { ...state.user, socialLinks: { ...(state.user.socialLinks || {}), ...links } } };
    }),

    // Cart Actions
    addToCart: (item) => {
        const { cartItems, showToast } = get();
        if (!cartItems.find(i => i.id === item.id)) {
            set({ cartItems: [...cartItems, item] });
            showToast(`Añadido al carrito: ${item.title}`, 'success');
        } else {
            showToast(`Este item ya está en tu carrito`, 'info');
        }
    },

    removeFromCart: (itemId) => set((state) => ({
        cartItems: state.cartItems.filter(i => i.id !== itemId)
    })),

    clearCart: () => set({ cartItems: [] }),

    // Like Actions
    toggleLike: (itemId) => set((state) => {
        const isLiked = state.likedItems.includes(itemId);
        return {
            likedItems: isLiked
                ? state.likedItems.filter(id => id !== itemId)
                : [...state.likedItems, itemId]
        };
    }),

    // Content Actions
    addCreatedItem: (item) => set((state) => ({
        createdItems: [item, ...state.createdItems]
    })),

    addBlogPost: (post) => set((state) => ({
        blogPosts: [post, ...state.blogPosts]
    })),

    // Notification Actions
    markNotificationRead: async (id) => {
        const { user } = get();
        if (user) await api.markNotificationRead(user.id, id.toString());
        set((state) => ({
            notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
        }));
    },

    deleteNotification: async (id) => {
        const { user } = get();
        if (!user) return;
        // Optimistic update
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        }));
        await notificationsService.deleteNotification(user.id, String(id));
    },

    markAllNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
    })),

    subscribeToNotifications: (userId: string) => {
        // Cleanup previous if exists
        const { unsubscribeNotifications } = get();
        if (unsubscribeNotifications) {
            unsubscribeNotifications();
        }

        set({ isLoadingNotifications: true });

        const unsubscribe = api.subscribeToNotifications(userId, (notifications) => {
            set({ notifications, isLoadingNotifications: false });
        });

        set({ unsubscribeNotifications: unsubscribe });
    },

    cleanupNotifications: () => {
        const { unsubscribeNotifications } = get();
        if (unsubscribeNotifications) unsubscribeNotifications();
        set({ unsubscribeNotifications: null, notifications: [] });
    },

    // Collection Actions
    fetchCollections: async () => {
        const { user } = get();
        if (!user) return;
        const collections = await api.getUserCollections(user.id);
        set({ collections });
    },

    saveToCollection: async (collectionId) => {
        const { itemToSave, showToast, closeSaveModal, user } = get();
        if (!itemToSave || !user) return;

        try {
            const sanitizedItem = {
                id: String(itemToSave.id),
                type: itemToSave.type || 'project',
                image: String(itemToSave.image || ''),
            };

            await api.addToCollection(user.id, collectionId, sanitizedItem);

            set((state) => ({
                collections: state.collections.map(col => {
                    if (col.id === collectionId) {
                        return {
                            ...col,
                            itemCount: (col.itemCount || 0) + 1,
                            thumbnails: [itemToSave.image, ...(col.thumbnails || []).slice(0, 3)],
                            items: [...(col.items || []), { id: itemToSave.id, type: itemToSave.type || 'project', addedAt: new Date().toISOString() }]
                        };
                    }
                    return col;
                })
            }));
            showToast("Guardado en colección", 'success');
            closeSaveModal();
        } catch (error) {
            console.error(error);
            showToast("Error al guardar", 'error');
        }
    },

    createCollection: async (title, isPrivate) => {
        const { itemToSave, showToast, closeSaveModal, user, saveToCollection } = get();
        if (!user) {
            showToast('Debes iniciar sesión para crear colecciones', 'error');
            throw new Error('No user');
        }

        try {
            const newCol = await api.createCollection(user.id, title, isPrivate);

            if (newCol) {
                const newCollectionState: CollectionItem = {
                    id: newCol.id,
                    title: newCol.title,
                    itemCount: 0,
                    thumbnails: [],
                    isPrivate: newCol.isPrivate,
                    items: []
                };

                set((state) => ({
                    collections: [...state.collections, newCollectionState]
                }));

                if (itemToSave) {
                    await saveToCollection(newCollectionState.id);
                } else {
                    showToast('Colección creada correctamente', 'success');
                    closeSaveModal();
                }
            } else {
                throw new Error('API returned null');
            }
        } catch (error) {
            console.error("Error creating collection:", error);
            showToast("Error al crear colección", 'error');
            throw error;
        }
    },

    deleteCollection: async (collectionId) => {
        const { user, showToast } = get();
        if (!user) return;
        try {
            await api.deleteCollection(user.id, collectionId);
            set((state) => ({
                collections: state.collections.filter(c => c.id !== collectionId)
            }));
            showToast("Colección eliminada", 'success');
        } catch (error) {
            console.error("Action error:", error);
            showToast("Error al eliminar colección", 'error');
        }
    }
});
