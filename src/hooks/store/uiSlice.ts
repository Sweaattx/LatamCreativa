import { StateCreator } from 'zustand';
import { UISlice, AppStore, ContentMode, CreateMode } from './types';

// Helper to safely read from localStorage
const getSavedContentMode = (): ContentMode => {
    if (typeof window === 'undefined') return 'creative';
    try {
        const saved = localStorage.getItem('latamcreativa_content_mode');
        if (saved === 'dev' || saved === 'creative') {
            return saved;
        }
    } catch (error) {
        console.warn('Error reading content mode from localStorage:', error);
    }
    return 'creative';
};

export const createUISlice: StateCreator<AppStore, [], [], UISlice> = (set, get) => ({
    // Initial State — always 'creative' to avoid hydration mismatch
    // Call hydrateContentMode() after mount to restore saved preference
    isSidebarOpen: false,
    activeCategory: 'Home',
    activeModule: 'home',
    contentMode: 'creative' as ContentMode,
    createMode: 'none' as CreateMode,
    searchQuery: '',
    toast: null,
    isSaveModalOpen: false,
    isShareModalOpen: false,
    itemToSave: null,
    viewingAuthor: null,
    subscriptionsTimestamp: 0,

    // Actions
    setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

    setActiveCategory: (category) => {
        set((state) => {
            // Sync sort option with category
            if (category === 'Tendencias') {
                return {
                    activeCategory: category,
                    blogState: { ...state.blogState, sortOption: 'popular' as const }
                };
            } else if (category === 'Home' || category === 'Nuevos') {
                return {
                    activeCategory: category,
                    blogState: { ...state.blogState, sortOption: 'recent' as const }
                };
            }

            return { activeCategory: category };
        });
    },

    setActiveModule: (module) => {
        set({ activeModule: module, viewingAuthor: null, createMode: 'none', searchQuery: '' });
        if (typeof window !== 'undefined' && window.innerWidth < 1280) {
            set({ isSidebarOpen: false });
        }
    },

    setContentMode: (mode) => {
        const currentMode = get().contentMode;

        if (currentMode === mode) return;

        // Save to localStorage
        try {
            localStorage.setItem('latamcreativa_content_mode', mode);
        } catch (error) {
            console.warn('Error saving content mode to localStorage:', error);
        }

        // Set data-mode attribute for CSS overrides
        if (typeof document !== 'undefined') {
            if (mode === 'dev') {
                document.documentElement.setAttribute('data-mode', 'dev');
            } else {
                document.documentElement.removeAttribute('data-mode');
            }
        }

        set({ contentMode: mode, activeCategory: 'Home' });
        get().showToast(mode === 'dev' ? 'Modo Desarrollador Activado 👨‍💻' : 'Modo Creativo Activado 🎨', 'info');
    },

    setCreateMode: (mode) => set({ createMode: mode }),
    setSearchQuery: (query) => set({ searchQuery: query }),

    showToast: (message, type = 'success') => {
        set({ toast: { message, type } });
        setTimeout(() => set({ toast: null }), 3000);
    },

    triggerSubscriptionUpdate: () => set(() => ({
        subscriptionsTimestamp: Date.now()
    })),

    openSaveModal: (id, image, type) => set({
        isSaveModalOpen: true,
        itemToSave: { id, image, type }
    }),

    closeSaveModal: () => set({
        isSaveModalOpen: false,
        itemToSave: null
    }),

    openShareModal: () => set({ isShareModalOpen: true }),
    closeShareModal: () => set({ isShareModalOpen: false }),

    setViewingAuthor: (author) => {
        set({ viewingAuthor: author });
        if (typeof window !== 'undefined' && window.innerWidth < 1280 && author) {
            set({ isSidebarOpen: false });
        }
    },
});
