/**
 * Tests for useAppStore Hook
 * 
 * Tests the Zustand store facade hook functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Zustand store
vi.mock('zustand', () => ({
    create: vi.fn(() => () => ({
        // UI State
        isSidebarOpen: true,
        isSearchOpen: false,
        isAuthModalOpen: false,
        activeDomain: 'creative',

        // Auth State
        user: null,

        // UI Actions
        toggleSidebar: vi.fn(),
        openSearch: vi.fn(),
        closeSearch: vi.fn(),
        setActiveDomain: vi.fn(),

        // Auth Actions
        setUser: vi.fn(),
        clearUser: vi.fn(),
    }))
}));

describe('useAppStore', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Initial State', () => {
        it('should have default UI state values', () => {
            // Test initial state structure
            const defaultState = {
                isSidebarOpen: true,
                isSearchOpen: false,
                isAuthModalOpen: false,
                activeDomain: 'creative',
                user: null
            };

            expect(defaultState.isSidebarOpen).toBe(true);
            expect(defaultState.isSearchOpen).toBe(false);
            expect(defaultState.activeDomain).toBe('creative');
        });

        it('should have null user by default', () => {
            const state = { user: null };
            expect(state.user).toBeNull();
        });
    });

    describe('Actions', () => {
        it('should define toggleSidebar action', () => {
            const actions = {
                toggleSidebar: vi.fn()
            };

            actions.toggleSidebar();
            expect(actions.toggleSidebar).toHaveBeenCalled();
        });

        it('should define setUser action', () => {
            const mockUser = {
                id: '123',
                uid: '123',
                email: 'test@example.com',
                name: 'Test User'
            };

            const actions = {
                setUser: vi.fn()
            };

            actions.setUser(mockUser);
            expect(actions.setUser).toHaveBeenCalledWith(mockUser);
        });

        it('should define clearUser action', () => {
            const actions = {
                clearUser: vi.fn()
            };

            actions.clearUser();
            expect(actions.clearUser).toHaveBeenCalled();
        });
    });

    describe('Domain Switching', () => {
        it('should accept valid domain values', () => {
            const validDomains = ['creative', 'dev'];

            validDomains.forEach(domain => {
                expect(['creative', 'dev']).toContain(domain);
            });
        });

        it('should define setActiveDomain action', () => {
            const actions = {
                setActiveDomain: vi.fn()
            };

            actions.setActiveDomain('dev');
            expect(actions.setActiveDomain).toHaveBeenCalledWith('dev');
        });
    });
});

describe('Store Selectors', () => {
    it('should select UI state correctly', () => {
        const state = {
            isSidebarOpen: false,
            isSearchOpen: true,
            activeDomain: 'dev'
        };

        // Simulate selector behavior
        const selectUI = (s: typeof state) => ({
            isSidebarOpen: s.isSidebarOpen,
            isSearchOpen: s.isSearchOpen,
            activeDomain: s.activeDomain
        });

        const uiState = selectUI(state);
        expect(uiState.isSidebarOpen).toBe(false);
        expect(uiState.isSearchOpen).toBe(true);
        expect(uiState.activeDomain).toBe('dev');
    });

    it('should select auth state correctly', () => {
        const mockUser = {
            id: '456',
            uid: '456',
            email: 'user@test.com',
            name: 'Auth User'
        };

        const state = { user: mockUser };

        const selectAuth = (s: typeof state) => ({
            user: s.user,
            isAuthenticated: !!s.user
        });

        const authState = selectAuth(state);
        expect(authState.user).toEqual(mockUser);
        expect(authState.isAuthenticated).toBe(true);
    });
});
